import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  HACKATHON_LIST: '/hackathon/hackathons',
  HACKATHON_BY_ID: (id) => `/hackathon/${id}`,
  // ORGANIZER-only on the backend — kept here for organizer/admin callers.
  // BrowseHackathonsScreen (participant-facing) intentionally filters
  // client-side instead of calling this. See the note there.
  HACKATHON_SEARCH: '/hackathon/search',
  HACKATHON_FILTER: '/hackathon/filter',
};

export const getAllHackathons = () => unwrap(apiClient.get(ENDPOINTS.HACKATHON_LIST));

export const getHackathonById = (id) => unwrap(apiClient.get(ENDPOINTS.HACKATHON_BY_ID(id)));

export const searchHackathons = (keyword) =>
  unwrap(apiClient.get(ENDPOINTS.HACKATHON_SEARCH, { params: { keyword } }));

export const filterHackathonsByStatus = (status) =>
  unwrap(apiClient.get(ENDPOINTS.HACKATHON_FILTER, { params: { status } }));