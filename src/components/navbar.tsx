import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-lg font-bold">Career Counselor Chat</h1>
      <ThemeToggle />
    </header>
  );
}
