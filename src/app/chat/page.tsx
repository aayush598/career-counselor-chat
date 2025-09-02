"use client";

import { trpc } from "@/lib/trpcClient";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const router = useRouter();

  // Query sessions
  const { data, isLoading } = trpc.chat.listSessions.useQuery({ page, pageSize });

  // Mutation for creating a new session
  const createSession = trpc.chat.createSession.useMutation({
    onSuccess: (session) => {
      // redirect to new session thread
      router.push(`/chat/${session.id}`);
    },
  });

  if (isLoading) return <p>Loading...</p>;

  if (!data || data.sessions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">No sessions yet.</p>
        <Button onClick={() => createSession.mutate({})} disabled={createSession.isLoading}>
          {createSession.isLoading ? "Creating..." : "Start new session"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Your Sessions</h1>
        <Button
          size="sm"
          onClick={() => createSession.mutate({})}
          disabled={createSession.isLoading}
        >
          {createSession.isLoading ? "Creating..." : "New Session"}
        </Button>
      </div>

      <ScrollArea className="h-[70vh] space-y-2">
        {data.sessions.map((session: { id: number; title: string; updatedAt: string }) => (
          <Link key={session.id} href={`/chat/${session.id}`}>
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="font-medium">{session.title}</div>
                <div className="text-xs text-gray-500">
                  Last updated {format(new Date(session.updatedAt), "PPpp")}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </ScrollArea>

      <div className="flex justify-between mt-4">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <Button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
