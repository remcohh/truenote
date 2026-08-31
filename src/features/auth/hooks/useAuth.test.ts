import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as pocketbaseService from '../../../services/pocketbase';

vi.mock('../../../services/pocketbase', () => ({
  getCurrentUser: vi.fn(),
  onAuthChange: vi.fn(),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial user from getCurrentUser', () => {
    const mockUser = { id: 'u1', email: 'test@example.com', name: 'Test Musician' };
    vi.mocked(pocketbaseService.getCurrentUser).mockReturnValue(mockUser);
    vi.mocked(pocketbaseService.onAuthChange).mockImplementation(() => () => {});

    const { result } = renderHook(() => useAuth());
    expect(result.current).toEqual(mockUser);
  });

  it('subscribes to auth changes and updates state when auth changes', () => {
    let authCallback: ((user: any) => void) | null = null;
    vi.mocked(pocketbaseService.getCurrentUser).mockReturnValue(null);
    vi.mocked(pocketbaseService.onAuthChange).mockImplementation((cb) => {
      authCallback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeNull();

    const loggedInUser = { id: 'u2', email: 'user2@example.com', name: 'User Two' };
    act(() => {
      if (authCallback) authCallback(loggedInUser);
    });

    expect(result.current).toEqual(loggedInUser);
  });
});
