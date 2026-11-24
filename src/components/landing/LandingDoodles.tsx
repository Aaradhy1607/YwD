"use client";

export function MarketplaceDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute left-[3%] top-16 h-24 w-24 -rotate-12 text-ywd-sage/35"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path d="M28 77V43l32-18 32 18v34l-32 18-32-18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m28 43 32 18 32-18M60 61v34M60 25v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m18 92 11-7M102 31l9-5M18 28l9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="61" r="3" fill="currentColor" />
      </svg>

      <svg
        className="absolute right-[4%] top-28 h-28 w-28 rotate-6 text-ywd-orange/30"
        viewBox="0 0 140 140"
        fill="none"
      >
        <path d="M25 102c12-25 27-41 45-48 17-7 31-4 44 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 7" />
        <path d="M67 29c14 2 25 11 29 24M96 53l6-18M96 53l-18-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="30" cy="99" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="114" cy="62" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M23 82v35M23 117h35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <svg
        className="absolute bottom-16 left-[8%] h-20 w-32 -rotate-3 text-ywd-orange/25"
        viewBox="0 0 160 100"
        fill="none"
      >
        <path d="M19 66h122M25 66V36h45v30M70 66V20h65v46M37 36V24h21v12M82 20V11h41v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M33 66v14M58 66v14M82 66v14M123 66v14M49 47h6M92 34h8M112 34h8M92 51h8M112 51h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m80 84 8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg
        className="absolute bottom-20 right-[9%] h-24 w-24 rotate-12 text-ywd-sage/30"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path d="M60 15 91 27v24c0 23-13 39-31 48-18-9-31-25-31-48V27l31-12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="m45 59 10 10 21-24M60 15v84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 43H12M108 43H98M26 83l-9 6M94 83l9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function AuthDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute left-[4%] top-[18%] h-24 w-24 -rotate-6 text-ywd-sage/25" viewBox="0 0 120 120" fill="none">
        <rect x="22" y="38" width="76" height="54" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M22 46h76M36 38V27h48v11M38 64h44M38 76h29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="86" cy="76" r="4" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-[12%] right-[3%] h-28 w-28 rotate-6 text-ywd-orange/25" viewBox="0 0 140 140" fill="none">
        <path d="M70 18 112 34v30c0 29-17 48-42 58-25-10-42-29-42-58V34l42-16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="m53 73 12 12 25-29M70 18v104" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="70" cy="73" r="35" stroke="currentColor" strokeWidth="1" strokeDasharray="4 7" />
      </svg>
    </div>
  );
}
