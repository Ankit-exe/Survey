import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate URL-friendly slug
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
export function generateSlug(): string {
  return nanoid();
}

// Hash IP address for privacy-preserving rate limiting
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + process.env.HASH_SECRET || "salt").digest("hex").slice(0, 16);
}

// Format date for display
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Calculate average from array of numbers
export function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Truncate text
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}
