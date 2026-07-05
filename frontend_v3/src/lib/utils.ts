import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: string | number): string {
  if (typeof level === "number") {
    if (level > 75) return "var(--red)";
    if (level > 50) return "#e87a3f";
    if (level > 25) return "var(--amber)";
    return "var(--green)";
  }
  const l = (level || "").toLowerCase();
  if (l.includes("crit")) return "var(--red)";
  if (l.includes("high")) return "#e87a3f";
  if (l.includes("med"))  return "var(--amber)";
  return "var(--green)";
}

export function healthScoreColor(score: number): string {
  if (score < 30) return "var(--red)";
  if (score < 60) return "#e87a3f";
  if (score < 80) return "var(--amber)";
  return "var(--green)";
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function getRiskClass(level: string): string {
  const l = (level || "").toLowerCase();
  if (l.includes("crit")) return "risk-critical";
  if (l.includes("high")) return "risk-high";
  if (l.includes("med"))  return "risk-medium";
  return "risk-low";
}
