// FILE: src/api/client.ts
// PURPOSE: Configured to use a dynamic backend URL for both local and deployed environments.

import axios from 'axios';
import { useAppStore } from '../state/store';

// This line reads the backend URL from environment variables.
// When you deploy to Vercel, it will use the production URL you set.
// When you run locally, it will default to 'http://localhost:8000'.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


// --- TYPE DEFINITIONS ---
export interface ScheduleItem {
  day: string;
  time: string;
  content: string;
}

export interface LaunchKitResponse {
  id: string;
  market_analysis: string;
  product_copy: string;
  ad_copy: string;
  social_posts: string[];
  schedule: ScheduleItem[];
}

export interface HistoryItem {
    id: string;
    product_idea: string;
    created_at: string;
}

// --- AXIOS INSTANCE ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

// --- INTERCEPTORS ---
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    const { token } = useAppStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      if (config.headers) {
          delete config.headers['Content-Type'];
      }
    } else {
        if (config.headers) {
            config.headers['Content-Type'] = 'application/json';
        }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- API FUNCTIONS ---
export const fetchLaunchKit = async (productIdea: string, file?: File | null): Promise<LaunchKitResponse> => {
  try {
    const formData = new FormData();
    formData.append('product_idea', productIdea);

    if (file) {
      formData.append('file', file);
    }

    const response = await apiClient.post<LaunchKitResponse>('/api/v1/generate-launch-kit', formData);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) throw new Error('Authentication failed. Your session may have expired.');
        if (error.response?.status === 422) throw new Error('Invalid input. The server could not process the request.');
        if (error.response?.status >= 500) throw new Error('Server error. Please try again later.');
        if (error.code === 'ECONNREFUSED') throw new Error('Unable to connect to the server. Please check if the backend is running.');
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('The request took too long. Please try again with a smaller document.');
        }
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const scheduleToCalendar = async (kitId: string): Promise<{ message: string }> => {
    try {
        const response = await apiClient.post(`/api/v1/schedule/${kitId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Google Calendar access is not authorized.');
            }
        }
        throw new Error('Failed to schedule posts. Please try again.');
    }
};

export const fetchHistoryList = async (): Promise<HistoryItem[]> => {
    try {
        const response = await apiClient.get<HistoryItem[]>('/api/v1/history');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch history.');
    }
};

export const fetchHistoryItem = async (kitId: string): Promise<LaunchKitResponse> => {
    try {
        const response = await apiClient.get<LaunchKitResponse>(`/api/v1/history/${kitId}`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch launch kit details.');
    }
};

export default apiClient;
