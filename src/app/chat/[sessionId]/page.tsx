"use client";

import { useParams } from "next/navigation";
import { mockMessages } from "@/lib/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const params = useParams();
  const messages = mockMessages[params.sessionId as string] ?? [];

  return (
    <div className="flex flex-col h-[90vh] p-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-2">Session {params.sessionId}</h1>

      <ScrollArea className="flex-1 border rounded-lg p-2">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} />
          ))}
        </div>
      </ScrollArea>

      <div className="mt-2">
        <Button className="w-full" disabled>
          Composer disabled (read-only)
        </Button>
      </div>
    </div>
  );
}
