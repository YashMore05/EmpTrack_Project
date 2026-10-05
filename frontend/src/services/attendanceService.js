import api from './api';

export const attendanceService = {
  async getAttendance(params = {}) {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  async getAttendanceByEmployee(employeeId) {
    const response = await api.get(`/attendance/employee/${employeeId}`);
    return response.data;
  },

  async getTodayAttendance(employeeId) {
    const response = await api.get(`/attendance/today/${employeeId}`);
    return response.data;
  },

  async checkIn(employeeId) {
    const response = await api.post('/attendance/check-in', { employeeId });
    return response.data;
  },

  async checkOut(employeeId) {
    const response = await api.post('/attendance/check-out', { employeeId });
    return response.data;
  },

  async logManualAttendance(data) {
    const response = await api.post('/attendance/manual', data);
    return response.data;
  },
};
