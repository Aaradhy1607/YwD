"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  Compass,
  RotateCw,
  Eye,
  Layers,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";

export interface OrbitSphereHeroProps {
  categories: any[];
  heroProducts: any[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  transactionFilter: "all" | "rent" | "buy";
  setTransactionFilter: (f: "all" | "rent" | "buy") => void;
  preferredDuration: string;
  setPreferredDuration: (d: string) => void;
  onExplore: () => void;
  onOpenProductDetail: (productId: string, initialMode?: "rent" | "buy", initialDuration?: string) => void;
  onOpenListProduct: () => void;
  onOpenHubModal: () => void;
  onOpenGuidedDiscovery?: () => void;
  cosmicMode?: boolean;
  onToggleCosmicMode?: () => void;
  heroView?: "orbit" | "classic";
  onToggleHeroView?: (view: "orbit" | "classic") => void;
}

interface SpecimenCardData {
  id: string;
  specimenTag: string;
  discipline: string;
  title: string;
  image: string;
  condition: string;
  hub: string;
  deposit: number;
  rates: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    semester: number;
  };
  telemetry: string;
}

const HARDWARE_FLEET: SpecimenCardData[] = [
  {
    id: "prod_macbook_m3",
    specimenTag: "SPEC // 01",
    discipline: "HIGH-PERFORMANCE COMPUTE",
    title: "MacBook Pro 14\" M3 Max",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    condition: "Mint (Grade A+)",
    hub: "Tech Tower • Locker Bay A",
    deposit: 8000,
    rates: { hourly: 150, daily: 699, weekly: 3499, monthly: 11999, semester: 29999 },
    telemetry: "Apple M3 Max • 14-Core CPU • 36GB Unified RAM",
  },
  {
    id: "prod_sony_a7iv",
    specimenTag: "SPEC // 02",
    discipline: "CINEMA OPTICS & PRODUCTION",
    title: "Sony Alpha 7 IV + 24-70mm GM",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    condition: "Studio Grade A",
    hub: "Media & Arts Studio • Bay C",
    deposit: 9500,
    rates: { hourly: 190, daily: 899, weekly: 4200, monthly: 14500, semester: 38000 },
    telemetry: "33MP Full-Frame Exmor R • 4K 60p 10-Bit 4:2:2",
  },
  {
    id: "prod_ti_nspire_cx2",
    specimenTag: "SPEC // 03",
    discipline: "ACADEMIC & STEM MATH",
    title: "TI-Nspire CX II CAS Calculator",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    condition: "Exam Permitted",
    hub: "Central Library Hub • Counter 4",
    deposit: 1500,
    rates: { hourly: 35, daily: 120, weekly: 450, monthly: 1200, semester: 2400 },
    telemetry: "Computer Algebra System • High-Res Color Backlit",
  },
  {
    id: "prod_dji_avata",
    specimenTag: "SPEC // 04",
    discipline: "AERIAL SENSORS & ROBOTICS",
    title: "DJI Avata 2 Pro-View FPV Drone",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    condition: "Cine-Ready",
    hub: "Robotics Arena Hub • Station 02",
    deposit: 7000,
    rates: { hourly: 140, daily: 650, weekly: 3100, monthly: 9800, semester: 24000 },
    telemetry: "4K 60fps Ultra-Wide FOV • Goggles 3 Included",
  },
  {
    id: "prod_teenage_op1",
    specimenTag: "SPEC // 05",
    discipline: "ACOUSTICS & SYNTHESIS",
    title: "Teenage Engineering OP-1 Field",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    condition: "Collector Grade",
    hub: "Sound Design Lab • Hub 10",
    deposit: 11000,
    rates: { hourly: 180, daily: 850, weekly: 3900, monthly: 12900, semester: 32000 },
    telemetry: "Stereo 24-bit 96kHz • 4-Track Tape Emulation",
  },
  {
    id: "prod_meta_quest3",
    specimenTag: "SPEC // 06",
    discipline: "SPATIAL COMPUTING & VR",
    title: "Meta Quest 3 Mixed Reality 512GB",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80",
    condition: "Sanitized Mint",
    hub: "XR Sandbox Lab • Locker Bay B",
    deposit: 4500,
    rates: { hourly: 90, daily: 450, weekly: 2100, monthly: 6500, semester: 16000 },
    telemetry: "4K+ InfiniteDisplay • Snapdragon XR2 Gen 2",
  },
  {
    id: "prod_rtx4090_rig",
    specimenTag: "SPEC // 07",
    discipline: "DEEP LEARNING CLUSTER",
    title: "NVIDIA RTX 4090 24GB Rig",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    condition: "Liquid Cooled",
    hub: "Compute Data Center • Bay 4",
    deposit: 15000,
    rates: { hourly: 250, daily: 1200, weekly: 5800, monthly: 19500, semester: 48000 },
    telemetry: "24GB GDDR6X • 16,384 CUDA Cores • PyTorch Ready",
  },
  {
    id: "prod_wacom_cintiq",
    specimenTag: "SPEC // 08",
    discipline: "DIGITAL DESIGN & ARCHITECTURE",
    title: "Wacom Cintiq Pro 27 Touch Display",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    condition: "Color Calibrated",
    hub: "Design Faculty Hub • Studio 3",
    deposit: 8500,
    rates: { hourly: 120, daily: 580, weekly: 2700, monthly: 8900, semester: 22000 },
    telemetry: "4K 120Hz 99% DCI-P3 • Pro Pen 3 Pressure",
  },
  {
    id: "prod_fender_strat",
    specimenTag: "SPEC // 09",
    discipline: "STUDIO AUDIO INSTRUMENTS",
    title: "Fender American Ultra Stratocaster",
    image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=800&q=80",
    condition: "Freshly Setup",
    hub: "Music Conservatory Hub • Bay 2",
    deposit: 5000,
    rates: { hourly: 80, daily: 380, weekly: 1800, monthly: 5500, semester: 14000 },
    telemetry: "Ultra Noiseless Vintage Pickups • Deluxe Hardshell",
  },
  {
    id: "prod_sony_fx3",
    specimenTag: "SPEC // 10",
    discipline: "BROADCAST DOCUMENTARY",
    title: "Sony FX3 Full-Frame Cinema Line",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    condition: "Cinema Package",
    hub: "Media & Arts Studio • Bay C",
    deposit: 12000,
    rates: { hourly: 220, daily: 999, weekly: 4800, monthly: 16000, semester: 42000 },
    telemetry: "XLR Handle Unit • Dual Base ISO 800/12800",
  },
  {
    id: "prod_apple_vision_pro",
    specimenTag: "SPEC // 11",
    discipline: "SPATIAL OPERATING SYSTEM",
    title: "Apple Vision Pro 512GB Solo Band",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    condition: "Laboratory Grade",
    hub: "Innovation Foundry • Vault 01",
    deposit: 18000,
    rates: { hourly: 300, daily: 1499, weekly: 6999, monthly: 24000, semester: 59000 },
    telemetry: "Micro-OLED 23 Million Pixels • visionOS 2.0",
  },
  {
    id: "prod_leica_q2",
    specimenTag: "SPEC // 12",
    discipline: "STREET ARCHIVE & MONOCHROME",
    title: "Leica Q2 47.3MP Summilux 28mm",
    image: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
    condition: "Collector Mint",
    hub: "Central Library Hub • Locker 7",
    deposit: 14000,
    rates: { hourly: 210, daily: 950, weekly: 4600, monthly: 15500, semester: 39000 },
    telemetry: "Fixed Summilux 28mm f/1.7 ASPH • Weather Sealed",
  },
];

export function OrbitSphereHero({
  categories,
  heroProducts,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  transactionFilter,
  setTransactionFilter,
  preferredDuration,
  setPreferredDuration,
  onExplore,
  onOpenProductDetail,
  onOpenListProduct,
  onOpenHubModal,
  onOpenGuidedDiscovery,
  cosmicMode = true,
  onToggleCosmicMode,
  heroView = "orbit",
  onToggleHeroView,
}: OrbitSphereHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  // Active specimen & duration tier
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeDuration, setActiveDuration] = useState<string>("daily");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [expandedDetail, setExpandedDetail] = useState(false);

  // Rotation angles (radians)
  const [rotX, setRotX] = useState(-0.06);
  const [rotY, setRotY] = useState(0.35);

  // Interactive Cursor Parallax Gyro (cursor moves -> sphere subtly tilts)
  const [gyroTilt, setGyroTilt] = useState({ x: 0, y: 0 });

  // Drag interaction physics
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ vx: 0.0016, vy: 0 });
  const animFrameRef = useRef<number | null>(null);

  const specimens = HARDWARE_FLEET;
  const currentSpecimen = specimens[activeIdx] || specimens[0];

  // Calibrated Sphere radius for 100% full visibility (never cut off top or bottom)
  const [radius, setRadius] = useState(360);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Proportional radius based on both width and height to guarantee zero clipping
      if (w < 640) setRadius(210);
      else if (w < 1024) setRadius(290);
      else if (h < 850) setRadius(330);
      else setRadius(370);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fibonacci spherical distribution calculations
  const sphereNodes = useMemo(() => {
    const count = specimens.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    return specimens.map((item, i) => {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

      const x0 = radius * Math.sin(phi) * Math.cos(theta);
      const y0 = radius * Math.cos(phi);
      const z0 = radius * Math.sin(phi) * Math.sin(theta);

      return {
        item,
        index: i,
        base: { x0, y0, z0 },
      };
    });
  }, [specimens, radius]);

  // Scroll linked transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scrollScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.88]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  // Main animation / physics loop for inertia and auto-rotation
  useEffect(() => {
    if (!mounted) return;

    const loop = () => {
      if (!isDraggingRef.current) {
        if (isAutoRotating) {
          setRotY((prev) => prev + velocityRef.current.vx);
          setRotX((prev) => {
            const next = prev + velocityRef.current.vy;
            return Math.max(-0.25, Math.min(0.25, next));
          });

          velocityRef.current.vx = velocityRef.current.vx * 0.96 + 0.0016 * 0.04;
          velocityRef.current.vy *= 0.95;
        } else {
          velocityRef.current.vx *= 0.94;
          velocityRef.current.vy *= 0.94;
          if (Math.abs(velocityRef.current.vx) > 0.0001) {
            setRotY((prev) => prev + velocityRef.current.vx);
          }
          if (Math.abs(velocityRef.current.vy) > 0.0001) {
            setRotX((prev) => Math.max(-0.25, Math.min(0.25, prev + velocityRef.current.vy)));
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotating, mounted]);

  // Pointer drag listeners for 3D trackball rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setGyroTilt({ x: ny * -0.05, y: nx * 0.07 });
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.0038;
    const vx = dx * sensitivity;
    const vy = -dy * sensitivity;

    velocityRef.current = { vx, vy };

    setRotY((prev) => prev + vx);
    setRotX((prev) => Math.max(-0.25, Math.min(0.25, prev + vy)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Rotate sphere to bring a target node straight to the front (center focus)
  const focusOnNode = useCallback(
    (index: number) => {
      setActiveIdx(index);
      const count = specimens.length;
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const theta = (2 * Math.PI * index) / goldenRatio;
      const phi = Math.acos(1 - (2 * (index + 0.5)) / count);

      const targetRotY = -theta + Math.PI / 2;
      const targetRotX = -(phi - Math.PI / 2);

      setRotY(targetRotY);
      setRotX(Math.max(-0.2, Math.min(0.2, targetRotX)));
      velocityRef.current = { vx: 0.0008, vy: 0 };
    },
    [specimens.length]
  );

  // Transform 3D coordinates based on current Euler angles + Gyro Tilt
  const effectiveRotY = rotY + gyroTilt.y;
  const effectiveRotX = rotX + gyroTilt.x;

  const projectedCards = useMemo(() => {
    const cosY = Math.cos(effectiveRotY);
    const sinY = Math.sin(effectiveRotY);
    const cosX = Math.cos(effectiveRotX);
    const sinX = Math.sin(effectiveRotX);
    const perspective = 950;

    return sphereNodes
      .map(({ item, index, base }) => {
        // 1. Rotate around Y axis
        const x1 = base.x0 * cosY + base.z0 * sinY;
        const z1 = -base.x0 * sinY + base.z0 * cosY;
        const y1 = base.y0;

        // 2. Rotate around X axis
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        // Perspective scale & depth
        const scale = perspective / (perspective - z2);
        const screenX = x2 * scale;
        const screenY = y2 * scale;

        // Normalized depth in [0, 1]
        const normZ = (z2 + radius) / (2 * radius);
        const isFront = z2 > 0;
        const isActive = index === activeIdx;

        return {
          item,
          index,
          x: Number(screenX.toFixed(1)),
          y: Number(screenY.toFixed(1)),
          z: Number(z2.toFixed(1)),
          scale: Number(Math.max(0.48, Math.min(scale, 1.35)).toFixed(3)),
          opacity: Number(Math.max(0.3, Math.min(0.3 + normZ * 0.7, 1)).toFixed(2)),
          zIndex: Math.floor(normZ * 40) + (isActive ? 50 : 0),
          isFront,
          isActive,
        };
      })
      .sort((a, b) => a.zIndex - b.zIndex);
  }, [sphereNodes, effectiveRotY, effectiveRotX, radius, activeIdx]);

  const currentRate =
    currentSpecimen.rates[activeDuration as keyof typeof currentSpecimen.rates] ||
    currentSpecimen.rates.daily;

  return (
    <section
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative min-h-[100vh] lg:min-h-[105vh] overflow-hidden select-none transition-colors duration-1000 ${
        cosmicMode ? "bg-[#060A08] text-[#F3F4F6]" : "bg-[#F5F0E8] text-[#18352D]"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Background Ambience */}
      {cosmicMode ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#060A08] via-[#050807] to-[#020403] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[#8B5CF6]/15 via-[#10B981]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:36px_36px] opacity-10 pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#F5F0E8] to-[#EFE8DD] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#C46A42_1px,transparent_1px)] [background-size:36px_36px] opacity-10 pointer-events-none" />
        </>
      )}

      {/* ========================================================
          EDITORIAL HEADER OVERLAY (TOP Z-30)
         ======================================================== */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 lg:px-12 pt-6 sm:pt-8 flex items-start justify-between pointer-events-none">
        {/* Top-Left: Insignia + Monumental Designer Typography */}
        <div className="space-y-3 max-w-lg pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-colors ${
                cosmicMode
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-[#18352D] text-[#FAF7F2] border-[#18352D]"
              }`}
            >
              YwD
            </div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase opacity-75 font-semibold">
              ORBIT // HARDWARE FLEET
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.92] select-none">
              <span className="font-serif italic font-light text-emerald-400">Orbit</span>{" "}
              <span className="font-sans font-light tracking-tighter">You</span>
              <br />
              <span className="font-serif italic font-light">Can</span>{" "}
              <span className="font-sans font-medium tracking-tighter">Reach</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase backdrop-blur-md transition-colors bg-white/5 border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero-Purchase Sovereignty</span>
          </div>
        </div>

        {/* Top-Right: Controls Suite (Cleaned & Consolidated) */}
        <div className="flex flex-col items-end gap-3 text-right pointer-events-auto">
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* View Switcher (Moved here to eliminate bottom overlap!) */}
            {onToggleHeroView && (
              <div
                className={`p-0.5 rounded-full border text-xs font-mono backdrop-blur-md flex items-center ${
                  cosmicMode ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-[#18352D]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleHeroView("orbit")}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                    heroView === "orbit"
                      ? cosmicMode
                        ? "bg-emerald-400 text-black font-semibold shadow-xs"
                        : "bg-[#18352D] text-white font-semibold shadow-xs"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  3D Orbit
                </button>
                <button
                  type="button"
                  onClick={() => onToggleHeroView("classic")}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                    heroView === "classic"
                      ? cosmicMode
                        ? "bg-emerald-400 text-black font-semibold shadow-xs"
                        : "bg-[#18352D] text-white font-semibold shadow-xs"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  Pedestal
                </button>
              </div>
            )}

            {/* Dimension Portal Toggle */}
            <button
              type="button"
              onClick={onToggleCosmicMode}
              title="Toggle Dimension: Studio ⇄ Cosmic Nebula"
              className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-all duration-300 backdrop-blur-md shadow-md ${
                cosmicMode
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25"
                  : "bg-[#18352D] text-[#FAF7F2] border-[#18352D] hover:bg-[#2A4D42]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{cosmicMode ? "Cosmic" : "Studio"}</span>
            </button>

            {/* Auto-Rotation Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="p-1.5 rounded-full border border-current/20 hover:border-current/50 transition-colors backdrop-blur-md"
              title={isAutoRotating ? "Pause Auto-Orbit" : "Resume Auto-Orbit"}
            >
              <RotateCw
                className={`w-3.5 h-3.5 transition-transform ${isAutoRotating ? "animate-spin" : ""}`}
                style={{ animationDuration: "14s" }}
              />
            </button>
          </div>

          <div className="font-mono text-xs tracking-widest opacity-80">
            <span className="text-base font-bold text-emerald-400">
              {String(activeIdx + 1).padStart(2, "0")}
            </span>
            <span className="opacity-40"> / </span>
            <span>{String(specimens.length).padStart(2, "0")}</span>
          </div>

          <div className="hidden sm:block text-[10px] font-mono tracking-tight opacity-60 max-w-[200px]">
            Deep & Verified • Locker Bay Alpha Monitored
          </div>
        </div>
      </div>

      {/* ========================================================
          3D INTERACTIVE ORBIT SPHERE CANVAS STAGE
          (Perfect true vertical center top-[50%] with no cutting off!)
         ======================================================== */}
      <motion.div
        style={{ scale: scrollScale, opacity: scrollOpacity }}
        className="absolute inset-0 flex items-center justify-center top-[50%] cursor-grab active:cursor-grabbing overflow-visible pointer-events-auto"
      >
        <div className="relative w-0 h-0 flex items-center justify-center">
          {/* Concentric Celestial Orbit Rings in 3D Space */}
          <div
            className="absolute rounded-full border border-current/15 pointer-events-none transition-opacity"
            style={{
              width: radius * 2.1,
              height: radius * 2.1,
              transform: `rotateX(68deg) rotateY(${effectiveRotY * 0.35}rad)`,
            }}
          />
          <div
            className="absolute rounded-full border border-dashed border-current/20 pointer-events-none transition-opacity"
            style={{
              width: radius * 2.4,
              height: radius * 2.4,
              transform: `rotateX(-32deg) rotateY(${-effectiveRotY * 0.25}rad)`,
            }}
          />

          {/* Render 3D Projected Specimen Cards */}
          {mounted &&
            projectedCards.map((card) => {
              const { item, index, x, y, scale, opacity, zIndex, isActive } = card;

              return (
                <div
                  key={item.id}
                  data-orbit-card
                  onClick={(e) => {
                    e.stopPropagation();
                    focusOnNode(index);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onOpenProductDetail(item.id, "rent", activeDuration);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-shadow duration-300 select-none will-change-transform cursor-pointer"
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale})`,
                    opacity,
                    zIndex,
                    filter: `blur(${Math.max(0, (1 - opacity) * 1.5).toFixed(1)}px)`,
                  }}
                >
                  {/* Floating Card Container */}
                  <div
                    className={`relative w-[155px] sm:w-[185px] lg:w-[215px] aspect-[16/11] rounded-2xl overflow-hidden border transition-all duration-300 backdrop-blur-xl shadow-2xl ${
                      isActive
                        ? cosmicMode
                          ? "border-emerald-400 shadow-emerald-400/40 ring-2 ring-emerald-400/70 scale-105"
                          : "border-[#C46A42] shadow-[#C46A42]/40 ring-2 ring-[#C46A42]/70 scale-105"
                        : cosmicMode
                        ? "border-white/15 bg-black/80 hover:border-white/40 hover:scale-105"
                        : "border-black/15 bg-white/90 hover:border-black/40 hover:scale-105"
                    }`}
                  >
                    {/* Card Photography */}
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Depth Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

                    {/* Top Status & Rate Badge */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/95">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md font-semibold tracking-wider border border-white/10">
                        {item.specimenTag}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md font-bold text-emerald-400 border border-emerald-500/30">
                        ₹{item.rates.daily}/d
                      </span>
                    </div>

                    {/* Bottom Title Bar with Condition & Telemetry */}
                    <div className="absolute bottom-2 inset-x-2 text-white">
                      <p className="text-[11px] sm:text-xs font-semibold truncate drop-shadow-md tracking-tight">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-0.5 text-[8px] sm:text-[9px] font-mono text-white/70">
                        <span className="truncate max-w-[110px]">{item.discipline}</span>
                        <span className="text-emerald-400 shrink-0 font-medium">{item.condition}</span>
                      </div>
                    </div>

                    {/* Focus Target Crosshair Corner Accents */}
                    {isActive && (
                      <div className="absolute inset-0 pointer-events-none border border-emerald-400/40">
                        <span className="absolute top-1 left-1 text-[8px] text-emerald-400 font-mono font-bold">+</span>
                        <span className="absolute bottom-1 right-1 text-[8px] text-emerald-400 font-mono font-bold">+</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* ========================================================
          EDITORIAL FOOTER & CORNER SIGNATURE
         ======================================================== */}
      <div className="absolute inset-x-6 lg:inset-x-12 bottom-20 z-20 flex flex-col sm:flex-row items-end sm:items-end justify-between gap-6 pointer-events-none">
        {/* Bottom Left: Manifesto Pill Container (Never obscures cards!) */}
        <div className="max-w-xs sm:max-w-sm pointer-events-auto hidden md:block p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/80">
          <p className="text-[11px] sm:text-xs font-sans leading-relaxed">
            From workstation compute to cinema optics, our verified campus relay turns four-figure hardware hurdles into zero-friction loans.
          </p>
        </div>

        {/* Bottom Right: Designer Script Signature */}
        <div className="text-right pointer-events-auto">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight leading-none text-white/95">
            <span className="italic font-light text-emerald-400">Fleets</span>
            <br />
            <span className="font-sans text-lg sm:text-xl font-light tracking-tight opacity-75">
              You Can Pilot
            </span>
          </p>
        </div>
      </div>

      {/* ========================================================
          TACTILE FLOATING CONTROL BAR (BOTTOM PILL)
         ======================================================== */}
      <div className="absolute inset-x-4 bottom-4 z-30 flex items-center justify-center pointer-events-auto">
        <motion.div
          layout
          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full border backdrop-blur-xl shadow-2xl transition-colors duration-500 max-w-full overflow-x-auto scrollbar-none ${
            cosmicMode
              ? "bg-[#0A120E]/90 border-white/15 text-white shadow-black/80"
              : "bg-white/90 border-black/15 text-[#18352D] shadow-xl"
          }`}
        >
          {/* Quick Action Button: '+' Guided Discovery */}
          <button
            type="button"
            onClick={onOpenGuidedDiscovery || onExplore}
            title="Launch Guided Fleet Discovery"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              cosmicMode
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-400"
                : "bg-[#18352D] hover:bg-[#2A4D42] border-[#18352D] text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Active Specimen Chip */}
          <div
            onClick={() => setExpandedDetail(!expandedDetail)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-current/10 text-xs font-mono cursor-pointer hover:border-current/30 transition-colors shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="opacity-60">{currentSpecimen.specimenTag}</span>
            <span className="opacity-30">//</span>
            <span className="font-semibold truncate max-w-[120px] sm:max-w-[200px]">
              {currentSpecimen.title}
            </span>
          </div>

          {/* Duration Selector Tabs */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-current/5 text-[11px] font-mono">
            {(["hourly", "daily", "weekly", "semester"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setActiveDuration(d);
                  setPreferredDuration(d);
                }}
                className={`px-2.5 py-1 rounded-full transition-all capitalize ${
                  activeDuration === d
                    ? cosmicMode
                      ? "bg-emerald-400 text-black font-semibold shadow-xs"
                      : "bg-[#18352D] text-white font-semibold shadow-xs"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Primary Action Button: "Launch Loan" */}
          <button
            type="button"
            onClick={() => onOpenProductDetail(currentSpecimen.id, "rent", activeDuration)}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shrink-0 ${
              cosmicMode
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black shadow-emerald-500/25"
                : "bg-[#C46A42] hover:bg-[#A8532F] text-white shadow-[#C46A42]/25"
            }`}
          >
            <span>Launch Loan</span>
            <span className="font-mono text-xs opacity-80">
              • ₹{currentRate}/{activeDuration === "semester" ? "sem" : activeDuration === "weekly" ? "wk" : activeDuration === "hourly" ? "hr" : "d"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* ========================================================
          EXPANDABLE SPECIMEN QUICK INSPECTION DRAWER
         ======================================================== */}
      <AnimatePresence>
        {expandedDetail && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 inset-x-4 sm:left-auto sm:right-6 sm:w-96 p-5 rounded-3xl border backdrop-blur-2xl z-40 shadow-2xl ${
              cosmicMode ? "bg-[#0A120E]/95 border-white/20 text-white" : "bg-white/95 border-black/15 text-[#18352D]"
            }`}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-current/10">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400">
                  {currentSpecimen.specimenTag} // {currentSpecimen.discipline}
                </span>
                <h3 className="text-base font-semibold mt-0.5">{currentSpecimen.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedDetail(false)}
                className="p-1 rounded-full hover:bg-current/10 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="opacity-60">Condition:</span>
                <span className="font-semibold text-emerald-400">{currentSpecimen.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Verified Hub:</span>
                <span>{currentSpecimen.hub}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">UPI Escrow Deposit:</span>
                <span>₹{currentSpecimen.deposit} (100% Refundable)</span>
              </div>
              <div className="pt-2 border-t border-current/10 text-[11px] opacity-80">
                {currentSpecimen.telemetry}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpandedDetail(false);
                onOpenProductDetail(currentSpecimen.id, "rent", activeDuration);
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Reserve via Verified Escrow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
