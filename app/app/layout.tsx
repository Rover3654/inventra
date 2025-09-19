import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";  // relativ: app/app → app/components
import Link from "next/link";
import AuthStatus from "../components/AuthStatus";

export const metadata: Metadata = {
  title: "Inventra",
  description: "Inventory Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeToggle />
        <header className="px-4 py-3 border-b border-white/10 flex gap-3">
          <Link href="/">Start</Link>
          <Link href="/inventory">Bestand</Link>
          <Link href="/activities">Aktivitäten</Link>
        </header>
        <AuthStatus />
        {children}
      </body>
    </html>
  );
}
