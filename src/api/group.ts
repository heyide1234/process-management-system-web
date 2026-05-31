import api from './request'
import type { CamundaUser } from './user'

export interface CamundaGroup {
  id: string
  name: string
  type: string
}

export function getGroups(params?: {
  id?: string
  name?: string
  type?: string
}) {
  return api.get<CamundaGroup[]>('/engine-rest/group', { params })
}

export function getGroup(groupId: string) {
  return api.get<CamundaGroup>(`/engine-rest/group/${groupId}`)
}

export function createGroup(data: { id: string; name: string; type?: string }) {
  return api.post('/engine-rest/group/create', data)
}

export function updateGroup(groupId: string, data: { name?: string; type?: string }) {
  return api.put(`/engine-rest/group/${groupId}`, data)
}

export function deleteGroup(groupId: string) {
  return api.delete(`/engine-rest/group/${groupId}`)
}

export function getGroupMembers(groupId: string) {
  return api.get<CamundaUser[]>('/engine-rest/user', {
    params: { memberOfGroup: groupId }
  })
}

export function addGroupMember(groupId: string, userId: string) {
  return api.put(`/engine-rest/group/${groupId}/members/${userId}`)
}

export function removeGroupMember(groupId: string, userId: string) {
  return api.delete(`/engine-rest/group/${groupId}/members/${userId}`)
}