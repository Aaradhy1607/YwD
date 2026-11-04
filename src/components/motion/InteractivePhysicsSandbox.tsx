"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  Camera,
  Laptop,
  CheckCircle2,
  Key,
} from "lucide-react";

export interface PhysicsToken {
  id: string;
  w: number;
  h: number;
  round?: boolean;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
}

const DEFAULT_TOKENS: PhysicsToken[] = [
  {
    id: "token-escrow",
    w: 210,
    h: 56,
    title: "100% Escrow Refund",
    subtitle: "Automated UPI return",
    icon: ShieldCheck,
    bgClass: "bg-white",
    borderClass: "border-[#789681]/40",
    textClass: "text-[#18352D]",
    accentClass: "bg-[#789681]/20 text-[#18352D]",
  },
  {
    id: "token-inspection",
    w: 220,
    h: 56,
    title: "Verified 4-Point Check",
    subtitle: "Tested and certified",
    icon: CheckCircle2,
    bgClass: "bg-white",
    borderClass: "border-[#18352D]/30",
    textClass: "text-[#18352D]",
    accentClass: "bg-[#18352D]/10 text-[#18352D]",
  },
  {
    id: "token-privacy",
    w: 200,
    h: 56,
    title: "Zero-PII Protection",
    subtitle: "Encrypted relay chat",
    icon: Lock,
    bgClass: "bg-[#18352D]",
    borderClass: "border-white/10",
    textClass: "text-white",
    accentClass: "bg-[#C46A42] text-white",
  },
  {
    id: "token-otp",
    w: 195,
    h: 56,
    title: "6-Digit Handover OTP",
    subtitle: "Anti-fraud release",
    icon: Key,
    bgClass: "bg-white",
    borderClass: "border-[#C46A42]/40",
    textClass: "text-[#C46A42]",
    accentClass: "bg-[#C46A42]/15 text-[#C46A42]",
  },
  {
    id: "token-gear-camera",
    w: 210,
    h: 56,
    title: "Sony Alpha & Optics",
    subtitle: "Calibrated cinema kits",
    icon: Camera,
    bgClass: "bg-white",
    borderClass: "border-[#E5DEC9]",
    textClass: "text-[#18352D]",
    accentClass: "bg-[#FAF7F2] text-[#18352D]",
  },
  {
    id: "token-gear-laptop",
    w: 210,
    h: 56,
    title: "MacBook Pro M3 Max",
    subtitle: "Clean data wiped",
    icon: Laptop,
    bgClass: "bg-white",
    borderClass: "border-[#E5DEC9]",
    textClass: "text-[#18352D]",
    accentClass: "bg-[#FAF7F2] text-[#18352D]",
  },
  {
    id: "token-instant-refund",
    w: 195,
    h: 56,
    title: "Instant UPI Payout",
    subtitle: "Zero deduction",
    icon: RotateCcw,
    bgClass: "bg-white",
    borderClass: "border-[#789681]/50",
    textClass: "text-[#18352D]",
    accentClass: "bg-[#789681]/15 text-[#789681]",
  },
];

interface InteractivePhysicsSandboxProps {
  tokens?: PhysicsToken[];
  className?: string;
}

export function InteractivePhysicsSandbox({
  tokens = DEFAULT_TOKENS,
  className = "",
}: InteractivePhysicsSandboxProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const box = hostRef.current;
    if (!box || typeof window === "undefined") return;

    let disposed = false;
    let teardown = () => {};

    import("matter-js").then(({ default: Matter }) => {
      if (disposed || !box) return;

      const { Engine, World, Bodies, Body, Constraint, Sleeping, Runner } = Matter;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let W = box.clientWidth;
      let H = box.clientHeight;
      const scale = W < 640 ? 0.75 : W < 1024 ? 0.88 : 1;
      const activeTokens = W < 640 ? tokens.slice(0, 5) : tokens;

      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1.05;
      const world = engine.world;

      const wallThickness = 160;
      const walls = [
        Bodies.rectangle(W / 2, H + wallThickness / 2, W * 3, wallThickness, { isStatic: true }),
        Bodies.rectangle(-wallThickness / 2, H / 2, wallThickness, H * 2, { isStatic: true }),
        Bodies.rectangle(W + wallThickness / 2, H / 2, wallThickness, H * 2, { isStatic: true }),
        Bodies.rectangle(W / 2, -700, W * 3, wallThickness, { isStatic: true }),
      ];
      World.add(world, walls);

      interface Entry {
        token: PhysicsToken;
        body: Matter.Body;
        el: HTMLDivElement | null;
        s: number;
      }

      const entries: Entry[] = activeTokens.map((token, i) => {
        const s = scale;
        const w = token.w * s;
        const h = token.h * s;
        const margin = Math.max(w, h) / 2 + 10;
        const x = margin + Math.random() * Math.max(10, W - margin * 2);
        const y = reduced ? H - h / 2 - Math.random() * 50 : -h - 30 - i * 50;

        const body = token.round
          ? Bodies.circle(x, y, w / 2, {
              restitution: 0.42,
              friction: 0.35,
              density: 0.002,
            })
          : Bodies.rectangle(x, y, w, h, {
              chamfer: { radius: 10 },
              restitution: 0.36,
              friction: 0.4,
              frictionAir: 0.012,
              density: 0.002,
            });

        Body.setAngle(body, (Math.random() - 0.5) * 0.3);
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

        World.add(world, body);
        return { token, body, el: elementRefs.current[i], s };
      });

      const applyTransforms = () => {
        entries.forEach((e) => {
          if (!e.el) return;
          const { x, y } = e.body.position;
          e.el.style.transform = `translate3d(${x - e.token.w / 2}px, ${y - e.token.h / 2}px, 0) rotate(${e.body.angle}rad) scale(${e.s})`;
          e.el.style.opacity = "1";
        });
      };

      if (reduced) {
        for (let i = 0; i < 200; i++) Engine.update(engine, 16);
        applyTransforms();
        setIsLoaded(true);
        return;
      }

      let activeConstraint: Matter.Constraint | null = null;
      let activeBody: Matter.Body | null = null;
      let dragOffset = { x: 0, y: 0 };

      const getLocalCoords = (e: PointerEvent) => {
        const rect = box.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      const handlePointerDown = (e: PointerEvent, entry: Entry) => {
        if (activeConstraint) return;
        const pos = getLocalCoords(e);
        Sleeping.set(entry.body, false);

        activeBody = entry.body;
        dragOffset = { x: pos.x - entry.body.position.x, y: pos.y - entry.body.position.y };

        activeConstraint = Constraint.create({
          pointA: { x: pos.x, y: pos.y },
          bodyB: entry.body,
          pointB: dragOffset,
          stiffness: 0.22,
          damping: 0.1,
        });

        World.add(world, activeConstraint);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!activeConstraint) return;
        const pos = getLocalCoords(e);
        activeConstraint.pointA = { x: pos.x, y: pos.y };
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (activeConstraint) {
          World.remove(world, activeConstraint);
          activeConstraint = null;
          activeBody = null;
        }
      };

      entries.forEach((entry) => {
        const el = entry.el;
        if (!el) return;

        el.addEventListener("pointerdown", (e) => handlePointerDown(e, entry));
      });

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);

      const runner = Runner.create();
      Runner.run(runner, engine);

      let animFrame = 0;
      const loop = () => {
        applyTransforms();
        animFrame = requestAnimationFrame(loop);
      };
      animFrame = requestAnimationFrame(loop);
      setIsLoaded(true);

      teardown = () => {
        cancelAnimationFrame(animFrame);
        Runner.stop(runner);
        Engine.clear(engine);
        World.clear(world, false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    });

    return () => {
      disposed = true;
      teardown();
    };
  }, [tokens]);

  return (
    <div
      ref={hostRef}
      className={`relative w-full h-[300px] sm:h-[340px] overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#FFFFFF] select-none ${className}`}
    >
      {/* Background Calm Label & Instruction */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-0">
        <div className="text-center">
          <span className="text-xs font-semibold text-[#C46A42]">
            Trust & Security Architecture
          </span>
          <h3 className="font-semibold text-lg text-[#18352D] mt-1">
            Physical Inspection & Automated Escrow Standards
          </h3>
          <p className="text-xs text-[#63736A] max-w-md mx-auto mt-1">
            Every transaction is protected with 4-point condition records, dual OTPs, and automated escrow security.
          </p>
        </div>

        <span className="text-[11px] font-medium text-[#63736A] bg-[#FAF7F2] px-3.5 py-1 rounded-full border border-[#E5DEC9]">
          Drag tokens to test physics interaction
        </span>
      </div>

      {/* Physics HTML Elements */}
      {tokens.map((token, idx) => {
        const IconComponent = token.icon;
        return (
          <div
            key={token.id}
            ref={(el) => {
              elementRefs.current[idx] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${token.w}px`,
              height: `${token.h}px`,
              opacity: 0,
              touchAction: "none",
              cursor: "grab",
              willChange: "transform",
              zIndex: 10 + idx,
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${token.borderClass} ${token.bgClass} shadow-xs active:cursor-grabbing`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${token.accentClass}`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-xs leading-snug truncate ${token.textClass}`}>
                {token.title}
              </p>
              {token.subtitle && (
                <p className="text-[10px] text-[#64617A] truncate mt-0.5">
                  {token.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
