"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/components/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900 relative">
        
        {/* Animated Colorful Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="z-10 relative flex w-full">
          <Sidebar user={user} activePath={pathname} />
          <main className="flex-1 min-h-screen pl-[80px] bg-transparent">
            <div className="w-full relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
