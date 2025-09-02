"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpcClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

function MessageBubble({ sender, content }: { sender: string; content: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-2 max-w-xs",
        sender === "user"
          ? "bg-blue-500 text-white self-end"
          : "bg-gray-200 text-gray-800 self-start"
      )}
    >
      {content}
    </div>
  );
}

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [cursor, setCursor] = useState<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.chat.listMessages.useInfiniteQuery(
    { sessionId: Number(sessionId), limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (isLoading) return <p>Loading...</p>;
  if (!data || !data.pages.length) return <p>No messages yet.</p>;

  const messages = data.pages.flatMap((p) => p.messages);

  return (
    <div className="flex flex-col h-[90vh] p-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-2">Session {sessionId}</h1>

      <ScrollArea className="flex-1 border rounded-lg p-2">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} />
          ))}
        </div>
      </ScrollArea>

      {hasNextPage && (
        <Button className="mt-2 w-full" onClick={() => fetchNextPage()}>
          Load more
        </Button>
      )}

      <div className="mt-2">
        <Button className="w-full" disabled>
          Composer disabled (read-only)
        </Button>
      </div>
    </div>
  );
}
