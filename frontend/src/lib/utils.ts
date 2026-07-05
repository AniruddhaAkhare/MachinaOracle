import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: string): string {
  const l = (level || "").toLowerCase();
  if (l === "critical") return "#ff2d55";
  if (l === "high") return "#ff6b00";
  if (l === "medium") return "#ffd600";
  return "#00ff88";
}

export function getRiskClass(level: string): string {
  const l = (level || "").toLowerCase();
  if (l === "critical") return "risk-critical";
  if (l === "high") return "risk-high";
  if (l === "medium") return "risk-medium";
  return "risk-low";
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function healthScoreColor(score: number): string {
  if (score < 30) return "#ff2d55";
  if (score < 60) return "#ff6b00";
  if (score < 80) return "#ffd600";
  return "#00ff88";
}