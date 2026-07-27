import api from './axiosConfig';

export const getAllHackathons = () => api.get('/hackathon/hackathons');

export const filterHackathons = (status) => api.get(`/hackathon/filter?status=${status}`);

export const getHackathonById = (id) => api.get(`/hackathon/${id}`);

export const getMyTeams = (userId) => api.get(`/teams/user/${userId}`);

export const getMyHackathons = (teamId) => api.get(`/hackathon/team/${teamId}/registrations`);

export const getMySubmissions = (userId) => api.get(`/submission/user/${userId}`);

export const getMyCertificates = () => api.get('/certificate/my');

export const downloadCertificate = (id) => api.get(`/certificate/${id}/download`, { responseType: 'blob' });