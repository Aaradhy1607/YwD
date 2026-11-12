"use client";

import { useScroll, useMotionValueEvent, MotionValue } from "framer-motion";
import { RefObject, useState } from "react";

interface UseScrollProgressReturn {
  scrollYProgress: MotionValue<number>;
  isInView: boolean;
}

export function useScrollProgress(
  ref: RefObject<HTMLElement | null>
): UseScrollProgressReturn {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const [isInView, setIsInView] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsInView(latest > 0.1 && latest < 0.9);
  });

  return { scrollYProgress, isInView };
}
