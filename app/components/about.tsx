"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Paths approximate the reference thumbnails: clover, bolt, diamond, speech-tail square.
// All share the same command structure (M + 8 straight L segments) so they morph cleanly without MorphSVGPlugin.
const shapePaths = [
  // Four-lobed clover
  "M0,-150 L100,-100 L150,0 L100,100 L0,150 L-100,100 L-150,0 L-100,-100 Z",
  // Lightning bolt
  "M40,-150 L120,-30 L20,-30 L100,90 L20,90 L60,150 L-40,30 L40,30 Z",
  // Diamond
  "M0,-150 L110,-50 L150,0 L110,50 L0,150 L-110,50 L-150,0 L-110,-50 Z",
  // Speech bubble with tail
  "M-120,-120 L120,-120 L120,60 L40,60 L40,150 L-40,60 L-120,60 L-120,-20 Z",
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
      className="bg-black text-white py-24 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div ref={copyRef} className="space-y-4 text-left">
          <p
            data-animate
            className="inline-flex items-center text-xs tracking-[0.35em] uppercase font-semibold text-gray-400"
          >
            About
          </p>
          <h2
            data-animate
            className="text-4xl md:text-5xl font-semibold leading-tight"
          >
            <span className="bg-clip-text text-white">
              Turning Vision into Interactive, Dynamic, and Scalable Applications.
            </span>
          </h2>
          <p data-animate className="text-lg text-gray-200 leading-relaxed">
            Hi, I&apos;m a Software Engineer based in Hyderabad, Telangana. I have over 3 years of
            experience and have worked on both the front-end and back-end. I am proficient in various
            programming languages and frameworks including React, Next.js, FastAPI and databases like
            Mongo and Postgres.
          </p>
          <p data-animate className="text-lg text-gray-200 leading-relaxed">
            I specialize in crafting engaging websites with captivating animations and intuitive designs
            that enhance user experiences. I also build dynamic web applications focused on performance
            and scalability.
          </p>
          <p data-animate className="text-sm text-gray-400">
            On the right, four SVGs morph every second via GSAP attr tweens: clover → lightning → diamond → speech block → clover.
          </p>
        </div>

        <div className="relative w-full aspect-square flex items-center justify-center">
          <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-orange-300/30 via-pink-300/25 to-purple-300/20 opacity-70" />
          <svg
            className="relative drop-shadow-2xl"
            viewBox="-220 -220 440 440"
            width="100%"
            height="100%"
          >
            <defs>
              <linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="60%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
            <path
              ref={morphRef}
              d={shapePaths[0]}
              fill="url(#sunset)"
              stroke="none"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
