"use client";

import { trpc } from "@/lib/trpcClient";

export default function HealthPage() {
  const pingQuery = trpc.ping.useQuery();

  if (pingQuery.isLoading) return <div>Loading...</div>;
  if (pingQuery.error) return <div>Error: {pingQuery.error.message}</div>;

  return <div className="p-4">Server says: {pingQuery.data}</div>;
}
