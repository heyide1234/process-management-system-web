import api from './request'

export interface HistoricTaskInstance {
  id: string
  processDefinitionKey: string
  processDefinitionId: string
  processInstanceId: string
  executionId: string
  activityInstanceId: string | null
  name: string
  description: string | null
  deleteReason: string | null
  owner: string | null
  assignee: string | null
  startTime: string
  endTime: string | null
  duration: number | null
  taskDefinitionKey: string
  priority: number
  due: string | null
  parentTaskId: string | null
  followUp: string | null
  tenantId: string | null
  removalTime: string | null
  rootProcessInstanceId: string
  formKey: string | null
}

export interface HistoricVariableInstance {
  id: string
  name: string
  type: string
  value: any
  valueInfo: object
  processInstanceId: string
  processDefinitionKey: string
  processDefinitionId: string
  executionId: string
  activityInstanceId: string
  taskId: string
  tenantId: string | null
  errorMessage: string | null
  state: string
  createTime: string
  removalTime: string | null
  rootProcessInstanceId: string
}

export interface HistoricProcessInstance {
  id: string
  businessKey: string | null
  processDefinitionId: string
  processDefinitionKey: string
  processDefinitionName: string | null
  processDefinitionVersion: number
  startTime: string
  endTime: string | null
  durationInMillis: number | null
  startUserId: string | null
  startActivityId: string | null
  endActivityId: string | null
  deleteReason: string | null
  superProcessInstanceId: string | null
  superCaseInstanceId: string | null
  caseInstanceId: string | null
  tenantId: string | null
  state: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'INTERNALLY_TERMINATED' | 'EXTERNALLY_TERMINATED'
}

export function getHistoricTasks(params?: {
  taskId?: string
  taskIdIn?: string
  taskParentTaskId?: string
  processInstanceId?: string
  processInstanceBusinessKey?: string
  processInstanceBusinessKeyIn?: string
  processDefinitionKey?: string
  processDefinitionId?: string
  executionId?: string
  caseDefinitionKey?: string
  caseDefinitionId?: string
  caseExecutionId?: string
  activityInstanceIdIn?: string
  taskName?: string
  taskNameLike?: string
  taskDescription?: string
  taskDescriptionLike?: string
  taskDefinitionKey?: string
  taskDeleteReason?: string
  taskDeleteReasonLike?: string
  taskAssignee?: string
  taskAssigneeLike?: string
  taskOwner?: string
  taskOwnerLike?: string
  taskPriority?: number
  assigned?: boolean
  unassigned?: boolean
  finished?: boolean
  unfinished?: boolean
  processFinished?: boolean
  processUnfinished?: boolean
  taskDueDate?: string
  taskDueDateBefore?: string
  taskDueDateAfter?: string
  taskFollowUpDate?: string
  taskFollowUpDateBefore?: string
  taskFollowUpDateAfter?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<HistoricTaskInstance[]>('/engine-rest/history/task', { params })
}

export function getHistoricVariableInstances(params?: {
  variableName?: string
  variableNameLike?: string
  processInstanceId?: string
  processInstanceIdIn?: string
  executionIdIn?: string
  taskIdIn?: string
  activityInstanceIdIn?: string
  caseExecutionIdIn?: string
  caseInstanceIdIn?: string
  variableValuesIgnoreCase?: boolean
  variableValuesLike?: boolean
  deserializeValues?: boolean
  tenantIdIn?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<HistoricVariableInstance[]>('/engine-rest/history/variable-instance', { params })
}

export function getHistoricProcessInstances(params?: {
  processInstanceId?: string
  processInstanceIds?: string
  processDefinitionKey?: string
  processDefinitionId?: string
  businessKey?: string
  businessKeyLike?: string
  startedBy?: string
  finished?: boolean
  unfinished?: boolean
  startActivityIdIn?: string
  tenantIdIn?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<HistoricProcessInstance[]>('/engine-rest/history/process-instance', { params })
}

export interface HistoricActivityInstance {
  id: string
  parentActivityInstanceId: string | null
  activityId: string
  activityName: string
  activityType: string
  processDefinitionKey: string
  processDefinitionId: string
  processInstanceId: string
  executionId: string
  taskId: string | null
  calledProcessInstanceId: string | null
  calledCaseInstanceId: string | null
  assignee: string | null
  startTime: string
  endTime: string | null
  durationInMillis: number | null
  canceled: boolean
  completeScope: boolean
  tenantId: string | null
  removalTime: string | null
  rootProcessInstanceId: string
}

export function getHistoricActivityInstances(params?: {
  activityInstanceId?: string
  processInstanceId?: string
  processDefinitionId?: string
  executionId?: string
  activityId?: string
  activityName?: string
  activityType?: string
  taskAssignee?: string
  finished?: boolean
  unfinished?: boolean
  canceled?: boolean
  completeScope?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<HistoricActivityInstance[]>('/engine-rest/history/activity-instance', { params })
}
