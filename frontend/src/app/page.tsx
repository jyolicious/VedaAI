"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assignments");
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-sm text-slate-500 animate-pulse">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}