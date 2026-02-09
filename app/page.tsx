"use client";

import CardStack from "./components/CardStack";
import FeaturedWork from "./components/FeatureWork";
import TransitionStack from "./components/TransitionStack";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <section className="min-h-screen flex items-center justify-center">
        {/* CENTERED GROUP */}
        <div className="w-full flex flex-col items-center text-center">
          {/* NAME / HERO */}

          <h1 className="mt-8 text-8xl md:text87xl font-bold leading-tight">
            <span className="block">SAI KALYAN</span>
            <span className="block">LABHISHETTY</span>
          </h1>

          <p className="mt-4 text-md tracking-widest text-gray-500 font-bold uppercase">
            3 Years of crafting innovative projects
          </p>

          {/* SPACE BETWEEN NAME AND CARDS */}
          <div className="w-full">
            <CardStack />
          </div>

          <div className="mt-4 w-full">
            <FeaturedWork />
          </div>

          {/* <div className="mt-4 w-full">
            <TransitionStack />
          </div> */}
        </div>
      </section>
    </main>
  );
}
