import { useEffect, useState } from 'react';

export function useNow(refreshKey?: unknown) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const tick = () => setNow(Date.now()); const immediate = setTimeout(tick, 0); const timer = setInterval(tick, 30000); return () => { clearTimeout(immediate); clearInterval(timer); }; }, [refreshKey]);
  return now;
}
