"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Target, MessageSquare, LineChart, FileText } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      icon: <FileText className="text-blue-400" size={24} />,
      bg: "bg-blue-500/10 border-blue-500/20",
      title: "1. Resume Parsing",
      desc: "Upload your resume. The LLM extracts your exact tech stack to build a personalized profile instantly."
    },
    {
      icon: <Target className="text-indigo-400" size={24} />,
      bg: "bg-indigo-500/10 border-indigo-500/20",
      title: "2. Dynamic Roadmap",
      desc: "Receive a tailored week-by-week preparation plan focusing on the algorithms and frameworks you need."
    },
    {
      icon: <MessageSquare className="text-purple-400" size={24} />,
      bg: "bg-purple-500/10 border-purple-500/20",
      title: "3. Adaptive Interviews",
      desc: "Engage in cinematic mock interviews. The AI pivots questions based on real-time performance."
    },
    {
      icon: <LineChart className="text-emerald-400" size={24} />,
      bg: "bg-emerald-500/10 border-emerald-500/20",
      title: "4. ML Predictions",
      desc: "An XGBoost model calculates your real-time placement probability (0-100%) based on comprehensive metrics."
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-8 pb-16 relative bg-transparent border-t border-gray-200/50">
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">End-to-End</span> Pipeline
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We don't do static question banks. PADO builds a real-time, personalized ecosystem tailored precisely to your background.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group bg-white rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 hover:border-gray-300 relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl group-hover:bg-gray-100 transition-colors"></div>
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border bg-white shadow-sm`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
