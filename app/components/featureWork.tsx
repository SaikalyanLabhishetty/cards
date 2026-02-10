"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    title: "ApplySense",
    eyebrow: "Job Fit Intelligence",
    body: "Analyzes your resume against any JD with ATS-style rules and recruiter logic—highlights missing skills, domain alignment, tone, and seniority, then explains rejection risks in plain English.",
    accent: "#f97316",
  },
  {
    title: "ApplySense Outcomes",
    eyebrow: "Actionable Scores",
    body: "Shows shortlisting, interview, and offer probabilities plus a prioritized fix list, so candidates apply smarter instead of blasting applications with vague match percentages.",
    accent: "#22d3ee",
  },
  {
    title: "Testlify",
    eyebrow: "Secure Exam Flow",
    body: "Admins add institution, register students, create the sheet, and share a code; students join with ID+code—no accounts needed for a fast start.",
    accent: "#a855f7",
  },
  {
    title: "Testlify Integrity",
    eyebrow: "Proctoring Engine",
    body: "Three-step photo verification every 30 seconds with real-time match %, alerts on mismatch, auto-terminate after three fails, forced full-screen, and auto-blocking of screen sharing or suspicious activity.",
    accent: "#fcd34d",
  },
];

export default function FeatureWork() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cardsEl = cardRefs.current.filter(Boolean);
      if (!cardsEl.length || !sectionRef.current) return;

      const scrollDistance = Math.max(window.innerHeight * 1.2, 900);

      // Seed a compact stack state so there is no flash before GSAP runs.
      gsap.set(cardsEl, {
        y: (i) => i * 32,
        scale: (i) => 0.98 - i * 0.015,
        rotate: (i) => (i - cardsEl.length / 2) * 1.6,
        opacity: (i) => 1 - i * 0.1,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      cardsEl.forEach((card, i) => {
        tl.to(
          card,
          {
            y: -120 - i * 30,
            scale: 1 + i * 0.03,
            rotate: 0,
            opacity: 1,
            boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
          },
          i * 0.28,
        );
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 0.7,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
        onLeave: () => {
          gsap.to(sectionRef.current, {
            autoAlpha: 0,
            duration: 0.25,
            overwrite: "auto",
          });
        },
        onEnterBack: () => {
          gsap.to(sectionRef.current, {
            autoAlpha: 1,
            duration: 0.2,
            overwrite: "auto",
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden py-24 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 mb-10">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Feature Work</p>
          <h3 className="text-3xl md:text-4xl font-semibold leading-tight">
            SAP-styled stacked cards for storytelling sections
          </h3>
          <p className="text-gray-300 max-w-2xl">
            ApplySense and Testlify in a layered narrative: cards stack, then step forward as you scroll—perfect for feature highlights and step-by-step stories.
          </p>
        </div>

        <div className="relative min-h-[90vh]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-cyan-400/10 to-amber-300/10 blur-3xl" />
          <div className="relative h-full flex items-center justify-center">
            {cards.map((card, i) => (
              <div
                key={card.title}
                ref={(el) => {
                  if (el) cardRefs.current[i] = el;
                }}
                className="absolute w-[88vw] max-w-2xl min-h-[360px] rounded-3xl p-10 md:p-12 backdrop-blur bg-white/5 border border-white/10"
                style={{ zIndex: cards.length - i }}
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.18em] text-gray-300 mb-4">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: card.accent }}
                  />
                  {card.eyebrow}
                </div>
                <h4 className="text-2xl md:text-3xl font-semibold mb-3">{card.title}</h4>
                <p className="text-gray-200 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
