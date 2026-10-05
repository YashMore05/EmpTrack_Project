import api from './api';

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  async getEmployeeDashboard(employeeId) {
    const response = await api.get(`/dashboard/employee/${employeeId}`);
    return response.data;
  },
};
