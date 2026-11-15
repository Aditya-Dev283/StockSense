import { create } from 'zustand';
import { User, UserRole } from '../types';
import { SEED_USERS } from '../data/seed';
import { sha256 } from '../lib/hash';
import { getStoredData, setStoredData, clearStoredData } from '../lib/storage';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  login: (username: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  clearLockout: () => void;
}

const STORAGE_KEY_AUTH = 'stocksense_auth_user_v2';

export const useAuthStore = create<AuthState>((set, get) => {
  const storedUser = getStoredData<User | null>(STORAGE_KEY_AUTH, null);

  return {
    currentUser: storedUser,
    isAuthenticated: !!storedUser,
    failedAttempts: 0,
    lockoutUntil: null,

    login: async (username: string, passwordPlain: string) => {
      const state = get();
      const now = Date.now();

      // Check soft lockout
      if (state.lockoutUntil && state.lockoutUntil > now) {
        const remainingSec = Math.ceil((state.lockoutUntil - now) / 1000);
        return {
          success: false,
          error: `Too many failed attempts. Security cooldown active. Try again in ${remainingSec} seconds.`,
        };
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = SEED_USERS.find(u => u.username.toLowerCase() === cleanUsername);

      if (!user) {
        const attempts = state.failedAttempts + 1;
        const lockout = attempts >= 5 ? now + 30000 : null;
        set({ failedAttempts: attempts, lockoutUntil: lockout });
        return {
          success: false,
          error: attempts >= 5
            ? 'Account temporarily locked for 30 seconds due to 5 consecutive failed attempts.'
            : 'Invalid username or password. Please try again.',
        };
      }

      const inputHash = await sha256(passwordPlain);
      if (inputHash !== user.passwordHash) {
        const attempts = state.failedAttempts + 1;
        const lockout = attempts >= 5 ? now + 30000 : null;
        set({ failedAttempts: attempts, lockoutUntil: lockout });
        return {
          success: false,
          error: attempts >= 5
            ? 'Account temporarily locked for 30 seconds due to 5 consecutive failed attempts.'
            : 'Invalid username or password. Please try again.',
        };
      }

      // Success
      set({
        currentUser: user,
        isAuthenticated: true,
        failedAttempts: 0,
        lockoutUntil: null,
      });
      setStoredData(STORAGE_KEY_AUTH, user);
      return { success: true };
    },

    quickDemoLogin: async (role: UserRole) => {
      const user = SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
      set({
        currentUser: user,
        isAuthenticated: true,
        failedAttempts: 0,
        lockoutUntil: null,
      });
      setStoredData(STORAGE_KEY_AUTH, user);
    },

    logout: () => {
      set({
        currentUser: null,
        isAuthenticated: false,
      });
      clearStoredData(STORAGE_KEY_AUTH);
    },

    clearLockout: () => {
      set({ failedAttempts: 0, lockoutUntil: null });
    },
  };
});
