// src/app/chat/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpcClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { debounce } from "lodash";
import type { SessionWithPreview } from "@/server/routers/chat";

const PAGE_SIZE = 10;

export default function ChatPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term updates so queries are not fired on every keystroke
  const debounced = useMemo(
    () =>
      debounce((val: string) => {
        setSearchTerm(val);
        setPage(1); // reset to first page on new search
      }, 350),
    []
  );

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    debounced(e.target.value);
  }

  // Query sessions with optional search
  const { data, isLoading, error } = trpc.chat.listSessions.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: searchTerm || undefined,
  });

  // create-session mutation & redirect (if you still use it)
  const createSession = trpc.chat.createSession.useMutation();

  const onCreate = async () => {
    try {
      const s = await createSession.mutateAsync({});
      // navigate to newly created session (client router)
      window.location.href = `/chat/${s.id}`;
    } catch (err) {
      console.error("Create session failed", err);
      alert("Failed to create session");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="mb-4 flex gap-2">
          <Input placeholder="Search sessions..." value={search} onChange={onSearchChange} />
          <Button onClick={onCreate}>New Session</Button>
        </div>
        <p>Loading sessions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="mb-4 flex gap-2">
          <Input placeholder="Search sessions..." value={search} onChange={onSearchChange} />
          <Button onClick={onCreate}>New Session</Button>
        </div>
        <div className="text-red-600">Failed to load sessions: {String(error.message)}</div>
      </div>
    );
  }

  const sessions = data?.sessions ?? [];
  const pagination = data?.pagination;

  const noSessionsAtAll =
    sessions.length === 0 && (!searchTerm || searchTerm.trim() === "") && pagination?.total === 0;
  const noResultsForSearch = sessions.length === 0 && !!(searchTerm && searchTerm.trim() !== "");

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4 flex gap-2">
        <Input placeholder="Search sessions..." value={search} onChange={onSearchChange} />
        <Button onClick={onCreate}>New Session</Button>
      </div>

      {noSessionsAtAll ? (
        <div className="text-center p-8 border rounded">
          <h2 className="text-lg font-medium mb-2">No sessions yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Start a new session to get career advice from the AI counselor.
          </p>
          <Button onClick={onCreate}>Start your first session</Button>
        </div>
      ) : noResultsForSearch ? (
        <div className="text-center p-6 border rounded">
          <p className="mb-2">No sessions matching “{searchTerm}”</p>
          <Button
            onClick={() => {
              setSearch("");
              setSearchTerm("");
              setPage(1);
            }}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-2">
              {sessions.map((session: SessionWithPreview) => (
                <Link key={session.id} href={`/chat/${session.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{session.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {session.lastMessagePreview ? (
                              <span className="truncate block max-w-[380px]">
                                {session.lastMessagePreview.length > 160
                                  ? session.lastMessagePreview.slice(0, 157) + "..."
                                  : session.lastMessagePreview}
                              </span>
                            ) : (
                              <span className="text-gray-400">No messages yet</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 ml-4">
                          {session.lastMessageAt ? (
                            <span title={new Date(session.lastMessageAt).toLocaleString()}>
                              {formatDistanceToNow(new Date(session.lastMessageAt), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : (
                            <span title={new Date(session.createdAt).toLocaleString()}>
                              {formatDistanceToNow(new Date(session.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </ScrollArea>

          {pagination && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} — {pagination.total} sessions
              </div>

              <div className="flex gap-2">
                <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </Button>
                <Button
                  disabled={page >= (pagination.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
