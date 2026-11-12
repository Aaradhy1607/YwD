"use client";

import { useEffect, useState } from "react";

interface UseSectionInViewReturn {
  activeSectionIndex: number;
  activeSectionId: string;
}

export function useSectionInView(sectionIds: string[]): UseSectionInViewReturn {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });

        // Find the most visible section
        let maxRatio = 0;
        let maxId = sectionIds[0] ?? "";
        let maxIndex = 0;

        sectionIds.forEach((id, index) => {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
            maxIndex = index;
          }
        });

        if (maxRatio > 0) {
          setActiveSectionIndex(maxIndex);
          setActiveSectionId(maxId);
        }
      },
      {
        threshold: 0.3,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return { activeSectionIndex, activeSectionId };
}
