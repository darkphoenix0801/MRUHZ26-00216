# PADO — Placement Assessment and Development Orchestrator
## Complete Technical Specification (Build Reference)

**Hackathon:** Hack-the-Matrix, Technidhi 2026 — Track 01: AI Agents
**Team:** 2 developers, 14-hour build window
**Flagship differentiator:** Adaptive Mock Interview Agent — a real Thought → Action → Observation loop that changes its next question based on accumulated memory of prior answers, not a fixed script.

---

## 1. PROJECT SUMMARY (feed this first for context)

PADO is an autonomous AI agent that acts as a placement preparation mentor for engineering students. A student uploads their resume and selects a target company. The system extracts their skill profile, generates a personalized preparation roadmap, and — as its core differentiating feature — runs an **adaptive mock interview** where each subsequent question is chosen by the agent based on a live query of the student's own answer history, not a pre-written question bank. The agent tags weaknesses per answer, stores everything in persistent memory, updates a placement-probability score using a hyperparameter-tuned ML classifier, and produces a company-readiness recommendation.

This is explicitly **not** a single-prompt chatbot. It satisfies the AI Agents track's four required capabilities:
- **Planning & Decision Making** — roadmap decomposition + live interview-branching decisions
- **Tool Usage** — resume parser, Whisper transcription, librosa audio analysis, SQL queries, ML inference endpoint
- **Memory Management** — persistent SQLite store queried mid-session to inform next actions
- **Autonomous Execution** — the interview loop and roadmap updates run without a human re-prompting each step

---

## 2. UPDATED MODEL RULE (IMPORTANT — READ BEFORE BUILDING THE ML COMPONENT)

Confirmed from organizers: **using an existing pretrained/off-the-shelf model architecture is allowed**, as long as the team **hyperparameter-tunes it and implements it end-to-end in the project**. This changes the ML plan from "train from scratch" to "select a proven model class, tune it properly, and wire it into the live pipeline with visible evidence of tuning."

### What this means concretely:

- Use **XGBoost's `XGBClassifier`** (existing, well-established model class) instead of a plain RandomForest — it's a legitimate "existing model," and it has many more hyperparameters, which makes the tuning story stronger and more visible to judges.
- Perform actual hyperparameter search — **`RandomizedSearchCV`** from scikit-learn (faster than GridSearch, fits the time budget) over at least: `max_depth`, `learning_rate`, `n_estimators`, `subsample`, `colsample_bytree`, `min_child_weight`.
- **Keep the artifact.** Save the search results (`cv_results_`) or a small before/after accuracy comparison table — this is your proof of tuning for the judges' rubric and for Phase 1 validation if asked.
- This satisfies "AI_NECESSITY" and "Tech Execution" scoring criteria better than a from-scratch model would, because tuning an existing model well is a real, demonstrable skill and takes less time than building one from nothing.

**Model to build:** Placement Probability Predictor
**Input features:** `cgpa`, `dsa_score`, `aptitude_score`, `communication_score`, `mock_interview_avg_score`
**Output:** probability (0–100%) student clears their selected target company
**Base model:** `XGBClassifier` (binary classification: cleared / not cleared, trained on synthetic labeled data)
**Tuning method:** `RandomizedSearchCV`, 5-fold CV, ~20–30 iterations (keep this small — you have 1 hour budgeted for this step)

---

## 3. TECH STACK (all free tier)

| Layer | Tool | Notes |
|---|---|---|
| LLM inference | Groq API (Llama 3.1/3.3) or Google AI Studio (Gemini Flash) | Free tier, fast enough for live demo |
| Speech-to-text | Groq's Whisper endpoint (free) or local `openai-whisper` | Use Groq if internet is reliable at venue — much faster |
| Audio feature extraction | `librosa` (Python, free, local) | Pace, pause length, energy variance as confidence proxies |
| ML model | `xgboost` + `scikit-learn` (`RandomizedSearchCV`) | Free, local training, no GPU needed |
| Backend | FastAPI (Python) | Simple REST endpoints, fast to scaffold with AI |
| Frontend | Streamlit (fastest) **or** React + Tailwind if team is comfortable | Streamlit strongly recommended given the 14-hour window |
| Database | SQLite | Zero-setup, file-based, perfect for hackathon scope |
| Resume parsing | Raw text extraction (`pdfplumber` or `python-docx`) + LLM prompt to structure it | Don't use a dedicated resume-parsing library — prompting is faster and more flexible |
| Hosting/demo | Local run on laptop, or Streamlit Community Cloud if deploying | Local is safer for live demo — no dependency on venue wifi for hosting (still needs wifi for LLM API calls) |

---

## 4. SYSTEM ARCHITECTURE

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Frontend   │────▶│   FastAPI Backend │────▶│   SQLite Database   │
│ (Streamlit)  │◀────│                   │◀────│  (persistent memory)│
└─────────────┘     └──────────────────┘     └────────────────────┘
                            │      │
              ┌─────────────┘      └──────────────┐
              ▼                                     ▼
    ┌──────────────────┐                 ┌──────────────────────┐
    │  LLM API (Groq/   │                 │  ML Inference          │
    │  Gemini) — used   │                 │  Endpoint (XGBoost,    │
    │  for: resume       │                 │  tuned via             │
    │  extraction,       │                 │  RandomizedSearchCV)   │
    │  roadmap gen,      │                 └──────────────────────┘
    │  interview scoring,│
    │  question selection│
    │  logic (agent core)│
    └──────────────────┘
              │
              ▼
    ┌──────────────────────┐
    │  Whisper (STT) +       │
    │  librosa (audio         │
    │  features) — voice       │
    │  interview pipeline       │
    └──────────────────────┘
```

---

## 5. DATABASE SCHEMA (SQLite — set this up in Hour 1, everything writes to it)

```sql
CREATE TABLE student_profile (
    student_id       TEXT PRIMARY KEY,
    name             TEXT,
    resume_text      TEXT,
    extracted_skills TEXT,        -- JSON array, from LLM extraction
    cgpa             REAL,
    target_company   TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roadmap (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id       TEXT,
    category         TEXT,        -- 'DSA' | 'Aptitude' | 'Core Subjects' | 'Communication'
    topic            TEXT,
    status           TEXT DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'done'
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profile(student_id)
);

-- THE CORE MEMORY TABLE — the adaptive interview agent reads and writes this live
CREATE TABLE interview_sessions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id          TEXT,
    session_id          TEXT,     -- groups questions belonging to one interview run
    question_number     INTEGER,
    question_text       TEXT,
    question_category   TEXT,     -- 'DSA' | 'System Design' | 'Behavioral' | 'OS' | 'DBMS' | 'CN'
    answer_transcript   TEXT,
    content_score        REAL,    -- 0-100, from LLM scoring the transcript
    confidence_score      REAL,   -- 0-100, from librosa audio features
    weakness_tag         TEXT,    -- LLM-assigned category this answer exposed as weak
    timestamp            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profile(student_id)
);

CREATE TABLE weekly_progress (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id            TEXT,
    week_number           INTEGER,
    dsa_score              REAL,
    aptitude_score          REAL,
    communication_score      REAL,
    placement_probability    REAL,  -- output from the tuned XGBoost model
    recorded_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profile(student_id)
);
```

---

## 6. THE ADAPTIVE INTERVIEW AGENT — CORE LOGIC (build this first, hardest part)

This is the flagship feature. Build and test it in **text-only mode first**, add voice after the reasoning loop is verified correct.

### Loop pseudocode:

```
FUNCTION run_interview_turn(student_id, session_id):

    # OBSERVE: pull everything this student has answered so far in this session
    past_answers = QUERY interview_sessions
                   WHERE student_id = student_id AND session_id = session_id
                   ORDER BY question_number

    # THINK: decide what to ask next based on memory
    IF past_answers is empty:
        next_category = pick_opening_category(target_company)  # e.g. start broad
    ELSE:
        weak_categories = [row.weakness_tag for row in past_answers WHERE row.content_score < 60]
        IF weak_categories is not empty:
            next_category = most_frequent(weak_categories)   # drill into the weakest area
        ELSE:
            next_category = next_unexplored_category(past_answers, target_company)  # broaden coverage

    # ACT: generate the actual question via LLM, grounded in category + company + past questions
    #      (pass past_answers as context so it doesn't repeat itself)
    question = LLM_CALL(
        prompt = build_question_prompt(next_category, target_company, past_answers)
    )

    RETURN question, next_category


FUNCTION score_and_store_answer(student_id, session_id, question, category, audio_file):

    transcript = WHISPER_TRANSCRIBE(audio_file)
    audio_features = LIBROSA_EXTRACT(audio_file)   # pace, pauses, energy variance
    confidence_score = compute_confidence_score(audio_features)

    content_score, weakness_tag = LLM_CALL(
        prompt = build_scoring_prompt(question, transcript, category)
    )
    # LLM returns both a 0-100 score AND a specific weakness tag if score is low

    INSERT INTO interview_sessions (...)

    RETURN content_score, confidence_score, weakness_tag
```

### Why this satisfies "AI Agent" and not "chatbot":

The next question is **not predetermined**. It is a live decision made by querying the agent's own memory table and branching based on what it finds — this is the Thought → Action → Observation loop the track literally requires. A chatbot would ask a fixed list of questions regardless of how the student answered; this system does not.

### Demo moment to rehearse:

Deliberately answer one question poorly on a specific topic (e.g. System Design), then show the agent's next question pivoting to drill into System Design specifically — narrate out loud "notice the agent just queried its memory and chose to follow up here because I scored low on this category." This is your single most important 90 seconds of the whole presentation.

---

## 7. LLM PROMPTS (use these as starting points, feed directly to Antigravity)

### 7.1 Resume extraction prompt
```
You are extracting structured data from a student's resume text.
Resume text: {resume_text}

Return ONLY valid JSON in this exact format:
{
  "skills": ["skill1", "skill2", ...],
  "cgpa": <number or null if not found>,
  "projects": ["short project description", ...],
  "strengths": ["inferred strength area", ...],
  "weaknesses": ["inferred gap area based on missing common skills", ...]
}
```

### 7.2 Roadmap generation prompt
```
Student profile: {extracted_skills_json}
Target company: {target_company}

Generate a preparation roadmap across exactly these 4 categories: DSA, Aptitude, Core Subjects, Communication.
For each category, list 3-5 specific topics the student should focus on, prioritized by
relevance to {target_company}'s known interview pattern and gaps visible in the student's profile.

Return ONLY valid JSON:
{
  "DSA": ["topic1", "topic2", ...],
  "Aptitude": [...],
  "Core Subjects": [...],
  "Communication": [...]
}
```

### 7.3 Interview question generation prompt (used inside the agent loop)
```
You are conducting a mock interview for a candidate targeting {target_company}.
Focus category for this question: {next_category}
Questions already asked this session: {past_questions_list}

Generate ONE interview question in the {next_category} category, appropriate for
{target_company}'s interview style. Do not repeat any prior question or topic.
Return only the question text, no preamble.
```

### 7.4 Answer scoring prompt
```
Question asked: {question}
Category: {category}
Candidate's answer transcript: {transcript}

Score this answer from 0-100 on correctness/quality for the given category.
If the score is below 60, identify the specific weakness (be precise, e.g.
"Graph traversal - BFS/DFS confusion" not just "DSA weak").

Return ONLY valid JSON:
{
  "content_score": <0-100>,
  "weakness_tag": "<specific weakness or null if score >= 60>",
  "brief_feedback": "<one sentence>"
}
```

### 7.5 Final recommendation prompt (end of session)
```
Student's accumulated interview performance: {all_session_rows_summary}
Placement probability from ML model: {model_output}%
Target company: {target_company}

Produce a short readiness summary:
1. Top 2 weakness areas to prioritize this week
2. Whether the student is currently "Ready" / "Needs Improvement" / "Not Ready" for {target_company}
3. One specific, actionable next step

Keep it under 100 words, direct and specific — no generic advice.
```

---

## 8. ML PIPELINE — HYPERPARAMETER TUNING DETAIL

```python
# Step 1: synthetic dataset generation (Dev 2, Hour 0.5-1.5)
# Generate ~500-1000 synthetic rows with numpy/Faker:
# columns: cgpa, dsa_score, aptitude_score, communication_score, mock_interview_avg_score, placed (0/1)
# Make 'placed' correlate realistically with the other columns (not random) so the model
# actually learns something demonstrable — e.g. weighted sum + noise threshold.

# Step 2: hyperparameter tuning (existing model, tuned — satisfies the updated rule)
from xgboost import XGBClassifier
from sklearn.model_selection import RandomizedSearchCV

param_dist = {
    'max_depth': [3, 4, 5, 6, 7],
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'n_estimators': [50, 100, 150, 200],
    'subsample': [0.6, 0.8, 1.0],
    'colsample_bytree': [0.6, 0.8, 1.0],
    'min_child_weight': [1, 3, 5],
}

base_model = XGBClassifier(eval_metric='logloss')
search = RandomizedSearchCV(
    base_model, param_dist, n_iter=25, cv=5,
    scoring='accuracy', random_state=42, n_jobs=-1
)
search.fit(X_train, y_train)

best_model = search.best_estimator_
# SAVE search.cv_results_ or a before/after accuracy comparison — this is your tuning proof
print("Best params:", search.best_params_)
print("Best CV accuracy:", search.best_score_)

import joblib
joblib.dump(best_model, 'placement_model.pkl')

# Step 3: wrap in FastAPI endpoint
# POST /predict  { cgpa, dsa_score, aptitude_score, communication_score, mock_interview_avg_score }
# -> { "placement_probability": <0-100> }
```

**Keep a slide or printed snippet showing `search.best_params_` and the before/after accuracy** — this is direct evidence of "hyperparameter tuning an existing model," which is exactly what the organizers confirmed satisfies the model requirement.

---

## 9. API ENDPOINTS (FastAPI backend — give this list directly to Antigravity)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/student/upload_resume` | Accepts resume file, extracts profile via LLM, stores in `student_profile` |
| POST | `/student/select_company` | Stores `target_company`, triggers roadmap generation |
| GET | `/roadmap/{student_id}` | Returns current roadmap from DB |
| POST | `/interview/start` | Creates new `session_id`, returns first question |
| POST | `/interview/answer` | Accepts audio file, runs transcribe → score → store → decide next question, returns next question + running feedback |
| GET | `/interview/summary/{session_id}` | Returns final recommendation using prompt 7.5 |
| POST | `/predict/placement_probability` | Wraps the tuned XGBoost model |
| GET | `/dashboard/{student_id}` | Returns weekly_progress rows + interview_sessions aggregates for the UI |

---

## 10. FOLDER STRUCTURE (give this to Antigravity to scaffold)

```
pado/
├── backend/
│   ├── main.py                  # FastAPI app, routes
│   ├── db.py                    # SQLite connection + schema init
│   ├── llm_client.py            # wraps Groq/Gemini API calls
│   ├── agent/
│   │   ├── interview_agent.py   # the core adaptive loop (Section 6)
│   │   ├── roadmap_agent.py
│   │   └── recommendation_agent.py
│   ├── audio/
│   │   ├── transcribe.py        # Whisper wrapper
│   │   └── features.py          # librosa feature extraction
│   ├── ml/
│   │   ├── train_model.py       # Section 8 script
│   │   ├── placement_model.pkl  # saved tuned model
│   │   └── predict.py
│   └── prompts.py                # all prompts from Section 7 as constants
├── frontend/
│   └── app.py                    # Streamlit app, calls backend endpoints
├── data/
│   └── synthetic_placement_data.csv
├── pado.db                       # SQLite file
└── requirements.txt
```

### requirements.txt
```
fastapi
uvicorn
streamlit
xgboost
scikit-learn
pandas
numpy
librosa
openai-whisper       # or groq client if using Groq's hosted Whisper
groq                 # or google-generativeai
pdfplumber
python-multipart
joblib
faker
```

---

## 11. NON-NEGOTIABLE BUILD PRIORITIES (if time runs short)

1. **Protect the adaptive interview loop (Section 6)** — this is the entire differentiation. Everything else can be rough.
2. **Keep the memory schema real and queryable** — the dashboard can be ugly, but `interview_sessions` must actually be queried live by the agent, not just stored and ignored.
3. **A working text-only adaptive interview beats a broken voice one.** Get the branching logic correct before adding Whisper/librosa.
4. **Keep the tuning artifact** (`best_params_` + accuracy comparison) — takes 2 extra minutes, directly answers the updated model rule if a mentor asks.
5. Cut roadmap UI polish or dashboard styling before cutting interview-agent testing time.

---

## 12. DEMO SCRIPT (90-second core moment)

1. Show student profile + roadmap briefly (10 sec)
2. Start interview, answer question 1 normally (15 sec)
3. **Deliberately answer question 2 poorly** on a specific topic (15 sec)
4. **Narrate explicitly**: "Watch — the agent just queried its own memory of my last answer and is now choosing to follow up on that exact weak area, not moving to a random next question." (10 sec)
5. Show the agent's next question pivoting into that weak area (10 sec)
6. Cut to final summary: weakness tags, placement probability from the tuned model, recommendation (20 sec)
7. Close with the quantified productivity claim, stated out loud

---

*This document is structured for direct ingestion by an AI coding agent (Antigravity). Every section is self-contained enough to be handed off independently to Dev 1 or Dev 2's build stream.*
