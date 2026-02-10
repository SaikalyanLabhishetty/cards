"use client";

import { useEffect, useState } from "react";

import CardStack from "./components/CardStack";
import About from "./components/about";

export default function Home() {
  const subtitle = "3 Years of crafting innovative projects";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      setTyped(subtitle.slice(0, i + 1));
      i += 1;

      if (i <= subtitle.length) {
        timer = setTimeout(typeNext, 70);
      }
    };

    typeNext();
    return () => clearTimeout(timer);
  }, [subtitle]);

  return (
    <main className="bg-black text-white">
      <section className="min-h-screen flex items-center justify-center">
        {/* CENTERED GROUP */}
        <div className="w-full flex flex-col items-center text-center">
          {/* NAME / HERO */}

          <h1 className="mt-8 text-8xl md:text87xl font-bold leading-tight">
            <span className="block">SAI KALYAN</span>
            <span className="block">LABHISHETTY</span>
          </h1>

          <p className="mt-4 text-md tracking-widest text-gray-400 font-bold uppercase flex items-center gap-1">
            {typed}
            <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse" aria-hidden="true" />
          </p>

          {/* SPACE BETWEEN NAME AND CARDS */}
          <div className="w-full">
            <CardStack />
          </div>

        </div>
      </section>
      <About />
    </main>
  );
}
