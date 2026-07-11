# PADO: Placement Predictor & AI Agent Platform
**Complete End-to-End Technical Architecture & Journey Documentation**

## 1. Project Overview
**PADO** is an AI-powered, full-stack placement preparation ecosystem designed to help students prepare for technical and behavioral interviews. It acts as a personalized career coach by:
1. Parsing a student's resume to identify current skills.
2. Generating a highly personalized roadmap.
3. Conducting realistic mock interviews (both text and audio) using dynamic datasets.
4. Evaluating answers using strict AI judging.
5. Predicting the student's final placement probability using a trained Machine Learning model.

---

## 2. Technology Stack & Where Things Live

### **Frontend (The User Interface)**
- **Framework**: Next.js (App Router), React, TypeScript.
- **Styling**: Tailwind CSS for responsive, modern glassmorphic designs.
- **Animations**: GSAP (GreenSock) for fluid scroll triggers, page transitions, and timeline generation.
- **Location**: `/pado-web/` directory.
- **Running Via**: `npm run dev` (Port 3000).

### **Backend (The Core Engine)**
- **Framework**: FastAPI (Python) - chosen for its immense speed and native asynchronous capabilities.
- **Database**: SQLite (`pado.db`) - lightweight, serverless relational database.
- **Location**: `/backend/` directory.
- **Running Via**: `uvicorn backend.main:app --reload` (Port 8000).

### **AI & Machine Learning (The Brain)**
1. **Local LLM (LM Studio)**: Serves as the primary intelligence. It extracts skills, generates the roadmaps, formulates questions, and acts as a strict judge to grade answers.
2. **Hugging Face Datasets**: Used to ground the AI in reality so it doesn't hallucinate questions.
   - *Technical*: `kaysss/leetcode-problem-solutions`
   - *Behavioral*: `Aiman1234/Interview-questions`
3. **Audio Processing**:
   - *Whisper (OpenAI)*: Converts student's recorded `.wav` voice answers to text.
   - *Librosa*: Analyzes raw audio waveforms to measure speaking ratio vs. silence to generate a "Confidence Score".
4. **XGBoost ML Model**: A pre-trained ML model (`placement_model.pkl`) that takes a student's scores (DSA, Aptitude, Communication) and predicts their exact placement probability (0-100%).

---

## 3. The End-to-End API Journey (How They Communicate)

The frontend and backend communicate exclusively via RESTful APIs. Here is the step-by-step journey of a user moving through the application:

### **Phase 1: Onboarding & Roadmap Generation**
1. **User Action**: The user fills out their details, target company, and pastes their resume in the frontend setup page.
2. **API Call**: `POST /student/register`
3. **Backend Process**:
   - The FastAPI backend forwards the resume text to the **Local LLM**.
   - The LLM extracts the student's core skills and identifies weaknesses based on the target company.
   - The LLM dynamically generates a 4-category roadmap (DSA, Aptitude, Core Subjects, Communication).
   - The backend saves the user profile and roadmap into the **SQLite** database (`student_profile` and `roadmap` tables).
4. **Frontend Response**: The `RoadmapSection.tsx` fetches `GET /student/{id}/roadmap` and uses GSAP to draw an interactive timeline. Every node on the timeline is clickable and automatically redirects the user to a free YouTube tutorial for that specific topic.

### **Phase 2: Text Mock Interviews**
1. **User Action**: The user starts a mock interview for a specific company (e.g., Google).
2. **API Call**: `POST /interview/start`
3. **Backend Process**:
   - The backend looks at the current round type (e.g., "DSA" or "Behavioral").
   - It securely fetches a random real-world question from the **Hugging Face Datasets** loaded in memory.
   - It sends that dataset question to the **Local LLM** to format it as if an interviewer at "Google" is asking it.
4. **API Call**: `POST /interview/answer`
5. **Backend Process**:
   - The user submits their text answer.
   - The backend sends the question and the user's answer to the **Local LLM**, instructing it to act as a "STRICT judge".
   - The LLM returns a JSON object containing a `content_score` (0-100), `feedback`, and `weakness_tag`.
   - The interaction is saved to the `interview_sessions` table in SQLite.

### **Phase 3: Audio & Speech Confidence Training**
1. **User Action**: The user navigates to the Audio Training tab.
2. **API Call**: `GET /interview/random_behavioral`
   - Fetches a purely random non-technical question directly from the Hugging Face dataset.
3. **User Action**: The user records their voice in the browser using the Web MediaRecorder API.
4. **API Call**: `POST /interview/answer_audio` (Multipart Form Data with `.wav` file attached).
5. **Backend Process**:
   - The file is temporarily saved.
   - **Librosa** analyzes the file's decibel levels, zero-crossing rate, and calculates how much the user was actually speaking vs pausing. This generates a `Confidence Score`.
   - **Whisper** transcribes the spoken words into text.
   - The text is passed to the **Local LLM** to generate a `Content Score` and feedback.
   - Everything is merged and returned to the frontend.

### **Phase 4: ML Analytics & Prediction**
1. **Trigger**: When an interview session naturally concludes (max questions reached), the backend automatically triggers the ML pipeline.
2. **Backend Process**:
   - It aggregates all the scores from the DB for that session.
   - It feeds the scores (`cgpa`, `dsa`, `aptitude`, `communication`) into the **XGBoost `placement_model.pkl`**.
   - The model predicts the probability of placement. If `> 65%`, the status is "Ready", else "Needs Improvement".
   - This record is saved into the `weekly_progress` table.
3. **API Call**: `GET /student/{id}/progress`
4. **Frontend Process**: The `AnalyticsSection.tsx` fetches the historical progress and plots a beautiful GSAP animated bar chart. It explicitly highlights the ML model's prediction by color-coding bars green/red and attaching "READY" or "NEEDS WORK" status badges.

---

## 4. Database Schema Structure (SQLite)

1. **`student_profile`**: Stores basic info, hashed passwords, CGPA, target company, and JSON-stringified extracted skills.
2. **`roadmap`**: Stores individual milestones mapped to a specific `student_id`.
3. **`interview_sessions`**: The history log of every single question asked, the answer given, the LLM feedback, the weakness tag, and the confidence/content scores.
4. **`weekly_progress`**: Stores the aggregated metrics and the final output of the XGBoost ML model for historical tracking.

---

## 5. Summary of Real-Time Execution
Everything runs locally on your machine for maximum privacy and speed:
- **Node.js** runs the Next.js frontend.
- **Python (Uvicorn)** runs the FastAPI backend.
- **LM Studio** runs the local LLM on port 1234.
- **Hugging Face** datasets are cached locally.
- **Whisper/Librosa/XGBoost** execute directly inside the Python environment using your machine's CPU/GPU.
