import { useCallback, useEffect, useRef, useState } from 'react';

export function useDelayedAction() {
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const run = useCallback(
    (action: () => void, delay = 700) => {
      if (busy || timerRef.current !== null) return;
      setBusy(true);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setBusy(false);
        action();
      }, delay);
    },
    [busy],
  );

  return { busy, run };
}
