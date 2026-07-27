import api from './axiosConfig'

export const getOverviewStats = () => api.get('/admin/stats/overview');

export const getAllUsers = () => api.get('/admin/users');

export const getUsersByRole = (role) => api.get(`/admin/users/role/${role}`);

export const approveOrganizer = (userId) => api.put(`/admin/users/${userId}/approve`);

export const rejectOrganizer = (userId) => api.put(`/admin/users/${userId}/reject`);

export const getAllHackathons = () => api.get('/admin/hackathons');

export const deleteHackathon = (id) => api.delete(`/admin/hackathons/${id}`);

export const getAllCertificates = () => api.get('/admin/certificates');

export const getAllOrganizations = () => api.get('/organization/organizations');