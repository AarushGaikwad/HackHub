import api from './axiosConfig';

export const getJudgeHackathons = (judgeId) => api.get(`/judges/${judgeId}/hackathons`);

export const getPendingSubmissions = (judgeId) => api.get(`/evaluations/judge/${judgeId}/pending`);

export const getJudgeEvaluations = (judgeId) => api.get(`/evaluations/judge/${judgeId}`);

export const getJudgeStats = (judgeId) => api.get(`/evaluations/judge/${judgeId}/stats`);

export const getSubmissionsWithStatus = (judgeId) => api.get(`/evaluations/judge/${judgeId}/submissions/status`);

export const getLeaderboard = (hackathonId) => api.get(`/evaluations/hackathon/${hackathonId}/leaderboard`);

export const submitEvaluation = (data) => api.post('/evaluations', data);

export const updateEvaluation = (id, data) => api.put(`/evaluations/${id}`, data);

export const getSubmissionEvaluations = (submissionId) => api.get(`/evaluations/submission/${submissionId}`);