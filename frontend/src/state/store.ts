import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient, { fetchLaunchKit, LaunchKitResponse, scheduleToCalendar, HistoryItem, fetchHistoryList, fetchHistoryItem } from '../api/client';

interface AppState {
  // State
  isLoading: boolean;
  error: string | null;
  launchKit: LaunchKitResponse | null;
  token: string | null;
  user: { id: string } | null;
  historyList: HistoryItem[] | null;
  isScheduling: boolean;
  scheduleStatus: { success?: string; error?: string } | null;

  // Actions
  generateLaunchKit: (productIdea: string, file?: File | null) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  login: (email, password) => Promise<boolean>;
  signup: (email, password) => Promise<boolean>;
  logout: () => void;
  fetchHistory: () => Promise<void>;
  fetchKitDetails: (kitId: string) => Promise<void>;
  pushScheduleToCalendar: (kitId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      launchKit: null,
      token: null,
      user: null,
      historyList: null,
      isScheduling: false,
      scheduleStatus: null,

      // Actions
      generateLaunchKit: async (productIdea: string, file?: File | null) => {
        if (!productIdea.trim()) {
          set({ error: 'Please enter a product idea' });
          return;
        }
        set({ isLoading: true, error: null, launchKit: null, scheduleStatus: null });
        try {
          const result = await fetchLaunchKit(productIdea, file);
          set({ launchKit: result, isLoading: false, error: null });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An unexpected error occurred', isLoading: false, launchKit: null });
        }
      },
      clearError: () => set({ error: null }),
      reset: () => set({ isLoading: false, error: null, launchKit: null, scheduleStatus: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/api/v1/auth/login', { email, password });
          const { access_token, user_id } = response.data;
          set({ token: access_token, user: { id: user_id }, isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      signup: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/api/v1/auth/signup', { email, password });
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Signup failed. The email might already be in use.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      logout: () => {
        set({ token: null, user: null, launchKit: null, historyList: null });
      },

fetchHistory: async () => {
  set({ isLoading: true, error: null });
  try {
      const history = await fetchHistoryList();
      if (Array.isArray(history)) {
          set({ historyList: history, isLoading: false });
      } else {
          set({ error: 'Invalid history data received from server', isLoading: false, historyList: [] });
      }
  } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load history', isLoading: false, historyList: [] });
  }
},
      fetchKitDetails: async (kitId: string) => {
        set({ isLoading: true, error: null, launchKit: null });
        try {
            const kitDetails = await fetchHistoryItem(kitId);
            set({ launchKit: kitDetails, isLoading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to load kit details', isLoading: false });
        }
      },

      pushScheduleToCalendar: async (kitId: string) => {
        set({ isScheduling: true, scheduleStatus: null });
        try {
            const result = await scheduleToCalendar(kitId);
            set({ isScheduling: false, scheduleStatus: { success: result.message } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            set({ isScheduling: false, scheduleStatus: { error: errorMessage } });
        }
      },
    }),
    {
      name: 'marketforge-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
