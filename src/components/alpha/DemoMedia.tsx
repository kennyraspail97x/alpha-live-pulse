import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** A neutral fallback until a rights-cleared photo tied to this exact item is supplied. */
export function DemoMedia({ label, className }: { label: string; className?: string }) {
  return <div className={cn("relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-surface-2 px-5 text-center", className)} role="img" aria-label={`Photo non disponible pour ${label}`}>
    <span className="absolute inset-x-0 top-0 h-px bg-accent/40" />
    <ImageOff className="h-7 w-7 text-muted-foreground/60" strokeWidth={1} />
    <span className="max-w-[18rem] font-display text-[15px] font-medium text-muted-foreground">{label}</span>
    <span className="text-[10px] uppercase text-muted-foreground">Photo vérifiée à venir</span>
  </div>;
}
