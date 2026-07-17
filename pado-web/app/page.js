import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import { IntroOverlay } from "@/components/CinematicIntro";

export default function Home() {
  return (
    <>
      <IntroOverlay title="PADO" subtitle="AI PLACEMENT COACH" />
      <Navbar />
      <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-white overflow-hidden">
        <Hero />
        <HowItWorks />
      </main>
      
      {/* Minimal Premium Footer */}
      <footer className="border-t border-white/5 py-16 text-center bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="w-10 h-10 mx-auto rounded-xl bg-white flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300">
          <span className="text-black text-lg font-bold tracking-tight">P</span>
        </div>
        <p className="text-sm text-zinc-500 font-medium tracking-wide">
          © {new Date().getFullYear()} PADO. Elevate your potential.
        </p>
      </footer>
    </>
  );
}
