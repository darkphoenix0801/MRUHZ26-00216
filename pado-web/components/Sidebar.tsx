"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Settings2, 
  Map as MapIcon, 
  MessageSquare, 
  BarChart3, 
  Mic2,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ user, activePath }: { user: any, activePath: string }) {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "setup", label: "Roadmap Setup", icon: Settings2, path: "/dashboard/setup" },
    { id: "roadmap", label: "Your Roadmap", icon: MapIcon, path: "/dashboard/roadmap" },
    { id: "interview", label: "Mock Interview", icon: MessageSquare, path: "/dashboard/interview" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { id: "audio", label: "Audio Training", icon: Mic2, path: "/dashboard/audio" },
  ];

  return (
    <>
      <aside
        ref={sidebarRef}
        className="group fixed top-0 left-0 h-screen bg-white/70 backdrop-blur-xl border-r border-white/60 flex flex-col justify-between p-4 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-[80px] hover:w-[260px] overflow-hidden shadow-[4px_0_30px_rgba(0,0,0,0.05)] hover:shadow-[8px_0_40px_rgba(0,0,0,0.08)]"
      >
        <div className="w-[220px]">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-4 px-2 mb-10 mt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <span className="text-white text-sm font-bold tracking-tight">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              PADO
            </span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Dashboard
            </p>
            {tabs.map((tab) => {
              const isActive = activePath.includes(tab.id);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`w-full flex items-center gap-4 px-2.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-md border border-white"
                      : "text-gray-500 hover:bg-white/50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="pt-4 border-t border-gray-200/50 relative w-[220px]">
          <Link
            href="/dashboard/account"
            className="w-full flex items-center justify-between px-2 py-2 hover:bg-white/80 rounded-xl transition-colors text-left group/profile shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex flex-shrink-0 items-center justify-center text-sm font-semibold text-indigo-700 border border-white shadow-sm">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <span className="text-sm font-semibold text-gray-900 leading-none">
                  {user?.name || "Student"}
                </span>
                <span className="text-xs text-gray-500 mt-1.5">
                  {user?.student_id || "guest"}
                </span>
              </div>
            </div>
            <ChevronRight 
              size={16} 
              className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover/profile:text-indigo-600" 
            />
          </Link>
        </div>
      </aside>
    </>
  );
}
