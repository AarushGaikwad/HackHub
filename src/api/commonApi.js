import apiClient, { unwrap } from './client';

const ENDPOINTS = {
  HACKATHON_LIST: '/hackathon/hackathons'
};

export const getAllHackathons = () => unwrap(apiClient.get(ENDPOINTS.HACKATHON_LIST));


export const getHackathonById = (id) => unwrap(apiClient.get(ENDPOINTS.HACKATHON_BY_ID(id)));


export const searchHackathons = (keyword) =>
  unwrap(apiClient.get(ENDPOINTS.HACKATHON_SEARCH, { params: { keyword } }));


export const filterHackathonsByStatus = (status) =>
  unwrap(apiClient.get(ENDPOINTS.HACKATHON_FILTER, { params: { status } }));