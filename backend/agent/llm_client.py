import os
import json
import requests
from backend.agent.prompts import RESUME_EXTRACTION_PROMPT, ROADMAP_GENERATION_PROMPT

# Local LM Studio Server Configuration
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

def clean_and_parse_json(text: str) -> dict:
    """
    Cleans local LLM outputs which often contain markdown wrappers (e.g. ```json ... ```)
    and parses it into a Python dictionary.
    """
    cleaned = text.strip()
    # Often local LLMs include chatty text before or after the JSON block.
    # Find the first '{' and the last '}'
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        cleaned = cleaned[start_idx:end_idx + 1]
    else:
        # If no braces found, maybe it's just malformed
        pass
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON. Raw Text: {text}")
        raise ValueError(f"LLM did not return a valid JSON structure: {e}")

def call_local_llm(prompt: str) -> str:
    """Sends a chat request to the local LM Studio server."""
    payload = {
        "model": "local-model",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(LM_STUDIO_URL, json=payload, headers=headers, timeout=120)
        if response.status_code != 200:
            print(f"LM Studio Error Response: {response.text}")
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            "❌ Could not connect to LM Studio Local Server.\n"
            "Please make sure LM Studio is open, your model is loaded, and the local server is started on port 1234!"
        )
    except Exception as e:
        raise RuntimeError(f"Error communicating with local LLM: {e}")

def call_local_llm_as_judge(prompt: str) -> str:
    """
    Sends a scoring/judging request with a strict system prompt and temperature=0.
    This ensures the model acts as a harsh, honest grader, not an encouraging tutor.
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
    
    payload = {
        "model": "local-model",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0,  # Zero randomness so it can't hallucinate a good score
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(LM_STUDIO_URL, json=payload, headers=headers, timeout=120)
        if response.status_code != 200:
            print(f"LM Studio Error Response: {response.text}")
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        raise ConnectionError("❌ Could not connect to LM Studio Local Server.")
    except Exception as e:
        raise RuntimeError(f"Error communicating with local LLM judge: {e}")

def extract_skills_from_resume(resume_text: str) -> dict:
    """Sends resume text to local Llama model to extract structured skills, projects, and details."""
    prompt = RESUME_EXTRACTION_PROMPT.format(resume_text=resume_text)
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

def generate_roadmap_from_skills(extracted_skills_json: str, target_company: str) -> dict:
    """Sends extracted skills to local Llama model to generate a tailored preparation roadmap."""
    prompt = ROADMAP_GENERATION_PROMPT.format(
        extracted_skills_json=extracted_skills_json,
        target_company=target_company
    )
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

if __name__ == "__main__":
    # Test script to run locally
    test_resume = "FastAPI developer with 2 years experience. CGPA: 8.8. Worked on SQL and machine learning projects."
    try:
        print("🔍 Testing Local Resume Extraction...")
        res = extract_skills_from_resume(test_resume)
        print(json.dumps(res, indent=2))
        
        print("\n🔍 Testing Local Roadmap Generation...")
        roadmap = generate_roadmap_from_skills(json.dumps(res), "Google")
        print(json.dumps(roadmap, indent=2))
    except Exception as e:
        print(f"Test failed: {e}")
