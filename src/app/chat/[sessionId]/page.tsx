"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpcClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type MessageStatus = "sending" | "sent" | "error";

function MessageBubble({
  sender,
  content,
  createdAt,
  status,
}: {
  sender: string;
  content: string;
  createdAt: string;
  status?: MessageStatus;
}) {
  return (
    <div className="flex flex-col max-w-xs self-start gap-1">
      <div
        className={cn(
          "rounded-2xl px-4 py-2 whitespace-pre-wrap",
          sender === "user"
            ? "bg-blue-500 text-white self-end"
            : "bg-gray-200 text-gray-800 self-start"
        )}
        aria-live={sender === "ai" ? "polite" : undefined}
      >
        {content}
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span title={new Date(createdAt).toLocaleString()}>
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
        {status === "sending" && <span className="italic">Sending…</span>}
        {status === "error" && (
          <button
            onClick={() => {
              // TODO: retry logic
            }}
            className="text-red-500 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) redirect("/login");

  const utils = trpc.useUtils();

  // Query: messages
  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.chat.listMessages.useInfiniteQuery(
    { sessionId: Number(sessionId), limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  // AI mutation
  const generateAI = trpc.chat.generateAI.useMutation({
    onError: () => {
      toast.error("AI failed to respond. Please try again.");
    },
    onSettled: () => {
      utils.chat.listMessages.invalidate({
        sessionId: Number(sessionId),
        limit: 10,
      });
    },
  });

  // User message mutation
  const addMessage = trpc.chat.addMessage.useMutation({
    onMutate: async (newMsg) => {
      await utils.chat.listMessages.cancel();

      const prevData = utils.chat.listMessages.getInfiniteData({
        sessionId: Number(sessionId),
        limit: 10,
      });

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
                        id: Math.random(),
                        sessionId: newMsg.sessionId,
                        sender: newMsg.sender,
                        content: newMsg.content,
                        createdAt: new Date().toISOString(),
                        status: "sending" as MessageStatus,
                      },
                    ],
                  }
                : page
            ),
          };
        }
      );

      setMessage("");
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
    onSuccess: async () => {
      await generateAI.mutateAsync({ sessionId: Number(sessionId) });
    },
    onSettled: () => {
      utils.chat.listMessages.invalidate({
        sessionId: Number(sessionId),
        limit: 10,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-[90vh] p-4 max-w-2xl mx-auto space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  const messages = data?.pages.flatMap((p) => p.messages) ?? [];

  return (
    <div className="flex flex-col h-[90vh] p-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-2">Session {sessionId}</h1>

      <ScrollArea className="flex-1 border rounded-lg p-2">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              sender={msg.sender}
              content={msg.content}
              createdAt={msg.createdAt}
              status={msg.status as MessageStatus}
            />
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
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <Input
          id="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button
          type="submit"
          disabled={addMessage.isLoading || generateAI.isLoading}
          aria-label="Send message"
        >
          {addMessage.isLoading || generateAI.isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
