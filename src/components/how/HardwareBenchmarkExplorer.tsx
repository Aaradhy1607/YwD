"use client";

import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  TrendingUp,
  Server,
  Play,
} from "lucide-react";

interface BenchmarkTest {
  id: string;
  name: string;
  category: string;
  metric: string;
  ywdScore: number;
  baselineScore: number;
  unit: string;
  multiplier: string;
  verdict: string;
  workload: string;
}

const BENCHMARKS: BenchmarkTest[] = [
  {
    id: "llm",
    name: "Local LLM Inference (Llama 3 8B Q4_K_M)",
    category: "ARTIFICIAL INTELLIGENCE",
    metric: "Tokens / Second",
    ywdScore: 42.5,
    baselineScore: 9.8,
    unit: "tok/s",
    multiplier: "4.3× Faster",
    verdict: "Runs fully in 36GB unified memory without swap disk stuttering.",
    workload: "Machine Learning thesis runs, local Ollama agents, zero cloud GPU bill.",
  },
  {
    id: "video",
    name: "8K ProRes 422 HQ Export (10-Min Timeline)",
    category: "CINEMA POST-PRODUCTION",
    metric: "Export Speed Factor",
    ywdScore: 3.2,
    baselineScore: 0.6,
    unit: "× Realtime",
    multiplier: "5.3× Faster",
    verdict: "Dual hardware ProRes encode engines render 10 minutes in 3m 08s.",
    workload: "Campus film festival edits, color grading in DaVinci Resolve Studio.",
  },
  {
    id: "blender",
    name: "Blender 4.2 Cycles Classroom Scene",
    category: "3D CAD & RAYTRACING",
    metric: "Frame Render Time (Lower is Better)",
    ywdScore: 14.2,
    baselineScore: 92.0,
    unit: "Seconds",
    multiplier: "6.5× Faster",
    verdict: "Hardware-accelerated raytracing cores slice render times drastically.",
    workload: "Architecture capstone portfolios, mechanical engineering stress simulations.",
  },
  {
    id: "docker",
    name: "Full-Stack Microservices Cold Build",
    category: "SOFTWARE ENGINEERING",
    metric: "Cold Build Completion (Lower is Better)",
    ywdScore: 38.0,
    baselineScore: 164.0,
    unit: "Seconds",
    multiplier: "4.3× Faster",
    verdict: "14-Core CPU with 300GB/s bandwidth handles 8 concurrent build containers.",
    workload: "48-Hour hackathons, monorepo Next.js + PostgreSQL compilations.",
  },
];

interface HardwareBenchmarkExplorerProps {
  cosmicMode?: boolean;
}

export function HardwareBenchmarkExplorer({
  cosmicMode = true,
}: HardwareBenchmarkExplorerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeBenchmark = BENCHMARKS[selectedIdx];

  return (
    <section
      id="benchmark-explorer"
      className={`py-20 sm:py-28 border-b transition-colors duration-1000 relative overflow-hidden ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>THE HOW FACTOR // 03 • ASSIGNMENT BENCHMARKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              How does this gear perform on real coursework?
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Forget marketing claims. We benchmark our fleet against common university assignments: local LLM models, 8K ProRes timelines, and Docker builds.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shrink-0 self-start md:self-auto">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>EMPIRICAL LAB METRICS</span>
          </div>
        </div>

        {/* 4 Test Workload Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENCHMARKS.map((bm, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={bm.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                    : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                <span className="text-[10px] font-mono block text-emerald-400 mb-1">
                  {bm.category}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                  {bm.name}
                </h4>
                <span className="text-[11px] font-mono font-bold text-emerald-300 mt-2 block">
                  {bm.multiplier}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Benchmark Comparison Display */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
                Workload Specification
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                {activeBenchmark.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {activeBenchmark.workload}
              </p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Performance Lift</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {activeBenchmark.multiplier}
              </span>
            </div>
          </div>

          {/* Visual Bar Graph Comparison */}
          <div className="space-y-6">
            {/* YwD Fleet Hardware Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  YwD Fleet // MacBook Pro 14" M3 Max (36GB Unified)
                </span>
                <span className="text-emerald-300 font-bold">
                  {activeBenchmark.ywdScore} {activeBenchmark.unit}
                </span>
              </div>
              <div className="h-5 rounded-full bg-black/40 border border-emerald-500/30 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  style={{ width: "95%" }}
                />
              </div>
            </div>

            {/* Standard Student Base Laptop Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>Standard Student Laptop // 8GB RAM Base Ultrabook</span>
                <span>
                  {activeBenchmark.baselineScore} {activeBenchmark.unit}
                </span>
              </div>
              <div className="h-4 rounded-full bg-black/40 border border-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-neutral-600 transition-all duration-1000"
                  style={{ width: "22%" }}
                />
              </div>
            </div>
          </div>

          {/* Lab Verification Note */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Lab Verification Conclusion</span>
              <p className="text-neutral-400 mt-0.5 leading-relaxed">
                {activeBenchmark.verdict}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

