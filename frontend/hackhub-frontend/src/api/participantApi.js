import api from './axiosConfig';

export const getAllHackathons = () => api.get('/hackathon/hackathons');

export const filterHackathons = (status) => api.get(`/hackathon/filter?status=${status}`);

export const getHackathonById = (id) => api.get(`/hackathon/${id}`);

export const getMyTeams = (userId) => api.get(`/teams/user/${userId}`);

export const getMyHackathons = (teamId) => api.get(`/hackathon/team/${teamId}/registrations`);

export const getMySubmissions = (userId) => api.get(`/submission/user/${userId}`);

export const getMyCertificates = () => api.get('/certificate/my');

export const downloadCertificate = (id) => api.get(`/certificate/${id}/download`, { responseType: 'blob' });

export const createTeam = (data) => api.post('/teams/create', data);

export const joinTeam = (code) => api.post(`/teams/join?code=${code}`);

export const leaveTeam = (teamId) => api.delete(`/teams/${teamId}/leave`);

export const deleteTeam = (teamId) => api.delete(`/teams/${teamId}`);

export const getTeamMembers = (teamId) => api.get(`/teams/${teamId}/members`);

export const transferLeader = (teamId, newLeaderId) => api.put(`/teams/${teamId}/transfer-leader?newLeaderId=${newLeaderId}`);

export const registerTeamForHackathon = (hackathonId, teamId) => api.post(`/hackathon/${hackathonId}/register-team/${teamId}`);

export const withdrawTeam = (hackathonId, teamId) => api.delete(`/hackathon/${hackathonId}/register-team/${teamId}`);

export const getTeamRegistrations = (teamId) => api.get(`/hackathon/team/${teamId}/registrations`);

export const submitProgress = (data) => api.post('/submission/progress', data);

export const submitFinal = (data) => api.post('/submission/final', data);

export const editSubmission = (id, data) => api.put(`/submission/progress/${id}`, data);

export const deleteSubmission = (id) => api.delete(`/submission/progress/${id}`);

export const getTeamSubmissions = (teamRegId) => api.get(`/submission/team/${teamRegId}`);

export const getUserById = (userId) => api.get(`/admin/users/${userId}`);