"use client";

import { useStore } from "@/store/store";

export default function InitialLoading() {
  const phase = useStore((state) => state.phase);
  if (phase !== "loading") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <h1 className="text-4xl font-bold">Initial Loading</h1>
    </div>
  );
}
