import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCProvider } from "@/components/trpc-provider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Career Counselor Chat",
  description: "AI-powered chat app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TRPCProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
