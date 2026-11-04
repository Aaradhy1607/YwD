"use client";

import React, { useEffect, useRef } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import {
  ShieldCheck,
  RotateCcw,
  Lock,
  Clock,
  CheckCircle2,
  Package,
  Key,
  Layers,
} from "lucide-react";

interface MarqueeItem {
  text: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_MARQUEE_ITEMS: MarqueeItem[] = [
  { text: "Verified 4-point inspection", badge: "Quality check", icon: CheckCircle2 },
  { text: "100% Escrow deposit lock", badge: "Protected", icon: ShieldCheck },
  { text: "Instant UPI refund settlement", badge: "Automated", icon: RotateCcw },
  { text: "Zero-PII privacy relay", badge: "Encrypted", icon: Lock },
  { text: "Flexible duration rates", badge: "Hourly to semester", icon: Clock },
  { text: "Verified collection hubs", badge: "Secure handover", icon: Package },
  { text: "Dual-OTP verification", badge: "Anti-fraud", icon: Key },
  { text: "Recommerce outright buy option", badge: "Pre-owned", icon: Layers },
];

interface AnimatedMarqueeProps {
  items?: MarqueeItem[];
  speed?: number;
  reverse?: boolean;
  className?: string;
}

export function AnimatedMarquee({
  items = DEFAULT_MARQUEE_ITEMS,
  speed = 10,
  reverse = false,
  className = "",
}: AnimatedMarqueeProps) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container || !track.animate) return;

    const dir = reverse ? -1 : 1;
    const baseSpeed = Math.abs(speed);
    const duration = (50 / baseSpeed) * 1000;

    const animation = track.animate(
      [
        { transform: "translateX(-50%)" },
        { transform: "translateX(0%)" },
      ],
      {
        duration,
        iterations: Infinity,
        easing: "linear",
      }
    );

    animation.currentTime = duration * 1000;

    const handleVelocityChange = (v: number) => {
      const boost = v / 450;
      animation.playbackRate = (dir * (baseSpeed + boost * 3)) / baseSpeed;
    };

    handleVelocityChange(smoothVelocity.get());
    const unsubscribe = smoothVelocity.on("change", handleVelocityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animation.play();
        } else {
          animation.pause();
        }
      },
      { rootMargin: "150px 0px" }
    );
    observer.observe(container);

    return () => {
      unsubscribe();
      observer.disconnect();
      animation.cancel();
    };
  }, [speed, reverse, smoothVelocity]);

  const renderTrackRow = () => (
    <div className="flex shrink-0 items-center gap-4 pr-4">
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-2.5 bg-[#FFFFFF] px-4 py-2.5 rounded-xl border border-[#E5DEC9] shadow-xs select-none shrink-0"
          >
            <div className="w-6 h-6 rounded-lg bg-[#18352D] text-[#C46A42] flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-xs text-[#18352D] whitespace-nowrap">
              {item.text}
            </span>
            {item.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF7F2] text-[#63736A] border border-[#E5DEC9] whitespace-nowrap">
                {item.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden py-3 bg-[#FAF7F2] border-y border-[#E5DEC9] select-none ${className}`}
      role="presentation"
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {renderTrackRow()}
        {renderTrackRow()}
      </div>
    </div>
  );
}
