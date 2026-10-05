import api from './api';

export const employeeService = {
  async getAllEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async getEmployeeByUserId(userId) {
    const response = await api.get(`/employees/user/${userId}`);
    return response.data;
  },

  async createEmployee(data) {
    const response = await api.post('/employees', data);
    return response.data;
  },

  async updateEmployee(id, data) {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  async deactivateEmployee(id) {
    const response = await api.put(`/employees/${id}/deactivate`);
    return response.data;
  },

  async activateEmployee(id) {
    const response = await api.put(`/employees/${id}/activate`);
    return response.data;
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};
