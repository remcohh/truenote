import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from '../../../services/pocketbase';
import type { UserProfile } from '../../../types';

/** Tracks the current PocketBase auth state, live across login/logout/token refresh. */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());

  useEffect(() => onAuthChange(setUser), []);

  return user;
}
