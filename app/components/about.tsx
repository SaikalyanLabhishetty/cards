"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Paths representing Agentic themes: Spark, Microchip, Gateway, Processing.
// All use 8 points (M + 8 L + Z) to morph cleanly without MorphSVGPlugin.
const shapePaths = [
  // AI Spark
  "M0,-150 L40,-40 L150,0 L40,40 L0,150 L-40,40 L-150,0 L-40,-40 Z",
  // Microchip Node
  "M-50,-130 L50,-130 L130,-50 L130,50 L50,130 L-50,130 L-130,50 L-130,-50 Z",
  // Data Gateway
  "M0,-150 L80,-80 L150,0 L80,80 L0,150 L-80,80 L-150,0 L-80,-80 Z",
  // Processing Core
  "M-100,-150 L100,-150 L40,-50 L40,50 L100,150 L-100,150 L-40,50 L-40,-50 Z",
];

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const morphRef = useRef<SVGPathElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Fade/slide in copy
      const copyItems = copyRef.current?.querySelectorAll("[data-animate]");
      if (copyItems?.length) {
        gsap.from(copyItems, {
          y: 18,
          opacity: 0,
          stagger: 0.08,
          ease: "power2.out",
          duration: 0.7,
        });
      }

      if (!morphRef.current) return;

      gsap.set(morphRef.current, { transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        repeat: -1,
        defaults: { duration: 1, ease: "power1.inOut" }, // morph each second
      });

      shapePaths.slice(1).forEach((path) => {
        tl.to(morphRef.current, { attr: { d: path } });
      });
      tl.to(morphRef.current, { attr: { d: shapePaths[0] } });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-transparent relative z-10 text-white py-24 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div ref={copyRef} className="space-y-4 text-left">
          <p
            data-animate
            className="inline-flex items-center text-xs tracking-[0.35em] uppercase font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          >
            System Profile
          </p>
          <h2
            data-animate
            className="text-4xl md:text-5xl font-semibold leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
              Engineering AI-Driven & Autonomous Digital Experiences.
            </span>
          </h2>
          <p data-animate className="text-lg text-gray-300 leading-relaxed font-light">
            Hi, I&apos;m a Software Engineer based in Hyderabad, Telangana, with a strong focus on building
            intelligent and agentic applications. I have over 3 years of experience spanning front-end
            interfaces to deeply integrated back-end systems. My stack includes React, Next.js, FastAPI,
            Mongo, and Postgres.
          </p>
          <p data-animate className="text-lg text-gray-300 leading-relaxed font-light">
            I specialize in crafting dynamic systems where sleek, futuristic UI meets highly optimized, robust
            architectures—turning complex user needs into seamless, automated realities.
          </p>
          <p data-animate className="text-xs border border-cyan-500/30 bg-cyan-900/20 backdrop-blur-md p-3 rounded-md text-cyan-200 mt-4 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="opacity-70">STATUS:</span> AI Core Operational
          </p>
        </div>

        <div className="relative w-full aspect-square flex items-center justify-center">
          <div className="absolute inset-0 blur-[80px] bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-purple-600/30 opacity-80 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          <svg
            className="relative drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            viewBox="-220 -220 440 440"
            width="100%"
            height="100%"
          >
            <defs>
              <linearGradient id="agentic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
                <stop offset="50%" stopColor="#06b6d4" /> {/* cyan-500 */}
                <stop offset="100%" stopColor="#a855f7" /> {/* purple-500 */}
              </linearGradient>
            </defs>
            <path
              ref={morphRef}
              d={shapePaths[0]}
              fill="url(#agentic-gradient)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
