"use client";

import React, { type ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <div className="ywd-app-shell min-h-screen">{children}</div>;
}
