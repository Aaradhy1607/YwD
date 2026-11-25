import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060A08] text-white px-4 text-center">
      <div className="space-y-4 max-w-md">
        <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
          Error 404 // Protocol Fault
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">Node Not Found</h1>
        <p className="text-sm text-neutral-400">
          The requested coordinate or equipment lot does not exist in the active platform ledger.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-xs tracking-wide transition-colors"
          >
            Return to Exchange Point
          </Link>
        </div>
      </div>
    </div>
  );
}

