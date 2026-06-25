import api from './request'

export interface CamundaUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface CamundaUserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
}

export function getUserCount(params?: {
  id?: string
  firstNameLike?: string
  emailLike?: string
}) {
  return api.get<{ count: number }>('/engine-rest/user/count', { params })
}

export function getUsers(params?: {
  id?: string
  firstNameLike?: string
  emailLike?: string
  firstResult?: number
  maxResults?: number
}) {
  return api.get<CamundaUser[]>('/engine-rest/user', { params })
}

export function getUser(userId: string) {
  return api.get<CamundaUserProfile>(`/engine-rest/user/${userId}/profile`)
}

export function createUser(data: {
  profile: { id: string; firstName: string; lastName: string; email: string }
  credentials: { password: string }
}) {
  return api.post('/engine-rest/user/create', data)
}

export function updateUserProfile(userId: string, data: {
  id: string
  firstName: string
  lastName: string
  email: string
}) {
  return api.put(`/engine-rest/user/${userId}/profile`, data)
}

export function updateUserCredentials(userId: string, data: {
  password: string
  authenticatedUserPassword: string
}) {
  return api.put(`/engine-rest/user/${userId}/credentials`, data)
}

export function deleteUser(userId: string) {
  return api.delete(`/engine-rest/user/${userId}`)
}

export function getUserGroups(userId: string) {
  return api.get<{ groups: { id: string; name: string }[]; groupUsers: unknown[] }>(
    '/engine-rest/identity/groups',
    { params: { userId } }
  )
}