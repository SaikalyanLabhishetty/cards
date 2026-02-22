"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

import CardStack from "./components/CardStack";
import About from "./components/about";
import Experience from "./components/experience";
import FeatureProject from "./components/featureProject";
import Connected from "./components/connected";
import AgenticChatbot from "./components/agenticChatbot";
// import FeatureWork from "./components/featureWork";
import AgenticBackground from "./components/agenticBackground";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*&%";

function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState(text.replace(/[A-Za-z0-9]/g, "_"));

  useEffect(() => {
    let frame = 0;

    const timeout = setTimeout(() => {
      let iteration = 0;

      const updateText = () => {
        setDisplayText(() =>
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              if (letter === " ") return " ";
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration < text.length) {
          iteration += 1 / 4;
          frame = requestAnimationFrame(updateText);
        } else {
          setDisplayText(text);
        }
      };

      frame = requestAnimationFrame(updateText);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [text, delay]);

  return <>{displayText}</>;
}

export default function Home() {
  const subtitle = "3 Years of crafting innovative projects";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    // Delay typing slightly so the name scrambles first
    const startTyping = setTimeout(() => {
      const typeNext = () => {
        setTyped(subtitle.slice(0, i + 1));
        i += 1;

        if (i <= subtitle.length) {
          timer = setTimeout(typeNext, 70);
        }
      };
      typeNext();
    }, 1000);

    return () => {
      clearTimeout(startTyping);
      clearTimeout(timer);
    };
  }, [subtitle]);

  return (
    <main id="top" className="relative text-white min-h-screen">
      <AgenticBackground />
      <section className="min-h-screen flex items-center justify-center">
        {/* CENTERED GROUP */}
        <div className="w-full flex flex-col items-center text-center">
          {/* NAME / HERO */}

          <h1 className="mt-8 text-5xl sm:text-6xl md:text-8xl font-black leading-tight uppercase tracking-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-500 cursor-default">
              <ScrambleText text="SAI KALYAN" delay={0} />
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-gray-300 via-gray-100 to-gray-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-500 cursor-default">
              <ScrambleText text="LABHISHETTY" delay={400} />
            </span>
          </h1>

          <p className="mt-6 text-sm md:text-base tracking-[0.2em] text-cyan-400 font-bold uppercase flex items-center gap-2">
            <span className="text-gray-500 font-mono opacity-70">&gt;</span>
            <span className="drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">{typed}</span>
            <span className="inline-block w-2 h-5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" aria-hidden="true" />
          </p>

          {/* SPACE BETWEEN NAME AND CARDS */}
          <div className="w-full mt-10 relative z-10">
            <CardStack />
          </div>

        </div>
      </section>
      <div className="relative z-10">
        <div id="about">
          <About />
        </div>
        <div id="experience">
          <Experience />
        </div>
        <div id="projects">
          <FeatureProject />
        </div>
        {/* <FeatureWork /> */}
        <div id="connect">
          <Connected />
        </div>
      </div>
      {/* llqh pgpl ecfl sczb  */}
      <AgenticChatbot />
      <Script
        src="https://kalyanlabhishetty.vercel.app/vueverse-chatbot-widget.js"
        data-base-url="https://kalyanlabhishetty.vercel.app"
        data-position="left"
        data-title="Ask Vueverse AI"
        strategy="afterInteractive"
      />
    </main>
  );
}
