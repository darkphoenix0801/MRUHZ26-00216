# PADO — Team Collaboration & Integration Plan
## Hack-the-Matrix 2026 — Track 01: AI Agents

This document defines the tasks, timeline, and merge integration points for the two-member team building **PADO**.

---

## 👥 Role Breakdown

*   **You (Dev 1 - ML & Analytics Lead):** Focuses on dataset creation, hyperparametered XGBoost model training, hyperparameter tuning, testing, and wrapping the ML model in a FastAPI endpoint.
*   **Your Teammate (Dev 2 - Agent & Full Stack Lead):** Focuses on SQLite database schema, FastAPI server scaffolding, the core Adaptive Agent loop, LLM prompts, Whisper/librosa audio, and the Streamlit frontend.

---

## 📅 Timeline & Step-by-Step Task List

### 🛠️ Developer 1 (You): ML & Inference Pipeline
Your goal is to build, tune, and expose the Placement Probability model quickly, then assist Dev 2 on backend/agent integration.

*   [ ] **Step 1: Synthetic Dataset Generation** (Hour 0.0 – 1.0)
    *   Create `data/synthetic_placement_data.csv` using a script.
    *   Generate ~1000 records containing: `cgpa`, `dsa_score`, `aptitude_score`, `communication_score`, `mock_interview_avg_score`, `placed` (0 or 1).
    *   *Rule:* Ensure features correlate logically (e.g., `placed = 1` requires high scores in DSA/CGPA + random noise) so the model learns meaningful boundaries.
*   [ ] **Step 2: Model Training & Hyperparameter Tuning** (Hour 1.0 – 2.5)
    *   Write `backend/ml/train_model.py`.
    *   Implement an `XGBClassifier`.
    *   Use `RandomizedSearchCV` (5-fold CV, ~20-30 iterations) to tune: `max_depth`, `learning_rate`, `n_estimators`, `subsample`, `colsample_bytree`.
    *   Save training metrics, search logs, and a before/after accuracy comparison table (crucial evidence for judges).
    *   Export the tuned model to `backend/ml/placement_model.pkl`.
*   [ ] **Step 3: Inference Service & Local Testing** (Hour 2.5 – 3.5)
    *   Write `backend/ml/predict.py` to load the PKL model and run predictions.
    *   Create a simple script to verify inputs and outputs.
*   [ ] **Step 4: Expose ML API Endpoint** (Hour 3.5 – 4.5)
    *   Implement the `/predict/placement_probability` POST endpoint in FastAPI.
    *   Ensure it takes features and returns the percentage probability (0-100%).
*   [ ] **Step 5: Assist Dev 2 / Integration Support** (Hour 4.5 onwards)
    *   Join Dev 2's build stream. Assist with SQLite queries, refining LLM prompts, or frontend testing.

---

### 💻 Developer 2 (Teammate): DB, Agent Loop, & Frontend
Their goal is to scaffold the application shell, build the agent reasoning logic, and construct the UI.

*   [ ] **Step 1: Database Setup** (Hour 0.0 – 1.0)
    *   Write `backend/db.py` to initialize the SQLite database (`pado.db`).
    *   Create tables: `student_profile`, `roadmap`, `interview_sessions` (agent memory), and `weekly_progress`.
*   [ ] **Step 2: Backend Scaffolding** (Hour 1.0 – 3.0)
    *   Scaffold `backend/main.py` using FastAPI.
    *   Implement endpoints for resume parsing, target company selection, and database operations.
*   [ ] **Step 3: The Adaptive Agent Reasoning Loop** (Hour 3.0 – 6.0)
    *   Write `backend/agent/interview_agent.py`.
    *   **Crucial Logic:** Query the SQLite `interview_sessions` table live to extract weakness tags. Feed this memory context back into the LLM prompt to dynamically branch and generate the next interview question.
    *   Test in text-only mode first to ensure it's not behaving like a stateless chatbot.
*   [ ] **Step 4: Audio Processing (Whisper & librosa)** (Hour 6.0 – 8.0)
    *   Integrate Whisper transcription for the audio response.
    *   Write `backend/audio/features.py` to extract pitch/pauses with `librosa`.
*   [ ] **Step 5: Streamlit Frontend** (Hour 8.0 – 10.0)
    *   Build the main UI in `frontend/app.py`.
    *   Add file upload for resumes, visual roadmap display, and the interactive mock interview panel.

---

## 🔀 The Integration & Merge Strategy

To avoid Git conflicts and build blockages, you should run on separate branches and merge at a designated synchronization point.

### 📌 Recommended Git Branching Model:
*   `main` — Production-ready code. Never write code directly here.
*   `feature/ml-pipeline` — Dev 1 (You) work branch.
*   `feature/agent-core` — Dev 2 (Teammate) work branch.

### 🏁 The Merge Point (Hour 4.0 – 5.0)

You should merge your branches when the following conditions are met:
1.  **Dev 1** has completed the tuned ML model, saved the `.pkl` artifact, and successfully created the `/predict/placement_probability` endpoint.
2.  **Dev 2** has scaffolded the FastAPI base and set up the SQLite database locally.

#### Integration Steps:
1.  Dev 1 pulls `feature/agent-core` into `feature/ml-pipeline` (or vice-versa) to verify everything compiles locally.
2.  Wire Dev 1's ML inference endpoint directly into the backend main loop:
    *   When the mock interview ends, Dev 2's code queries the SQLite database for average scores (`mock_interview_avg_score`, etc.).
    *   It calls Dev 1's local inference endpoint with those averages.
    *   The returned probability percentage is saved in the database's `weekly_progress` table and displayed on the Streamlit dashboard.
3.  Once the integrated local test passes, merge the combined branch into `main`.

---

## 💡 Pro-Tips for Git Conflict Avoidance:
*   **Decoupled Directories:** Because you are working in `backend/ml/` and your teammate is working in `backend/agent/` and `backend/db/`, you will not be editing the same files. This keeps Git merges clean.
*   **Mock Endpoint:** Before Dev 1 finishes the actual ML model, Dev 2 can use a mock function that returns a dummy placement probability (e.g. `return random.randint(40, 95)`). This allows Dev 2 to build the frontend without waiting for the ML model to be fully trained.
