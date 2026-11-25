"use client";

import React, { useState } from "react";
import { ShieldCheck, Camera, Lock, CheckCircle2, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const TRUST_FAQS: FaqItem[] = [
  {
    id: "deposit",
    question: "How does the rental deposit work?",
    answer:
      "Your security deposit is tracked separately from the rental fee on your booking record (status HELD) and is not paid out to the item owner during the rental period. It remains held until return verification is completed or the booking is cancelled before handover.",
  },
  {
    id: "damage",
    question: "What happens if an item gets damaged?",
    answer:
      "During return inspection, if damage is noted, the booking is marked as DISPUTED and the deposit status updates to PARTIALLY_REFUNDED while the timestamped before-and-after condition photos are reviewed.",
  },
  {
    id: "refund",
    question: "How does the UPI refund process work?",
    answer:
      "At dropoff, you enter your 6-digit return OTP, upload return condition photos, and provide your UPI ID. When no damage is reported, the booking is marked COMPLETED and the deposit status updates to REFUNDED for payout to your specified UPI ID.",
  },
  {
    id: "chat",
    question: "How does anonymous chat work?",
    answer:
      "Every account uses a system-assigned alias (such as EcoRenter-4912) instead of your real name. All coordination happens through the YwD relay chat, which automatically filters out phone numbers and email addresses from messages.",
  },
  {
    id: "cancellation",
    question: "What happens if a renter or owner cancels?",
    answer:
      "Pending or confirmed bookings can be cancelled before pickup handover. Cancelling updates the booking status to CANCELLED and releases the held security deposit.",
  },
];

export function TrustSection({ showFaq = false }: { showFaq?: boolean }) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(TRUST_FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#F5F0E8]">
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-medium text-[#C46A42] mb-2">
            Trust &amp; accountability
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#18352D] tracking-tight leading-[1.12]">
            Hardware security and identity confidentiality
          </h2>
          <p className="text-sm sm:text-base text-[#63736A] mt-3 leading-relaxed">
            How YwD documents hardware condition, tracks security deposits separately from rental charges, and keeps personal contact details private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#789681]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#C46A42] block">
                Deposit tracking
              </span>
              <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
                Protected Security Deposit
              </h3>
              <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
                Security deposits are tracked separately from rental charges and are not released to the owner during an active rental.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
              <span>Refund initiated upon return verification</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#C46A42]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#C46A42] block">
                Inspection integrity
              </span>
              <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
                4-Angle Photographic Records
              </h3>
              <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
                Handover and return workflows capture condition photos across key angles so pre-existing wear is documented.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
              <span>Server-verified dual-OTP handover</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#FAF7F2] p-6 sm:p-7 rounded-2xl border border-[#E5DEC9] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18352D] text-white flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#789681]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#C46A42] block">
                Identity protection
              </span>
              <h3 className="text-lg font-semibold text-[#18352D] tracking-tight">
                Zero Personal Contact Leakage
              </h3>
              <p className="text-xs sm:text-sm text-[#63736A] leading-relaxed">
                Coordination happens through YwD relay chat using assigned aliases. Phone numbers and email addresses are moderated and never exposed.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5DEC9] text-xs text-[#18352D] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
              <span>Privacy-shielded relay messaging</span>
            </div>
          </div>
        </div>
      </section>

      {showFaq && (
        <section
          aria-labelledby="trust-faq-heading"
          className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E5DEC9]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-medium text-[#C46A42] mb-1.5">
                Frequently asked questions
              </p>
              <h2
                id="trust-faq-heading"
                className="text-2xl sm:text-3xl font-semibold text-[#18352D] tracking-tight"
              >
                Policies, deposits, and handovers
              </h2>
            </div>

            <div className="divide-y divide-[#E5DEC9] bg-[#FFFFFF] rounded-2xl border border-[#E5DEC9]">
              {TRUST_FAQS.map((item) => {
                const isOpen = openFaqId === item.id;
                const panelId = `faq-panel-${item.id}`;
                const buttonId = `faq-button-${item.id}`;

                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleFaq(item.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18352D]/40"
                      >
                        <span className="font-semibold text-sm sm:text-base text-[#18352D]">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#63736A] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#C46A42]" : ""
                          }`}
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="px-6 pb-5 text-xs sm:text-sm text-[#63736A] leading-relaxed"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
