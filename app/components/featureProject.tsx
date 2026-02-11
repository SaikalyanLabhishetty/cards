"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projectCards = [
  {
    title: "ApplySense",
    eyebrow: "Project 01",
    body: "Analyzes your resume against any JD with ATS-style rules and recruiter logic—highlights missing skills, domain alignment, tone, and seniority, then explains rejection risks in plain English.",
    from: "#0f172a",
    to: "#06b6d4",
    accent: "#f8fafc",
    image: "/projects/applysense.png",
  },
  {
    title: "Testlify",
    eyebrow: "Project 02",
    body: "Admins add institution, register students, create the sheet, and share a code; students join with ID+code—no accounts needed for a fast start.",
    from: "#111827",
    to: "#a855f7",
    accent: "#ede9fe",
    image: "/projects/examportal.png",
  },
  {
    title: "Automation Rail",
    eyebrow: "Project 03",
    body: "Third slot ready for content. Add a hero screenshot or diagram on the right side when assets are ready.",
    from: "#0b1221",
    to: "#f97316",
    accent: "#fff7ed",
  },
  {
    title: "Realtime CX",
    eyebrow: "Case Study Slot 04",
    body: "Fourth placeholder. Keep copy to 2-3 lines so the stack stays balanced and legible.",
    from: "#0f172a",
    to: "#22d3ee",
    accent: "#ecfeff",
  },
];

export default function FeatureProject() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
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

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "+=1700",
          scrub: 1.2,
        },
      });

      cards.forEach((card, i) => {
        const base = i * 0.55; // slower stagger so each card stays readable
        // Hold the card in place for a moment as the section enters view
        tl.to(
          card,
          {
            y: -12 - i * 12,
            rotate: 0,
            scale: 1 + i * 0.015,
            opacity: 1,
            boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
          },
          base,
        );

        // Then send it upward and fade it out, one card after another
        tl.to(
          card,
          {
            y: -200 - i * 28,
            opacity: 0.35,
            ease: "power1.inOut",
          },
          base + 1.4,
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden py-24 px-6 md:px-12"
    >
      <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_60%_80%,rgba(249,115,22,0.14),transparent_22%)]" />

      <div className="relative max-w-6xl mx-auto flex flex-col items-center gap-12">
        <div ref={copyRef} className="space-y-4 text-center max-w-2xl mx-auto">
          <p
            data-animate
            className="inline-flex items-center text-xs tracking-[0.35em] uppercase font-semibold text-gray-400"
          >
            Feature Projects
          </p>
          <h3 data-animate className="text-3xl md:text-4xl font-semibold leading-tight">
            A collection of my best projects
          </h3>
          <p data-animate className="text-lg text-gray-200 leading-relaxed max-w-xl">
            Here's a look at some of my favorite projects, each with a short description and a visual representation.
          </p>
        </div>

        <div className="relative h-[600px] flex items-center justify-center w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-emerald-400/8 to-orange-400/8 blur-3xl" />
          <div className="relative h-full w-full flex items-center justify-center">
            {projectCards.map((card, i) => (
              <div
                key={card.title}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                className="absolute w-[92%] max-w-3xl min-h-[380px] rounded-[26px] overflow-hidden border border-white/10 backdrop-blur-sm"
                style={{
                  zIndex: projectCards.length - i,
                  background: `linear-gradient(130deg, ${card.from}, ${card.to})`,
                }}
              >
                <div className="grid grid-cols-5 h-full">
                  <div className="col-span-2 bg-black/70 px-6 md:px-7 py-7 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-gray-300">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: card.accent }}
                        />
                        {card.eyebrow}
                      </div>
                      <h4 className="text-2xl md:text-3xl font-semibold leading-tight">{card.title}</h4>
                      <p className="text-gray-200 leading-relaxed text-sm md:text-base">{card.body}</p>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="inline-flex h-6 px-3 items-center rounded-full bg-white/5 border border-white/10">
                        Stacked
                      </span>
                      <span className="inline-flex h-6 px-3 items-center rounded-full bg-white/5 border border-white/10">
                        Scroll-reactive
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 relative overflow-hidden">
                    {!card.image && (
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 12px 12px, rgba(255,255,255,0.3) 1.5px, transparent 0)",
                          backgroundSize: "26px 26px",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                    {card.image && (
                      <>
                        <Image
                          src={card.image}
                          alt={`${card.title} showcase`}
                          fill
                          sizes="(max-width: 768px) 100vw, 720px"
                          className="object-cover"
                          priority={i === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />
                      </>
                    )}
                    <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        <span className="inline-block w-8 h-0.5 bg-white/70" />
                        {card.image ? "Live Preview" : "Visual Canvas"}
                      </div>
                      <div className="text-right text-4xl md:text-5xl font-black tracking-tight text-white/90 drop-shadow-lg">
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
