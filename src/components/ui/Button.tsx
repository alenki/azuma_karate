import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "ink" | "outline" | "text";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  /** Render as an in-page anchor (no Next routing). */
  plain?: boolean;
  size?: "md" | "lg";
} & Omit<ComponentProps<"button">, "children" | "className">;

const base =
  "btn inline-flex items-center justify-center gap-3 font-mono uppercase tracking-[0.12em] " +
  "min-h-11 px-6 text-[0.75rem] transition-[background-color,color,border-color,transform] duration-300 " +
  "ease-[var(--ease-out)] select-none cursor-pointer";

const variants: Record<Variant, string> = {
  ink: "btn-ink",
  outline: "btn-outline",
  text: "btn-text min-h-0 px-0",
};

/**
 * Typeset buttons: mono uppercase, hairline or solid. The hover state is a
 * colour swap plus a tiny lift — nothing that moves the layout.
 */
export function Button({ children, variant = "ink", className, href, plain, size = "md", ...rest }: ButtonProps) {
  const cls = cn(base, variants[variant], size === "lg" && "min-h-14 px-8 text-[0.8125rem]", className);
  if (href) {
    if (plain || href.startsWith("#") || /^https?:/.test(href)) {
      return (
        <a href={href} className={cls} {...(rest as ComponentProps<"a">)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
