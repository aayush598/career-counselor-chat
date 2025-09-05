// src/app/error.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-sm text-gray-600">{error.message || "An unexpected error occurred."}</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
