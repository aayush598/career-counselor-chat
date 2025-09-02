"use client";

import Link from "next/link";
import { mockSessions } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function ChatPage() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Your Sessions</h1>

      {mockSessions.length === 0 ? (
        <div className="text-center space-y-2">
          <p className="text-gray-500">No sessions yet.</p>
          <Button>Start new session</Button>
        </div>
      ) : (
        <ScrollArea className="h-[70vh]">
          <div className="space-y-2">
            {mockSessions.map((session) => (
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
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
