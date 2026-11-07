"use client";

import React, { useEffect, useRef, useState } from "react";

interface InteractiveCursorProps {
  mode?: "cosmic" | "studio";
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speed: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
  isBright: boolean;
}

interface RibbonPoint {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
  size: number;
}

export function InteractiveCursor({ mode = "cosmic" }: InteractiveCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const cursorLabelRef = useRef<HTMLSpanElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [cursorState, setCursorState] = useState<{
    hovering: boolean;
    label: string;
    isDrag: boolean;
  }>({ hovering: false, label: "", isDrag: false });

  // Physics refs
  const mousePos = useRef({ x: -500, y: -500, lastX: -500, lastY: -500 });
  const ringPos = useRef({ x: -500, y: -500 });
  const starsRef = useRef<StarParticle[]>([]);
  const ribbonPoints = useRef<RibbonPoint[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    // Clearly visible, sparkling, beautiful celestial stars (visible, magical, not blinding)
    const initStars = () => {
      const starColors =
        mode === "cosmic"
          ? [
              "#FFFFFF", // Crisp starlight diamond
              "#38BDF8", // Electric cyan
              "#10B981", // Aurora emerald
              "#C084FC", // Celestial violet
              "#FDE047", // Amber starlight
            ]
          : ["#18352D", "#C46A42", "#789681", "#3B5A4E"];

      // 130 visible, sparkling celestial particles
      starsRef.current = Array.from({ length: 130 }, (_, i) => {
        const isBright = i % 8 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: isBright ? Math.random() * 2.2 + 1.4 : Math.random() * 1.5 + 0.8,
          baseAlpha: isBright ? 0.85 : Math.random() * 0.35 + 0.45, // Clearly visible!
          speed: Math.random() * 0.25 + 0.05,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: Math.random() * 0.035 + 0.015,
          twinklePhase: Math.random() * Math.PI * 2,
          isBright,
        };
      });
    };

    initStars();

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const vx = x - mousePos.current.lastX;
      const vy = y - mousePos.current.lastY;
      const speed = Math.min(Math.hypot(vx, vy), 50);

      mousePos.current.lastX = x;
      mousePos.current.lastY = y;
      mousePos.current.x = x;
      mousePos.current.y = y;

      // Add fluid organic ribbon points (from internet-alchemist-hero.mp4)
      ribbonPoints.current.push({
        x,
        y,
        age: 0,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        size: Math.max(14, Math.min(speed * 1.8, 42)),
      });

      if (ribbonPoints.current.length > 50) {
        ribbonPoints.current.shift();
      }

      // Check hover target under cursor
      const target = e.target as HTMLElement | null;
      if (target) {
        const isSphereCard = target.closest(".cursor-grab, .cursor-grabbing, [data-orbit-card]");
        const interactive = target.closest("button, a, [role='button'], input, .cursor-pointer");
        if (isSphereCard) {
          setCursorState({ hovering: true, label: "DRAG", isDrag: true });
        } else if (interactive) {
          setCursorState({ hovering: true, label: "VIEW", isDrag: false });
        } else {
          setCursorState({ hovering: false, label: "", isDrag: false });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let time = 0;
    const maxAge = 36;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw clearly visible, sparkling celestial stars
      if (mode === "cosmic") {
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          s.y -= s.speed;
          if (s.y < 0) {
            s.y = height;
            s.x = Math.random() * width;
          }

          // Gentle sinusoidal twinkle
          const twinkle = 0.65 + 0.35 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
          const currentAlpha = Math.min(1, s.baseAlpha * twinkle);

          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.isBright ? 8 : 3;
          ctx.fill();

          // Subtle diamond sparkle for key hero stars
          if (s.isBright && currentAlpha > 0.6) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.7;
            ctx.globalAlpha = currentAlpha * 0.7;
            const flare = s.size * 2.2;
            ctx.beginPath();
            ctx.moveTo(s.x - flare, s.y);
            ctx.lineTo(s.x + flare, s.y);
            ctx.moveTo(s.x, s.y - flare);
            ctx.lineTo(s.x, s.y + flare);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // 2. Draw organic chromatic fluid ribbon (from internet-alchemist-hero.mp4)
      const points = ribbonPoints.current;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
      }
      ribbonPoints.current = points.filter((p) => p.age < maxAge);

      if (ribbonPoints.current.length > 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < ribbonPoints.current.length; i++) {
          const prev = ribbonPoints.current[i - 1];
          const curr = ribbonPoints.current[i];
          const progress = i / ribbonPoints.current.length;
          const life = 1 - curr.age / maxAge;

          if (life <= 0) continue;

          let strokeColor = "";
          if (mode === "cosmic") {
            // Iridescent purple/violet into emerald neon
            const r = Math.floor(147 + progress * (16 - 147));
            const g = Math.floor(51 + progress * (185 - 51));
            const b = Math.floor(234 + progress * (129 - 234));
            strokeColor = `rgba(${r}, ${g}, ${b}, ${(life * 0.42).toFixed(3)})`;
          } else {
            // Studio forest and amber
            const r = Math.floor(196 + progress * (24 - 196));
            const g = Math.floor(106 + progress * (53 - 106));
            const b = Math.floor(66 + progress * (45 - 66));
            strokeColor = `rgba(${r}, ${g}, ${b}, ${(life * 0.25).toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.lineWidth = Math.max(2, curr.size * life);
          ctx.strokeStyle = strokeColor;
          ctx.shadowBlur = mode === "cosmic" ? 16 : 6;
          ctx.shadowColor = mode === "cosmic" ? "rgba(168, 85, 247, 0.4)" : "rgba(196, 106, 66, 0.2)";
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // 3. Smooth Lerp for the Interactive Magnetic Cursor Ring
      const lerp = 0.2;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0px) translate(-50%, -50%)`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0px) translate(-50%, -50%)`;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mounted, mode]);

  if (!mounted) return null;

  return (
    <>
      {/* Background Starry & Fluid Canvas (Always visible, clean full opacity) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-1000"
        style={{ opacity: 1 }}
      />

      {/* Pinpoint Center Cursor Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 rounded-full transition-all duration-150 will-change-transform ${
          cursorState.hovering ? "w-1.5 h-1.5 opacity-0" : "w-2 h-2 opacity-100"
        } ${
          mode === "cosmic"
            ? "bg-[#10B981] shadow-[0_0_10px_#10B981]"
            : "bg-[#18352D] shadow-[0_0_6px_rgba(24,53,45,0.4)]"
        }`}
      />

      {/* Magnetic Outer Action Ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 rounded-full flex items-center justify-center transition-all duration-300 ease-out will-change-transform ${
          cursorState.hovering
            ? cursorState.isDrag
              ? "w-16 h-16 border border-emerald-400/70 bg-emerald-950/40 backdrop-blur-xs scale-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "w-14 h-14 border border-emerald-400/60 bg-emerald-900/30 backdrop-blur-xs scale-100 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            : "w-8 h-8 border border-current opacity-40 scale-100"
        } ${
          mode === "cosmic" ? "text-emerald-400 border-emerald-400/50" : "text-[#18352D] border-[#18352D]/50"
        }`}
      >
        {cursorState.hovering && (
          <span
            ref={cursorLabelRef}
            className="text-[9px] font-mono tracking-widest font-bold uppercase select-none animate-in fade-in duration-200"
          >
            {cursorState.label}
          </span>
        )}
      </div>
    </>
  );
}
