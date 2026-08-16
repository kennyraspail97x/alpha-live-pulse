import { useEffect, useState } from "react";
import { getTimeContext, type TimeContext } from "./alpha-context";

/** SSR-stable clock: renders a fixed evening context, then syncs to the real time after hydration. */
export function useNowContext(): TimeContext {
  const [ctx, setCtx] = useState<TimeContext>(() =>
    getTimeContext(new Date(2026, 0, 3, 20, 0)),
  );
  useEffect(() => {
    setCtx(getTimeContext(new Date()));
    const id = window.setInterval(() => setCtx(getTimeContext(new Date())), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return ctx;
}
