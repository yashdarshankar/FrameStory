import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${import.meta.env.VITE_API_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const token = response.data.access_token;
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });

    // Setup generic axios header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
    delete axios.defaults.headers.common['Authorization'];
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}));
