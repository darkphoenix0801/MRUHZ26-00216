<div align="center">
  <h1>🚀 PADO</h1>
  <p><b>Personalized Adaptive Interview & Placement Ecosystem</b></p>
</div>

Welcome to the **PADO** repository! PADO is a complete, end-to-end AI placement preparation ecosystem. Instead of relying on static questions and generic roadmaps, PADO uses a suite of intelligent tools to simulate a highly personalized, adaptive interview experience.

---

## 🧠 Core AI Technologies Used

We heavily emphasize local, privacy-first, and highly optimized models. Our entire ecosystem is driven by:

1. **Hyperparametered local LLM**: We use a highly optimized, hyperparametered local LLM to orchestrate the personalized interview process, parse resumes, extract skills, and generate personalized weekly study roadmaps. This ensures zero data leakage, complete privacy, and no reliance on expensive external API endpoints.
2. **Hyperparametered XGBoost ML Model**: We do not rely on basic heuristics. Instead, we use a sophisticated, hyperparametered XGBoost ML model (`placement_model.pkl`) to predict a student's exact placement probability (0-100%) based on their academic and interview performance metrics (DSA, Aptitude, Communication, CGPA). This model is hyperparameter-tuned locally using `RandomizedSearchCV` for maximum accuracy.

---

## 🏗️ Project Architecture

PADO is split into two primary components:

### 1. 🎨 Frontend (`pado-web/`)
- Built with **Next.js** and **React**.
- Provides a beautiful, interactive dashboard and cinematic interview experience using **GSAP** animations and **Tailwind CSS**.
- Communicates seamlessly with our backend to fetch personalized data and ML predictions.

### 2. ⚙️ Backend (`backend/`)
- Powered by **FastAPI** (Python).
- Hosts the **hyperparametered XGBoost ML model** for real-time placement probability predictions.
- Orchestrates the **hyperparametered local LLM** for resume parsing, roadmap generation, and mock interviews.
- Processes audio using **Whisper** for transcription and **Librosa** for voice confidence measurement.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- LM Studio (for running the hyperparametered local LLM)

### Running the Project

**1. Start the Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Start the Frontend:**
```bash
cd pado-web
npm install
npm run dev
```
Open `http://localhost:3000` to see the application!

---

## 📚 Documentation

For a deep dive into our technical stack, architecture, and ML model tuning, check out our comprehensive guides:
- [PADO Full Technical Spec](./PADO_Full_Technical_Spec.md)
- [PADO Architecture Guide](./PADO_ARCHITECTURE_GUIDE.md)
- [PADO Evaluator Guide](./PADO_EVALUATOR_GUIDE.md)
- [Verification Guide](./VERIFICATION_GUIDE.md)
- [Phase 2 Backend Guide](./PHASE_2_BACKEND_GUIDE.md)
- [Collaboration Plan](./COLLABORATION_PLAN.md)

---
<div align="center">
  <i>Built with ❤️ for Hack The Matrix</i>
</div>
