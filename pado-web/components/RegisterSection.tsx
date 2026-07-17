"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

const BACKEND = "https://mruhz26-00216.onrender.com";

export default function RegisterSection({ user }: { user: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    cgpa: "8.5",
    target_company: "Google",
  });
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

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
      // Redirect to Roadmap tab
      setTimeout(() => {
         router.push("/dashboard/roadmap");
      }, 500);
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

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 font-serif" style={{ letterSpacing: "-0.01em" }}>
            Build Your Study Roadmap
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Upload your resume and your local Llama model will extract your skills, identify gaps, and generate a tailored preparation plan.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
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
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-[#3D3929] text-white text-sm font-medium rounded-xl hover:bg-[#2A271C] disabled:bg-[#E5E3DB] disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
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
        </div>
      </div>
    </div>
  );
}
