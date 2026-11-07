"use client";

import React, { useEffect, useRef, useState } from "react";

interface FluidCursorProps {
  mode?: "cosmic" | "studio";
  intensity?: number;
}

interface Point {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
  size: number;
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
  isBrightDiamond: boolean;
}

export function FluidCursor({ mode = "cosmic", intensity = 1 }: FluidCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const starsRef = useRef<StarParticle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, lastX: -1000, lastY: -1000, moving: false });
  const animFrameRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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

    const initStars = () => {
      const starColors =
        mode === "cosmic"
          ? [
              "#FFFFFF", // Crisp diamond white
              "#FFFFFF",
              "#38BDF8", // Electric cyan
              "#10B981", // Aurora emerald
              "#A855F7", // Celestial violet
              "#FCD34D", // Amber gold
            ]
          : ["#18352D", "#C46A42", "#789681", "#4A6B5D"];

      // 95 vibrant cosmic stars with varied depths and diamond twinkles
      starsRef.current = Array.from({ length: 95 }, (_, i) => {
        const isBrightDiamond = i % 7 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: isBrightDiamond ? Math.random() * 2.2 + 1.8 : Math.random() * 1.8 + 0.8,
          baseAlpha: isBrightDiamond ? 0.95 : Math.random() * 0.45 + 0.5,
          speed: Math.random() * 0.35 + 0.08,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: Math.random() * 0.04 + 0.015,
          twinklePhase: Math.random() * Math.PI * 2,
          isBrightDiamond,
        };
      });
    };

    initStars();

    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.moving = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        mouseRef.current.moving = false;
      }, 150);

      const x = e.clientX;
      const y = e.clientY;

      const vx = x - mouseRef.current.lastX;
      const vy = y - mouseRef.current.lastY;
      const speed = Math.min(Math.hypot(vx, vy), 40);

      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      // Add trail point with organic velocity size
      pointsRef.current.push({
        x,
        y,
        age: 0,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        size: Math.max(16, Math.min(speed * 2, 54)) * intensity,
      });

      // Cap points for optimal 60fps performance
      if (pointsRef.current.length > 55) {
        pointsRef.current.shift();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Render loop
    const maxAge = 40;
    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw brighter, sparkling cosmic stars
      if (mode === "cosmic") {
        for (let i = 0; i < starsRef.current.length; i++) {
          const s = starsRef.current[i];
          s.y -= s.speed;
          if (s.y < 0) {
            s.y = height;
            s.x = Math.random() * width;
          }

          // Twinkle pulse calculation
          const twinkle = 0.7 + 0.3 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
          const currentAlpha = Math.min(1, s.baseAlpha * twinkle);

          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.isBrightDiamond ? 10 : 4;
          ctx.fill();

          // Delicate 4-point diamond sparkle for hero stars
          if (s.isBrightDiamond && currentAlpha > 0.6) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = currentAlpha * 0.75;
            const flare = s.size * 2.8;

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

      // 2. Draw organic chromatic fluid ribbon (Internet Alchemist style)
      const points = pointsRef.current;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Filter expired points
      pointsRef.current = points.filter((p) => p.age < maxAge);

      if (pointsRef.current.length > 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < pointsRef.current.length; i++) {
          const prev = pointsRef.current[i - 1];
          const curr = pointsRef.current[i];
          const progress = i / pointsRef.current.length;
          const life = 1 - curr.age / maxAge;

          if (life <= 0) continue;

          // Color palette depending on active dimension
          let strokeColor = "";
          if (mode === "cosmic") {
            // Iridescent violet / purple into emerald neon
            const r = Math.floor(139 + progress * (16 - 139));
            const g = Math.floor(92 + progress * (185 - 92));
            const b = Math.floor(246 + progress * (129 - 246));
            strokeColor = `rgba(${r}, ${g}, ${b}, ${(life * 0.48 * intensity).toFixed(3)})`;
          } else {
            // Elegant studio forest and amber trail
            const r = Math.floor(196 + progress * (24 - 196));
            const g = Math.floor(106 + progress * (53 - 106));
            const b = Math.floor(66 + progress * (45 - 66));
            strokeColor = `rgba(${r}, ${g}, ${b}, ${(life * 0.28 * intensity).toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.lineWidth = Math.max(2, curr.size * life);
          ctx.strokeStyle = strokeColor;
          ctx.shadowBlur = mode === "cosmic" ? 20 : 8;
          ctx.shadowColor = mode === "cosmic" ? "rgba(168, 85, 247, 0.5)" : "rgba(196, 106, 66, 0.25)";
          ctx.stroke();
        }
      }

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isClient, mode, intensity]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-700"
      style={{ opacity: 0.95 }}
    />
  );
}
