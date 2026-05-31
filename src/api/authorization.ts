import api from './request'

export interface AuthorizationDto {
  id: string
  type: number
  permissions: string[]
  userId: string | null
  groupId: string | null
  resourceType: number
  resourceId: string | null
  removalTime?: string | null
  rootProcessInstanceId?: string | null
}

export interface AuthorizationCreateDto {
  type?: number
  permissions?: string[]
  userId?: string | null
  groupId?: string | null
  resourceType?: number
  resourceId?: string | null
}

export interface AuthorizationUpdateDto {
  permissions?: string[]
  userId?: string | null
  groupId?: string | null
  resourceType?: number
  resourceId?: string | null
}

export interface AuthorizationCheckResultDto {
  permissionName: string | null
  resourceName: string | null
  resourceId: string | null
  authorized: boolean | null
}

export interface AuthorizationQueryParams {
  id?: string
  type?: number
  userIdIn?: string
  groupIdIn?: string
  resourceType?: number
  resourceId?: string
  sortBy?: 'resourceType' | 'resourceId'
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}

export const RESOURCE_TYPES: Record<number, string> = {
  0: 'Application',
  1: 'User',
  2: 'Group',
  3: 'Group membership',
  4: 'Authorization',
  5: 'Filter',
  6: 'ProcessDefinition',
  7: 'Task',
  8: 'ProcessInstance',
  9: 'Deployment',
  10: 'DecisionDefinition',
  11: 'Tenant',
  12: 'TenantMembership',
  13: 'Batch',
  14: 'DecisionRequirementsDefinition',
  15: 'Report',
  16: 'Dashboard',
  17: 'OperationLogCatgeory',
  18: 'Optimize',
  19: 'HistoricTask',
  20: 'HistoricProcessInstance',
  21: 'System'
}

export const RESOURCE_TYPES_CN: Record<string, string> = {
  Application: '应用',
  User: '用户',
  Group: '组',
  'Group membership': '组成员',
  'Group Membership': '组成员',
  Authorization: '授权',
  Filter: '过滤器',
  ProcessDefinition: '流程定义',
  ProcessInstance: '流程实例',
  DecisionDefinition: '决策定义',
  TenantMembership: '租户成员',
  DecisionRequirementsDefinition: '决策需求定义',
  OperationLogCatgeory: '操作日志类别',
  HistoricTask: '历史任务',
  HistoricProcessInstance: '历史流程实例',
  Deployment: '部署',
  'Process Definition': '流程定义',
  'Process Instance': '流程实例',
  Task: '任务',
  'Decision Definition': '决策定义',
  Tenant: '租户',
  'Tenant Membership': '租户成员',
  Batch: '批处理',
  Report: '报表',
  Dashboard: '仪表盘',
  Optimize: '流程优化',
  System: '系统'
}

export function getResourceLabel(code: number): string {
  const en = RESOURCE_TYPES[code] || String(code)
  return RESOURCE_TYPES_CN[en] || en
}

export const RESOURCE_TYPE_OPTIONS = Object.entries(RESOURCE_TYPES).map(([value, label]) => ({
  value: Number(value),
  label: RESOURCE_TYPES_CN[label] || label
}))

export const AUTHORIZATION_TYPES: Record<number, string> = {
  0: 'Global',
  1: 'Grant',
  2: 'Revoke'
}

export const AUTHORIZATION_TYPES_CN: Record<string, string> = {
  Global: '全局授权',
  Grant: '授予',
  Revoke: '撤销'
}

export function getAuthTypeLabel(code: number): string {
  const en = AUTHORIZATION_TYPES[code] || String(code)
  return AUTHORIZATION_TYPES_CN[en] || en
}

export const AUTHORIZATION_TYPE_OPTIONS = Object.entries(AUTHORIZATION_TYPES).map(([value, label]) => ({
  value: Number(value),
  label: AUTHORIZATION_TYPES_CN[label] || label
}))

export const PERMISSIONS_CN: Record<string, string> = {
  ALL: '全部',
  READ: '读',
  UPDATE: '改',
  CREATE: '创建',
  DELETE: '删除',
  ACCESS: '访问',
  READ_TASK: '读任务',
  UPDATE_TASK: '改任务',
  CREATE_INSTANCE: '创建实例',
  READ_INSTANCE: '读实例',
  UPDATE_INSTANCE: '改实例',
  DELETE_INSTANCE: '删实例',
  READ_HISTORY: '读历史',
  DELETE_HISTORY: '删历史',
  TASK_WORK: '签收任务',
  TASK_ASSIGN: '分配任务'
}

export function getPermissionLabel(key: string): string {
  return PERMISSIONS_CN[key] || key
}

export const PERMISSION_OPTIONS = Object.entries(PERMISSIONS_CN).map(([value, label]) => ({
  value,
  label: `${label}（${value}）`
}))

export function getAuthorizations(params?: AuthorizationQueryParams) {
  return api.get<AuthorizationDto[]>('/engine-rest/authorization', { params })
}

export function getAuthorizationCount(params?: AuthorizationQueryParams) {
  return api.get<{ count: number }>('/engine-rest/authorization/count', { params })
}

export function getAuthorization(id: string) {
  return api.get<AuthorizationDto>(`/engine-rest/authorization/${id}`)
}

export function createAuthorization(data: AuthorizationCreateDto) {
  return api.post<AuthorizationDto>('/engine-rest/authorization/create', data)
}

export function updateAuthorization(id: string, data: AuthorizationUpdateDto) {
  return api.put(`/engine-rest/authorization/${id}`, data)
}

export function deleteAuthorization(id: string) {
  return api.delete(`/engine-rest/authorization/${id}`)
}

export function checkAuthorization(params: {
  permissionName: string
  resourceName?: string
  resourceType: number
  resourceId?: string
  userId?: string
}) {
  return api.get<AuthorizationCheckResultDto>('/engine-rest/authorization/check', { params })
}
