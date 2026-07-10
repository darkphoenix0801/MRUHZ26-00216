import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pado.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    print("🗄️ Initializing SQLite Database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create Student Profile Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profile (
        student_id       TEXT PRIMARY KEY,
        name             TEXT,
        resume_text      TEXT,
        extracted_skills TEXT,        -- JSON array/string, from LLM extraction
        cgpa             REAL,
        target_company   TEXT,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. Create Roadmap Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roadmap (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id       TEXT,
        category         TEXT,        -- 'DSA' | 'Aptitude' | 'Core Subjects' | 'Communication'
        topic            TEXT,
        status           TEXT DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'done'
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_profile(student_id)
    );
    """)
    
    # 3. Create Interview Sessions Table (Memory storage for adaptive questioning)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_sessions (
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
    """)
    
    # 4. Create Weekly Progress Table (For XGBoost inputs and outputs history)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weekly_progress (
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
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database tables successfully created/validated!")


# --- HELPER FUNCTIONS FOR INTERACTION ---

def save_student_profile(student_id, name, resume_text, extracted_skills, cgpa, target_company):
    """Saves or updates a student profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    # Serialize skills list to JSON string if it is a list
    if isinstance(extracted_skills, list):
        extracted_skills = json.dumps(extracted_skills)
        
    cursor.execute("""
    INSERT OR REPLACE INTO student_profile (student_id, name, resume_text, extracted_skills, cgpa, target_company)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (student_id, name, resume_text, extracted_skills, cgpa, target_company))
    conn.commit()
    conn.close()

def get_student_profile(student_id):
    """Retrieves student profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_profile WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def save_roadmap_item(student_id, category, topic):
    """Saves a roadmap topic recommendation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO roadmap (student_id, category, topic)
    VALUES (?, ?, ?)
    """, (student_id, category, topic))
    conn.commit()
    conn.close()

def get_roadmap(student_id):
    """Retrieves roadmap items for a student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM roadmap WHERE student_id = ?", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_interview_turn(student_id, session_id, question_number, question_text, question_category, 
                        answer_transcript=None, content_score=None, confidence_score=None, weakness_tag=None):
    """Saves or updates an interview question and answer turn."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO interview_sessions 
    (student_id, session_id, question_number, question_text, question_category, answer_transcript, content_score, confidence_score, weakness_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (student_id, session_id, question_number, question_text, question_category, 
          answer_transcript, content_score, confidence_score, weakness_tag))
    conn.commit()
    conn.close()

def get_past_answers(student_id, session_id):
    """Gets all questions and answers in a specific interview session ordered by question number."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM interview_sessions 
    WHERE student_id = ? AND session_id = ? 
    ORDER BY question_number
    """, (student_id, session_id))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_weekly_progress(student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability):
    """Saves weekly progress and the calculated placement probability."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO weekly_progress (student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability))
    conn.commit()
    conn.close()

def get_weekly_progress(student_id):
    """Retrieves progress history over time."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM weekly_progress WHERE student_id = ? ORDER BY week_number", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    init_db()
