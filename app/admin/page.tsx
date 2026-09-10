"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/doctor");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-xl font-black">Redirecting to Doctor Portal...</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Admin route has been moved to the secure Doctor Portal at{" "}
          <code className="text-emerald-400 font-bold">/doctor</code>.
        </p>
        <Link
          href="/doctor"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md"
        >
          <span>Go to Doctor Portal</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
