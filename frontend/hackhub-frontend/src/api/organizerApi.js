import api from './axiosConfig';

export const createHackathon = (data) => api.post('/hackathon/create', data);

export const getMyHackathons = (organizerId) => api.get(`/hackathon/organizer/${organizerId}`);

export const updateHackathon = (id, data) => api.put(`/hackathon/${id}`, data);

export const deleteHackathon = (id) => api.delete(`/hackathon/${id}`);

export const filterHackathons = (status) => api.get(`/hackathon/filter?status=${status}`);

export const getRegisteredTeams = (hackathonId) => api.get(`/hackathon/${hackathonId}/registered-teams`);

export const getHackathonEvaluations = (hackathonId) => api.get(`/evaluations/hackathon/${hackathonId}`);

export const getLeaderboard = (hackathonId) => api.get(`/evaluations/hackathon/${hackathonId}/leaderboard`);

export const generateCertificates = (hackathonId) => api.post(`/certificate/generate/${hackathonId}`);

export const getAssignedJudges = (hackathonId) => api.get(`/hackathon/${hackathonId}/judges`);

export const assignJudge = (hackathonId, judgeId, organizerId) => api.post(`/hackathon/${hackathonId}/assign-judge/${judgeId}?organizerId=${organizerId}`);

export const removeJudge = (hackathonId, judgeId, organizerId) => api.delete(`/hackathon/${hackathonId}/assign-judge/${judgeId}?organizerId=${organizerId}`);

export const getAllOrganizations = () => api.get('/organization/organizations');

export const getAllUsers = () => api.get('/admin/users');