"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { title: "ApplySense", img: "/projects/applysense.png", url: "applysense.pro" },
  { title: "Bub.io", img: "/projects/bub.png", url: "bub.io" },
  { title: "Crm.io", img: "/projects/crm.png", url: "crm.io" },
  { title: "JobPe", img: "/projects/jobpe.png", url: "jobpe.com" },
];

export default function FeaturedWork() {
  const trackRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");
      if (!cards.length || !trackRef.current || !ctaRef.current) return;

      const cardWidth = cards[0].offsetWidth;
      const gap = 64;
      const viewportWidth = window.innerWidth;

      const startX = (viewportWidth - cardWidth) / 2;
      const movePerCard = cardWidth + gap;
      const totalMove = movePerCard * (cards.length - 1);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".featured",
          start: "top top",
          end: `+=${cards.length * 900 + 800}`,
          scrub: true,
          pin: true,
        },
      });

      // 1️⃣ Cards slide one-by-one (main animation)
      tl.fromTo(
        trackRef.current,
        { x: startX },
        { x: startX - totalMove, ease: "none" }
      );

      // 2️⃣ Cards EXIT completely to the LEFT
      tl.to(trackRef.current, {
        x: startX - totalMove - viewportWidth,
        opacity: 0,
        ease: "none",
      });

      // 3️⃣ CTA appears ONLY after cards are gone
      tl.fromTo(
        ctaRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, []);


  return (
    <section className="featured min-h-screen bg-white overflow-hidden px-20">
      {/* FIXED TITLE */}
      <h2 className="text-7xl font-bold text-gray-300 mb-24">
        FEATURED WORK
      </h2>

      {/* PROJECT SLIDER */}
      <div className="relative w-full overflow-hidden">
        <div ref={trackRef} className="flex gap-16 w-max">
          {projects.map((p) => (
            <div
              key={p.title}
              className="project-card w-[720px] shrink-0"
            >
              <div className="bg-gradient-to-b from-green-50 to-white rounded-[32px] p-6 shadow-2xl">
                <div className="w-full h-[450px] rounded-2xl overflow-hidden bg-white">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xl font-semibold text-gray-800">
                    {p.title}
                  </p>
                  <p className="text-sm text-gray-500">{p.url}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA (appears AFTER cards) */}
      <div
        ref={ctaRef}
        className="absolute inset-0 flex items-center justify-center text-center pointer-events-none opacity-0"
      >
        <p className="max-w-3xl text-3xl leading-relaxed text-gray-800 font-light">
          Lets work together to create something <br />
          awesome and beautiful. Whether you <br />
          have a project in mind or just want to say <br />
          hi, feel free to get in touch.
        </p>
      </div>
    </section>
  );
}
