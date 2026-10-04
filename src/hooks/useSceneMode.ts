import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/** True when the pinned, choreographed scenes should be used instead of the compact figures. */
export function useSceneMode() {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const update = () => setOn(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return on;
}
