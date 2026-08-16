import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Map, Plus, Sparkles, Route as RouteIcon, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const tabs: { to: string; label: string; icon: typeof Compass; center?: boolean }[] = [
  { to: "/", label: "Now", icon: Sparkles },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/map", label: "Map", icon: Map, center: true },
  { to: "/trips", label: "Trips", icon: RouteIcon },
  { to: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {createOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-background/70 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div
            className="mx-auto mb-28 w-full max-w-[520px] rounded-3xl bg-surface p-5 alpha-hairline animate-alpha-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold">Créer</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Tout ce que vous publiez reste rattaché à un lieu réel.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["Publier une Story", "Passer en Live", "Recommander un lieu", "Créer une collection"].map((l) => (
                <Button key={l} variant="surface" className="h-14 justify-start px-4 text-left" onClick={() => setCreateOpen(false)}>
                  {l}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Démo — la publication n'est pas encore connectée à un backend.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setCreateOpen(true)}
        aria-label="Créer"
        className="fixed right-4 bottom-24 z-30 grid h-13 w-13 place-items-center rounded-full bg-primary text-primary-foreground alpha-glow active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[520px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map(({ to, label, icon: Icon, center }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            if (center)
              return (
                <Link key={to} to={to as never} className="-mt-6 flex flex-col items-center">
                  <span
                    className={cn(
                      "grid h-14 w-14 place-items-center rounded-2xl transition-all",
                      active ? "bg-primary text-primary-foreground alpha-glow" : "bg-surface-2 alpha-hairline",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-1 text-[10px] text-muted-foreground">{label}</span>
                </Link>
              );
            return (
              <Link key={to} to={to as never} className="flex w-16 flex-col items-center gap-1 py-2">
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px]", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
