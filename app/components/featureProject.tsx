"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projectCards = [
  {
    title: "ApplySense",
    eyebrow: "Module 01",
    body: "Analyzes candidate data against defined ATS-style heuristics and recruiter logic hierarchies. Highlights missing parameters, domain alignment vectors, tone, and seniority levels, then computes rejection risks into plain English logs.",
    from: "rgba(15, 23, 42, 0.6)", // slate-900 with opacity
    to: "rgba(6, 182, 212, 0.4)", // cyan-500 with opacity
    accent: "#06b6d4", // cyan-500
    image: "/projects/applysense.png",
  },
  {
    title: "Testlify",
    eyebrow: "Module 02",
    body: "Automated assessment environment. Admins deploy test modules and access keys; users sync via ID+code—bypassing traditional authentication gateways for instantaneous session start.",
    from: "rgba(17, 24, 39, 0.6)", // gray-900 with opacity
    to: "rgba(168, 85, 247, 0.4)", // purple-500 with opacity
    accent: "#a855f7", // purple-500
    image: "/projects/examportal.png",
  }
];

export default function FeatureProject() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const cardsStageRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);
      if (!sectionRef.current || !cards.length) return;

      const copyItems = copyRef.current?.querySelectorAll("[data-animate]");
      if (copyItems?.length) {
        gsap.from(copyItems, {
          y: 18,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      gsap.set(cards, {
        y: (i) => i * 24,
        rotate: (i) => -5 + i * 2.4,
        scale: (i) => 0.96 - i * 0.02,
        opacity: (i) => 1 - i * 0.1,
        transformOrigin: "50% 50%",
      });

      gsap.from(cards, {
        x: 32,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power2.out",
      });

      const scrollDistance = Math.max(window.innerHeight * 1.9, cards.length * 900);
      const leadIn = 0.7;
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: 1.15,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        const base = leadIn + i * 2.4;
        // Focus each card first, then fully clear it before the next card leads.
        tl.to(
          card,
          {
            duration: 1.15,
            y: -12 - i * 12,
            rotate: 0,
            scale: 1 + i * 0.015,
            opacity: 1,
          },
          base,
        );

        // Then send it upward and fade it out, one card after another.
        // Skip the last card so it stays visible as the section unpins.
        if (i !== cards.length - 1) {
          tl.to(
            card,
            {
              duration: 1.4,
              y: -260 - i * 24,
              opacity: 0,
              scale: 0.96,
              ease: "power1.inOut",
            },
            base + 1.25,
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-transparent z-10 text-white overflow-hidden py-24 px-6 md:px-12"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_10%_20%,rgba(6,182,212,0.1),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.1),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(59,130,246,0.1),transparent_22%)]" />

      <div className="relative max-w-6xl mx-auto flex flex-col items-center gap-12">
        <div ref={copyRef} className="relative z-20 space-y-4 text-center max-w-2xl mx-auto">
          <p
            data-animate
            className="inline-flex items-center text-xs tracking-[0.35em] uppercase font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          >
            Core Modules
          </p>
          <h3 data-animate className="text-3xl md:text-4xl font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
            Deployed System Architectures
          </h3>
          <p data-animate className="text-lg text-gray-300 leading-relaxed max-w-xl font-light">
            A specialized overview of implemented solutions, showcasing data processing, automated logic, and dynamic interface engineering.
          </p>
        </div>

        <div ref={cardsStageRef} className="relative z-10 h-[600px] flex items-center justify-center w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-emerald-400/8 to-orange-400/8 blur-3xl" />
          <div className="relative h-full w-full flex items-center justify-center">
            {projectCards.map((card, i) => (
              <div
                key={card.title}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                className="absolute w-[92%] max-w-3xl min-h-[380px] rounded-[26px] overflow-hidden border backdrop-blur-3xl shadow-2xl"
                style={{
                  zIndex: projectCards.length - i,
                  background: `linear-gradient(130deg, ${card.from}, ${card.to})`,
                  borderColor: card.accent,
                  boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px ${card.from}`,
                }}
              >
                <div className="grid grid-cols-5 h-full">
                  <div className="col-span-2 bg-[#030303]/60 px-6 md:px-7 py-7 flex flex-col justify-between border-r border-white/5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-cyan-200 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: card.accent, boxShadow: `0 0 10px ${card.accent}` }}
                        />
                        {card.eyebrow}
                      </div>
                      <h4 className="text-2xl md:text-3xl font-semibold leading-tight text-white">{card.title}</h4>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light">{card.body}</p>
                    </div>
                    <div className="text-xs text-cyan-300 flex items-center gap-2 font-mono">
                      <span className="inline-flex h-6 px-3 items-center rounded bg-cyan-900/40 border border-cyan-500/30">
                        Active
                      </span>
                      <span className="inline-flex h-6 px-3 items-center rounded bg-purple-900/40 border border-purple-500/30">
                        Deployed
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 relative overflow-hidden bg-black/40">
                    {!card.image && (
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 12px 12px, rgba(255,255,255,0.1) 1.5px, transparent 0)",
                          backgroundSize: "26px 26px",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#030303]/40 via-transparent to-white/5" />
                    {card.image && (
                      <>
                        <Image
                          src={card.image}
                          alt={`${card.title} showcase`}
                          fill
                          sizes="(max-width: 768px) 100vw, 720px"
                          className="object-cover opacity-80 mix-blend-screen"
                          priority={i === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 via-[#030303]/40 to-transparent" />
                      </>
                    )}
                    <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                        <span className="inline-block w-8 h-0.5 bg-cyan-400/70" />
                        {card.image ? "Live Preview" : "Visual Canvas"}
                      </div>
                      <div className="text-right text-4xl md:text-5xl font-black tracking-tight text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                        {card.image ? card.title : "SVG / IMG"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
