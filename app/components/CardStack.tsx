"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { name: "React", bg: "/react.svg", color: "#20232a" },
  { name: "Next.js", bg: "/next.svg", color: "#7c7c7cff" },
  { name: "FastAPI", bg: "/fastapi.svg", color: "#0f766e" },
  { name: "Python", bg: "/python.svg", color: "#1e3a8a" },
  { name: "MongoDB", bg: "/mongodb.svg", color: "#166534" },
  { name: "GitHub", bg: "/github.svg", color: "#07144d" },
];

export default function CardStack() {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const mounted = useRef(false);
  const centerIndex = (cards.length - 1) / 2;

  const spacing = 180;
  const curveDepth = 60;
  const rotateDeg = 8;

  useLayoutEffect(() => {
    mounted.current = true;

    const ctx = gsap.context(() => {
      // Drop in from below, then fan open
      const spreadState = {
        x: (i: number) => (i - centerIndex) * spacing,
        y: (i: number) => Math.abs(i - centerIndex) * curveDepth,
        rotate: (i: number) => (i - centerIndex) * rotateDeg,
        opacity: 1,
      };

      gsap.set(cardsRef.current, {
        x: 0,
        y: 240,
        rotate: 0,
        opacity: 0,
        transformOrigin: "50% 100%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(cardsRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.06,
      }).to(
        cardsRef.current,
        {
          ...spreadState,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.25",
      );

      tl.call(() => {
        if (!mounted.current) return;

        ScrollTrigger.create({
          trigger: ".stack",
          start: "top top",
          end: "+=600",
          scrub: true,
          pin: true,
          animation: gsap.to(cardsRef.current, {
            x: 0,
            y: 0,
            rotate: 0,
            ease: "none",
          }),
        });
      });

    });

    return () => {
      mounted.current = false;
      ctx.revert();
    };
  }, []);

  return (
    <section className="stack min-h-screen bg-black">
      <div className="relative w-full flex justify-center pt-24">
        {/* pt-24 controls how far from top the cards sit */}
        {cards.map((card, i) => (
          <div
            key={card.name}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="absolute w-64 h-72 rounded-2xl shadow-2xl stack-card"
            style={{
              backgroundColor: card.color,
              backgroundImage: `url(${card.bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "90px",
              // Match GSAP's starting state to avoid an initial flash
              opacity: 0,
              transform: "translate3d(0, 240px, 0) rotate(0deg)",
              transformOrigin: "50% 100%",

              // rightmost card on top
              zIndex: i + 1,
            }}
          />
        ))}
      </div>
    </section>
  );
}
