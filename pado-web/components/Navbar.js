"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Code, Menu, X } from "lucide-react";
import { useUser } from "./UserContext";

export default function Navbar() {
  const { user, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-lg border-b border-white/10 shadow-2xl' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300">
              <span className="text-black text-xl font-bold tracking-tighter">P</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white hidden sm:block group-hover:text-gray-200 transition-colors">
              PADO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it Works</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Platform</Link>
            
            <div className="h-6 w-px bg-white/20 mx-2"></div>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-400 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <User size={14} className="text-blue-400" />
                  </div>
                  {user.name}
                </Link>
                <button 
                  onClick={logout} 
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/auth" className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 py-6 px-6 flex flex-col gap-6 shadow-2xl">
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300">How it Works</Link>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300">Platform</Link>
          <div className="h-px w-full bg-white/10"></div>
          {user ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm text-gray-400">Signed in as <strong className="text-white">{user.name}</strong></span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-red-400 font-medium">Log out</button>
            </div>
          ) : (
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="px-5 py-3 text-center bg-white text-black font-semibold rounded-xl">
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
