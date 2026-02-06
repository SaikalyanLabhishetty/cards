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
          <p className="text-sm tracking-widest text-gray-500 mt-2">
            HYDERABAD
          </p>
          <p className="text-sm tracking-widest text-gray-500 mt-2">
            labhishettysaikalyan@gmail.com
          </p>

          <h1 className="mt-8 text-6xl md:text-7xl font-light leading-tight">
            <span className="block">SAI KALYAN</span>
            <span className="block">LABHISHETTY</span>
          </h1>

          <p className="mt-4 text-sm tracking-widest text-gray-500 uppercase">
            3 Years of crafting innovative projects
          </p>

          {/* SPACE BETWEEN NAME AND CARDS */}
          <div className="mt-20 w-full">
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
