// src/components/navbar.tsx
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-lg font-bold">
        <Link href="/">Career Counselor Chat</Link>
      </h1>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {status === "loading" ? (
          <span className="text-sm text-gray-500">Loading...</span>
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {session.user.name ?? session.user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
