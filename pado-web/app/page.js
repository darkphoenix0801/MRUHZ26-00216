import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ValueProposition from "@/components/ValueProposition";
import IdeaSection from "@/components/IdeaSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-gray-900 selection:bg-indigo-500/30 selection:text-indigo-900 overflow-hidden">
        <Hero />
        <ValueProposition />
        <IdeaSection />
        <HowItWorks />
      </main>
      
      {/* Minimal Premium Footer */}
      <footer className="border-t border-gray-200 py-16 text-center bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
        <div className="w-10 h-10 mx-auto rounded-xl bg-white flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100">
          <span className="text-indigo-600 text-lg font-bold tracking-tight">P</span>
        </div>
        <p className="text-sm text-gray-500 font-medium tracking-wide">
          © {new Date().getFullYear()} PADO. Elevate your potential.
          <br />
          All Rights are reserved : Bloodline Agents
        </p>
      </footer>
    </>
  );
}
