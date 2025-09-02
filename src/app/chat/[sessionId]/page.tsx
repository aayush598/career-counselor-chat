"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpcClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [message, setMessage] = useState("");

  // Messages query
  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.chat.listMessages.useInfiniteQuery(
    { sessionId: Number(sessionId), limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Add message mutation
  const utils = trpc.useUtils();
  const addMessage = trpc.chat.addMessage.useMutation({
    onMutate: async (newMsg) => {
      // Cancel outgoing refetches
      await utils.chat.listMessages.cancel();

      // Snapshot current state
      const prevData = utils.chat.listMessages.getInfiniteData({
        sessionId: Number(sessionId),
        limit: 10,
      });

      // Optimistically add message
      utils.chat.listMessages.setInfiniteData(
        { sessionId: Number(sessionId), limit: 10 },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, idx) =>
              idx === old.pages.length - 1
                ? {
                    ...page,
                    messages: [
                      ...page.messages,
                      {
                        id: Math.random(), // temp id
                        sessionId: newMsg.sessionId,
                        sender: newMsg.sender,
                        content: newMsg.content,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : page
            ),
          };
        }
      );

      setMessage(""); // clear input
      return { prevData };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevData) {
        utils.chat.listMessages.setInfiniteData(
          { sessionId: Number(sessionId), limit: 10 },
          ctx.prevData
        );
      }
      toast.error("Failed to send message");
    },
    onSettled: () => {
      utils.chat.listMessages.invalidate({ sessionId: Number(sessionId), limit: 10 });
    },
  });

  if (isLoading) return <p>Loading...</p>;

  const messages = data?.pages.flatMap((p) => p.messages) ?? [];

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

      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!message.trim()) return;
          addMessage.mutate({
            sessionId: Number(sessionId),
            content: message,
            sender: "user",
          });
        }}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit" disabled={addMessage.isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
}
