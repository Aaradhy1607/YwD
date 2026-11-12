"use client";

import { useScroll, useVelocity, MotionValue } from "framer-motion";

interface UseScrollVelocityReturn {
  velocity: MotionValue<number>;
  scrollY: MotionValue<number>;
}

export function useScrollVelocity(): UseScrollVelocityReturn {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  return { velocity, scrollY };
}
