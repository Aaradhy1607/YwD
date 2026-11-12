"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Sparkles,
  Wifi,
} from "lucide-react";

interface CampusStation {
  id: string;
  name: string;
  campusZone: string;
  walkingTime: string;
  activeLotsCount: number;
  featuredHardware: string;
  lockerBay: string;
  batteryAvg: string;
  status: "ONLINE" | "BUSY";
  operatingHours: string;
}

const STATIONS: CampusStation[] = [
  {
    id: "engg_bay_a",
    name: "Engineering Quad Locker Bay A",
    campusZone: "North Campus • Academic Block 3",
    walkingTime: "3-Min Walk from Hostels",
    activeLotsCount: 14,
    featuredHardware: "Apple M3 Max Workstations & NVIDIA RTX Rigs",
    lockerBay: "Lockers 01 — 24",
    batteryAvg: "100% Calibrated",
    status: "ONLINE",
    operatingHours: "07:00 AM — 11:30 PM",
  },
  {
    id: "media_bay",
    name: "Media & Studio Exchange Bay",
    campusZone: "West Campus • Creative Arts Complex",
    walkingTime: "5-Min Walk from Design Center",
    activeLotsCount: 9,
    featuredHardware: "Sony Alpha 7 IV, FX3 Rigs & Wireless Lavs",
    lockerBay: "Lockers 25 — 40",
    batteryAvg: "98% Clean Charge",
    status: "ONLINE",
    operatingHours: "08:00 AM — 10:00 PM",
  },
  {
    id: "library_counter",
    name: "Library Pavilion Counter 4",
    campusZone: "Central Campus • Ground Floor Pavilion",
    walkingTime: "2-Min Walk from Reading Rooms",
    activeLotsCount: 22,
    featuredHardware: "TI-Nspire Graphing Calculators & Digital Multimeters",
    lockerBay: "Counter Desk 04",
    batteryAvg: "Exam-Ready Fresh",
    status: "ONLINE",
    operatingHours: "Open 24 Hours",
  },
  {
    id: "sound_conservatory",
    name: "Sound Conservatory Bay 10",
    campusZone: "South Campus • Music & Acoustics Wing",
    walkingTime: "6-Min Walk from Student Center",
    activeLotsCount: 6,
    featuredHardware: "Teenage Engineering OP-1 Field & Audio Interfaces",
    lockerBay: "Lockers 41 — 50",
    batteryAvg: "100% State of Health",
    status: "ONLINE",
    operatingHours: "09:00 AM — 09:00 PM",
  },
];

interface CampusProximityRadarProps {
  cosmicMode?: boolean;
  onOpenHubModal: () => void;
  onExplore: () => void;
}

export function CampusProximityRadar({
  cosmicMode = true,
  onOpenHubModal,
  onExplore,
}: CampusProximityRadarProps) {
  const [selectedStationIdx, setSelectedStationIdx] = useState(0);
  const activeStation = STATIONS[selectedStationIdx];

  return (
    <section
      id="campus-radar"
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
              <Navigation className="w-3.5 h-3.5" />
              <span>THE HOW FACTOR // 05 • LOCAL CAMPUS UTILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              How fast can you physically pick this up?
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              No 5-day shipping delays. YwD operates physical campus exchange hubs. Reserve online and collect your sanitized gear in under 15 minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenHubModal}
            className="px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono flex items-center gap-2 hover:bg-emerald-500/20 transition-all self-start md:self-auto"
          >
            <MapPin className="w-4 h-4" />
            <span>SWITCH CAMPUS HUB</span>
          </button>
        </div>

        {/* 4 Campus Hub Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATIONS.map((station, idx) => {
            const isSelected = selectedStationIdx === idx;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedStationIdx(idx)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/50"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 text-neutral-400"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {station.status}
                    </span>
                    <span className="text-neutral-500">{station.walkingTime.split(" ")[0]} WALK</span>
                  </div>

                  <h4 className={`text-base font-semibold leading-snug ${isSelected ? "text-white" : "text-neutral-300"}`}>
                    {station.name}
                  </h4>
                  <p className="text-xs text-neutral-400">{station.campusZone}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{station.activeLotsCount} LOTS LIVE</span>
                  <span className="text-neutral-500">{station.lockerBay}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Hub Station Deep Dive */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
                Selected Handover Coordinate
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white">
                {activeStation.name}
              </h3>
              <p className="text-sm text-neutral-400">
                {activeStation.campusZone} • {activeStation.walkingTime}
              </p>
            </div>

            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all shrink-0 self-start md:self-auto shadow-lg shadow-emerald-500/20"
            >
              <span>Explore Gear at This Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-neutral-500 block uppercase">Primary Inventory</span>
              <span className="text-white font-medium block text-sm">{activeStation.featuredHardware}</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-neutral-500 block uppercase">Battery Calibration</span>
              <span className="text-emerald-400 font-bold block text-sm flex items-center gap-1.5">
                <Battery className="w-4 h-4" />
                {activeStation.batteryAvg}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-neutral-500 block uppercase">Operational Hours</span>
              <span className="text-white font-medium block text-sm">{activeStation.operatingHours}</span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-neutral-500 block uppercase">Handover Verification</span>
              <span className="text-emerald-300 font-medium block text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Staff / Dual-OTP Automated
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

