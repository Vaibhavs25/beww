import { useEffect, useState } from 'react';

export function useNow(refreshKey?: unknown) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    // New shared data can arrive between timer ticks. Refresh the clock too,
    // so that a just-arrived photo or mood is immediately eligible to display.
    const initial = setTimeout(tick, 0);
    const timer = setInterval(tick, 30000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [refreshKey]);
  return now;
}
