"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Mic, Shield } from "lucide-react";

export default function Hero() {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the hero text with a slight slide up
      gsap.from(textRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.5
      });
      
      // Gentle floating animation for background blobs
      gsap.to(blobRef.current.children, {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: 4,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          repeat: -1,
          yoyo: true
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Dynamic Background */}
      <div ref={blobRef} className="absolute inset-0 z-0 overflow-hidden opacity-60">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[40%] w-[600px] h-[600px] bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-5xl">
        <div ref={textRef} className="flex flex-col items-center text-center">
          
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-sm font-medium text-indigo-700 shadow-lg">
            <Sparkles size={16} className="text-indigo-500 animate-pulse" />
            <span>PADO 2.0 is now live</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-gray-900">
            Master your interview. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Secure your future.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The hyper-personalized, adaptive AI placement ecosystem that analyzes your resume, builds your roadmap, and simulates high-pressure interviews in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] group"
            >
              Start Preparing Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-50 text-indigo-700 font-medium rounded-full hover:bg-indigo-100 transition-colors flex items-center justify-center border border-indigo-100"
            >
              See how it works
            </Link>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2 text-blue-600 shadow-inner">
                <Brain size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Adaptive Intelligence</h3>
              <p className="text-sm text-gray-600">The LLM pivots questions based on your weakest technical areas.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2 text-purple-600 shadow-inner">
                <Mic size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Voice Analytics</h3>
              <p className="text-sm text-gray-600">Practice behavioral rounds by speaking. We transcribe and evaluate instantly.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2 text-emerald-600 shadow-inner">
                <Shield size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Data Driven</h3>
              <p className="text-sm text-gray-600">Live placement probability scoring via XGBoost models on your performance.</p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
