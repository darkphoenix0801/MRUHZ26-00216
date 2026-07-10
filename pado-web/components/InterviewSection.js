"use client";
import { useState, useRef } from "react";
import { gsap } from "gsap";

const BACKEND = "http://localhost:8000";

function ScoreBar({ score }) {
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Score</span>
        <span className={score >= 60 ? "text-gray-700 font-medium" : "text-red-500 font-medium"}>{score}/100</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-700 ${score >= 60 ? "bg-gray-900" : "bg-red-400"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewSection({ user }) {
  const [sessionId, setSessionId] = useState("");
  const [active, setActive] = useState(false);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState({ text: "", category: "", number: 1 });
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const questionCardRef = useRef(null);
  const resultRef = useRef(null);

  function animateIn(el) {
    if (!el) return;
    gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
  }

  async function startInterview() {
    setError("");
    setResult(null);
    setHistory([]);
    const sid = `sess_${Math.random().toString(36).slice(2, 10)}`;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user?.student_id || "demo_user", session_id: sid, topic: topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSessionId(sid);
      setQuestion({ text: data.question_text, category: data.category, number: 1 });
      setActive(true);
      setTimeout(() => animateIn(questionCardRef.current), 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.student_id || "demo_user",
          session_id: sessionId,
          question_number: question.number,
          question_text: question.text,
          category: question.category,
          answer_text: answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setHistory((h) => [...h, data.turn_result]);
      setAnswer("");

      if (!data.complete) {
        const nq = data.next_question;
        setQuestion({ text: nq.question_text, category: nq.category, number: nq.question_number });
        setTimeout(() => animateIn(questionCardRef.current), 50);
      } else {
        setActive(false);
        setResult({ probability: data.placement_probability, summary: data.summary });
        setTimeout(() => animateIn(resultRef.current), 50);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const progressPct = active ? Math.round(((question.number - 1) / 3) * 100) : result ? 100 : 0;

  return (
    <section id="interview" className="py-24 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Step 02</p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Adaptive Mock Interview
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl">
            The agent reads your past answers from its session memory and pivots to drill down on weak topics — just like a real interviewer.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main Panel (3 cols) */}
          <div className="md:col-span-3">
            {!active && !result && (
              <div className="border border-gray-100 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6 text-2xl">
                  ◉
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to begin?</h3>
                <p className="text-sm text-gray-500 mb-6">3 adaptive questions, scored in real-time by your local Llama model.</p>
                <input
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="Interview Topic (e.g. React, Python)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {loading ? "Starting…" : "Start Interview →"}
                </button>
                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
              </div>
            )}

            {/* Active Question Card */}
            {active && (
              <div ref={questionCardRef}>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Question {question.number} of 3</span>
                    <span className="uppercase tracking-widest font-medium text-gray-500">{question.category}</span>
                  </div>
                  <div className="h-0.5 bg-gray-100 rounded-full">
                    <div
                      className="h-0.5 bg-gray-900 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-6 mb-4 bg-white shadow-sm">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Question</p>
                  <p className="text-gray-900 text-base leading-relaxed">{question.text}</p>
                </div>

                <textarea
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none mb-4"
                  placeholder="Type your answer here…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                <div className="flex gap-3">
                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="flex-1 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40"
                  >
                    {loading ? "Grading…" : "Submit Answer →"}
                  </button>
                  <button
                    onClick={() => { setActive(false); setHistory([]); }}
                    className="px-4 py-3 text-sm text-gray-400 border border-gray-200 rounded-xl hover:border-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
              </div>
            )}

            {/* Result Card */}
            {result && (
              <div ref={resultRef} className="border border-gray-100 rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Session Complete</p>
                <div className="flex items-end gap-4 mb-6">
                  <div>
                    <p className="text-5xl font-semibold text-gray-900 tracking-tight">{result.probability}%</p>
                    <p className="text-sm text-gray-400 mt-1">XGBoost Placement Probability</p>
                  </div>
                  <span
                    className={`mb-1 px-3 py-1 text-xs font-medium rounded-full ${
                      result.probability > 65
                        ? "bg-gray-900 text-white"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {result.probability > 65 ? "Ready" : "Needs Improvement"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Llama Feedback</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </div>

                <button
                  onClick={() => { setResult(null); setHistory([]); }}
                  className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-900 transition-colors"
                >
                  Start new session
                </button>
              </div>
            )}
          </div>

          {/* Observation log (2 cols) */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Observation Log</p>
              {history.length === 0 ? (
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-xs text-gray-400">Turn-by-turn scores will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.question_number} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Q{h.question_number} · {h.category}</p>
                        {h.weakness_tag && (
                          <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">Weak</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{h.question_text}</p>
                      <ScoreBar score={h.content_score} />
                      {h.weakness_tag && (
                        <p className="text-xs text-red-400 mt-2">↳ {h.weakness_tag}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{h.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
