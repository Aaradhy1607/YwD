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
    name: "Central Handover Point • Zone 1",
    desc: "Designated pickup counter and item condition inspection station.",
    timing: "Open 08:00 AM – 10:00 PM Daily",
  },
  {
    name: "Technology & Equipment Desk",
    desc: "Electronics and computing hardware exchange point for laptops, cameras, and accessories.",
    timing: "Open 08:30 AM – 09:30 PM Daily",
  },
  {
    name: "Academic Handover Desk",
    desc: "Exchange point for books, calculators, and laboratory equipment.",
    timing: "Open 09:00 AM – 08:00 PM Mon–Sat",
  },
  {
    name: "Media & Studio Exchange Bay",
    desc: "Exchange point for cameras, audio gear, and production kits.",
    timing: "Open 10:00 AM – 07:00 PM Daily",
  },
  {
    name: "Direct Delivery / Verified Courier",
    desc: "Doorstep delivery directly to your verified residential address.",
    timing: "Scheduled during checkout",
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
                  Designated exchange locations for counterparty handover
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
                      : "border-[#E5DEC9] bg-[#FFFFFF] hover:border-[#18352D]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-[#C46A42]" />
                        <h4 className="font-semibold text-xs sm:text-sm text-[#18352D]">
                          {hub.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#63736A] leading-relaxed">
                        {hub.desc}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-[#789681]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{hub.timing}</span>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#18352D] bg-[#18352D] text-white"
                            : "border-[#E5DEC9]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-[#FFFFFF] border-t border-[#E5DEC9] flex items-center justify-between text-xs text-[#63736A]">
            <span>Need home delivery?</span>
            <button
              type="button"
              onClick={() => {
                onSelectHub("Direct Delivery / Verified Courier");
                onClose();
              }}
              className="text-[#C46A42] font-semibold hover:underline"
            >
              Select Courier Delivery
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
