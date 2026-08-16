import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "live" | "surface";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all active:scale-[0.97] disabled:opacity-40",
        size === "sm" && "h-9 px-4 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-13 px-6 text-[15px]",
        variant === "primary" && "bg-primary text-primary-foreground alpha-glow",
        variant === "surface" && "bg-surface-2 text-foreground alpha-hairline",
        variant === "outline" && "alpha-hairline text-foreground",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        variant === "live" && "bg-live text-live-foreground",
        className,
      )}
    />
  );
}

export function Chip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        "h-9 shrink-0 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-muted-foreground alpha-hairline",
        className,
      )}
    />
  );
}

export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "live" | "primary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-medium tracking-wide uppercase",
        tone === "default" && "bg-background/60 text-foreground/90 backdrop-blur-md alpha-hairline",
        tone === "live" && "bg-live text-live-foreground",
        tone === "primary" && "bg-primary text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-2 w-2 rounded-full bg-live animate-alpha-pulse" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
    </span>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between px-5">
      <div>
        <h2 className="font-display text-[19px] leading-tight font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-ultramarine text-[12px] font-semibold text-foreground alpha-hairline"
    >
      {initials}
    </span>
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-lg font-semibold">{value}</div>
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
    </div>
  );
}
