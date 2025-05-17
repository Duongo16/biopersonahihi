import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class name objects into a single string.
 * Uses clsx for conditional class names and twMerge to properly merge Tailwind CSS classes.
 *
 * @param inputs - Class names or conditional class objects
 * @returns A string of merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
