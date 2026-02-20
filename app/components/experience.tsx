"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

export default function Experience() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);
    const dotRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
        const ctx = gsap.context(() => {
            // Create scroll-linked timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 1,
                }
            });

            if (pathRef.current && dotRef.current) {
                // Calculate exact path length for drawing effect
                const length = pathRef.current.getTotalLength();
                gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

                // Animate stroke drawing
                tl.to(pathRef.current, {
                    strokeDashoffset: 0,
                    ease: "none",
                }, 0);

                // Animate glowing dot along the path
                tl.to(dotRef.current, {
                    motionPath: {
                        path: pathRef.current,
                        align: pathRef.current,
                        alignOrigin: [0.5, 0.5],
                    },
                    ease: "none"
                }, 0);
            }

            // Animate the text items
            gsap.utils.toArray<HTMLElement>(".exp-item").forEach((item) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        end: "bottom top",
                        toggleActions: "play none none reverse",
                    },
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative z-10 py-24 text-white overflow-hidden min-h-screen">
            <div className="max-w-6xl mx-auto relative px-6 md:px-0">

                {/* Title Block */}
                <div className="text-center mb-12 md:mb-24 px-4">
                    <p className="inline-flex items-center text-[10px] md:text-xs tracking-[0.35em] uppercase font-semibold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] mb-3 md:mb-4">
                        System Timeline
                    </p>
                    <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
                            Operational Experience.
                        </span>
                    </h2>
                </div>

                {/* --- Desktop View (MotionPath) --- */}
                <div className="relative w-full h-[1200px] hidden md:block">
                    {/* SVG Canvas for Path */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                        {/* Background Faded Path */}
                        <path
                            d="M 500,0 C 800,200 800,400 500,600 C 200,800 200,1000 500,1200"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="4"
                        />
                        {/* Active Highlight Path calculated for draw effect */}
                        <path
                            ref={pathRef}
                            d="M 500,0 C 800,200 800,400 500,600 C 200,800 200,1000 500,1200"
                            fill="none"
                            stroke="url(#path-gradient)"
                            strokeWidth="4"
                            style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.5))" }}
                        />
                    </svg>

                    {/* Glowing Spark Element moving along the path */}
                    <div
                        ref={dotRef}
                        className="absolute top-0 left-0 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_6px_rgba(6,182,212,0.8)] z-20"
                        style={{
                            transform: "translate(-50%, -50%)",
                            border: "2px solid rgba(255,255,255,0.8)"
                        }}
                    />

                    {/* Experience Item 1 */}
                    <div className="absolute top-[8%] left-[5%] w-[40%] exp-item text-right">
                        <div className="inline-block p-[1px] rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                            <div className="bg-[#0a0a0f]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                                <h3 className="text-2xl font-bold text-white mb-1">Software Engineer</h3>
                                <p className="text-cyan-400 font-medium mb-4 flex items-center justify-end gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    Owfis Jobpe Technologies &bull; April 2025 - Present
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Led the development of scalable React/Next.js applications, delivered end-to-end payment integrations, and embedded AI-driven agentic functionality to automate user interactions and business logic.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Experience Item 2 */}
                    <div className="absolute top-[42%] right-[5%] w-[40%] exp-item text-left">
                        <div className="inline-block p-[1px] rounded-2xl bg-gradient-to-bl from-purple-500/30 to-blue-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                            <div className="bg-[#0a0a0f]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                                <h3 className="text-2xl font-bold text-white mb-1">Software Engineer</h3>
                                <p className="text-purple-400 font-medium mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                    Mantra Technologies &bull; January 2024 - March 2025
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Built reusable UI components and packaged them as Nuxt plugins for seamless adoption across multiple applications.
                                    Developed scalable web applications with Next.js, optimizing server-side rendering and API routes to handle high concurrent traffic and improve performance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Experience Item 3 */}
                    <div className="absolute top-[75%] left-[5%] w-[40%] exp-item text-right">
                        <div className="inline-block p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <div className="bg-[#0a0a0f]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                                <h3 className="text-2xl font-bold text-white mb-1">Frontend Developer</h3>
                                <p className="text-blue-400 font-medium mb-4 flex items-center justify-end gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    PowerSchool India &bull; September 2022 - June 2023
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Developed responsive, interactive user interfaces for complex SaaS platforms.
                                    Collaborated closely with design teams to establish reusable shared services and ensure design–development consistency.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Mobile View (Simple Vertical Line) --- */}
                <div className="block md:hidden relative pt-10">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-purple-500 opacity-60 rounded-full" />

                    <div className="space-y-12">

                        {/* Mobile Item 1 */}
                        <div className="relative pl-14 pr-2 exp-item">
                            <div className="absolute left-[20px] top-6 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] border-2 border-slate-900" />
                            <div className="bg-[#0a0a0f]/80 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/20 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-1">Software Engineer</h3>
                                <p className="text-cyan-400 text-xs font-medium mb-3">Owfis Jobpe Technologies &bull; April 2025 - Present</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Led the development of scalable React/Next.js applications, delivered end-to-end payment integrations, and embedded AI-driven agentic functionality to automate user interactions and business logic.
                                </p>
                            </div>
                        </div>

                        {/* Mobile Item 2 */}
                        <div className="relative pl-14 pr-2 exp-item">
                            <div className="absolute left-[20px] top-6 w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)] border-2 border-slate-900" />
                            <div className="bg-[#0a0a0f]/80 backdrop-blur-md p-5 rounded-2xl border border-purple-500/20 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-1">Software Engineer</h3>
                                <p className="text-purple-400 text-xs font-medium mb-3">Mantra Technologies &bull; January 2024 - March 2025</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Built reusable UI components and packaged them as Nuxt plugins for seamless adoption across multiple applications.
                                    Developed scalable web applications with Next.js, optimizing server-side rendering and API routes to handle high concurrent traffic and improve performance.
                                </p>
                            </div>
                        </div>

                        {/* Mobile Item 3 */}
                        <div className="relative pl-14 pr-2 exp-item">
                            <div className="absolute left-[20px] top-6 w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.9)] border-2 border-slate-900" />
                            <div className="bg-[#0a0a0f]/80 backdrop-blur-md p-5 rounded-2xl border border-blue-500/20 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-1">Frontend Developer</h3>
                                <p className="text-blue-400 text-xs font-medium mb-3">PowerSchool India &bull; September 2022 - June 2023</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Developed responsive, interactive user interfaces for complex SaaS platforms.
                                    Collaborated closely with design teams to establish reusable shared services and ensure design–development consistency.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
