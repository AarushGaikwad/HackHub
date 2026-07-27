import api from './axiosConfig'

export const loginUser = (data) => {
    api.post('/login', data)
}

export const registerParticipant = (data) => {
    api.post('/user/register/participant', data)
}

export const registerOrganizer = (data) => {
    api.post('/user/register/organizer', data)
}

export const registerJudge = (data) => {
    api.post('/user/register/judge', data)
}