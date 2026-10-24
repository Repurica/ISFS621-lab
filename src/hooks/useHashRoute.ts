import { useCallback, useEffect, useState } from 'react';
import type { Screen } from '../types';

const SCREENS: Screen[] = ['login', 'claim', 'dashboard', 'scan', 'review', 'retailer'];

function readScreen(): Screen {
  const hash = window.location.hash.replace('#', '');
  return SCREENS.includes(hash as Screen) ? (hash as Screen) : 'login';
}

export function useHashRoute() {
  const [screen, setScreen] = useState<Screen>(readScreen);

  useEffect(() => {
    const sync = () => setScreen(readScreen());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#login');
    }
  }, []);

  const navigate = useCallback((next: Screen, replace = false) => {
    const hash = `#${next}`;
    if (window.location.hash !== hash) {
      if (replace) {
        window.history.replaceState(null, '', hash);
      } else {
        window.history.pushState(null, '', hash);
      }
    }
    setScreen(next);
  }, []);

  return { screen, navigate };
}
