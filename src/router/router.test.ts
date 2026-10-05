import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { parsePath, formatPath } from './router';
import { useRouter } from './useRouter';

describe('router utilities', () => {
  describe('parsePath', () => {
    it('parses /library correctly', () => {
      expect(parsePath('/library')).toEqual({ page: 'library' });
    });

    it('defaults / and empty to library', () => {
      expect(parsePath('/')).toEqual({ page: 'library' });
      expect(parsePath('')).toEqual({ page: 'library' });
    });

    it('parses /stats correctly', () => {
      expect(parsePath('/stats')).toEqual({ page: 'stats' });
    });

    it('parses /practice without exercise id', () => {
      expect(parsePath('/practice')).toEqual({ page: 'practice', exerciseId: undefined });
    });

    it('parses /practice with exercise id', () => {
      expect(parsePath('/practice/scale-c-major')).toEqual({
        page: 'practice',
        exerciseId: 'scale-c-major',
      });
    });

    it('decodes uri components in exercise id', () => {
      expect(parsePath('/practice/scale%20c%20major')).toEqual({
        page: 'practice',
        exerciseId: 'scale c major',
      });
    });

    it('falls back to library for unknown routes', () => {
      expect(parsePath('/random-unknown-page')).toEqual({ page: 'library' });
    });
  });

  describe('formatPath', () => {
    it('formats string page names to paths', () => {
      expect(formatPath('library')).toBe('/library');
      expect(formatPath('practice')).toBe('/practice');
      expect(formatPath('stats')).toBe('/stats');
    });

    it('formats Route objects to paths', () => {
      expect(formatPath({ page: 'library' })).toBe('/library');
      expect(formatPath({ page: 'stats' })).toBe('/stats');
      expect(formatPath({ page: 'practice' })).toBe('/practice');
      expect(formatPath({ page: 'practice', exerciseId: 'scale-c-major' })).toBe(
        '/practice/scale-c-major'
      );
      expect(formatPath({ page: 'practice', exerciseId: 'scale c major' })).toBe(
        '/practice/scale%20c%20major'
      );
    });
  });
});

describe('useRouter hook', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    window.history.pushState({}, '', '/library');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with current window.location.pathname', () => {
    window.history.pushState({}, '', '/stats');
    const { result } = renderHook(() => useRouter());
    expect(result.current.route).toEqual({ page: 'stats' });
  });

  it('navigates to a new page using pushState', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useRouter());

    act(() => {
      result.current.navigate('stats');
    });

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/stats');
    expect(result.current.route).toEqual({ page: 'stats' });
  });

  it('navigates to practice with exerciseId', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useRouter());

    act(() => {
      result.current.navigate({ page: 'practice', exerciseId: 'scale-d-major' });
    });

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/practice/scale-d-major');
    expect(result.current.route).toEqual({ page: 'practice', exerciseId: 'scale-d-major' });
  });

  it('updates route state on popstate event', () => {
    const { result } = renderHook(() => useRouter());

    act(() => {
      window.history.pushState({}, '', '/practice');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.route).toEqual({ page: 'practice', exerciseId: undefined });
  });
});
