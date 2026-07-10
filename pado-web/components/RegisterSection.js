"use client";
import { useState, useRef } from "react";
import { gsap } from "gsap";

const BACKEND = "http://localhost:8000";

export default function RegisterSection({ user }) {
  const [form, setForm] = useState({
    cgpa: "8.5",
    target_company: "Google",
  });
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");
  const roadmapRef = useRef(null);

  // Parse resume file: PDF, DOCX or TXT (client-side text extraction)
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      setResumeText(text);
    } else if (file.name.endsWith(".pdf")) {
      // Read raw text via FormData → backend helper endpoint
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`${BACKEND}/util/parse_resume`, { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setResumeText(data.text);
        } else {
          setError("Could not parse PDF. Try pasting your resume text below.");
        }
      } catch {
        setError("Backend not reachable. Paste your resume text manually.");
      }
    } else if (file.name.endsWith(".docx")) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`${BACKEND}/util/parse_resume`, { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setResumeText(data.text);
        } else {
          setError("Could not parse DOCX. Try pasting your resume text below.");
        }
      } catch {
        setError("Backend not reachable. Paste your resume text manually.");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.student_id || !form.name || !resumeText) {
    if (!resumeText) {
      setError("Please provide a resume.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.student_id || "demo_user",
          name: user?.name || "Demo User",
          cgpa: parseFloat(form.cgpa) || 0.0,
          target_company: form.target_company,
          resume_text: resumeText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      setRoadmap(data.roadmap);
      // Animate roadmap cards in
      setTimeout(() => {
        if (roadmapRef.current) {
          gsap.fromTo(
            roadmapRef.current.querySelectorAll(".roadmap-card"),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
          );
        }
      }, 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const categoryMeta = {
    DSA: { icon: "⌥", label: "Data Structures & Algorithms" },
    Aptitude: { icon: "◈", label: "Aptitude & Reasoning" },
    "Core Subjects": { icon: "◉", label: "Core CS Subjects" },
    Communication: { icon: "◎", label: "Communication Skills" },
  };

  return (
    <section id="register" className="py-24 px-6 border-t border-gray-100 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Step 01</p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Build Your Study Roadmap
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl">
            Upload your resume and your local Llama model will extract your skills, identify gaps, and generate a tailored preparation plan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">CGPA</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Target Company</label>
                <select
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  value={form.target_company}
                  onChange={(e) => setForm({ ...form, target_company: e.target.value })}
                >
                  {["Google", "Amazon", "Meta", "Microsoft", "Netflix"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Resume File</label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all bg-white">
                <div className="text-center">
                  {fileName ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">✓ {fileName}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Drop your resume here</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Manual fallback */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Resume Text <span className="text-gray-300">(auto-filled from upload or paste manually)</span>
              </label>
              <textarea
                rows={4}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading || !resumeText}
              className="w-full py-3.5 mt-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating roadmap…
                </>
              ) : (
                "Generate Study Roadmap →"
              )}
            </button>
          </form>

          {/* Roadmap Output */}
          <div id="roadmap" ref={roadmapRef}>
            {roadmap ? (
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(roadmap).map(([cat, topics]) => (
                  <div key={cat} className="roadmap-card bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-base">{categoryMeta[cat]?.icon || "◆"}</span>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{cat}</p>
                        <p className="text-sm font-semibold text-gray-900">{categoryMeta[cat]?.label}</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-gray-300 mt-0.5">—</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-center p-8">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <span className="text-2xl">◈</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Your roadmap will appear here</p>
                <p className="text-xs text-gray-400 mt-1">Fill the form and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
