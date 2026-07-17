"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Cpu, MessageCircle, BarChart, ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ValueProposition() {
  const sectionRef = useRef(null);
  const itemsRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Floating abstract shapes
      gsap.utils.toArray('.blob-shape').forEach((blob, i) => {
        gsap.to(blob, {
          y: "random(-40, 40)",
          x: "random(-40, 40)",
          rotation: "random(-20, 20)",
          duration: "random(4, 7)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      });

      // Staggered reveal for value items
      gsap.from(itemsRef.current.children, {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: itemsRef.current,
          start: "top 75%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    {
      title: "Hyper-Personalized Roadmaps",
      desc: "Stop studying blindly. We parse your resume and generate a customized week-by-week curriculum targeting the exact algorithms and system design concepts required by your dream company.",
      icon: <Cpu size={32} className="text-blue-500" />,
      color: "from-blue-100 to-blue-50",
      border: "border-blue-200"
    },
    {
      title: "Real-Time Mock Interviews",
      desc: "Face an adaptive LLM that acts like a real hiring manager. It doesn't just read questions; it analyzes your technical answers and pivots its follow-up questions to expose your weaknesses.",
      icon: <MessageCircle size={32} className="text-purple-500" />,
      color: "from-purple-100 to-purple-50",
      border: "border-purple-200"
    },
    {
      title: "Vocal Confidence Analytics",
      desc: "Using advanced Whisper AI, you can speak your answers aloud. We transcribe your speech instantly, analyzing not just what you say, but how confidently you say it.",
      icon: <Sparkles size={32} className="text-amber-500" />,
      color: "from-amber-100 to-amber-50",
      border: "border-amber-200"
    },
    {
      title: "Predictive ML Scoring",
      desc: "Our embedded XGBoost Machine Learning model tracks all your performance metrics over time to calculate a live probability score of your placement success.",
      icon: <BarChart size={32} className="text-emerald-500" />,
      color: "from-emerald-100 to-emerald-50",
      border: "border-emerald-200"
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 relative bg-white overflow-hidden">
      {/* Colorful Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-60">
        <div className="blob-shape absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[80px]"></div>
        <div className="blob-shape absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        <div className="blob-shape absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-600 shadow-sm mb-6">
            <ShieldCheck size={16} />
            <span>The Ultimate Advantage</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            Exactly what you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">get.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            PADO replaces generic question banks with a living, breathing ecosystem designed to guarantee your placement through personalized repetition and adaptive difficulty.
          </p>
        </div>

        <div ref={itemsRef} className="flex flex-col gap-12">
          {values.map((item, i) => (
            <div 
              key={i} 
              className={`flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br ${item.color} p-10 rounded-[2.5rem] border ${item.border} shadow-xl shadow-gray-200/50 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}
            >
              <div className="w-24 h-24 rounded-3xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
