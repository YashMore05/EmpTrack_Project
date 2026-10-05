import api from './api';

export const leaveService = {
  async getAllLeaves(params = {}) {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  async getLeavesByEmployee(employeeId) {
    const response = await api.get(`/leaves/employee/${employeeId}`);
    return response.data;
  },

  async applyLeave(data) {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  async approveLeave(id) {
    const response = await api.put(`/leaves/${id}/approve`);
    return response.data;
  },

  async rejectLeave(id, rejectionReason) {
    const response = await api.put(`/leaves/${id}/reject`, { rejectionReason });
    return response.data;
  },

  async cancelLeave(id, employeeId) {
    const response = await api.put(`/leaves/${id}/cancel`, { employeeId });
    return response.data;
  },
};
