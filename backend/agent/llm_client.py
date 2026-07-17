import os
import json
import time
from dotenv import load_dotenv
from backend.agent.prompts import RESUME_EXTRACTION_PROMPT, ROADMAP_GENERATION_PROMPT
from groq import Groq
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

# Load environment variables from .env
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
USE_GEMINI_FALLBACK = os.environ.get("USE_GEMINI_FALLBACK", "true").lower() == "true"

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None

def clean_and_parse_json(text: str) -> dict:
    """
    Cleans LLM outputs which often contain markdown wrappers (e.g. ```json ... ```)
    and parses it into a Python dictionary.
    """
    cleaned = text.strip()
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        cleaned = cleaned[start_idx:end_idx + 1]
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON. Raw Text: {text}")
        raise ValueError(f"LLM did not return a valid JSON structure: {e}")

def call_with_retry(func, max_retries=3, base_delay=2):
    """Executes a function with simple exponential backoff."""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            print(f"⚠️ API Call Failed. Retrying in {delay} seconds... (Error: {e})")
            time.sleep(delay)

def call_groq(prompt: str, temperature: float = 0.2, system_message: str = None) -> str:
    if not groq_client:
        raise ValueError("GROQ_API_KEY is not set.")
        
    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})
    
    def _do_call():
        response = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=temperature
        )
        return response.choices[0].message.content
        
    return call_with_retry(_do_call)

def call_gemini(prompt: str, temperature: float = 0.2, system_message: str = None) -> str:
    if not gemini_client:
        raise ValueError("GEMINI_API_KEY is not set.")
    
    def _do_call():
        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_message,
                temperature=temperature,
            ),
        )
        return response.text
    return call_with_retry(_do_call)

def call_local_llm(prompt: str) -> str:
    """Sends a chat request to the LLM (formerly local, now Groq/Gemini)."""
    try:
        return call_groq(prompt, temperature=0.2)
    except Exception as e:
        if USE_GEMINI_FALLBACK and GEMINI_API_KEY:
            print(f"⚠️ Groq failed, falling back to Gemini: {e}")
            return call_gemini(prompt, temperature=0.2)
        raise RuntimeError(f"Error communicating with LLM: {e}")

def call_local_llm_as_judge(prompt: str) -> str:
    """
    Sends a scoring/judging request to the LLM with a strict system prompt and temperature=0.
    """
    system_message = (
        "You are a STRICT technical interviewer at a top tech company (like Google or Amazon). "
        "Your ONLY job is to honestly evaluate the candidate's answer to the question asked. "
        "You are NOT a tutor. You do NOT encourage. You do NOT give partial credit for vague answers. "
        "If the candidate says 'I don't know', 'not sure', '#', or submits blank/irrelevant text, "
        "you MUST give a score of 0. "
        "You must be completely honest. Your output MUST be ONLY a valid JSON object. "
        "Do NOT include any explanations, apologies, or conversational text outside the JSON."
    )
    try:
        return call_groq(prompt, temperature=0.0, system_message=system_message)
    except Exception as e:
        if USE_GEMINI_FALLBACK and GEMINI_API_KEY:
            print(f"⚠️ Groq failed (judge), falling back to Gemini: {e}")
            return call_gemini(prompt, temperature=0.0, system_message=system_message)
        raise RuntimeError(f"Error communicating with LLM judge: {e}")

def extract_skills_from_resume(resume_text: str) -> dict:
    """Sends resume text to LLM to extract structured skills, projects, and details."""
    prompt = RESUME_EXTRACTION_PROMPT.format(resume_text=resume_text)
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

def generate_roadmap_from_skills(extracted_skills_json: str, target_company: str) -> dict:
    """Sends extracted skills to LLM to generate a tailored preparation roadmap."""
    prompt = ROADMAP_GENERATION_PROMPT.format(
        extracted_skills_json=extracted_skills_json,
        target_company=target_company
    )
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

if __name__ == "__main__":
    # Test script to run
    test_resume = "FastAPI developer with 2 years experience. CGPA: 8.8. Worked on SQL and machine learning projects."
    try:
        print("🔍 Testing LLM Resume Extraction...")
        res = extract_skills_from_resume(test_resume)
        print(json.dumps(res, indent=2))
        
        print("\n🔍 Testing LLM Roadmap Generation...")
        roadmap = generate_roadmap_from_skills(json.dumps(res), "Google")
        print(json.dumps(roadmap, indent=2))
    except Exception as e:
        print(f"Test failed: {e}")
