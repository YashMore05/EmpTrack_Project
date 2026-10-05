import api from './api';

const USER_KEY = 'employee_tracking_user';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'ADMIN';
  },

  isEmployee() {
    const user = this.getCurrentUser();
    return user && user.role === 'EMPLOYEE';
  },
};
