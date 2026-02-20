"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { name: "React", bg: "/react.svg", color: "rgba(6, 182, 212, 0.1)", shadow: "rgba(6, 182, 212, 0.4)" },
  { name: "Next.js", bg: "/next.svg", color: "rgba(255, 255, 255, 0.05)", shadow: "rgba(255, 255, 255, 0.2)" },
  { name: "FastAPI", bg: "/fastapi.svg", color: "rgba(16, 185, 129, 0.1)", shadow: "rgba(16, 185, 129, 0.4)" },
  { name: "Python", bg: "/python.svg", color: "rgba(245, 158, 11, 0.1)", shadow: "rgba(245, 158, 11, 0.4)" },
  { name: "MongoDB", bg: "/mongodb.svg", color: "rgba(168, 85, 247, 0.1)", shadow: "rgba(168, 85, 247, 0.4)" },
  { name: "GitHub", bg: "/github.svg", color: "rgba(255, 255, 255, 0.05)", shadow: "rgba(255, 255, 255, 0.2)" },
];
const centerIndex = (cards.length - 1) / 2;

export default function CardStack() {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const mounted = useRef(false);

  // Responsive values based on screen width are handled inside useLayoutEffect below.

  useLayoutEffect(() => {
    mounted.current = true;

    const ctx = gsap.context(() => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      const cardWidth = Math.min(256, Math.max(112, viewportWidth * 0.28));
      const cardHeight = Math.min(288, Math.max(140, viewportWidth * 0.36));
      const spacing = Math.min(isMobile ? 74 : 180, cardWidth * (isMobile ? 0.56 : 0.7));
      const curveDepth = Math.min(isMobile ? 36 : 60, cardHeight * (isMobile ? 0.2 : 0.22));
      const rotateDeg = isMobile ? 10 : 8;
      const dropY = isMobile ? 180 : 240;
      const scrollDistance = isMobile ? 320 : 400;

      // Drop in from below, then fan open
      const spreadState = {
        x: (i: number) => (i - centerIndex) * spacing,
        y: (i: number) => Math.abs(i - centerIndex) * curveDepth,
        rotate: (i: number) => (i - centerIndex) * rotateDeg,
        opacity: 1,
      };

      gsap.set(cardsRef.current, {
        x: 0,
        y: dropY,
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
          end: `+=${scrollDistance}`,
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
    <section className="stack min-h-[60vh] md:min-h-[80vh] bg-transparent relative z-10">
      <div className="relative w-full flex justify-center pt-8 md:pt-12">
        {cards.map((card, i) => (
          <div
            key={card.name}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="absolute rounded-2xl backdrop-blur-xl border border-white/20"
            style={{
              width: "clamp(112px, 28vw, 256px)",
              height: "clamp(140px, 36vw, 288px)",
              backgroundColor: card.color,
              backgroundImage: `url(${card.bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "clamp(44px, 14vw, 96px)",
              boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px ${card.shadow}`,
              opacity: 0,
              transform: "translate3d(0, 180px, 0) rotate(0deg)",
              transformOrigin: "50% 100%",
              zIndex: i + 1,
            }}
          />
        ))}
      </div>
    </section>
  );
}
