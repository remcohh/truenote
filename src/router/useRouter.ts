import { useState, useEffect, useCallback } from 'react';
import { parsePath, formatPath, type Route, type Page } from './router';

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => {
    if (typeof window === 'undefined') {
      return { page: 'library' };
    }
    return parsePath(window.location.pathname);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Canonicalize root '/' to '/library'
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(null, '', '/library');
    }

    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback(
    (to: Route | Page | string, options?: { replace?: boolean }) => {
      if (typeof window === 'undefined') return;

      const targetUrl =
        typeof to === 'string' && to.startsWith('/')
          ? to
          : typeof to === 'string'
          ? formatPath(to as Page)
          : formatPath(to);

      const nextRoute = parsePath(targetUrl);

      if (options?.replace) {
        window.history.replaceState(null, '', targetUrl);
      } else if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }

      setRoute(nextRoute);
    },
    []
  );

  return { route, navigate };
}
