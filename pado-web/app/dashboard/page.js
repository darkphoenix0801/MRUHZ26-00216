"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RegisterSection from "@/components/RegisterSection";
import InterviewSection from "@/components/InterviewSection";
import AnalyticsSection from "@/components/AnalyticsSection";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pado_user");
    if (!stored) {
      router.push("/auth");
    } else {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("pado_user");
        router.push("/auth");
      }
    }
  }, [router]);

  if (!mounted || !user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Here is your placement coaching dashboard.
          </p>
        </div>
        
        <RegisterSection user={user} />
        <InterviewSection user={user} />
        <AnalyticsSection user={user} />
      </main>
    </>
  );
}
