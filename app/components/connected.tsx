"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export default function Connected() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const traceLeadRef = useRef<SVGPathElement | null>(null);
  const traceTailRef = useRef<SVGPathElement | null>(null);
  const ballRef = useRef<SVGCircleElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const connectBtnRef = useRef<HTMLAnchorElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const flapRef = useRef<HTMLDivElement | null>(null);
  const letterRef = useRef<HTMLDivElement | null>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const sendTlRef = useRef<gsap.core.Timeline | null>(null);

  const [postcardOpen, setPostcardOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleOpenPostcard = (event: any) => {
    event.preventDefault();
    if (closing) return;
    setClosing(false);
    setPostcardOpen(true);
  };

  const handleSend = (event?: any) => {
    event?.preventDefault();
    if (!postcardOpen || closing) return;
    setClosing(true);

    const overlay = overlayRef.current;
    const envelope = envelopeRef.current;
    const flap = flapRef.current;
    const letter = letterRef.current;
    const connectBtn = connectBtnRef.current;
    if (!overlay || !envelope || !flap || !letter || !connectBtn) return;

    const { innerWidth: vw, innerHeight: vh } = window;
    const btnRect = connectBtn.getBoundingClientRect();
    const toX = btnRect.left + btnRect.width / 2 - vw / 2;
    const toY = btnRect.top + btnRect.height / 2 - vh / 2;

    sendTlRef.current?.kill();
    sendTlRef.current = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        setPostcardOpen(false);
        setClosing(false);
      },
    });

    sendTlRef.current
      .to(letter, { y: 90, opacity: 0, duration: 0.4 }, 0)
      .to(flap, { rotateX: 0, duration: 0.35 }, 0)
      .to(
        envelope,
        { width: 190, height: 190, borderRadius: "40% 40% 55% 55%", duration: 0.45, ease: "power3.inOut" },
        0.1,
      )
      .to(envelope, { rotation: -25, y: -40, scale: 0.8, duration: 0.45 }, 0.25)
      .to(envelope, { x: toX, y: toY, rotation: -320, scale: 0.08, duration: 0.9, ease: "power4.in" }, 0.65)
      .to(overlay, { opacity: 0, duration: 0.35, ease: "power1.out" }, 0.65);
  };

  const handleClose = () => {
    if (!postcardOpen || closing) return;
    setClosing(true);

    const overlay = overlayRef.current;
    const envelope = envelopeRef.current;
    const flap = flapRef.current;
    const letter = letterRef.current;
    const connectBtn = connectBtnRef.current;
    if (!overlay || !envelope || !flap || !letter || !connectBtn) return;

    const { innerWidth: vw, innerHeight: vh } = window;
    const btnRect = connectBtn.getBoundingClientRect();
    const toX = btnRect.left + btnRect.width / 2 - vw / 2;
    const toY = btnRect.top + btnRect.height / 2 - vh / 2;

    sendTlRef.current?.kill();
    sendTlRef.current = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        setPostcardOpen(false);
        setClosing(false);
      },
    });

    sendTlRef.current
      .to(letter, { y: 90, opacity: 0, duration: 0.3 }, 0)
      .to(flap, { rotateX: 0, duration: 0.3 }, 0.05)
      .to(envelope, { x: toX, y: toY, scale: 0.2, rotation: -8, duration: 0.55 }, 0.15)
      .to(overlay, { opacity: 0, duration: 0.35, ease: "power1.out" }, 0.2);
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      const lead = traceLeadRef.current;
      const tail = traceTailRef.current;
      const ball = ballRef.current;
      if (!path || !lead || !tail || !ball) return;

      const length = path.getTotalLength();
      const startBall = 0.01;
      const endBall = 0.99;

      gsap.set([lead, tail], {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.set(ball, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });

      // draw forward - longer duration for complex path
      tl.to(lead, { strokeDashoffset: 0, duration: 3, ease: "power3.out" }, 0)
        .to(
          ball,
          {
            duration: 15,
            ease: "power1.inOut",
            motionPath: {
              path,
              align: path,
              start: startBall,
              end: endBall,
            },
          },
          0.5,
        )
        .to(
          tail,
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power3.out",
          },
          8,
        )
        // draw backward
        .to(
          lead,
          { strokeDashoffset: -length * 0.01, duration: 1, ease: "back.out(2)" },
          3.5,
        )
        .to(
          tail,
          { strokeDashoffset: -length * 0.01, duration: 1, ease: "back.out(2)" },
          11,
        )
        .to(
          ball,
          {
            duration: 15,
            ease: "power1.inOut",
            motionPath: {
              path,
              align: path,
              start: endBall,
              end: startBall,
            },
          },
          12,
        )
        .addLabel("reset", 24)
        .to([lead, tail], { strokeDashoffset: length, duration: 0.3, ease: "none" }, "reset");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!postcardOpen) return;

    const ctx = gsap.context(() => {
      const overlay = overlayRef.current;
      const envelope = envelopeRef.current;
      const flap = flapRef.current;
      const letter = letterRef.current;
      const connectBtn = connectBtnRef.current;
      if (!overlay || !envelope || !flap || !letter || !connectBtn) return;

      const { innerWidth: vw, innerHeight: vh } = window;
      const btnRect = connectBtn.getBoundingClientRect();
      const fromX = btnRect.left + btnRect.width / 2 - vw / 2;
      const fromY = btnRect.top + btnRect.height / 2 - vh / 2;

      gsap.set(overlay, { opacity: 0, pointerEvents: "auto" });
      gsap.set(letter, { y: 90, opacity: 0 });
      gsap.set(flap, { rotateX: 0, transformOrigin: "50% 0%" });
      gsap.set(envelope, {
        x: fromX,
        y: fromY,
        scale: 0.2,
        rotation: -8,
        transformOrigin: "50% 50%",
        width: 520,
        height: 420,
        borderRadius: "22px",
      });

      openTlRef.current?.kill();
      openTlRef.current = gsap.timeline({ defaults: { ease: "power2.out" } });
      openTlRef.current
        .to(overlay, { opacity: 1, duration: 0.25 }, 0)
        .to(envelope, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.8, ease: "power3.out" }, 0)
        .to(flap, { rotateX: -150, duration: 0.55 }, 0.35)
        .to(letter, { y: -12, opacity: 1, duration: 0.55 }, 0.55);
    }, containerRef);

    return () => {
      ctx.revert();
      openTlRef.current?.kill();
      sendTlRef.current?.kill();
    };
  }, [postcardOpen]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0f111a] text-white px-6 py-12 md:py-16 flex flex-col items-center gap-6 rounded-3xl overflow-hidden border border-white/5"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_55%_90%,rgba(236,72,153,0.12),transparent_28%)]" />
      <div className="relative text-center space-y-2">
        <p className="text-xs tracking-[0.35em] uppercase text-gray-400">Connect</p>
        <h3 className="text-2xl md:text-3xl font-semibold">Let's get connected</h3>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl">
          I’m always open to new opportunities, collaborations, and interesting conversations. If you’d like to work together or just say hi, feel free to reach out.
        </p>
      </div>

      <div className="relative w-full max-w-5xl flex justify-center overflow-hidden">
        <svg
          viewBox="0 0 850 100"
          className="w-full max-w-5xl drop-shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
          style={{ minHeight: "120px" }}
        >
          {/* Base path - your "kalyanlabhishetty" text */}
          <path
            ref={pathRef}
            className="signature"
            d="M 476.3 74 L 467.3 74 L 467.3 0 L 476.3 0 L 476.3 30.3 Q 479.1 26.2 483.4 23.5 Q 487.7 20.8 493.5 20.8 Q 502.3 20.8 506.65 26.1 Q 511 31.4 511 40.1 L 511 74 L 502 74 L 502 41.1 Q 502 35.5 499.4 32.1 Q 496.8 28.7 492.1 28.7 Q 487.5 28.7 483.35 31.95 Q 479.2 35.2 476.3 39.6 L 476.3 74 Z M 607.3 74 L 598.3 74 L 598.3 0 L 607.3 0 L 607.3 30.3 Q 610.1 26.2 614.4 23.5 Q 618.7 20.8 624.5 20.8 Q 633.3 20.8 637.65 26.1 Q 642 31.4 642 40.1 L 642 74 L 633 74 L 633 41.1 Q 633 35.5 630.4 32.1 Q 627.8 28.7 623.1 28.7 Q 618.5 28.7 614.35 31.95 Q 610.2 35.2 607.3 39.6 L 607.3 74 Z M 42.1 69 L 35.9 75 L 9 47.3 L 9 74 L 0 74 L 0 0 L 9 0 L 9 42.3 L 32.5 21 L 37.7 26.7 L 17.6 44.5 L 42.1 69 Z M 134.4 95.2 L 136.4 87.7 Q 137.6 88.4 139.4 88.9 Q 141.2 89.4 143.4 89.4 Q 147.6 89.4 150.9 86.7 Q 154.2 84 157.2 76.1 L 159.5 70.1 L 154.7 70.1 L 134.4 24.4 L 142.4 20.8 L 161.8 64.1 L 176.9 21.2 L 185.2 24.4 L 166.1 76.6 Q 163.2 84.6 159.8 89.1 Q 156.4 93.6 152.3 95.4 Q 148.2 97.2 143.2 97.2 Q 140.2 97.2 137.95 96.6 Q 135.7 96 134.4 95.2 Z M 782.8 95.2 L 784.8 87.7 Q 786 88.4 787.8 88.9 Q 789.6 89.4 791.8 89.4 Q 796 89.4 799.3 86.7 Q 802.6 84 805.6 76.1 L 807.9 70.1 L 803.1 70.1 L 782.8 24.4 L 790.8 20.8 L 810.2 64.1 L 825.3 21.2 L 833.6 24.4 L 814.5 76.6 Q 811.6 84.6 808.2 89.1 Q 804.8 93.6 800.7 95.4 Q 796.6 97.2 791.6 97.2 Q 788.6 97.2 786.35 96.6 Q 784.1 96 782.8 95.2 Z M 262.9 74 L 253.9 74 L 253.9 22 L 262.6 22 L 262.6 30.7 Q 265.4 26.5 269.75 23.65 Q 274.1 20.8 280.1 20.8 Q 288.9 20.8 293.25 26.1 Q 297.6 31.4 297.6 40.1 L 297.6 74 L 288.6 74 L 288.6 41.1 Q 288.6 35.5 285.95 32.1 Q 283.3 28.7 278.6 28.7 Q 274 28.7 269.9 31.95 Q 265.8 35.2 262.9 39.6 L 262.9 74 Z M 547 69.8 L 550.8 62.3 Q 553.4 64.5 557.35 65.95 Q 561.3 67.4 565.8 67.4 Q 571.4 67.4 574.25 65.55 Q 577.1 63.7 577.1 60.8 Q 577.1 58.7 576.05 57.1 Q 575 55.5 572.2 53.95 Q 569.4 52.4 564.1 50.6 Q 556.8 48.1 553.15 44.65 Q 549.5 41.2 549.5 35.1 Q 549.5 29.1 554.75 24.95 Q 560 20.8 569.3 20.8 Q 574.3 20.8 578.2 21.85 Q 582.1 22.9 585.2 24.5 L 582.7 31.9 Q 580 30.3 576.55 29.3 Q 573.1 28.3 568.9 28.3 Q 563.7 28.3 561 30.4 Q 558.3 32.5 558.3 35 Q 558.3 37.4 560.4 39.1 Q 562.5 40.8 568.6 42.8 Q 578.5 46.1 582.4 50.1 Q 586.3 54.1 586.3 60.1 Q 586.3 67.1 580.65 71.15 Q 575 75.2 565.5 75.2 Q 559.6 75.2 554.85 73.7 Q 550.1 72.2 547 69.8 Z M 416.3 69.7 L 416.3 74 L 407.9 74 L 407.9 0 L 416.9 0 L 416.9 27.4 Q 418.9 25.1 422.75 22.95 Q 426.6 20.8 431.9 20.8 Q 437.9 20.8 443.15 23.95 Q 448.4 27.1 451.6 33.05 Q 454.8 39 454.8 47.5 Q 454.8 53.7 452.8 58.8 Q 450.8 63.9 447.45 67.55 Q 444.1 71.2 439.9 73.2 Q 435.7 75.2 431.3 75.2 Q 426.8 75.2 422.85 73.55 Q 418.9 71.9 416.3 69.7 Z M 699.6 51.7 L 663.2 51.7 Q 664.1 59 668.3 63.1 Q 672.5 67.2 679.4 67.2 Q 683.9 67.2 687.5 66.25 Q 691.1 65.3 694.4 63.8 L 696.5 71.5 Q 692.9 73.1 688.4 74.15 Q 683.9 75.2 678.3 75.2 Q 667.1 75.2 660.55 68.05 Q 654 60.9 654 48 Q 654 40.2 656.95 34.05 Q 659.9 27.9 665.2 24.35 Q 670.5 20.8 677.5 20.8 Q 685 20.8 689.95 24.05 Q 694.9 27.3 697.4 32.8 Q 699.9 38.3 699.9 44.9 Q 699.9 48.4 699.6 51.7 Z M 713.9 56.1 L 713.9 31.7 L 704.9 31.7 L 704.9 23.9 L 714.1 23.9 L 716 7.5 L 722.9 7.5 L 722.9 23.9 L 737.3 23.9 L 737.3 31.7 L 722.9 31.7 L 722.9 56.8 Q 722.9 62.6 725.35 64.9 Q 727.8 67.2 731.2 67.2 Q 733.7 67.2 735.95 66.4 Q 738.2 65.6 740.1 64.5 L 742.6 71.7 Q 740.6 72.9 737.2 74.05 Q 733.8 75.2 730.1 75.2 Q 722.6 75.2 718.25 70.25 Q 713.9 65.3 713.9 56.1 Z M 753.6 56.1 L 753.6 31.7 L 744.6 31.7 L 744.6 23.9 L 753.8 23.9 L 755.7 7.5 L 762.6 7.5 L 762.6 23.9 L 777 23.9 L 777 31.7 L 762.6 31.7 L 762.6 56.8 Q 762.6 62.6 765.05 64.9 Q 767.5 67.2 770.9 67.2 Q 773.4 67.2 775.65 66.4 Q 777.9 65.6 779.8 64.5 L 782.3 71.7 Q 780.3 72.9 776.9 74.05 Q 773.5 75.2 769.8 75.2 Q 762.3 75.2 757.95 70.25 Q 753.6 65.3 753.6 56.1 Z M 85.2 26.2 Q 82.5 23.9 78.85 22.35 Q 75.2 20.8 70.7 20.8 Q 63.5 20.8 57.95 24.45 Q 52.4 28.1 49.25 34.3 Q 46.1 40.5 46.1 48.3 Q 46.1 56.5 49.25 62.55 Q 52.4 68.6 57.7 71.9 Q 63 75.2 69.5 75.2 Q 75.6 75.2 79.55 72.55 Q 83.5 69.9 85.8 66.7 Q 87.8 74.5 97.4 74.5 L 99.3 67.5 Q 97.1 67.5 95.25 66.35 Q 93.4 65.2 93.4 61.4 L 93.4 22 L 85.2 22 L 85.2 26.2 Z M 227.8 26.2 Q 225.1 23.9 221.45 22.35 Q 217.8 20.8 213.3 20.8 Q 206.1 20.8 200.55 24.45 Q 195 28.1 191.85 34.3 Q 188.7 40.5 188.7 48.3 Q 188.7 56.5 191.85 62.55 Q 195 68.6 200.3 71.9 Q 205.6 75.2 212.1 75.2 Q 218.2 75.2 222.15 72.55 Q 226.1 69.9 228.4 66.7 Q 230.4 74.5 240 74.5 L 241.9 67.5 Q 239.7 67.5 237.85 66.35 Q 236 65.2 236 61.4 L 236 22 L 227.8 22 L 227.8 26.2 Z M 381.8 26.2 Q 379.1 23.9 375.45 22.35 Q 371.8 20.8 367.3 20.8 Q 360.1 20.8 354.55 24.45 Q 349 28.1 345.85 34.3 Q 342.7 40.5 342.7 48.3 Q 342.7 56.5 345.85 62.55 Q 349 68.6 354.3 71.9 Q 359.6 75.2 366.1 75.2 Q 372.2 75.2 376.15 72.55 Q 380.1 69.9 382.4 66.7 Q 384.4 74.5 394 74.5 L 395.9 67.5 Q 393.7 67.5 391.85 66.35 Q 390 65.2 390 61.4 L 390 22 L 381.8 22 L 381.8 26.2 Z M 110.8 57.7 L 110.8 0 L 119.8 0 L 119.8 56.8 Q 119.8 62.2 122.05 64.8 Q 124.3 67.4 128.3 67.4 Q 130.2 67.4 132.05 66.95 Q 133.9 66.5 135.2 65.9 L 137.4 73.2 Q 135.6 74 132.95 74.6 Q 130.3 75.2 127.1 75.2 Q 122.5 75.2 118.8 73.45 Q 115.1 71.7 112.95 67.8 Q 110.8 63.9 110.8 57.7 Z M 312.6 57.7 L 312.6 0 L 321.6 0 L 321.6 56.8 Q 321.6 62.2 323.85 64.8 Q 326.1 67.4 330.1 67.4 Q 332 67.4 333.85 66.95 Q 335.7 66.5 337 65.9 L 339.2 73.2 Q 337.4 74 334.75 74.6 Q 332.1 75.2 328.9 75.2 Q 324.3 75.2 320.6 73.45 Q 316.9 71.7 314.75 67.8 Q 312.6 63.9 312.6 57.7 Z M 535.5 74 L 526.5 74 L 526.5 22 L 535.5 22 L 535.5 74 Z M 84.4 60.7 Q 82.1 63.5 78.7 65.35 Q 75.3 67.2 71.5 67.2 Q 66.9 67.2 63.2 64.75 Q 59.5 62.3 57.4 57.95 Q 55.3 53.6 55.3 48 Q 55.3 42.2 57.4 37.85 Q 59.5 33.5 63.15 31.05 Q 66.8 28.6 71.6 28.6 Q 75.2 28.6 78.45 29.75 Q 81.7 30.9 84.4 32.8 L 84.4 60.7 Z M 227 60.7 Q 224.7 63.5 221.3 65.35 Q 217.9 67.2 214.1 67.2 Q 209.5 67.2 205.8 64.75 Q 202.1 62.3 200 57.95 Q 197.9 53.6 197.9 48 Q 197.9 42.2 200 37.85 Q 202.1 33.5 205.75 31.05 Q 209.4 28.6 214.2 28.6 Q 217.8 28.6 221.05 29.75 Q 224.3 30.9 227 32.8 L 227 60.7 Z M 381 60.7 Q 378.7 63.5 375.3 65.35 Q 371.9 67.2 368.1 67.2 Q 363.5 67.2 359.8 64.75 Q 356.1 62.3 354 57.95 Q 351.9 53.6 351.9 48 Q 351.9 42.2 354 37.85 Q 356.1 33.5 359.75 31.05 Q 363.4 28.6 368.2 28.6 Q 371.8 28.6 375.05 29.75 Q 378.3 30.9 381 32.8 L 381 60.7 Z M 416.9 35.4 Q 418.7 32.9 422.15 30.75 Q 425.6 28.6 429.9 28.6 Q 434.2 28.6 437.75 30.9 Q 441.3 33.2 443.45 37.5 Q 445.6 41.8 445.6 47.8 Q 445.6 53.6 443.45 58 Q 441.3 62.4 437.55 64.8 Q 433.8 67.2 428.9 67.2 Q 425.4 67.2 422.3 66.1 Q 419.2 65 416.9 63.2 L 416.9 35.4 Z M 663.1 44.4 Q 663.9 36.7 667.7 32.65 Q 671.5 28.6 677.3 28.6 Q 684 28.6 687.8 32.7 Q 691.6 36.8 691.6 44.4 L 663.1 44.4 Z M 531 13.1 Q 528.4 13.1 526.55 11.2 Q 524.7 9.3 524.7 6.8 Q 524.7 3.9 526.4 2.2 Q 528.1 0.5 531 0.5 Q 533.6 0.5 535.45 2.35 Q 537.3 4.2 537.3 6.8 Q 537.3 9.6 535.6 11.35 Q 533.9 13.1 531 13.1 Z"
            fill="none"
            stroke="#393b54"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            opacity="0.55"
          />
          <path
            ref={traceLeadRef}
            d="M 476.3 74 L 467.3 74 L 467.3 0 L 476.3 0 L 476.3 30.3 Q 479.1 26.2 483.4 23.5 Q 487.7 20.8 493.5 20.8 Q 502.3 20.8 506.65 26.1 Q 511 31.4 511 40.1 L 511 74 L 502 74 L 502 41.1 Q 502 35.5 499.4 32.1 Q 496.8 28.7 492.1 28.7 Q 487.5 28.7 483.35 31.95 Q 479.2 35.2 476.3 39.6 L 476.3 74 Z M 607.3 74 L 598.3 74 L 598.3 0 L 607.3 0 L 607.3 30.3 Q 610.1 26.2 614.4 23.5 Q 618.7 20.8 624.5 20.8 Q 633.3 20.8 637.65 26.1 Q 642 31.4 642 40.1 L 642 74 L 633 74 L 633 41.1 Q 633 35.5 630.4 32.1 Q 627.8 28.7 623.1 28.7 Q 618.5 28.7 614.35 31.95 Q 610.2 35.2 607.3 39.6 L 607.3 74 Z M 42.1 69 L 35.9 75 L 9 47.3 L 9 74 L 0 74 L 0 0 L 9 0 L 9 42.3 L 32.5 21 L 37.7 26.7 L 17.6 44.5 L 42.1 69 Z M 134.4 95.2 L 136.4 87.7 Q 137.6 88.4 139.4 88.9 Q 141.2 89.4 143.4 89.4 Q 147.6 89.4 150.9 86.7 Q 154.2 84 157.2 76.1 L 159.5 70.1 L 154.7 70.1 L 134.4 24.4 L 142.4 20.8 L 161.8 64.1 L 176.9 21.2 L 185.2 24.4 L 166.1 76.6 Q 163.2 84.6 159.8 89.1 Q 156.4 93.6 152.3 95.4 Q 148.2 97.2 143.2 97.2 Q 140.2 97.2 137.95 96.6 Q 135.7 96 134.4 95.2 Z M 782.8 95.2 L 784.8 87.7 Q 786 88.4 787.8 88.9 Q 789.6 89.4 791.8 89.4 Q 796 89.4 799.3 86.7 Q 802.6 84 805.6 76.1 L 807.9 70.1 L 803.1 70.1 L 782.8 24.4 L 790.8 20.8 L 810.2 64.1 L 825.3 21.2 L 833.6 24.4 L 814.5 76.6 Q 811.6 84.6 808.2 89.1 Q 804.8 93.6 800.7 95.4 Q 796.6 97.2 791.6 97.2 Q 788.6 97.2 786.35 96.6 Q 784.1 96 782.8 95.2 Z M 262.9 74 L 253.9 74 L 253.9 22 L 262.6 22 L 262.6 30.7 Q 265.4 26.5 269.75 23.65 Q 274.1 20.8 280.1 20.8 Q 288.9 20.8 293.25 26.1 Q 297.6 31.4 297.6 40.1 L 297.6 74 L 288.6 74 L 288.6 41.1 Q 288.6 35.5 285.95 32.1 Q 283.3 28.7 278.6 28.7 Q 274 28.7 269.9 31.95 Q 265.8 35.2 262.9 39.6 L 262.9 74 Z M 547 69.8 L 550.8 62.3 Q 553.4 64.5 557.35 65.95 Q 561.3 67.4 565.8 67.4 Q 571.4 67.4 574.25 65.55 Q 577.1 63.7 577.1 60.8 Q 577.1 58.7 576.05 57.1 Q 575 55.5 572.2 53.95 Q 569.4 52.4 564.1 50.6 Q 556.8 48.1 553.15 44.65 Q 549.5 41.2 549.5 35.1 Q 549.5 29.1 554.75 24.95 Q 560 20.8 569.3 20.8 Q 574.3 20.8 578.2 21.85 Q 582.1 22.9 585.2 24.5 L 582.7 31.9 Q 580 30.3 576.55 29.3 Q 573.1 28.3 568.9 28.3 Q 563.7 28.3 561 30.4 Q 558.3 32.5 558.3 35 Q 558.3 37.4 560.4 39.1 Q 562.5 40.8 568.6 42.8 Q 578.5 46.1 582.4 50.1 Q 586.3 54.1 586.3 60.1 Q 586.3 67.1 580.65 71.15 Q 575 75.2 565.5 75.2 Q 559.6 75.2 554.85 73.7 Q 550.1 72.2 547 69.8 Z M 416.3 69.7 L 416.3 74 L 407.9 74 L 407.9 0 L 416.9 0 L 416.9 27.4 Q 418.9 25.1 422.75 22.95 Q 426.6 20.8 431.9 20.8 Q 437.9 20.8 443.15 23.95 Q 448.4 27.1 451.6 33.05 Q 454.8 39 454.8 47.5 Q 454.8 53.7 452.8 58.8 Q 450.8 63.9 447.45 67.55 Q 444.1 71.2 439.9 73.2 Q 435.7 75.2 431.3 75.2 Q 426.8 75.2 422.85 73.55 Q 418.9 71.9 416.3 69.7 Z M 699.6 51.7 L 663.2 51.7 Q 664.1 59 668.3 63.1 Q 672.5 67.2 679.4 67.2 Q 683.9 67.2 687.5 66.25 Q 691.1 65.3 694.4 63.8 L 696.5 71.5 Q 692.9 73.1 688.4 74.15 Q 683.9 75.2 678.3 75.2 Q 667.1 75.2 660.55 68.05 Q 654 60.9 654 48 Q 654 40.2 656.95 34.05 Q 659.9 27.9 665.2 24.35 Q 670.5 20.8 677.5 20.8 Q 685 20.8 689.95 24.05 Q 694.9 27.3 697.4 32.8 Q 699.9 38.3 699.9 44.9 Q 699.9 48.4 699.6 51.7 Z M 713.9 56.1 L 713.9 31.7 L 704.9 31.7 L 704.9 23.9 L 714.1 23.9 L 716 7.5 L 722.9 7.5 L 722.9 23.9 L 737.3 23.9 L 737.3 31.7 L 722.9 31.7 L 722.9 56.8 Q 722.9 62.6 725.35 64.9 Q 727.8 67.2 731.2 67.2 Q 733.7 67.2 735.95 66.4 Q 738.2 65.6 740.1 64.5 L 742.6 71.7 Q 740.6 72.9 737.2 74.05 Q 733.8 75.2 730.1 75.2 Q 722.6 75.2 718.25 70.25 Q 713.9 65.3 713.9 56.1 Z M 753.6 56.1 L 753.6 31.7 L 744.6 31.7 L 744.6 23.9 L 753.8 23.9 L 755.7 7.5 L 762.6 7.5 L 762.6 23.9 L 777 23.9 L 777 31.7 L 762.6 31.7 L 762.6 56.8 Q 762.6 62.6 765.05 64.9 Q 767.5 67.2 770.9 67.2 Q 773.4 67.2 775.65 66.4 Q 777.9 65.6 779.8 64.5 L 782.3 71.7 Q 780.3 72.9 776.9 74.05 Q 773.5 75.2 769.8 75.2 Q 762.3 75.2 757.95 70.25 Q 753.6 65.3 753.6 56.1 Z M 85.2 26.2 Q 82.5 23.9 78.85 22.35 Q 75.2 20.8 70.7 20.8 Q 63.5 20.8 57.95 24.45 Q 52.4 28.1 49.25 34.3 Q 46.1 40.5 46.1 48.3 Q 46.1 56.5 49.25 62.55 Q 52.4 68.6 57.7 71.9 Q 63 75.2 69.5 75.2 Q 75.6 75.2 79.55 72.55 Q 83.5 69.9 85.8 66.7 Q 87.8 74.5 97.4 74.5 L 99.3 67.5 Q 97.1 67.5 95.25 66.35 Q 93.4 65.2 93.4 61.4 L 93.4 22 L 85.2 22 L 85.2 26.2 Z M 227.8 26.2 Q 225.1 23.9 221.45 22.35 Q 217.8 20.8 213.3 20.8 Q 206.1 20.8 200.55 24.45 Q 195 28.1 191.85 34.3 Q 188.7 40.5 188.7 48.3 Q 188.7 56.5 191.85 62.55 Q 195 68.6 200.3 71.9 Q 205.6 75.2 212.1 75.2 Q 218.2 75.2 222.15 72.55 Q 226.1 69.9 228.4 66.7 Q 230.4 74.5 240 74.5 L 241.9 67.5 Q 239.7 67.5 237.85 66.35 Q 236 65.2 236 61.4 L 236 22 L 227.8 22 L 227.8 26.2 Z M 381.8 26.2 Q 379.1 23.9 375.45 22.35 Q 371.8 20.8 367.3 20.8 Q 360.1 20.8 354.55 24.45 Q 349 28.1 345.85 34.3 Q 342.7 40.5 342.7 48.3 Q 342.7 56.5 345.85 62.55 Q 349 68.6 354.3 71.9 Q 359.6 75.2 366.1 75.2 Q 372.2 75.2 376.15 72.55 Q 380.1 69.9 382.4 66.7 Q 384.4 74.5 394 74.5 L 395.9 67.5 Q 393.7 67.5 391.85 66.35 Q 390 65.2 390 61.4 L 390 22 L 381.8 22 L 381.8 26.2 Z M 110.8 57.7 L 110.8 0 L 119.8 0 L 119.8 56.8 Q 119.8 62.2 122.05 64.8 Q 124.3 67.4 128.3 67.4 Q 130.2 67.4 132.05 66.95 Q 133.9 66.5 135.2 65.9 L 137.4 73.2 Q 135.6 74 132.95 74.6 Q 130.3 75.2 127.1 75.2 Q 122.5 75.2 118.8 73.45 Q 115.1 71.7 112.95 67.8 Q 110.8 63.9 110.8 57.7 Z M 312.6 57.7 L 312.6 0 L 321.6 0 L 321.6 56.8 Q 321.6 62.2 323.85 64.8 Q 326.1 67.4 330.1 67.4 Q 332 67.4 333.85 66.95 Q 335.7 66.5 337 65.9 L 339.2 73.2 Q 337.4 74 334.75 74.6 Q 332.1 75.2 328.9 75.2 Q 324.3 75.2 320.6 73.45 Q 316.9 71.7 314.75 67.8 Q 312.6 63.9 312.6 57.7 Z M 535.5 74 L 526.5 74 L 526.5 22 L 535.5 22 L 535.5 74 Z M 84.4 60.7 Q 82.1 63.5 78.7 65.35 Q 75.3 67.2 71.5 67.2 Q 66.9 67.2 63.2 64.75 Q 59.5 62.3 57.4 57.95 Q 55.3 53.6 55.3 48 Q 55.3 42.2 57.4 37.85 Q 59.5 33.5 63.15 31.05 Q 66.8 28.6 71.6 28.6 Q 75.2 28.6 78.45 29.75 Q 81.7 30.9 84.4 32.8 L 84.4 60.7 Z M 227 60.7 Q 224.7 63.5 221.3 65.35 Q 217.9 67.2 214.1 67.2 Q 209.5 67.2 205.8 64.75 Q 202.1 62.3 200 57.95 Q 197.9 53.6 197.9 48 Q 197.9 42.2 200 37.85 Q 202.1 33.5 205.75 31.05 Q 209.4 28.6 214.2 28.6 Q 217.8 28.6 221.05 29.75 Q 224.3 30.9 227 32.8 L 227 60.7 Z M 381 60.7 Q 378.7 63.5 375.3 65.35 Q 371.9 67.2 368.1 67.2 Q 363.5 67.2 359.8 64.75 Q 356.1 62.3 354 57.95 Q 351.9 53.6 351.9 48 Q 351.9 42.2 354 37.85 Q 356.1 33.5 359.75 31.05 Q 363.4 28.6 368.2 28.6 Q 371.8 28.6 375.05 29.75 Q 378.3 30.9 381 32.8 L 381 60.7 Z M 416.9 35.4 Q 418.7 32.9 422.15 30.75 Q 425.6 28.6 429.9 28.6 Q 434.2 28.6 437.75 30.9 Q 441.3 33.2 443.45 37.5 Q 445.6 41.8 445.6 47.8 Q 445.6 53.6 443.45 58 Q 441.3 62.4 437.55 64.8 Q 433.8 67.2 428.9 67.2 Q 425.4 67.2 422.3 66.1 Q 419.2 65 416.9 63.2 L 416.9 35.4 Z M 663.1 44.4 Q 663.9 36.7 667.7 32.65 Q 671.5 28.6 677.3 28.6 Q 684 28.6 687.8 32.7 Q 691.6 36.8 691.6 44.4 L 663.1 44.4 Z M 531 13.1 Q 528.4 13.1 526.55 11.2 Q 524.7 9.3 524.7 6.8 Q 524.7 3.9 526.4 2.2 Q 528.1 0.5 531 0.5 Q 533.6 0.5 535.45 2.35 Q 537.3 4.2 537.3 6.8 Q 537.3 9.6 535.6 11.35 Q 533.9 13.1 531 13.1 Z"
            fill="none"
            stroke="#7d7f8e"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            ref={traceTailRef}
            d="M 476.3 74 L 467.3 74 L 467.3 0 L 476.3 0 L 476.3 30.3 Q 479.1 26.2 483.4 23.5 Q 487.7 20.8 493.5 20.8 Q 502.3 20.8 506.65 26.1 Q 511 31.4 511 40.1 L 511 74 L 502 74 L 502 41.1 Q 502 35.5 499.4 32.1 Q 496.8 28.7 492.1 28.7 Q 487.5 28.7 483.35 31.95 Q 479.2 35.2 476.3 39.6 L 476.3 74 Z M 607.3 74 L 598.3 74 L 598.3 0 L 607.3 0 L 607.3 30.3 Q 610.1 26.2 614.4 23.5 Q 618.7 20.8 624.5 20.8 Q 633.3 20.8 637.65 26.1 Q 642 31.4 642 40.1 L 642 74 L 633 74 L 633 41.1 Q 633 35.5 630.4 32.1 Q 627.8 28.7 623.1 28.7 Q 618.5 28.7 614.35 31.95 Q 610.2 35.2 607.3 39.6 L 607.3 74 Z M 42.1 69 L 35.9 75 L 9 47.3 L 9 74 L 0 74 L 0 0 L 9 0 L 9 42.3 L 32.5 21 L 37.7 26.7 L 17.6 44.5 L 42.1 69 Z M 134.4 95.2 L 136.4 87.7 Q 137.6 88.4 139.4 88.9 Q 141.2 89.4 143.4 89.4 Q 147.6 89.4 150.9 86.7 Q 154.2 84 157.2 76.1 L 159.5 70.1 L 154.7 70.1 L 134.4 24.4 L 142.4 20.8 L 161.8 64.1 L 176.9 21.2 L 185.2 24.4 L 166.1 76.6 Q 163.2 84.6 159.8 89.1 Q 156.4 93.6 152.3 95.4 Q 148.2 97.2 143.2 97.2 Q 140.2 97.2 137.95 96.6 Q 135.7 96 134.4 95.2 Z M 782.8 95.2 L 784.8 87.7 Q 786 88.4 787.8 88.9 Q 789.6 89.4 791.8 89.4 Q 796 89.4 799.3 86.7 Q 802.6 84 805.6 76.1 L 807.9 70.1 L 803.1 70.1 L 782.8 24.4 L 790.8 20.8 L 810.2 64.1 L 825.3 21.2 L 833.6 24.4 L 814.5 76.6 Q 811.6 84.6 808.2 89.1 Q 804.8 93.6 800.7 95.4 Q 796.6 97.2 791.6 97.2 Q 788.6 97.2 786.35 96.6 Q 784.1 96 782.8 95.2 Z M 262.9 74 L 253.9 74 L 253.9 22 L 262.6 22 L 262.6 30.7 Q 265.4 26.5 269.75 23.65 Q 274.1 20.8 280.1 20.8 Q 288.9 20.8 293.25 26.1 Q 297.6 31.4 297.6 40.1 L 297.6 74 L 288.6 74 L 288.6 41.1 Q 288.6 35.5 285.95 32.1 Q 283.3 28.7 278.6 28.7 Q 274 28.7 269.9 31.95 Q 265.8 35.2 262.9 39.6 L 262.9 74 Z M 547 69.8 L 550.8 62.3 Q 553.4 64.5 557.35 65.95 Q 561.3 67.4 565.8 67.4 Q 571.4 67.4 574.25 65.55 Q 577.1 63.7 577.1 60.8 Q 577.1 58.7 576.05 57.1 Q 575 55.5 572.2 53.95 Q 569.4 52.4 564.1 50.6 Q 556.8 48.1 553.15 44.65 Q 549.5 41.2 549.5 35.1 Q 549.5 29.1 554.75 24.95 Q 560 20.8 569.3 20.8 Q 574.3 20.8 578.2 21.85 Q 582.1 22.9 585.2 24.5 L 582.7 31.9 Q 580 30.3 576.55 29.3 Q 573.1 28.3 568.9 28.3 Q 563.7 28.3 561 30.4 Q 558.3 32.5 558.3 35 Q 558.3 37.4 560.4 39.1 Q 562.5 40.8 568.6 42.8 Q 578.5 46.1 582.4 50.1 Q 586.3 54.1 586.3 60.1 Q 586.3 67.1 580.65 71.15 Q 575 75.2 565.5 75.2 Q 559.6 75.2 554.85 73.7 Q 550.1 72.2 547 69.8 Z M 416.3 69.7 L 416.3 74 L 407.9 74 L 407.9 0 L 416.9 0 L 416.9 27.4 Q 418.9 25.1 422.75 22.95 Q 426.6 20.8 431.9 20.8 Q 437.9 20.8 443.15 23.95 Q 448.4 27.1 451.6 33.05 Q 454.8 39 454.8 47.5 Q 454.8 53.7 452.8 58.8 Q 450.8 63.9 447.45 67.55 Q 444.1 71.2 439.9 73.2 Q 435.7 75.2 431.3 75.2 Q 426.8 75.2 422.85 73.55 Q 418.9 71.9 416.3 69.7 Z M 699.6 51.7 L 663.2 51.7 Q 664.1 59 668.3 63.1 Q 672.5 67.2 679.4 67.2 Q 683.9 67.2 687.5 66.25 Q 691.1 65.3 694.4 63.8 L 696.5 71.5 Q 692.9 73.1 688.4 74.15 Q 683.9 75.2 678.3 75.2 Q 667.1 75.2 660.55 68.05 Q 654 60.9 654 48 Q 654 40.2 656.95 34.05 Q 659.9 27.9 665.2 24.35 Q 670.5 20.8 677.5 20.8 Q 685 20.8 689.95 24.05 Q 694.9 27.3 697.4 32.8 Q 699.9 38.3 699.9 44.9 Q 699.9 48.4 699.6 51.7 Z M 713.9 56.1 L 713.9 31.7 L 704.9 31.7 L 704.9 23.9 L 714.1 23.9 L 716 7.5 L 722.9 7.5 L 722.9 23.9 L 737.3 23.9 L 737.3 31.7 L 722.9 31.7 L 722.9 56.8 Q 722.9 62.6 725.35 64.9 Q 727.8 67.2 731.2 67.2 Q 733.7 67.2 735.95 66.4 Q 738.2 65.6 740.1 64.5 L 742.6 71.7 Q 740.6 72.9 737.2 74.05 Q 733.8 75.2 730.1 75.2 Q 722.6 75.2 718.25 70.25 Q 713.9 65.3 713.9 56.1 Z M 753.6 56.1 L 753.6 31.7 L 744.6 31.7 L 744.6 23.9 L 753.8 23.9 L 755.7 7.5 L 762.6 7.5 L 762.6 23.9 L 777 23.9 L 777 31.7 L 762.6 31.7 L 762.6 56.8 Q 762.6 62.6 765.05 64.9 Q 767.5 67.2 770.9 67.2 Q 773.4 67.2 775.65 66.4 Q 777.9 65.6 779.8 64.5 L 782.3 71.7 Q 780.3 72.9 776.9 74.05 Q 773.5 75.2 769.8 75.2 Q 762.3 75.2 757.95 70.25 Q 753.6 65.3 753.6 56.1 Z M 85.2 26.2 Q 82.5 23.9 78.85 22.35 Q 75.2 20.8 70.7 20.8 Q 63.5 20.8 57.95 24.45 Q 52.4 28.1 49.25 34.3 Q 46.1 40.5 46.1 48.3 Q 46.1 56.5 49.25 62.55 Q 52.4 68.6 57.7 71.9 Q 63 75.2 69.5 75.2 Q 75.6 75.2 79.55 72.55 Q 83.5 69.9 85.8 66.7 Q 87.8 74.5 97.4 74.5 L 99.3 67.5 Q 97.1 67.5 95.25 66.35 Q 93.4 65.2 93.4 61.4 L 93.4 22 L 85.2 22 L 85.2 26.2 Z M 227.8 26.2 Q 225.1 23.9 221.45 22.35 Q 217.8 20.8 213.3 20.8 Q 206.1 20.8 200.55 24.45 Q 195 28.1 191.85 34.3 Q 188.7 40.5 188.7 48.3 Q 188.7 56.5 191.85 62.55 Q 195 68.6 200.3 71.9 Q 205.6 75.2 212.1 75.2 Q 218.2 75.2 222.15 72.55 Q 226.1 69.9 228.4 66.7 Q 230.4 74.5 240 74.5 L 241.9 67.5 Q 239.7 67.5 237.85 66.35 Q 236 65.2 236 61.4 L 236 22 L 227.8 22 L 227.8 26.2 Z M 381.8 26.2 Q 379.1 23.9 375.45 22.35 Q 371.8 20.8 367.3 20.8 Q 360.1 20.8 354.55 24.45 Q 349 28.1 345.85 34.3 Q 342.7 40.5 342.7 48.3 Q 342.7 56.5 345.85 62.55 Q 349 68.6 354.3 71.9 Q 359.6 75.2 366.1 75.2 Q 372.2 75.2 376.15 72.55 Q 380.1 69.9 382.4 66.7 Q 384.4 74.5 394 74.5 L 395.9 67.5 Q 393.7 67.5 391.85 66.35 Q 390 65.2 390 61.4 L 390 22 L 381.8 22 L 381.8 26.2 Z M 110.8 57.7 L 110.8 0 L 119.8 0 L 119.8 56.8 Q 119.8 62.2 122.05 64.8 Q 124.3 67.4 128.3 67.4 Q 130.2 67.4 132.05 66.95 Q 133.9 66.5 135.2 65.9 L 137.4 73.2 Q 135.6 74 132.95 74.6 Q 130.3 75.2 127.1 75.2 Q 122.5 75.2 118.8 73.45 Q 115.1 71.7 112.95 67.8 Q 110.8 63.9 110.8 57.7 Z M 312.6 57.7 L 312.6 0 L 321.6 0 L 321.6 56.8 Q 321.6 62.2 323.85 64.8 Q 326.1 67.4 330.1 67.4 Q 332 67.4 333.85 66.95 Q 335.7 66.5 337 65.9 L 339.2 73.2 Q 337.4 74 334.75 74.6 Q 332.1 75.2 328.9 75.2 Q 324.3 75.2 320.6 73.45 Q 316.9 71.7 314.75 67.8 Q 312.6 63.9 312.6 57.7 Z M 535.5 74 L 526.5 74 L 526.5 22 L 535.5 22 L 535.5 74 Z M 84.4 60.7 Q 82.1 63.5 78.7 65.35 Q 75.3 67.2 71.5 67.2 Q 66.9 67.2 63.2 64.75 Q 59.5 62.3 57.4 57.95 Q 55.3 53.6 55.3 48 Q 55.3 42.2 57.4 37.85 Q 59.5 33.5 63.15 31.05 Q 66.8 28.6 71.6 28.6 Q 75.2 28.6 78.45 29.75 Q 81.7 30.9 84.4 32.8 L 84.4 60.7 Z M 227 60.7 Q 224.7 63.5 221.3 65.35 Q 217.9 67.2 214.1 67.2 Q 209.5 67.2 205.8 64.75 Q 202.1 62.3 200 57.95 Q 197.9 53.6 197.9 48 Q 197.9 42.2 200 37.85 Q 202.1 33.5 205.75 31.05 Q 209.4 28.6 214.2 28.6 Q 217.8 28.6 221.05 29.75 Q 224.3 30.9 227 32.8 L 227 60.7 Z M 381 60.7 Q 378.7 63.5 375.3 65.35 Q 371.9 67.2 368.1 67.2 Q 363.5 67.2 359.8 64.75 Q 356.1 62.3 354 57.95 Q 351.9 53.6 351.9 48 Q 351.9 42.2 354 37.85 Q 356.1 33.5 359.75 31.05 Q 363.4 28.6 368.2 28.6 Q 371.8 28.6 375.05 29.75 Q 378.3 30.9 381 32.8 L 381 60.7 Z M 416.9 35.4 Q 418.7 32.9 422.15 30.75 Q 425.6 28.6 429.9 28.6 Q 434.2 28.6 437.75 30.9 Q 441.3 33.2 443.45 37.5 Q 445.6 41.8 445.6 47.8 Q 445.6 53.6 443.45 58 Q 441.3 62.4 437.55 64.8 Q 433.8 67.2 428.9 67.2 Q 425.4 67.2 422.3 66.1 Q 419.2 65 416.9 63.2 L 416.9 35.4 Z M 663.1 44.4 Q 663.9 36.7 667.7 32.65 Q 671.5 28.6 677.3 28.6 Q 684 28.6 687.8 32.7 Q 691.6 36.8 691.6 44.4 L 663.1 44.4 Z M 531 13.1 Q 528.4 13.1 526.55 11.2 Q 524.7 9.3 524.7 6.8 Q 524.7 3.9 526.4 2.2 Q 528.1 0.5 531 0.5 Q 533.6 0.5 535.45 2.35 Q 537.3 4.2 537.3 6.8 Q 537.3 9.6 535.6 11.35 Q 533.9 13.1 531 13.1 Z"
            fill="none"
            stroke="#9ca3af"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            opacity="0.75"
          />
          <circle ref={ballRef} className="ball" cx="0" cy="0" r="2.5" fill="#34d399" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-200">
        <a
          href="https://www.linkedin.com/in/kalyan-labhishetty-b16a90179/"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/25 hover:bg-white/10"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-[#0A66C2]">
            <path d="M20.447 20.452h-3.554v-5.568c0-1.328-.026-3.037-1.85-3.037-1.853 0-2.136 1.447-2.136 2.94v5.665H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM3.56 20.452h3.554V9H3.56v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
          LinkedIn
        </a>

        <a
          href="https://github.com/SaikalyanLabhishetty"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/25 hover:bg-white/10"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-gray-100">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 .5C5.649.5.5 5.65.5 12.004c0 5.095 3.292 9.41 7.867 10.936.575.106.785-.249.785-.554 0-.273-.01-1.184-.016-2.148-3.198.696-3.874-1.54-3.874-1.54-.523-1.33-1.277-1.684-1.277-1.684-1.043-.713.079-.699.079-.699 1.152.081 1.758 1.183 1.758 1.183 1.026 1.758 2.69 1.25 3.345.956.104-.744.401-1.25.73-1.538-2.552-.29-5.236-1.277-5.236-5.683 0-1.255.449-2.28 1.183-3.083-.119-.29-.512-1.457.113-3.04 0 0 .965-.309 3.163 1.178a11.02 11.02 0 0 1 2.878-.387 11 11 0 0 1 2.878.387c2.198-1.487 3.162-1.178 3.162-1.178.626 1.583.233 2.75.114 3.04.736.803 1.183 1.828 1.183 3.083 0 4.417-2.69 5.39-5.253 5.675.412.355.78 1.053.78 2.126 0 1.536-.014 2.775-.014 3.154 0 .307.208.666.79.553C20.71 21.41 24 17.098 24 12.004 24 5.65 18.851.5 12 .5Z"
            />
          </svg>
          GitHub
        </a>

        <a
          ref={connectBtnRef}
          href="#connect"
          onClick={handleOpenPostcard}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/25 hover:bg-white/10"
          role="button"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-emerald-300">
            <path
              d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="m21.854 2.147-10.94 10.939" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Connect
        </a>

        <a
          href="/resume.pdf"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/25 hover:bg-white/10"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-amber-300">
            <path d="M6 3.5h7L18.5 9v11a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 3.5V9h5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 13h7" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M8.5 16h4" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Résumé
        </a>
      </div>

      {postcardOpen && (
        <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" style={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative flex h-full w-full items-center justify-center px-6">
            <div
              ref={envelopeRef}
              className="relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-sky-500/85 via-indigo-500/80 to-purple-600/85 shadow-[0_30px_80px_rgba(0,0,0,0.45)] transform-gpu"
              style={{ width: 520, height: 420, perspective: "1200px", transformStyle: "preserve-3d" }}
            >
              <div
                ref={flapRef}
                className="absolute left-0 right-0 top-0 h-1/2 bg-gradient-to-b from-white via-slate-50 to-white/40 shadow-md"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "50% 0%" }}
              />

              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-[22px]" />

              <div
                ref={letterRef}
                className="absolute left-[5%] top-[7%] flex h-[86%] w-[90%] flex-col gap-3 rounded-xl bg-white px-4 py-3 text-gray-900 shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                    Little Post
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close postcard"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow hover:text-slate-700 hover:bg-white transition"
                  >
                    ×
                  </button>
                </div>

                <form className="flex h-full flex-col text-sm" onSubmit={handleSend}>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-slate-500">Your email</span>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        placeholder="you@example.com"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[12px] font-medium text-slate-500">Message</span>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="Tell me about your idea..."
                      />
                    </label>
                  </div>

                  <div className="sticky bottom-0 flex items-center justify-between gap-2 text-xs text-slate-500 bg-white pt-2 pb-1 border-t border-slate-200">
                    <span>Folds like a postcard</span>
                    <button
                      type="submit"
                      disabled={closing}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 px-3 py-1.5 text-white font-semibold shadow-md transition hover:shadow-lg disabled:opacity-60"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M4 12h12" />
                        <path d="M10 6l6 6-6 6" />
                      </svg>
                      Send
                    </button>
                  </div>
                </form>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/80">
                <span>From: You</span>
                <span>To: Kalyan</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
