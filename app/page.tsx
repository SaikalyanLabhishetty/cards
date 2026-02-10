"use client";

import CardStack from "./components/CardStack";

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

          <section className="w-full flex flex-col md:flex-row gap-8 px-6 md:px-16">
            <div className="w-full md:w-1/2 text-left">
              <h2 className="text-3xl md:text-4xl font-bold">About</h2>
              <h3 className="mt-3 text-2xl md:text-3xl font-semibold">
                Turning Vision into
                <br />
                Interactive, Dynamic, and
                <br />
                Scalable Websites.
              </h3>
              <p className="mt-4 text-base md:text-lg text-gray-700">
                Hi, I&apos;m a Software Engineer based in Hyderabad, Telangana. I
                have over 3 years of experience and have worked on both the
                front-end and back-end. I am proficient in various programming
                languages and frameworks including React, Next.js, FastAPI and
                databases like Mongo and Postgres.
              </p>
              <p className="mt-4 text-base md:text-lg text-gray-700">
                I specialize in crafting engaging websites with captivating
                animations and intuitive designs that enhance user experiences.
                I also build dynamic web applications focused on performance and
                scalability.
              </p>
            </div>
            <div className="w-full md:w-1/2" />
          </section>

        </div>
      </section>
    </main>
  );
}
