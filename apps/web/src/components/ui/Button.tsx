import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand text-white hover:bg-[#1f555c]",
        variant === "secondary" && "border border-slate-300 bg-white text-ink hover:bg-slate-50",
        variant === "danger" && "bg-coral text-white hover:bg-[#bd4f31]",
        className
      )}
      {...props}
    />
  );
}
