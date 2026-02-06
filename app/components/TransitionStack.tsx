"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const pages = [
  "/projects/applysense.png",
  "/projects/bub.png",
  "/projects/crm.png",
  "/projects/jobpe.png",
];

export default function TornadoTransition() {
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".tornado",
          start: "top top",
          end: "+=1800",
          scrub: 0.8,
          pin: true,
        },
      });

      itemsRef.current.forEach((el, i) => {
        const angle = i * 20; // rotation offset
        const radius = 300 + i * 40;

        // ENTER from LEFT in spiral
        tl.fromTo(
          el,
          {
            x: -window.innerWidth,
            y: 0,
            rotate: angle,
            scale: 0.8,
            opacity: 0,
          },
          {
            x: Math.cos((angle * Math.PI) / 180) * radius,
            y: Math.sin((angle * Math.PI) / 180) * radius,
            rotate: angle + 360,
            scale: 1,
            opacity: 1,
            ease: "none",
          },
          0
        );

        // EXIT to RIGHT
        tl.to(
          el,
          {
            x: window.innerWidth + 400,
            rotate: angle + 720,
            scale: 0.7,
            opacity: 0,
            ease: "none",
          },
          1
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="tornado min-h-screen bg-white overflow-hidden flex items-center justify-center">
      {pages.map((img, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) itemsRef.current[i] = el;
          }}
          className="absolute w-[720px] h-[450px] rounded-[32px] shadow-2xl bg-white overflow-hidden"
          style={{ zIndex: pages.length - i }}
        >
          <img
            src={img}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      ))}
    </section>
  );
}
