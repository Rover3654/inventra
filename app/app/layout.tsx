import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";


export const metadata: Metadata = {
  title: "Inventra",
  description: "Inventory Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}


