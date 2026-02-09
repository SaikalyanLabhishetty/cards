"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    mounted.current = true;

    const ctx = gsap.context(() => {
      // Start stacked on load
      gsap.set(cardsRef.current, {
        x: 0,
        y: 0,
        rotate: 0,
      });

      // Spread after 3 seconds, then allow scroll to bring them back to stacked
      gsap.delayedCall(1, () => {
        if (!mounted.current) return;

        gsap.to(cardsRef.current, {
          x: (i) => (i - centerIndex) * spacing,
          y: (i) => Math.abs(i - centerIndex) * curveDepth,
          rotate: (i) => (i - centerIndex) * rotateDeg,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            if (!mounted.current) return;

            gsap.to(cardsRef.current, {
              x: 0,
              y: 0,
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: ".stack",
                start: "top top",
                end: "+=600",
                scrub: true,
                pin: true,
              },
            });
          },
        });
      });

    });

    return () => {
      mounted.current = false;
      ctx.revert();
    };
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
