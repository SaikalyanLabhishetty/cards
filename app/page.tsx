"use client";

import CardStack from "./components/CardStack";
import About from "./components/about";

export default function Home() {
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

          <p className="mt-4 text-md tracking-widest text-gray-400 font-bold uppercase">
            3 Years of crafting innovative projects
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
