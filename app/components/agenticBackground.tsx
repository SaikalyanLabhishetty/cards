"use client";

import { useEffect, useState } from "react";

export default function AgenticBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] bg-[#030303] overflow-hidden pointer-events-none">
            {/* Tech Grid */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Mouse Follow Glow */}
            <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{
                    background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
                }}
            />

            {/* Floating Animated Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

            {/* Overlay gradient to darken edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#030303]" />
        </div>
    );
}
