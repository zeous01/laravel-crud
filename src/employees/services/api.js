import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const employeeApi = {
  getAll: (params = {}) => axios.get(`${API_URL}/employees`, { params }),
  getOne: (id) => axios.get(`${API_URL}/employees/${id}`),
  create: (data) => axios.post(`${API_URL}/employees`, data),
  update: (id, data) => axios.put(`${API_URL}/employees/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/employees/${id}`),


  getFamilies: (employeeId) => axios.get(`${API_URL}/employees/${employeeId}/families`),
  addFamily: (employeeId, data) => axios.post(`${API_URL}/employees/${employeeId}/families`, data),
  updateFamily: (employeeId, familyId, data) => axios.put(`${API_URL}/employees/${employeeId}/families/${familyId}`, data),
  deleteFamily: (employeeId, familyId) => axios.delete(`${API_URL}/employees/${employeeId}/families/${familyId}`),
};