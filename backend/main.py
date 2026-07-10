from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import joblib
import pandas as pd
import os
import json
import zipfile
import io
import xml.etree.ElementTree as ET

# Import DB and LLM client helpers
from backend.db import (
    save_student_profile,
    get_student_profile,
    save_roadmap_item,
    get_roadmap,
    save_weekly_progress,
    get_weekly_progress,
    get_past_answers
)
from backend.agent.llm_client import (
    extract_skills_from_resume,
    generate_roadmap_from_skills
)
from backend.agent.interview_agent import (
    generate_interview_question,
    score_and_store_turn,
    generate_session_summary
)
import tempfile
from backend.audio.processor import transcribe_audio, analyze_confidence

# 1. Initialize the FastAPI Server
app = FastAPI(title="PADO Placement Predictor & Agent API")

# Allow requests from Next.js dev server (port 3000) and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define Request Schemas
class StudentFeatures(BaseModel):
    cgpa: float
    dsa_score: float
    aptitude_score: float
    communication_score: float
    mock_interview_avg_score: float

class StudentRegistration(BaseModel):
    student_id: str
    name: str
    resume_text: str
    cgpa: float
    target_company: str

class StartInterviewRequest(BaseModel):
    student_id: str
    session_id: str

class SubmitAnswerRequest(BaseModel):
    student_id: str
    session_id: str
    question_number: int
    question_text: str
    category: str
    answer_text: str

# Load the model once when the server starts, not on every request!
MODEL_PATH = "backend/ml/placement_model.pkl"
model = None

@app.on_event("startup")
def load_model():
    global model
    # Resolve relative paths to absolute to prevent uvicorn lookup bugs
    script_dir = os.path.dirname(os.path.abspath(__file__))
    absolute_model_path = os.path.join(script_dir, "ml", "placement_model.pkl")
    
    if os.path.exists(absolute_model_path):
        model = joblib.load(absolute_model_path)
        print(f"✅ Successfully loaded tuned XGBoost model from {absolute_model_path}")
    else:
        print(f"⚠️ Warning: Model file not found at {absolute_model_path}")

# Helper: compute placement probability inside FastAPI internally
def calculate_placement_probability_internal(cgpa: float, dsa: float, aptitude: float, comms: float, interview: float) -> float:
    if model is None:
        return 50.0  # Safe fallback if ML model PKL isn't loaded
    features_dict = {
        "cgpa": cgpa,
        "dsa_score": dsa,
        "aptitude_score": aptitude,
        "communication_score": comms,
        "mock_interview_avg_score": interview
    }
    input_data = pd.DataFrame([features_dict])
    raw_probability = model.predict_proba(input_data)[0][1]
    return round(float(raw_probability) * 100, 1)

# 3. Predict Placement Probability (ML Endpoint)
@app.post("/predict/placement_probability")
def predict_placement(features: StudentFeatures):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on the server.")
    
    features_dict = features.model_dump() if hasattr(features, "model_dump") else features.dict()
    input_data = pd.DataFrame([features_dict])
    
    raw_probability = model.predict_proba(input_data)[0][1]
    probability = float(raw_probability)
    
    return {
        "placement_probability": round(probability * 100, 1),
        "status": "Ready" if probability > 0.65 else "Needs Improvement"
    }

# 4. Register Student & Generate Roadmap (Agent + DB Endpoint)
@app.post("/student/register")
def register_student(student: StudentRegistration):
    try:
        print(f"📝 Starting registration for student: {student.student_id}")
        extracted_data = extract_skills_from_resume(student.resume_text)
        
        save_student_profile(
            student_id=student.student_id,
            name=student.name,
            resume_text=student.resume_text,
            extracted_skills=extracted_data.get("skills", []),
            cgpa=student.cgpa,
            target_company=student.target_company
        )
        
        roadmap_data = generate_roadmap_from_skills(
            extracted_skills_json=json.dumps(extracted_data),
            target_company=student.target_company
        )
        
        for category, topics in roadmap_data.items():
            for topic in topics:
                save_roadmap_item(
                    student_id=student.student_id,
                    category=category,
                    topic=topic
                )
                
        print("🎉 Student registration and roadmap generation complete!")
        return {
            "status": "success",
            "message": "Student successfully registered and study roadmap generated.",
            "extracted_skills": extracted_data.get("skills", []),
            "roadmap": roadmap_data
        }
        
    except ValueError as val_err:
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        print(f"❌ Error registering student: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to register student: {str(e)}")

@app.get("/student/{student_id}")
def get_student(student_id: str):
    profile = get_student_profile(student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return profile

# 5. Retrieve Study Roadmap (DB Endpoint)
@app.get("/student/{student_id}/roadmap")
def get_student_roadmap(student_id: str):
    profile = get_student_profile(student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    db_roadmap = get_roadmap(student_id)
    
    structured_roadmap = {
        "DSA": [],
        "Aptitude": [],
        "Core Subjects": [],
        "Communication": []
    }
    
    for item in db_roadmap:
        cat = item["category"]
        if cat in structured_roadmap:
            structured_roadmap[cat].append(item["topic"])
            
    return {
        "student_id": student_id,
        "name": profile["name"],
        "target_company": profile["target_company"],
        "roadmap": structured_roadmap
    }

# 6. Start Mock Interview Session (Agent Endpoint)
@app.post("/interview/start")
def start_interview(request: StartInterviewRequest):
    profile = get_student_profile(request.student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found. Please register first.")
        
    try:
        # Generate the very first question (question_number = 1)
        question_text, category = generate_interview_question(
            student_id=request.student_id,
            session_id=request.session_id,
            target_company=profile["target_company"]
        )
        
        from backend.agent.company_kb import get_company_loop
        company_loop = get_company_loop(profile["target_company"])
        
        return {
            "session_id": request.session_id,
            "question_number": 1,
            "total_questions": company_loop["rounds"],
            "category": category,
            "question_text": question_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

# 7. Submit Answer & Pivot/Get Next Question (Adaptive Agent Endpoint)
@app.post("/interview/answer")
def submit_answer(request: SubmitAnswerRequest):
    profile = get_student_profile(request.student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    try:
        # A. Score current answer and save to SQLite
        turn_result = score_and_store_turn(
            student_id=request.student_id,
            session_id=request.session_id,
            question_number=request.question_number,
            question_text=request.question_text,
            category=request.category,
            answer_text=request.answer_text
        )
        
        # We determine total questions based on company loop rounds.
        from backend.agent.company_kb import get_company_loop
        company_loop = get_company_loop(profile["target_company"])
        MAX_QUESTIONS = company_loop["rounds"]
        
        if request.question_number < MAX_QUESTIONS:
            # B. Generate the next branching question
            next_q, next_cat = generate_interview_question(
                student_id=request.student_id,
                session_id=request.session_id,
                target_company=profile["target_company"],
                question_number=request.question_number + 1
            )
            
            return {
                "turn_result": turn_result,
                "complete": False,
                "next_question": {
                    "question_number": request.question_number + 1,
                    "category": next_cat,
                    "question_text": next_q
                }
            }
        else:
            # C. Interview is complete! Compute performance summaries and run ML prediction
            print("🎓 Max questions reached. Compiling final metrics...")
            past_turns = get_past_answers(request.student_id, request.session_id)
            
            # Group scores by category to supply to XGBoost
            dsa_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'DSA']
            aptitude_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'Aptitude']
            comm_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'Behavioral']
            all_scores = [t['content_score'] for t in past_turns]
            
            # Compute averages, fallback to 70 if category wasn't asked in this short session
            avg_dsa = sum(dsa_scores) / len(dsa_scores) if dsa_scores else 70.0
            avg_aptitude = sum(aptitude_scores) / len(aptitude_scores) if aptitude_scores else 70.0
            avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else 70.0
            avg_interview = sum(all_scores) / len(all_scores) if all_scores else 70.0
            
            # Call our XGBoost model
            print("🧠 Running XGBoost prediction classifier...")
            probability = calculate_placement_probability_internal(
                cgpa=profile["cgpa"],
                dsa=avg_dsa,
                aptitude=avg_aptitude,
                comms=avg_comm,
                interview=avg_interview
            )
            
            # Save progress to DB
            save_weekly_progress(
                student_id=request.student_id,
                week_number=1, # Default mock week
                dsa_score=avg_dsa,
                aptitude_score=avg_aptitude,
                communication_score=avg_comm,
                placement_probability=probability
            )
            
            # Generate final text recommendation using Llama
            summary = generate_session_summary(
                student_id=request.student_id,
                session_id=request.session_id,
                model_output_probability=probability
            )
            
            return {
                "turn_result": turn_result,
                "complete": True,
                "placement_probability": probability,
                "summary": summary
            }
            
    except Exception as e:
        print(f"❌ Error in submit_answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/answer_audio")
async def submit_answer_audio(
    student_id: str = Form(...),
    session_id: str = Form(...),
    question_number: int = Form(...),
    question_text: str = Form(...),
    category: str = Form(...),
    audio_file: UploadFile = File(...)
):
    profile = get_student_profile(student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    try:
        # Save uploaded file to a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".wav")
        try:
            content = await audio_file.read()
            with os.fdopen(fd, 'wb') as f:
                f.write(content)
            
            # Process Audio
            transcription = transcribe_audio(temp_path)
            confidence = analyze_confidence(temp_path)
        finally:
            # Clean up temp file
            os.remove(temp_path)

        if not transcription:
            transcription = "I don't know"  # Fallback if whisper fails completely

        # A. Score current answer and save to SQLite (passing confidence)
        turn_result = score_and_store_turn(
            student_id=student_id,
            session_id=session_id,
            question_number=question_number,
            question_text=question_text,
            category=category,
            answer_text=transcription,
            provided_confidence_score=confidence
        )
        
        # B. We determine total questions based on company loop rounds.
        from backend.agent.company_kb import get_company_loop
        company_loop = get_company_loop(profile["target_company"])
        MAX_QUESTIONS = company_loop["rounds"]
        
        if question_number < MAX_QUESTIONS:
            next_q, next_cat = generate_interview_question(
                student_id=student_id,
                session_id=session_id,
                target_company=profile["target_company"],
                question_number=question_number + 1
            )
            
            return {
                "turn_result": turn_result,
                "transcription": transcription,
                "confidence_score": confidence,
                "complete": False,
                "next_question": {
                    "question_number": question_number + 1,
                    "category": next_cat,
                    "question_text": next_q
                }
            }
        else:
            print("🎓 Max questions reached. Compiling final metrics...")
            past_turns = get_past_answers(student_id, session_id)
            
            # Group scores by category to supply to XGBoost
            dsa_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'DSA']
            aptitude_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'Aptitude']
            comm_scores = [t['content_score'] for t in past_turns if t['question_category'] == 'Behavioral']
            all_scores = [t['content_score'] for t in past_turns]
            
            avg_dsa = sum(dsa_scores) / len(dsa_scores) if dsa_scores else 70.0
            avg_aptitude = sum(aptitude_scores) / len(aptitude_scores) if aptitude_scores else 70.0
            avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else 70.0
            avg_interview = sum(all_scores) / len(all_scores) if all_scores else 70.0
            
            print("🧠 Running XGBoost prediction classifier...")
            # We must import or use the existing calculate_placement_probability_internal
            # It's defined above in main.py, so we can just call it
            probability = calculate_placement_probability_internal(
                cgpa=profile["cgpa"],
                dsa=avg_dsa,
                aptitude=avg_aptitude,
                comms=avg_comm,
                interview=avg_interview
            )
            
            save_weekly_progress(
                student_id=student_id,
                week_number=1,
                dsa_score=avg_dsa,
                aptitude_score=avg_aptitude,
                communication_score=avg_comm,
                placement_probability=probability
            )
            
            summary = generate_session_summary(
                student_id=student_id,
                session_id=session_id,
                model_output_probability=probability
            )
            
            return {
                "turn_result": turn_result,
                "transcription": transcription,
                "confidence_score": confidence,
                "complete": True,
                "placement_probability": probability,
                "summary": summary
            }

    except Exception as e:
        print(f"❌ Error in submit_answer_audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 8. Get Weekly Progress History (DB Endpoint)
@app.get("/student/{student_id}/progress")
def get_progress(student_id: str):
    profile = get_student_profile(student_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    history = get_weekly_progress(student_id)
    return {
        "student_id": student_id,
        "name": profile["name"],
        "history": history
    }

# 9. Resume File Parser (used by Next.js frontend for PDF/DOCX upload)
@app.post("/util/parse_resume")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Accepts a PDF, DOCX, or TXT file upload and returns the extracted plain text.
    This allows the Next.js frontend to send uploaded resume files and receive
    text content to display and pass to the /student/register endpoint.
    """
    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")

        elif filename.endswith(".pdf"):
            # Use pypdf to parse PDF bytes in-memory
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content))
                pages = []
                for page in reader.pages:
                    pg = page.extract_text()
                    if pg:
                        pages.append(pg)
                text = "\n".join(pages)
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"PDF parse error: {e}")

        elif filename.endswith(".docx"):
            # Unzip DOCX and read word/document.xml
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as docx:
                    xml_bytes = docx.read("word/document.xml")
                root = ET.fromstring(xml_bytes)
                ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
                text_nodes = root.iter(f"{ns}t")
                text = " ".join(n.text for n in text_nodes if n.text)
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"DOCX parse error: {e}")

        else:
            raise HTTPException(status_code=415, detail="Unsupported file type. Upload PDF, DOCX, or TXT.")

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract any text from the uploaded file.")

        return {"filename": filename, "text": text.strip()}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

# How to run this locally:
# uvicorn backend.main:app --reload
