# Prompts for PADO Resume extraction, Roadmap generation, Question generation, Scoring, and Recommendations

RESUME_EXTRACTION_PROMPT = """
You are extracting structured data from a student's resume text.
Resume text:
{resume_text}

Return ONLY valid JSON in this exact format:
{{
  "skills": ["skill1", "skill2", ...],
  "cgpa": <number or null if not found>,
  "projects": ["short project description", ...],
  "strengths": ["inferred strength area", ...],
  "weaknesses": ["inferred gap area based on missing common skills", ...]
}}
"""

ROADMAP_GENERATION_PROMPT = """
Student profile skills & details:
{extracted_skills_json}

Target company:
{target_company}

Generate a preparation roadmap across exactly these 4 categories: DSA, Aptitude, Core Subjects, Communication.
For each category, list 8-10 specific topics the student should focus on, prioritized by relevance to {target_company}'s known interview pattern and gaps visible in the student's profile.

Return ONLY valid JSON in this exact format:
{{
  "DSA": ["topic1", "topic2", ...],
  "Aptitude": ["topic1", "topic2", ...],
  "Core Subjects": ["topic1", "topic2", ...],
  "Communication": ["topic1", "topic2", ...]
}}
"""

QUESTION_GENERATION_PROMPT = """
You are an expert technical interviewer for {target_company}.
The candidate is currently in the following interview round:
- Round Name: {round_name}
- Round Type: {round_type}
- Round Focus: {round_focus}

Student profile skills: {skills_json}
Questions already asked this session: {past_questions_list}

Recent Live Web Context (Inspiration for your question based on real recent interview questions for {target_company}):
{live_context}

Generate ONE interview question for this specific round and focus.
Do not repeat any prior question. Use the Live Web Context to ask something realistic and recently asked at this company, adapting it slightly so it matches the student's skills if necessary.

IF the Round Type is "DSA" (Data Structures & Algorithms), you MUST format the question exactly like a LeetCode problem:
1. Provide a scenario or problem statement.
2. Provide at least two clear Examples with Input and Output.
3. Provide Constraints (e.g., time/space complexity expectations).

IF the Round Type is NOT "DSA" (e.g., System Design, Behavioral, Core Subjects), ask a direct, comprehensive interview question appropriate for {target_company}.

Generate a high-quality, modern question.
Return only the question text, no preamble, intro, or formatting other than the question itself.
"""

ANSWER_SCORING_PROMPT = """
Question asked: {question}
Category/Round Type: {category}
Candidate's answer/code: 
{transcript}

You are the Interviewer/Judge.
IF the category is "DSA", evaluate the candidate's code for:
1. Logical correctness (would it pass test cases?).
2. Time and Space Complexity.
3. Code quality.
IF the category is NOT "DSA", evaluate the answer for correctness, depth, and quality.

Score this answer from 0-100.
If the score is below 60, identify the specific weakness (be precise and actionable, e.g. "O(N^2) instead of O(N) time", or "Graph traversal - BFS/DFS confusion").

IMPORTANT scoring rules:
- If the answer is blank, just "#", "I don't know", "not sure", or completely irrelevant  content_score MUST be 0, and weakness_tag MUST be "Lacks basic knowledge of topic".
- If the code/answer is mostly correct but has inefficiencies  score between 40-70.
- Only give above 80 if the answer is genuinely strong, correct, and well-explained.

Return ONLY a valid JSON object containing exactly these three keys with your own honestly evaluated values:
- "content_score": (integer) Your graded score between 0 and 100.
- "weakness_tag": (string) The specific weakness identified, or "Lacks basic knowledge of topic" if they didn't know the answer.
- "brief_feedback": (string) 1-2 sentences of honest interviewer feedback.

Output ONLY the JSON object. No other text.
"""

FINAL_RECOMMENDATION_PROMPT = """
Student's accumulated interview performance:
{all_session_rows_summary}

Placement probability from ML model: {model_output}%
Target company: {target_company}

Produce a short readiness summary:
1. Top 2 weakness areas to prioritize this week.
2. Whether the student is currently "Ready", "Needs Improvement", or "Not Ready" for {target_company}.
3. One specific, actionable next step.

Keep it under 100 words, direct, and specific  no generic advice.
Return plain text format, no JSON wrappers.
"""
