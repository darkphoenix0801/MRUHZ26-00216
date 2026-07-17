"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    letter: "I",
    title: "Innovative Ideas",
    desc: "We parse your resume dynamically and generate ideas tailored to your exact tech stack.",
    color: "from-blue-600 to-cyan-400"
  },
  {
    letter: "D",
    title: "Dynamic Roadmaps",
    desc: "Your preparation journey pivots in real-time based on your mock interview performance.",
    color: "from-purple-600 to-pink-400"
  },
  {
    letter: "E",
    title: "Empowerment",
    desc: "Speak your answers out loud. Build the confidence needed to crush behavioral and technical rounds.",
    color: "from-emerald-600 to-teal-400"
  },
  {
    letter: "A",
    title: "Attractive Design",
    desc: "A premium, distraction-free environment that makes rigorous interview prep enjoyable.",
    color: "from-amber-500 to-orange-400"
  }
];

export default function IdeaSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal header
      gsap.from(textRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
        }
      });

      // Cards staggered entrance
      gsap.from(cardsRef.current.children, {
        y: 80,
        opacity: 0,
        rotationX: -15,
        transformOrigin: "bottom center",
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 75%",
        }
      });

      // Floating animation for the letters
      gsap.utils.toArray('.idea-letter').forEach((letter: any, i) => {
        gsap.to(letter, {
          y: "random(-10, 10)",
          rotation: "random(-5, 5)",
          duration: "random(2, 4)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-gray-50 relative overflow-hidden border-t border-gray-100">
      
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div ref={textRef} className="text-center mb-24">
          <h2 className="text-sm font-bold tracking-[0.3em] text-indigo-500 uppercase mb-4">Core Philosophy</h2>
          <h3 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">I.D.E.A</span> Framework
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our approach isn't just about practicing; it's about fundamentally changing how you prepare for success.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
          {principles.map((item, i) => (
            <div 
              key={i}
              className="group relative bg-white border border-gray-100 p-8 rounded-3xl transition-all duration-500 hover:bg-gray-50 hover:-translate-y-2 shadow-lg hover:shadow-2xl hover:border-indigo-200"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
              
              <div className="idea-letter text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-100 mb-6 inline-block filter drop-shadow-md group-hover:from-indigo-200 group-hover:to-indigo-100 transition-all">
                {item.letter}
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{item.title}</h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
