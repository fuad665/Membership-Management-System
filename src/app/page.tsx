"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-sm font-semibold text-slate-500">Redirecting...</span>
    </div>
  );
}
