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
  X,
  Maximize2,
  Box,
  Cpu,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { ScrambleText } from "@/components/motion/ScrambleText";

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

interface HardwarePin {
  label: string;
  desc: string;
  x: number; // percentage
  y: number; // percentage
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
  mass: string;
  dimensions: string;
  pins: HardwarePin[];
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
    mass: "1.61 kg (3.55 lbs)",
    dimensions: "312.6 × 221.2 × 15.5 mm",
    pins: [
      { label: "Liquid Retina XDR", desc: "1,600 nits peak HDR • 120Hz ProMotion panel", x: 50, y: 35 },
      { label: "M3 Max Silicon", desc: "14-Core CPU • 30-Core GPU • Hardware Raytracing", x: 50, y: 70 },
      { label: "MagSafe 3 & TB4", desc: "140W fast-charge • 40Gb/s PCIe transfer bus", x: 18, y: 80 },
    ],
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
    mass: "658 g (Body Only)",
    dimensions: "131.3 × 96.4 × 79.8 mm",
    pins: [
      { label: "33MP Exmor R CMOS", desc: "Back-illuminated sensor • 15+ stops dynamic range", x: 50, y: 45 },
      { label: "FE 24-70mm f/2.8 GM", desc: "Constant maximum aperture • Dual XD Linear motors", x: 50, y: 75 },
      { label: "Dual Media Slots", desc: "CFexpress Type A & SD UHS-II simultaneous recording", x: 80, y: 60 },
    ],
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
    mass: "242 g",
    dimensions: "193 × 86 × 19 mm",
    pins: [
      { label: "Color Backlit Display", desc: "3.2\" 320x240 pixels • High contrast 16-bit color", x: 50, y: 30 },
      { label: "CAS Symbolic Engine", desc: "Algebraic simplification & differential equations", x: 50, y: 65 },
    ],
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
    mass: "377 g",
    dimensions: "185 × 212 × 64 mm",
    pins: [
      { label: "1/1.3\" CMOS Sensor", desc: "4K/60fps HDR • 155° Ultra-Wide Field of View", x: 50, y: 30 },
      { label: "Integrated Prop Guards", desc: "Aerodynamic ducted design for indoor campus flying", x: 50, y: 70 },
    ],
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
    mass: "590 g",
    dimensions: "288 × 102 × 29 mm",
    pins: [
      { label: "High-Res Color OLED", desc: "Custom graphics • Vector waveform visualization", x: 30, y: 40 },
      { label: "CNC Aluminum Body", desc: "Anodized unibody chassis with passive radiator", x: 70, y: 60 },
    ],
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
    mass: "515 g",
    dimensions: "184 × 160 × 98 mm",
    pins: [
      { label: "Dual RGB Passthrough", desc: "18 PPD color cameras with depth projection", x: 50, y: 40 },
      { label: "Snapdragon XR2 Gen 2", desc: "Double the GPU graphics performance of Quest 2", x: 50, y: 70 },
    ],
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
    mass: "14.2 kg (Full Tower Rig)",
    dimensions: "520 × 240 × 510 mm",
    pins: [
      { label: "Ada Lovelace GPU", desc: "16,384 CUDA cores • 4th Gen Tensor Cores for LLMs", x: 50, y: 45 },
      { label: "360mm Liquid Loop", desc: "Dual radiator push-pull silent cooling setup", x: 50, y: 20 },
    ],
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
    mass: "7.2 kg",
    dimensions: "638 × 379 × 31 mm",
    pins: [
      { label: "4K 120Hz 10-Bit Panel", desc: "99% DCI-P3 & 98% Adobe RGB color accuracy", x: 50, y: 40 },
      { label: "Pro Pen 3 Digitizer", desc: "8,192 pressure levels with zero-lag tilt response", x: 75, y: 65 },
    ],
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
    mass: "3.6 kg",
    dimensions: "1000 × 330 × 50 mm",
    pins: [
      { label: "Ultra Noiseless Pickups", desc: "Classic bell-like chime without 60-cycle hum", x: 50, y: 55 },
      { label: "Modern D Neck Profile", desc: "10\"-14\" compound radius rosewood fingerboard", x: 50, y: 25 },
    ],
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
    mass: "715 g",
    dimensions: "129.7 × 77.8 × 84.5 mm",
    pins: [
      { label: "Internal Cooling Fan", desc: "Unlimited 4K/60p recording without thermal shutoff", x: 50, y: 40 },
      { label: "Detachable XLR Handle", desc: "Dual XLR/TRS inputs with 4-channel 24-bit audio", x: 50, y: 20 },
    ],
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
    mass: "600 g",
    dimensions: "Custom Fit 3D Knitted Band",
    pins: [
      { label: "Dual Micro-OLED", desc: "23 million pixels • Custom 3D catadioptric lenses", x: 50, y: 40 },
      { label: "Dual-Chip Silicon", desc: "M2 computing engine paired with real-time R1 chip", x: 50, y: 70 },
    ],
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
    mass: "734 g",
    dimensions: "130 × 80 × 91.9 mm",
    pins: [
      { label: "Summilux 28mm f/1.7", desc: "Legendary optical formula with integrated macro mode", x: 50, y: 55 },
      { label: "47.3MP Sensor", desc: "Full-frame sensor with crop modes up to 75mm", x: 50, y: 35 },
    ],
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

  // Step 1: Cinematic 3D "Focal Pull" Zoom Pedestal State
  const [isFocalOpen, setIsFocalOpen] = useState(false);
  const [focalAngle, setFocalAngle] = useState<"studio" | "wireframe" | "anatomy">("studio");
  const [activePin, setActivePin] = useState<HardwarePin | null>(null);

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
      if (!isDraggingRef.current && !isFocalOpen) {
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
  }, [isAutoRotating, mounted, isFocalOpen]);

  // Pointer drag listeners for 3D trackball rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFocalOpen) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isFocalOpen) return;
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
        const x1 = base.x0 * cosY + base.z0 * sinY;
        const z1 = -base.x0 * sinY + base.z0 * cosY;
        const y1 = base.y0;

        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const scale = perspective / (perspective - z2);
        const screenX = x2 * scale;
        const screenY = y2 * scale;

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
              <ScrambleText text="ORBIT // HARDWARE FLEET" duration={260} />
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
            <ScrambleText text="Zero-Purchase Sovereignty" duration={220} />
          </div>
        </div>

        {/* Top-Right: Controls Suite */}
        <div className="flex flex-col items-end gap-3 text-right pointer-events-auto">
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* View Switcher */}
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
              <ScrambleText text={String(activeIdx + 1).padStart(2, "0")} trigger={activeIdx} duration={150} />
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
         ======================================================== */}
      <motion.div
        style={{ scale: scrollScale, opacity: scrollOpacity }}
        animate={{
          filter: isFocalOpen ? "blur(14px) brightness(0.55)" : "blur(0px) brightness(1)",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center top-[50%] cursor-grab active:cursor-grabbing overflow-visible pointer-events-auto"
      >
        <div className="relative w-0 h-0 flex items-center justify-center">
          {/* Concentric Celestial Orbit Rings */}
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
                    if (isActive) {
                      setIsFocalOpen(true);
                    } else {
                      focusOnNode(index);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsFocalOpen(true);
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

                    {/* Active Indicator Crosshairs */}
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
        {/* Bottom Left: Manifesto Pill Container */}
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

          {/* Active Specimen Chip (Clicking triggers Step 1 Focal Pull Zoom!) */}
          <div
            onClick={() => setIsFocalOpen(true)}
            title="Click to Zoom into 3D Focal Inspection"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-current/10 text-xs font-mono cursor-pointer hover:border-emerald-400 transition-colors shrink-0 bg-white/5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="opacity-60">{currentSpecimen.specimenTag}</span>
            <span className="opacity-30">//</span>
            <span className="font-semibold truncate max-w-[120px] sm:max-w-[200px]">
              <ScrambleText text={currentSpecimen.title} trigger={currentSpecimen.id} duration={180} />
            </span>
            <Maximize2 className="w-3 h-3 text-emerald-400 ml-1 opacity-70" />
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

          {/* Inspect Focal Button */}
          <button
            type="button"
            onClick={() => setIsFocalOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono border transition-all ${
              cosmicMode
                ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                : "border-[#18352D]/20 text-[#18352D] hover:bg-[#18352D]/5"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Inspect 3D</span>
          </button>

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
          STEP 1: CINEMATIC 3D "FOCAL PULL" ZOOM PEDESTAL MODAL
          (Dual-Angle Inspection: Studio Hero ⇄ Blueprint Wireframe ⇄ Port Anatomy)
         ======================================================== */}
      <AnimatePresence>
        {isFocalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`relative w-full max-w-5xl rounded-3xl border p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl ${
                cosmicMode
                  ? "bg-[#0A120E] border-emerald-500/30 text-white shadow-[0_0_80px_rgba(16,185,129,0.15)]"
                  : "bg-white border-[#E5DEC9] text-[#18352D] shadow-2xl"
              }`}
            >
              {/* Background Coordinate Watermark */}
              <div className="absolute right-6 top-6 text-6xl sm:text-8xl font-mono font-black opacity-5 pointer-events-none select-none">
                {currentSpecimen.specimenTag.replace("//", "")}
              </div>

              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-current/15 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <ScrambleText
                    text={currentSpecimen.specimenTag}
                    trigger={`${currentSpecimen.id}-${focalAngle}`}
                    duration={200}
                    className="font-mono text-xs font-bold text-emerald-400 tracking-widest"
                  />
                  <span className="opacity-30">//</span>
                  <ScrambleText
                    text={currentSpecimen.discipline}
                    trigger={`${currentSpecimen.id}-${focalAngle}`}
                    duration={240}
                    className="text-xs font-mono opacity-60 tracking-wider"
                  />
                </div>

                {/* Return to Galaxy Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFocalOpen(false);
                    setActivePin(null);
                  }}
                  className="px-4 py-2 rounded-full border border-current/20 hover:border-emerald-400 hover:text-emerald-400 transition-all font-mono text-xs flex items-center gap-2"
                >
                  <span>RETURN TO ORBIT</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dual-Angle Inspection Mode Tabs */}
              <div className="flex items-center justify-center my-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-current/15 bg-black/40 backdrop-blur-md text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setFocalAngle("studio");
                      setActivePin(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      focalAngle === "studio"
                        ? "bg-emerald-400 text-black font-semibold shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>01 // Studio Hero</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFocalAngle("wireframe");
                      setActivePin(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      focalAngle === "wireframe"
                        ? "bg-emerald-400 text-black font-semibold shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>02 // Blueprint X-Ray</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFocalAngle("anatomy");
                      if (currentSpecimen.pins.length > 0) setActivePin(currentSpecimen.pins[0]);
                    }}
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      focalAngle === "anatomy"
                        ? "bg-emerald-400 text-black font-semibold shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>03 // Hardware Pins</span>
                  </button>
                </div>
              </div>

              {/* Central Inspection Pedestal Display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Visual Canvas Stage (7 Columns) */}
                <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-current/20 bg-black/80 flex items-center justify-center group">
                  {/* Studio Hero Photography */}
                  {focalAngle === "studio" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full relative"
                    >
                      <img
                        src={currentSpecimen.image}
                        alt={currentSpecimen.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10">
                          CALIBRATION: GRADE A+ MINT
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                          MONITORED SENSOR
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Blueprint Wireframe X-Ray Mode */}
                  {focalAngle === "wireframe" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full relative flex items-center justify-center bg-[#040806] overflow-hidden"
                    >
                      {/* Millimeter Engineering Grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B981_1px,transparent_1px),linear-gradient(to_bottom,#10B981_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

                      {/* Inverted / Cybernetic Wireframe Filter */}
                      <img
                        src={currentSpecimen.image}
                        alt="Wireframe Blueprint"
                        className="w-full h-full object-cover filter invert contrast-125 opacity-40 mix-blend-screen"
                      />

                      {/* Blueprint Architectural Target Crosshairs */}
                      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-[10px] text-emerald-400">
                        <div className="flex justify-between">
                          <span>+ COORD: 34.901°N // 71.021°W</span>
                          <span>SCALE: 1.000 // METRIC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TOLERANCE: ±0.05mm</span>
                          <span>CAD_LAYER: 04_CHASSIS</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Port & Sensor Anatomy Mode */}
                  {focalAngle === "anatomy" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full relative"
                    >
                      <img
                        src={currentSpecimen.image}
                        alt="Hardware Anatomy"
                        className="w-full h-full object-cover filter brightness-75"
                      />
                      <div className="absolute inset-0 bg-black/40" />

                      {/* Pulsing Interactive Hardware Callout Pins */}
                      {currentSpecimen.pins.map((pin, i) => (
                        <div
                          key={pin.label}
                          onClick={() => setActivePin(pin)}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/pin"
                        >
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 text-black font-mono font-bold text-[10px] items-center justify-center shadow-lg">
                              0{i + 1}
                            </span>
                          </span>

                          <div className="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover/pin:block w-48 p-2 rounded-xl bg-black/90 border border-emerald-400/50 text-white text-[10px] font-mono z-30 shadow-2xl">
                            <p className="font-bold text-emerald-400">{pin.label}</p>
                            <p className="opacity-80 mt-0.5">{pin.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Telemetry & Loan Details (5 Columns) */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block">
                      ARCHIVAL SPECIMEN PROFILE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      <ScrambleText
                        text={currentSpecimen.title}
                        trigger={`${currentSpecimen.id}-${focalAngle}`}
                        duration={220}
                      />
                    </h2>
                    <p className="text-xs sm:text-sm opacity-75 font-mono leading-relaxed">
                      <ScrambleText
                        text={currentSpecimen.telemetry}
                        trigger={currentSpecimen.id}
                        duration={200}
                      />
                    </p>
                  </div>

                  {/* Physical Hardware Benchmark HUD */}
                  <div className="p-4 rounded-2xl bg-current/5 border border-current/10 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="opacity-60">Physical Mass:</span>
                      <span className="font-semibold text-white/95">{currentSpecimen.mass}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Dimensions:</span>
                      <span className="font-semibold text-white/95">{currentSpecimen.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Escrow Security:</span>
                      <span className="text-emerald-400 font-semibold">100% Refundable via UPI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Dispatch Locker:</span>
                      <span className="font-semibold text-white/95">{currentSpecimen.hub}</span>
                    </div>
                  </div>

                  {/* Active Pin Callout Banner */}
                  {focalAngle === "anatomy" && activePin && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono space-y-1"
                    >
                      <span className="text-emerald-400 font-bold">PIN TELEMETRY // {activePin.label}</span>
                      <p className="text-white/80">{activePin.desc}</p>
                    </motion.div>
                  )}

                  {/* Rates & Direct Action Suite */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-mono font-bold text-emerald-400">
                          ₹{currentRate}
                        </span>
                        <span className="text-xs font-mono opacity-60">
                          /{activeDuration === "semester" ? "semester" : activeDuration === "weekly" ? "week" : activeDuration === "hourly" ? "hour" : "day"}
                        </span>
                      </div>
                      <span className="text-xs font-mono opacity-70">
                        Security Deposit: ₹{currentSpecimen.deposit}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFocalOpen(false);
                        onOpenProductDetail(currentSpecimen.id, "rent", activeDuration);
                      }}
                      className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      <span>Launch Loan via Verified Escrow</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
