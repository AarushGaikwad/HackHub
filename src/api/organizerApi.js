import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  // Hackathon management
  HACKATHON_CREATE: '/hackathon/create',
  HACKATHON_BY_ID: (id) => `/hackathon/${id}`,
  HACKATHON_UPDATE: (id) => `/hackathon/${id}`,
  HACKATHON_DELETE: (id) => `/hackathon/${id}`,
  HACKATHONS_BY_ORGANIZER: (organizerId) => `/hackathon/organizer/${organizerId}`,

  // Team registrations for a hackathon
  REGISTERED_TEAMS: (hackathonId) => `/hackathon/${hackathonId}/registered-teams`,
  REGISTRATION_STATUS_UPDATE: (hackathonId, teamId) =>
    `/hackathon/${hackathonId}/register-team/${teamId}/status`, // PUT ?userId=&status=

  // Judge assignment
  ASSIGN_JUDGE: (hackathonId, judgeId) => `/hackathon/${hackathonId}/assign-judge/${judgeId}`, // POST/DELETE ?organizerId=
  ASSIGNED_JUDGES: (hackathonId) => `/hackathon/${hackathonId}/judges`,

  // Certificates
  CERTIFICATES_GENERATE: (hackathonId) => `/certificate/generate/${hackathonId}`,
  CERTIFICATES_BY_HACKATHON: (hackathonId) => `/certificate/hackathon/${hackathonId}`,

  // Hackathon-level visibility
  SUBMISSIONS_BY_HACKATHON: (hackathonId) => `/submission/hackathon/${hackathonId}`,
  EVALUATIONS_BY_HACKATHON: (hackathonId) => `/evaluations/hackathon/${hackathonId}`,
  LEADERBOARD: (hackathonId) => `/evaluations/hackathon/${hackathonId}/leaderboard`,
};

// ── Hackathon Management 
export const createHackathon = (payload) => unwrap(apiClient.post(ENDPOINTS.HACKATHON_CREATE, payload));

export const getHackathonById = (id) => unwrap(apiClient.get(ENDPOINTS.HACKATHON_BY_ID(id)));

export const updateHackathon = (id, payload) => unwrap(apiClient.put(ENDPOINTS.HACKATHON_UPDATE(id), payload));

export const deleteHackathon = (id) => unwrap(apiClient.delete(ENDPOINTS.HACKATHON_DELETE(id)));

export const getHackathonsByOrganizer = (organizerId) =>
  unwrap(apiClient.get(ENDPOINTS.HACKATHONS_BY_ORGANIZER(organizerId)));

// ── Team Registrations 
export const getRegisteredTeams = (hackathonId) => unwrap(apiClient.get(ENDPOINTS.REGISTERED_TEAMS(hackathonId)));

export const updateRegistrationStatus = (hackathonId, teamId, userId, status) =>
  unwrap(
    apiClient.put(ENDPOINTS.REGISTRATION_STATUS_UPDATE(hackathonId, teamId), null, {
      params: { userId, status },
    })
  );

// ── Judge Assignment 
export const assignJudge = (hackathonId, judgeId, organizerId) =>
  unwrap(apiClient.post(ENDPOINTS.ASSIGN_JUDGE(hackathonId, judgeId), null, { params: { organizerId } }));

export const removeJudge = (hackathonId, judgeId, organizerId) =>
  unwrap(apiClient.delete(ENDPOINTS.ASSIGN_JUDGE(hackathonId, judgeId), { params: { organizerId } }));

export const getAssignedJudges = (hackathonId) => unwrap(apiClient.get(ENDPOINTS.ASSIGNED_JUDGES(hackathonId)));

// ── Certificates 
export const generateCertificates = (hackathonId) =>
  unwrap(apiClient.post(ENDPOINTS.CERTIFICATES_GENERATE(hackathonId)));

export const getHackathonCertificates = (hackathonId) =>
  unwrap(apiClient.get(ENDPOINTS.CERTIFICATES_BY_HACKATHON(hackathonId)));

// ── Hackathon-level visibility 
export const getHackathonSubmissions = (hackathonId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSIONS_BY_HACKATHON(hackathonId)));

export const getHackathonEvaluations = (hackathonId) =>
  unwrap(apiClient.get(ENDPOINTS.EVALUATIONS_BY_HACKATHON(hackathonId)));

export const getLeaderboard = (hackathonId) => unwrap(apiClient.get(ENDPOINTS.LEADERBOARD(hackathonId)));