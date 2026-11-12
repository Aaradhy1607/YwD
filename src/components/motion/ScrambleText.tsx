"use client";

import React, { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  trigger?: any;
  duration?: number; // ms
  characters?: string;
  className?: string;
  as?: React.ElementType;
}

const DEFAULT_CHARS = "0123456789ABCDEF!@#$%&*+~/?_[]";

export function ScrambleText({
  text,
  trigger,
  duration = 220,
  characters = DEFAULT_CHARS,
  className = "",
  as: Component = "span",
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const originalText = text;
    const length = originalText.length;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Number of characters resolved so far
      const resolvedCount = Math.floor(progress * length);

      let result = "";
      for (let i = 0; i < length; i++) {
        if (originalText[i] === " " || originalText[i] === "\n") {
          result += originalText[i];
        } else if (i < resolvedCount) {
          result += originalText[i];
        } else {
          result += characters[Math.floor(Math.random() * characters.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(originalText);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, trigger, duration, characters]);

  return <Component className={className}>{displayText}</Component>;
}

