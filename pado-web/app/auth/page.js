"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.password) return;
    
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/student/login" : "/student/register";
      
      const payload = isLogin 
        ? { student_id: form.student_id, password: form.password }
        : { 
            student_id: form.student_id, 
            name: form.name || "Student",
            password: form.password,
            resume_text: "N/A",
            cgpa: 0,
            target_company: "Any"
          };

      const res = await fetch(`https://pado-backend-5kg8.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await res.json();
      
      localStorage.setItem(
        "pado_user",
        JSON.stringify({
          student_id: form.student_id,
          name: form.name || data.name || "Student",
        })
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gray-950 pt-20">
        {/* Premium Dark Animated Background */}
        <div className="absolute inset-0 -z-10 w-full h-full">
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[20%] left-[40%] w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-gray-700/50 rounded-[2rem] p-10 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>
          
          <div className="text-center mb-10 relative z-10">
            <div className="w-16 h-16 mx-auto bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Enter your Student ID to continue your journey"
                : "Join the ultimate AI interview preparation ecosystem"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                Student ID
              </label>
              <input
                required
                className="w-full px-4 py-3.5 text-white border border-gray-700/50 rounded-xl bg-gray-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
                placeholder="e.g. charan_01"
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                  Full Name
                </label>
                <input
                  required
                  className="w-full px-4 py-3.5 text-white border border-gray-700/50 rounded-xl bg-gray-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
                  placeholder="e.g. Charan Teja"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
                Password
              </label>
              <input
                required
                type="password"
                className="w-full px-4 py-3.5 text-white border border-gray-700/50 rounded-xl bg-gray-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-white text-gray-950 text-sm font-bold rounded-xl hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </span>
              ) : (
                isLogin ? "Sign In" : "Register Now"
              )}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white font-medium transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
