import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MachinaOracle — AI Factory Brain",
  description: "Autonomous AI Platform for Predictive Maintenance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="circuit-bg min-h-screen">{children}</body>
    </html>
  );
}
