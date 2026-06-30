import api from './request'

export interface Task {
  id: string
  name: string
  assignee: string | null
  created: string
  due: string | null
  followUp: string | null
  delegationState: string | null
  description: string | null
  executionId: string
  owner: string | null
  parentTaskId: string | null
  priority: number
  processDefinitionId: string
  processInstanceId: string
  taskDefinitionKey: string
  caseExecutionId: string | null
  caseInstanceId: string | null
  caseDefinitionId: string | null
  suspended: boolean
  formKey: string | null
  tenantId: string | null
}

export function getTasks(params?: {
  assignee?: string
  candidateGroup?: string
  candidateUser?: string
  processInstanceId?: string
  processDefinitionKey?: string
  processDefinitionName?: string
  taskDefinitionKey?: string
  taskDefinitionKeyLike?: string
  name?: string
  nameLike?: string
  suspended?: boolean
  active?: boolean
  priority?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<Task[]>('/engine-rest/task', { params })
}

export function getTaskCount(params?: {
  assignee?: string
  candidateGroup?: string
  candidateUser?: string
}) {
  return api.get<{ count: number }>('/engine-rest/task/count', { params })
}

export function getHistoricTaskInstanceCount(data?: {
  taskAssignee?: string
  finished?: boolean
  unfinished?: boolean
}) {
  return api.post<{ count: number }>('/engine-rest/history/task/count', data)
}

export function getTask(id: string) {
  return api.get<Task>('/engine-rest/task/' + id)
}

export function claimTask(id: string, userId: string) {
  return api.post('/engine-rest/task/' + id + '/claim', { userId })
}

export function unclaimTask(id: string) {
  return api.post('/engine-rest/task/' + id + '/unclaim')
}

export function completeTask(id: string, variables?: Record<string, { value: any; type?: string }>) {
  return api.post('/engine-rest/task/' + id + '/complete', { variables: variables || {} })
}

export function delegateTask(id: string, userId: string) {
  return api.post('/engine-rest/task/' + id + '/delegate', { userId })
}

export function resolveTask(id: string) {
  return api.post('/engine-rest/task/' + id + '/resolve')
}

export function getTaskVariables(id: string) {
  return api.get<Record<string, { value: any; type: string }>>(
    '/engine-rest/task/' + id + '/variables'
  )
}
