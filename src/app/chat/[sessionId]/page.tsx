"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpcClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { debounce } from "lodash";

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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");

  const { data: session } = trpc.chat.getSession.useQuery(
    {
      id: Number(sessionId),
    },
    {
      onSuccess: (s) => setTitle(s.title),
    }
  );

  // Rename mutation
  const rename = trpc.chat.renameSession.useMutation();

  // Debounced save
  const saveTitle = debounce((newTitle: string) => {
    rename.mutate({ id: Number(sessionId), title: newTitle });
  }, 500);

  const utils = trpc.useUtils();

  // Query: messages
  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.chat.listMessages.useInfiniteQuery(
    { sessionId: Number(sessionId), limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  // AI mutation (real provider)
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

      // Optimistic UI
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
      // 🔥 trigger AI response after user message saved
      await generateAI.mutateAsync({ sessionId: Number(sessionId) });
    },
    onSettled: () => {
      utils.chat.listMessages.invalidate({
        sessionId: Number(sessionId),
        limit: 10,
      });
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
        <Button type="submit" disabled={addMessage.isLoading || generateAI.isLoading}>
          {addMessage.isLoading || generateAI.isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
