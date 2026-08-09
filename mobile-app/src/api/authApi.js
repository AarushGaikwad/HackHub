import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  LOGIN: '/login',
  REGISTER_PARTICIPANT: '/user/register/participant',
  REGISTER_ORGANIZER: '/user/register/organizer',
  REGISTER_JUDGE: '/user/register/judge',
};


export const login = (email, password) =>
  unwrap(apiClient.post(ENDPOINTS.LOGIN, { email, password }));


export const registerParticipant = ({ name, collegeName, email, password, confirmPassword }) =>
  unwrap(
    apiClient.post(ENDPOINTS.REGISTER_PARTICIPANT, {
      name,
      collegeName,
      email,
      password,
      confirmPassword,
    })
  );


// status will be PENDING until an admin approves — surface this in the UI after registering.
export const registerOrganizer = ({ name, email, organizationName, password, confirmPassword }) =>
  unwrap(
    apiClient.post(ENDPOINTS.REGISTER_ORGANIZER, {
      name,
      email,
      organizationName,
      password,
      confirmPassword,
    })
  );


export const registerJudge = ({ name, email, designation, password, confirmPassword }) =>
  unwrap(
    apiClient.post(ENDPOINTS.REGISTER_JUDGE, {
      name,
      email,
      designation,
      password,
      confirmPassword,
    })
  );