"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { name: "React", bg: "/react.svg", color: "#20232a" },
  { name: "Next.js", bg: "/next.svg", color: "#000000" },
  { name: "FastAPI", bg: "/fastapi.svg", color: "#0f766e" },
  { name: "Python", bg: "/python.svg", color: "#1e3a8a" },
  { name: "MongoDB", bg: "/mongodb.svg", color: "#166534" },
  { name: "GitHub", bg: "/github.svg", color: "#07144d" },
];

export default function CardStack() {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const centerIndex = (cards.length - 1) / 2;

  const spacing = 180;
  const curveDepth = 60;
  const rotateDeg = 8;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(cardsRef.current, {
        x: (i) => (i - centerIndex) * spacing,
        y: (i) => Math.abs(i - centerIndex) * curveDepth,
        rotate: (i) => (i - centerIndex) * rotateDeg,
        ease: "none",
        scrollTrigger: {
          trigger: ".stack",
          start: "top top",
          end: "+=600",
          scrub: true,
          pin: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="stack min-h-screen bg-white">
      <div className="relative w-full flex justify-center pt-24">
        {/* pt-24 controls how far from top the cards sit */}
        {cards.map((card, i) => (
          <div
            key={card.name}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="absolute w-64 h-72 rounded-2xl shadow-2xl"
            style={{
              backgroundColor: card.color,
              backgroundImage: `url(${card.bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "90px",

              // rightmost card on top
              zIndex: i + 1,
            }}
          />
        ))}
      </div>
    </section>
  );
}
