"use client";

import React, { useState } from "react";
import {
  Terminal,
  ShieldCheck,
  Cpu,
  Camera,
  Bot,
  Binary,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Layers,
  Radio,
} from "lucide-react";

interface CampusTelemetryDashboardProps {
  cosmicMode?: boolean;
  onExplore: () => void;
  onOpenHubModal: () => void;
}

export function CampusTelemetryDashboard({
  cosmicMode = true,
  onExplore,
  onOpenHubModal,
}: CampusTelemetryDashboardProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  const terminalCommand = "ywd fleet verify --hub=\"Tech-Tower-Alpha\" --escrow=secured --status=live";

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const corePillars = [
    {
      id: "compute",
      icon: Cpu,
      tag: "PILLAR // 01",
      title: "High-Performance Compute",
      description: "Apple M3 Pro/Max workstations and liquid-cooled NVIDIA RTX 4090 rigs calibrated for Machine Learning thesis runs, 4K rendering, and 48-hour hackathons.",
      stats: "48+ Workstations Ready",
      hub: "Tech Tower • Locker Bay A",
      spec: "16,384 CUDA Cores • 36GB Unified RAM",
    },
    {
      id: "optics",
      icon: Camera,
      tag: "PILLAR // 02",
      title: "Cinema Optics & Production",
      description: "Sony Alpha 7 IV and FX3 cinema packages with Sony G-Master lenses, XLR sound handles, and V90 SD cards for campus film festivals and portfolios.",
      stats: "32+ Optics Kits Online",
      hub: "Media & Arts Studio • Bay C",
      spec: "4K 60p 10-Bit All-Intra • Exmor R Sensor",
    },
    {
      id: "robotics",
      icon: Bot,
      tag: "PILLAR // 03",
      title: "Autonomous Aerial & Robotics",
      description: "DJI Avata 2 Pro-View FPV drones with Goggles 3, LiDAR sensors, and robotics dev kits for aerial surveying and hardware engineering projects.",
      stats: "18+ Sensor Drones Active",
      hub: "Robotics Arena • Station 02",
      spec: "4K 60fps Ultra-Wide • Omnidirectional Obstacle Avoidance",
    },
    {
      id: "stem",
      icon: Binary,
      tag: "PILLAR // 04",
      title: "STEM & Academic Computing",
      description: "Texas Instruments Nspire CX II CAS graphing calculators, digital oscilloscopes, and engineering drafting gear permitted for semester finals and lab exams.",
      stats: "65+ STEM Instruments Live",
      hub: "Central Library Hub • Counter 4",
      spec: "Computer Algebra System • Color Backlit Display",
    },
  ];

  return (
    <section
      className={`py-20 sm:py-28 border-b transition-colors duration-1000 relative overflow-hidden ${
        cosmicMode
          ? "bg-[#060A08] text-[#F3F4F6] border-white/10"
          : "bg-[#FAF7F2] text-[#18352D] border-[#E5DEC9]"
      }`}
    >
      {/* Subtle Blueprint Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 space-y-12">
        {/* Section Top Header & Live Telemetry Ticker */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-current/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md transition-colors bg-white/5 border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CAMPUS INFRASTRUCTURE // LIVE TELEMETRY</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
              Developer-grade hardware.{" "}
              <span className="font-serif italic font-light text-emerald-400">Institutional trust.</span>
            </h2>

            <p className="text-sm sm:text-base opacity-75 max-w-xl leading-relaxed">
              Real-time hardware availability and cryptographic escrow status across 4 verified college hubs.
              Designed for student builders, researchers, and creators.
            </p>
          </div>

          {/* Interactive Hub Status Pill */}
          <button
            type="button"
            onClick={onOpenHubModal}
            className={`text-xs font-mono flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              cosmicMode
                ? "bg-white/5 border-emerald-500/30 hover:border-emerald-400 text-white"
                : "bg-white border-[#E5DEC9] hover:border-[#18352D] text-[#18352D]"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>4 Hubs Monitored (Alpha, Beta, Library, Studio)</span>
          </button>
        </div>

        {/* ========================================================
            TERMINAL STATUS BAR (Inspired by fossclub.tech terminal)
           ======================================================== */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all ${
            cosmicMode
              ? "bg-[#0A120E]/95 border-emerald-500/20 shadow-2xl"
              : "bg-white border-[#E5DEC9] shadow-sm"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">ESCROW VAULT ACTIVE</span>
              </div>
              <span className="opacity-30">//</span>
              <span className="opacity-80 shrink-0">UPI AUTO-SETTLEMENT ON VERIFIED RETURN</span>
              <span className="opacity-30">//</span>
              <span className="opacity-80 shrink-0 text-emerald-400">DUAL-OTP PROTOCOL ARMED</span>
            </div>

            {/* Clickable CLI Copy */}
            <div
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors shrink-0 ${
                cosmicMode
                  ? "bg-black/60 border-white/10 hover:border-emerald-400/50 text-white/90"
                  : "bg-[#FAF7F2] border-[#E5DEC9] hover:border-[#18352D] text-[#18352D]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <code className="text-[11px] font-mono">{terminalCommand}</code>
              {copiedCmd ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 opacity-60 hover:opacity-100 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            FOUR CORE PILLARS GRID (fossclub.tech & Juniper style)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isHovered = activeTab === idx;

            return (
              <div
                key={pillar.id}
                onMouseEnter={() => setActiveTab(idx)}
                className={`relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                  cosmicMode
                    ? "bg-[#0A120E]/90 border-white/10 hover:border-emerald-400/60 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                    : "bg-white border-[#E5DEC9] hover:border-[#18352D] shadow-sm hover:shadow-xl"
                }`}
              >
                {/* Top Telemetry Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-current/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${
                          cosmicMode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-[#18352D]/10 border-[#18352D]/20 text-[#18352D]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-widest opacity-60 block">
                          {pillar.tag}
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {pillar.stats}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono opacity-50 px-2 py-0.5 rounded border border-current/15">
                      LOCKERbay_v2
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight group-hover:text-emerald-400 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm opacity-75 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Technical Coordinates */}
                <div className="pt-6 mt-6 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="opacity-50 text-[10px] block">VERIFIED HUB DISPATCH:</span>
                    <span className="font-semibold text-white/90">{pillar.hub}</span>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="opacity-50 text-[10px] block">HARDWARE BENCHMARK:</span>
                    <span className="text-emerald-400 font-semibold">{pillar.spec}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Metrics Counter Ribbon */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl border text-center ${
            cosmicMode
              ? "bg-[#0A120E]/80 border-white/10 text-white"
              : "bg-white border-[#E5DEC9] text-[#18352D]"
          }`}
        >
          <div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">100%</p>
            <p className="text-xs font-mono opacity-60 mt-1 uppercase tracking-wider">
              UPI Escrow Refund Rate
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">0%</p>
            <p className="text-xs font-mono opacity-60 mt-1 uppercase tracking-wider">
              Phone Number Exposure
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">4 Bays</p>
            <p className="text-xs font-mono opacity-60 mt-1 uppercase tracking-wider">
              Active College Locker Hubs
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">6-Digit</p>
            <p className="text-xs font-mono opacity-60 mt-1 uppercase tracking-wider">
              Dual-OTP Handover Check
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

