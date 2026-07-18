"use client";

import React from "react";

export default function Marquee() {
  return (
    <div className="w-full bg-indigo-600 text-white overflow-hidden py-3 flex relative z-10 shadow-lg border-y border-indigo-700">
      <div className="whitespace-nowrap animate-marquee flex items-center gap-12 font-semibold text-sm tracking-widest uppercase">
        <span>🚀 PADO 2.0 IS LIVE</span>
        <span className="opacity-50">•</span>
        <span>OVER 5,000+ AI INTERVIEWS CONDUCTED</span>
        <span className="opacity-50">•</span>
        <span>TRUSTED BY STUDENTS WORLDWIDE</span>
        <span className="opacity-50">•</span>
        <span>REAL-TIME PERFORMANCE ANALYTICS</span>
        <span className="opacity-50">•</span>
        <span>BOOST YOUR PLACEMENT PROBABILITY TODAY</span>
        <span className="opacity-50">•</span>
        <span>🚀 PADO 2.0 IS LIVE</span>
        <span className="opacity-50">•</span>
        <span>OVER 5,000+ AI INTERVIEWS CONDUCTED</span>
        <span className="opacity-50">•</span>
        <span>TRUSTED BY STUDENTS WORLDWIDE</span>
        <span className="opacity-50">•</span>
        <span>REAL-TIME PERFORMANCE ANALYTICS</span>
        <span className="opacity-50">•</span>
        <span>BOOST YOUR PLACEMENT PROBABILITY TODAY</span>
      </div>
      <style jsx>{`
        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
          min-width: 200%;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
