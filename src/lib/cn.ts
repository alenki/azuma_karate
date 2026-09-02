import { clsx, type ClassValue } from "clsx";

/** Tiny class-name combiner. Tailwind v4 has no conflicting-class merge need for our usage. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
