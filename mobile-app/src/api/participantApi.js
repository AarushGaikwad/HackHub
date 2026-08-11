import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  // Teams
  TEAM_BY_ID: (teamId) => `/teams/${teamId}`,
  TEAM_MEMBERS: (teamId) => `/teams/${teamId}/members`,
  TEAMS_BY_USER: (userId) => `/teams/user/${userId}`,
  TEAM_CREATE: '/teams/create',
  TEAM_DELETE: (teamId) => `/teams/${teamId}`,
  TEAM_JOIN: '/teams/join',                              // POST ?code=&userId=
  TEAM_TRANSFER_LEADER: (teamId) => `/teams/${teamId}/transfer-leader`, // PUT ?newLeaderId=
  TEAM_LEAVE: (teamId) => `/teams/${teamId}/leave`,
  TEAM_BY_INVITE_CODE: '/teams/invite',                  // GET ?code=
  TEAM_IS_LEADER: (teamId) => `/teams/${teamId}/is-leader`, // GET ?userId=

  // Team Registration (hackathon side, participant actions)
  TEAM_REGISTER: (hackathonId, teamId) => `/hackathon/${hackathonId}/register-team/${teamId}`,
  TEAM_WITHDRAW: (hackathonId, teamId) => `/hackathon/${hackathonId}/register-team/${teamId}`,
  TEAM_REGISTRATIONS: (teamId) => `/hackathon/team/${teamId}/registrations`,
  USER_PARTICIPATED_HACKATHONS: (userId) => `/hackathon/user/${userId}/hackathons`,

  // Submissions
  SUBMISSION_PROGRESS: '/submission/progress',
  SUBMISSION_FINAL: '/submission/final',
  SUBMISSION_PROGRESS_EDIT: (submissionId) => `/submission/progress/${submissionId}`,
  SUBMISSION_PROGRESS_DELETE: (submissionId) => `/submission/progress/${submissionId}`,
  SUBMISSION_BY_ID: (submissionId) => `/submission/${submissionId}`,
  SUBMISSION_FINAL_BY_TEAM_REG: (teamRegistrationId) => `/submission/final/${teamRegistrationId}`,
  SUBMISSIONS_BY_TEAM_REG: (teamRegistrationId) => `/submission/team/${teamRegistrationId}`,
  SUBMISSIONS_BY_USER: (userId) => `/submission/user/${userId}`,
  SUBMISSIONS_PROGRESS_BY_TEAM_REG: (teamRegistrationId) => `/submission/team/${teamRegistrationId}/progress`,

  // Certificates
  CERTIFICATES_MY: '/certificate/my',
  CERTIFICATE_DOWNLOAD: (certificateId) => `/certificate/${certificateId}/download`,
};

// ── Teams 
export const getTeamById = (teamId) => unwrap(apiClient.get(ENDPOINTS.TEAM_BY_ID(teamId)));

export const getTeamMembers = (teamId) => unwrap(apiClient.get(ENDPOINTS.TEAM_MEMBERS(teamId)));

export const getTeamsByUser = (userId) => unwrap(apiClient.get(ENDPOINTS.TEAMS_BY_USER(userId)));

// TeamRequestDto — confirm exact field names once you share that DTO;
// `name` is used here as the reasonable inferred field.
export const createTeam = (payload) => unwrap(apiClient.post(ENDPOINTS.TEAM_CREATE, payload));

export const deleteTeam = (teamId) => unwrap(apiClient.delete(ENDPOINTS.TEAM_DELETE(teamId)));


export const joinTeam = (code, userId) =>
  unwrap(apiClient.post(ENDPOINTS.TEAM_JOIN, null, { params: { code, userId } }));

export const transferLeadership = (teamId, newLeaderId) =>
  unwrap(apiClient.put(ENDPOINTS.TEAM_TRANSFER_LEADER(teamId), null, { params: { newLeaderId } }));

export const leaveTeam = (teamId) => unwrap(apiClient.delete(ENDPOINTS.TEAM_LEAVE(teamId)));

export const getTeamByInviteCode = (code) =>
  unwrap(apiClient.get(ENDPOINTS.TEAM_BY_INVITE_CODE, { params: { code } }));

export const isUserLeader = (teamId, userId) =>
  unwrap(apiClient.get(ENDPOINTS.TEAM_IS_LEADER(teamId), { params: { userId } }));

// ── Team Registration ──────────────────────────────────────────────────
export const registerTeamForHackathon = (hackathonId, teamId) =>
  unwrap(apiClient.post(ENDPOINTS.TEAM_REGISTER(hackathonId, teamId)));

export const withdrawTeam = (hackathonId, teamId) =>
  unwrap(apiClient.delete(ENDPOINTS.TEAM_WITHDRAW(hackathonId, teamId)));

export const getTeamRegistrations = (teamId) =>
  unwrap(apiClient.get(ENDPOINTS.TEAM_REGISTRATIONS(teamId)));

export const getUserParticipatedHackathons = (userId) =>
  unwrap(apiClient.get(ENDPOINTS.USER_PARTICIPATED_HACKATHONS(userId)));

// ── Submissions ─────────────────────────────────────────────────────────
// ProgressSubmissionRequestDto / FinalSubmissionRequestDto — confirm exact
// field names once shared; payload is passed through as-is for now.
export const submitProgress = (payload) => unwrap(apiClient.post(ENDPOINTS.SUBMISSION_PROGRESS, payload));

export const submitFinal = (payload) => unwrap(apiClient.post(ENDPOINTS.SUBMISSION_FINAL, payload));

export const editProgressSubmission = (submissionId, payload) =>
  unwrap(apiClient.put(ENDPOINTS.SUBMISSION_PROGRESS_EDIT(submissionId), payload));

export const deleteProgressSubmission = (submissionId) =>
  unwrap(apiClient.delete(ENDPOINTS.SUBMISSION_PROGRESS_DELETE(submissionId)));

export const getSubmissionById = (submissionId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSION_BY_ID(submissionId)));

export const getFinalSubmission = (teamRegistrationId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSION_FINAL_BY_TEAM_REG(teamRegistrationId)));

export const getTeamSubmissions = (teamRegistrationId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSIONS_BY_TEAM_REG(teamRegistrationId)));

export const getUserSubmissions = (userId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSIONS_BY_USER(userId)));

export const getTeamProgressSubmissions = (teamRegistrationId) =>
  unwrap(apiClient.get(ENDPOINTS.SUBMISSIONS_PROGRESS_BY_TEAM_REG(teamRegistrationId)));

// ── Certificates ────────────────────────────────────────────────────────
export const getMyCertificates = () => unwrap(apiClient.get(ENDPOINTS.CERTIFICATES_MY));

// Binary PDF response — do not run through unwrap().
export const downloadCertificate = (certificateId) =>
  apiClient.get(ENDPOINTS.CERTIFICATE_DOWNLOAD(certificateId), { responseType: 'arraybuffer' });