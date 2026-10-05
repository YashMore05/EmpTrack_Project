import api from './api';

export const leaveBalanceService = {
  async getLeaveBalance(employeeId) {
    const response = await api.get(`/leave-balance/${employeeId}`);
    return response.data;
  },

  async updateLeaveBalance(employeeId, data) {
    const response = await api.put(`/leave-balance/${employeeId}`, data);
    return response.data;
  },
};
