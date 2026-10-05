export type Page = 'library' | 'practice' | 'stats';

export interface Route {
  page: Page;
  exerciseId?: string;
}

/**
 * Parses a window.location.pathname into a strongly typed Route.
 * Examples:
 *   - '/library' -> { page: 'library' }
 *   - '/practice' -> { page: 'practice' }
 *   - '/practice/c-major-scale' -> { page: 'practice', exerciseId: 'c-major-scale' }
 *   - '/stats' -> { page: 'stats' }
 *   - '/' or unknown -> { page: 'library' }
 */
export function parsePath(pathname: string): Route {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0]?.toLowerCase();

  if (first === 'stats') {
    return { page: 'stats' };
  }

  if (first === 'practice') {
    return {
      page: 'practice',
      exerciseId: segments[1] ? decodeURIComponent(segments[1]) : undefined,
    };
  }

  return { page: 'library' };
}

/**
 * Formats a Route or Page into a URL pathname string.
 */
export function formatPath(route: Route | Page): string {
  if (typeof route === 'string') {
    return `/${route}`;
  }
  if (route.page === 'practice') {
    return route.exerciseId ? `/practice/${encodeURIComponent(route.exerciseId)}` : '/practice';
  }
  return `/${route.page}`;
}
