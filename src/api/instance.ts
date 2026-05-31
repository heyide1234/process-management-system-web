import api from './request'

export interface ProcessInstance {
  id: string
  definitionId: string
  businessKey: string | null
  caseInstanceId: string | null
  ended: boolean
  suspended: boolean
  tenantId: string | null
}

export interface ActivityInstance {
  id: string
  parentActivityInstanceId: string | null
  activityId: string
  activityName: string
  activityType: string
  processInstanceId: string
  processDefinitionId: string
  childActivityInstances: ActivityInstance[]
  childTransitionInstances: any[]
  executionIds: string[]
  incidentIds: string[]
  name: string
  incidentIdsCount: number
}

export interface VariableValue {
  value: any
  type: string
  valueInfo?: Record<string, any>
}

export interface ProcessInstanceQueryParams {
  processDefinitionKey?: string
  processDefinitionId?: string
  businessKey?: string
  businessKeyLike?: string
  suspended?: boolean
  active?: boolean
  sortBy?: 'instanceId' | 'definitionKey' | 'definitionId' | 'tenantId' | 'businessKey'
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}

export function getProcessInstances(params?: ProcessInstanceQueryParams) {
  return api.get<ProcessInstance[]>('/engine-rest/process-instance', { params })
}

export function getProcessInstanceCount(params?: ProcessInstanceQueryParams) {
  return api.get<{ count: number }>('/engine-rest/process-instance/count', { params })
}

export function getProcessInstance(id: string) {
  return api.get<ProcessInstance>('/engine-rest/process-instance/' + id)
}

export function deleteProcessInstance(id: string) {
  return api.delete('/engine-rest/process-instance/' + id)
}

export function suspendProcessInstance(id: string) {
  return api.put('/engine-rest/process-instance/' + id + '/suspended', { suspended: true })
}

export function activateProcessInstance(id: string) {
  return api.put('/engine-rest/process-instance/' + id + '/suspended', { suspended: false })
}

export function getActivityInstances(id: string) {
  return api.get<{ [key: string]: ActivityInstance }>(
    '/engine-rest/process-instance/' + id + '/activity-instances'
  )
}

export function getInstanceVariables(id: string) {
  return api.get<Record<string, VariableValue>>(
    '/engine-rest/process-instance/' + id + '/variables'
  )
}
