# 🗺️ PADO Phase 2: Resume Extraction, Roadmap Generation & DB Integration

This document outlines the detailed tasks and implementation steps for Phase 2 of building **PADO**. 

In this phase, we will connect our SQLite database (`backend/db.py`) to the FastAPI server and write the LLM (Large Language Model) orchestration code to **parse resumes**, **extract skills**, and **generate personalized weekly study roadmaps** automatically when a student registers.

---

## 📅 Phase 2 Task Checklist

- [ ] **Step 1: Environment Setup & Safe API Key Configuration**
  * Create a `.env` file in the project root to store your `GEMINI_API_KEY`.
  * Install `google-generativeai` and `python-dotenv`.
- [ ] **Step 2: Create LLM prompts module (`backend/agent/prompts.py`)**
  * Define structured prompts for resume extraction and roadmap generation.
- [ ] **Step 3: Create LLM Client (`backend/agent/llm_client.py`)**
  * Initialize the Google Gemini API client.
  * Implement functions to call Gemini and return parsed JSON outputs for resumes and roadmaps.
- [ ] **Step 4: Connect DB to FastAPI (`backend/main.py`)**
  * Import database helper functions.
  * Implement a `POST /student/register` endpoint.
  * Implement a `GET /student/{student_id}/roadmap` endpoint.
- [ ] **Step 5: End-to-End Local Test**
  * Run the server and test registration with a mock resume.

---

## 🛠️ Step-by-Step Implementation Guide

### 🔑 Step 1: Environment Setup & Safe API Key Configuration
We will use Google's **Gemini API** because it is incredibly fast and offers free tier access for developers. 

1. Install the required Python packages in your virtual environment:
   ```bash
   source venv/bin/activate
   pip install google-generativeai python-dotenv
   ```

2. To keep your API key secure (and not leak it into Github where it could get stolen), create a `.env` file in the root folder (`/Users/charanteja/Desktop/hackthematrix/.env`) and add:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

---

### 📝 Step 2: Define the Prompts (`backend/agent/prompts.py`)
We need two distinct prompts. 

1. **Resume Extraction Prompt:** Reads raw text from a resume and extracts structured data (skills, CGPA, projects).
2. **Roadmap Generation Prompt:** Reads the extracted skills and generates a weekly study guide split into four categories (DSA, Aptitude, Core Subjects, Communication).

We will write these inside `backend/agent/prompts.py` as clean python variables.

---

### 🤖 Step 3: Write the Gemini client (`backend/agent/llm_client.py`)
We will write helper functions using the `google-generativeai` SDK.
* We will use the model **`gemini-1.5-flash`** (or `gemini-2.5-flash` if available) because it is highly optimized for fast, structured JSON outputs.
* We will use Gemini's **Structured Output** feature (by setting `response_mime_type="application/json"`) to guarantee that the LLM returns valid JSON without any markdown formatting bugs.

---

### 🌐 Step 4: Write the FastAPI Routes (`backend/main.py`)
We will import our database functions (`backend/db.py`) and our LLM helper functions (`backend/agent/llm_client.py`). We will build two new HTTP endpoints:

#### 1. `POST /student/register`
* **Incoming Body:** `{"student_id": "charan123", "name": "Charan Teja", "resume_text": "...", "cgpa": 8.5, "target_company": "Google"}`
* **Process:**
  1. The API calls `extract_skills_from_resume(resume_text)`.
  2. The database saves this profile using `save_student_profile(...)`.
  3. The API calls `generate_roadmap_from_skills(skills, target_company)`.
  4. The database saves each roadmap topic using `save_roadmap_item(...)`.
* **Outgoing Response:** `{"status": "success", "message": "Student registered and roadmap generated."}`

#### 2. `GET /student/{student_id}/roadmap`
* **Process:** Queries the database for all roadmap rows matching `student_id`.
* **Outgoing Response:** A clean JSON list of study topics categorized by section.

---

## 🏃‍♂️ Verification Walkthrough Example

Once Phase 2 is finished, you can run this test in Swagger UI (`http://localhost:8000/docs`):

1. **Send POST request to `/student/register`** with this payload:
   ```json
   {
     "student_id": "charan_01",
     "name": "Charan Teja",
     "resume_text": "Experienced in Python, FastAPI, and SQL. Completed projects in Machine Learning. CGPA is 8.5.",
     "cgpa": 8.5,
     "target_company": "Google"
   }
   ```
2. The backend will parse the resume, find `"Python"`, `"FastAPI"`, `"SQL"`, `"Machine Learning"`, and save them to `student_profile` in `pado.db`.
3. It will generate custom roadmap topics for Google (like "Graphs & Trees" for DSA, "System Architecture" for Core Subjects) and save them to the `roadmap` table.
4. **Send GET request to `/student/charan_01/roadmap`** and check that it returns the exact list of study items saved in SQLite!
