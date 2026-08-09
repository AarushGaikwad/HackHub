import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  JUDGE_HACKATHONS: (judgeId) => `/judges/${judgeId}/hackathons`,

  EVALUATIONS_CREATE: '/evaluations',
  EVALUATION_UPDATE: (evaluationId) => `/evaluations/${evaluationId}`,
  EVALUATION_BY_ID: (evaluationId) => `/evaluations/${evaluationId}`,
  EVALUATIONS_BY_SUBMISSION: (submissionId) => `/evaluations/submission/${submissionId}`,
  EVALUATIONS_BY_JUDGE: (judgeId) => `/evaluations/judge/${judgeId}`,
  EVALUATIONS_JUDGE_PENDING: (judgeId) => `/evaluations/judge/${judgeId}/pending`,
  EVALUATIONS_JUDGE_STATS: (judgeId) => `/evaluations/judge/${judgeId}/stats`,
  JUDGE_SUBMISSION_STATUS: (judgeId) => `/evaluations/judge/${judgeId}/submissions/status`,
  LEADERBOARD: (hackathonId) => `/evaluations/hackathon/${hackathonId}/leaderboard`,


  SUBMISSION_BY_ID: (submissionId) => `/submission/${submissionId}`,
};

export const getJudgeHackathons = (judgeId) => unwrap(apiClient.get(ENDPOINTS.JUDGE_HACKATHONS(judgeId)));

export const submitEvaluation = (payload) => unwrap(apiClient.post(ENDPOINTS.EVALUATIONS_CREATE, payload));

export const updateEvaluation = (evaluationId, payload) =>
  unwrap(apiClient.put(ENDPOINTS.EVALUATION_UPDATE(evaluationId), payload));

export const getEvaluationById = (evaluationId) => unwrap(apiClient.get(ENDPOINTS.EVALUATION_BY_ID(evaluationId)));

export const getSubmissionEvaluations = (submissionId) =>
  unwrap(apiClient.get(ENDPOINTS.EVALUATIONS_BY_SUBMISSION(submissionId)));

export const getJudgeEvaluations = (judgeId) => unwrap(apiClient.get(ENDPOINTS.EVALUATIONS_BY_JUDGE(judgeId)));

export const getPendingSubmissions = (judgeId) => unwrap(apiClient.get(ENDPOINTS.EVALUATIONS_JUDGE_PENDING(judgeId)));

export const getJudgeStats = (judgeId) => unwrap(apiClient.get(ENDPOINTS.EVALUATIONS_JUDGE_STATS(judgeId)));

export const getSubmissionEvaluationStatus = (judgeId) =>
  unwrap(apiClient.get(ENDPOINTS.JUDGE_SUBMISSION_STATUS(judgeId)));

export const getLeaderboard = (hackathonId) => unwrap(apiClient.get(ENDPOINTS.LEADERBOARD(hackathonId)));

export const getSubmissionById = (submissionId) => unwrap(apiClient.get(ENDPOINTS.SUBMISSION_BY_ID(submissionId)));