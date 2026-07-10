"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    student_id: "",
    name: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student_id) return;
    
    // In a real app, this would be an API call to authenticate.
    // For this local app, we simply save to localStorage.
    localStorage.setItem(
      "pado_user",
      JSON.stringify({
        student_id: form.student_id,
        name: form.name || "Student",
      })
    );
    router.push("/dashboard");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-white">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin
                ? "Enter your Student ID to continue"
                : "Enter your details to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Student ID
              </label>
              <input
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                placeholder="charan_01"
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  placeholder="Charan Teja"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all"
            >
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
