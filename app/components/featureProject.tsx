"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projectCards = [
  {
    id: "applysense",
    title: "ApplySense",
    eyebrow: "Module 01",
    body: "Analyzes candidate data against defined ATS-style heuristics and recruiter logic hierarchies. Highlights missing parameters, domain alignment vectors, tone, and seniority levels, then computes rejection risks into plain English logs.",
    from: "rgba(15, 23, 42, 0.6)",
    to: "rgba(6, 182, 212, 0.4)",
    accent: "#06b6d4",
    image: "/projects/applysense.png",
  },
  {
    id: "testlify",
    title: "Testlify",
    eyebrow: "Module 02",
    body: "Automated assessment environment. Admins deploy test modules and access keys; users sync via ID+code—bypassing traditional authentication gateways for instantaneous session start.",
    from: "rgba(17, 24, 39, 0.6)",
    to: "rgba(168, 85, 247, 0.4)",
    accent: "#a855f7",
    image: "/projects/examportal.png",
  }
  // {
  //   id: "nexus",
  //   title: "Project Nexus",
  //   eyebrow: "Module 03",
  //   body: "Centralized data pipeline orchestrator. Ingests, normalizes, and routes multi-modal data streams across distributed microservices with millisecond latency. Intelligent routing dynamically scales according to active nodes.",
  //   from: "rgba(10, 25, 41, 0.6)",
  //   to: "rgba(59, 130, 246, 0.4)",
  //   accent: "#3b82f6",
  //   image: "", // Example without image
  // }
];

export default function FeatureProject() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Background copy fade-in on scroll
      const copyItems = copyRef.current?.querySelectorAll("[data-animate]");
      if (copyItems?.length) {
        gsap.from(copyItems, {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: copyRef.current,
            start: "top 80%",
          }
        });
      }

      // Card Stacking Effect
      const cards = cardsRef.current.filter(Boolean);

      cards.forEach((card, index) => {
        // We do not animate the last card, because nothing covers it
        if (index === cards.length - 1) return;

        // When the card reaches sticky top (vh padding applied in CSS) until the NEXT card reaches it
        gsap.to(card, {
          scale: 0.9,
          opacity: 0.5,
          y: -20, // slightly move it up as well
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 120px", // When this card hits sticky pos
            endTrigger: cards[index + 1],
            end: "top 120px", // until the next card hits sticky pos
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 text-white min-h-screen pt-24 pb-32 px-6 md:px-12"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_10%_20%,rgba(6,182,212,0.1),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.1),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(59,130,246,0.1),transparent_22%)]" />

      <div className="max-w-5xl mx-auto flex flex-col items-center gap-16 relative z-10">

        {/* Header Copy */}
        <div ref={copyRef} className="space-y-4 text-center max-w-2xl mx-auto pt-10 pb-16">
          <p
            data-animate
            className="inline-flex items-center text-xs tracking-[0.35em] uppercase font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          >
            Core Modules
          </p>
          <h3 data-animate className="text-4xl md:text-5xl font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 py-2">
            Deployed System Architectures
          </h3>
          <p data-animate className="text-lg text-gray-300 leading-relaxed font-light">
            A specialized overview of implemented solutions, showcasing data processing, automated logic, and dynamic interface engineering. Scroll to cycle systems.
          </p>
        </div>

        {/* Stacked Cards Container */}
        <div className="w-full relative flex flex-col gap-16 md:gap-32 pb-32">
          {projectCards.map((card, index) => {
            // Apply standard sticky positioning using CSS. top-120px to leave room under the header. 
            // We use 'sticky' to stack them.
            return (
              <div
                key={card.id}
                className="w-full sticky pt-6 md:pt-10"
                style={{ top: '60px' }} // The point at which it sticks on screen
              >
                <div
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                  className="w-full rounded-[26px] overflow-hidden border backdrop-blur-3xl shadow-[0_30px_50px_-12px_rgba(0,0,0,0.5)] will-change-transform"
                  style={{
                    background: `linear-gradient(130deg, ${card.from}, ${card.to})`,
                    borderColor: card.accent,
                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 25px ${card.from}`,
                    height: '500px', // Fixed height for consistency
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                    {/* Left Column (Copy) */}
                    <div className="md:col-span-2 bg-[#030303]/70 px-6 md:px-10 py-8 md:py-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 order-2 md:order-1 h-full max-h-[250px] md:max-h-full">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-cyan-200 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
                            style={{ backgroundColor: card.accent, boxShadow: `0 0 10px ${card.accent}` }}
                          />
                          {card.eyebrow}
                        </div>
                        <h4 className="text-3xl md:text-4xl font-semibold leading-tight text-white tracking-wide">{card.title}</h4>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light overflow-y-auto pr-2 custom-scrollbar">
                          {card.body}
                        </p>
                      </div>
                      <div className="text-xs text-cyan-300 flex items-center gap-3 font-mono mt-4">
                        <span className="inline-flex h-7 px-4 items-center rounded-md bg-cyan-900/40 border border-cyan-500/30">
                          Active
                        </span>
                        <span className="inline-flex h-7 px-4 items-center rounded-md bg-purple-900/40 border border-purple-500/30">
                          Deployed
                        </span>
                      </div>
                    </div>

                    {/* Right Column (Visual) */}
                    <div className="md:col-span-3 relative overflow-hidden bg-[#030303]/80 h-full min-h-[250px] order-1 md:order-2">
                      {!card.image && (
                        <div
                          className="absolute inset-0 opacity-40 mix-blend-overlay"
                          style={{
                            backgroundImage:
                              `radial-gradient(circle at 12px 12px, ${card.accent} 1px, transparent 0)`,
                            backgroundSize: "26px 26px",
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-bl from-[#030303]/60 via-transparent to-white/5 z-10 pointer-events-none" />

                      {card.image && (
                        <>
                          <Image
                            src={card.image}
                            alt={`${card.title} showcase`}
                            fill
                            sizes="(max-width: 768px) 100vw, 700px"
                            className="object-cover opacity-80 mix-blend-screen transition-transform duration-700 hover:scale-105"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 via-[#030303]/20 to-transparent pointer-events-none z-10" />
                        </>
                      )}

                      {/* Technical Decorative Elements overlay */}
                      <div className="relative z-20 h-full flex flex-col justify-between p-6 md:p-8 pointer-events-none">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                          <span className="inline-block w-8 h-px bg-cyan-400/70" />
                          {card.image ? "Live Component Render" : "Architectural Node"}
                        </div>
                        <div className="text-right text-4xl md:text-6xl font-black tracking-tight text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] opacity-20 transform -translate-x-4">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
