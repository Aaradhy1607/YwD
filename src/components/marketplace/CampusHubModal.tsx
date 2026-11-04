"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CheckCircle2, Building, ShieldCheck } from "lucide-react";

interface CampusHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHub: string;
  onSelectHub: (hub: string) => void;
}

export const VERIFIED_HUBS = [
  {
    name: "Central Verified Locker • Hub A",
    desc: "Contactless 24/7 dual-OTP smart locker bay and certified hardware inspection station.",
    timing: "Open 24/7 with contactless access",
  },
  {
    name: "Technology & Equipment Desk • Point 1",
    desc: "Electronics and computing hardware pickup counter for laptops, cameras, and accessories.",
    timing: "Open 08:30 AM – 09:30 PM Daily",
  },
  {
    name: "Academic & Media Center Handover Point",
    desc: "Convenient verified pickup counter for study material, calculators, optics, and tools.",
    timing: "Open 09:00 AM – 08:00 PM Mon–Sat",
  },
  {
    name: "Studio & Audio Visual Collection Point",
    desc: "Specialized optical and audio gear inspection desk for cinema kits and microphones.",
    timing: "Open 10:00 AM – 07:00 PM Daily",
  },
  {
    name: "Express Handover Bay • Zone 2",
    desc: "Rapid drop-off and pickup facility for hostel essentials and sports equipment.",
    timing: "Open 08:00 AM – 10:00 PM Daily",
  },
];

export function CampusHubModal({
  isOpen,
  onClose,
  selectedHub,
  onSelectHub,
}: CampusHubModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FFFFFF] w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#18352D] text-[#F5F0E8] p-5 flex items-center justify-between border-b border-[#2C483F]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C46A42] flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-white">
                  Select Handover Point
                </h3>
                <p className="text-[11px] text-[#9BB5A3]">
                  Verified exchange stations with secure locker access
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Hubs */}
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2.5 bg-[#FAF7F2]">
            {VERIFIED_HUBS.map((hub) => {
              const isSelected = selectedHub === hub.name;
              return (
                <div
                  key={hub.name}
                  onClick={() => {
                    onSelectHub(hub.name);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#18352D] bg-[#FFFFFF] shadow-sm ring-1 ring-[#18352D]"
                      : "border-[#E5DEC9] bg-[#FFFFFF] hover:border-[#789681]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#18352D]">
                          {hub.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#18352D] text-[#F5F0E8]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#63736A] leading-relaxed">
                        {hub.desc}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#789681] font-medium pt-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{hub.timing}</span>
                      </div>
                    </div>

                    <div className="shrink-0 mt-1">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#18352D] text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-[#E5DEC9]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#FFFFFF] border-t border-[#E5DEC9] flex items-center justify-between text-xs text-[#63736A]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>Condition verification at every handover point</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#18352D] hover:bg-[#10231E] text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
