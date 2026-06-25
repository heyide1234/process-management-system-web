import api from './request'

export interface ProcessDefinition {
  id: string
  key: string
  category: string
  name: string
  version: number
  deploymentId: string
  resource: string
  diagram: string | null
  suspended: boolean
  tenantId: string | null
  versionTag: string | null
  description?: string
}

export interface ActivityStatistics {
  id: string
  instances: number
  canceled: number
  finished: number
  completeScope: boolean
  failedJobs: number
  incidents: { incidentType: string; incidentCount: number }[]
}

export function getProcessDefinitionCount(params?: {
  id?: string
  idIn?: string
  name?: string
  nameLike?: string
  key?: string
  keyLike?: string
  category?: string
  categoryLike?: string
  deploymentId?: string
  version?: number
  latestVersion?: boolean
  suspended?: boolean
  active?: boolean
}) {
  return api.get<{ count: number }>('/engine-rest/process-definition/count', { params })
}

export function getProcessDefinitions(params?: {
  id?: string
  idIn?: string
  name?: string
  nameLike?: string
  key?: string
  keyLike?: string
  category?: string
  categoryLike?: string
  deploymentId?: string
  version?: number
  latestVersion?: boolean
  suspended?: boolean
  active?: boolean
  tenantIdIn?: string
  withoutTenantId?: boolean
  includeProcessDefinitionsWithoutTenantId?: boolean
  startableBy?: string
  startableTaskList?: boolean
  startablePermissionCheck?: boolean
  notStartableBy?: string
  sortBy?: 'category' | 'key' | 'id' | 'name' | 'version' | 'deploymentId' | 'tenantId'
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<ProcessDefinition[]>('/engine-rest/process-definition', { params })
}

export function getProcessDefinition(id: string) {
  return api.get<ProcessDefinition>('/engine-rest/process-definition/' + id)
}

export function getProcessDefinitionByKey(key: string, tenantId?: string) {
  const url = tenantId
    ? `/engine-rest/process-definition/key/${key}/tenant-id/${tenantId}`
    : `/engine-rest/process-definition/key/${key}`
  return api.get<ProcessDefinition>(url)
}

export function startProcessInstance(
  id: string,
  variables?: Record<string, { value: any; type?: string }>,
  businessKey?: string,
  withVariablesInReturn?: boolean
) {
  return api.post('/engine-rest/process-definition/' + id + '/start', {
    variables: variables || {},
    businessKey: businessKey || undefined,
    withVariablesInReturn: withVariablesInReturn || false
  })
}

export function startProcessInstanceByKey(
  key: string,
  variables?: Record<string, { value: any; type?: string }>,
  businessKey?: string,
  tenantId?: string,
  withVariablesInReturn?: boolean
) {
  const url = tenantId
    ? `/engine-rest/process-definition/key/${key}/tenant-id/${tenantId}/start`
    : `/engine-rest/process-definition/key/${key}/start`
  return api.post(url, {
    variables: variables || {},
    businessKey: businessKey || undefined,
    withVariablesInReturn: withVariablesInReturn || false
  })
}

export function suspendProcessDefinition(id: string, includeProcessInstances?: boolean) {
  return api.put('/engine-rest/process-definition/' + id + '/suspended', {
    suspended: true,
    includeProcessInstances: includeProcessInstances || false
  })
}

export function activateProcessDefinition(id: string, includeProcessInstances?: boolean) {
  return api.put('/engine-rest/process-definition/' + id + '/suspended', {
    suspended: false,
    includeProcessInstances: includeProcessInstances || false
  })
}

export function deleteProcessDefinition(id: string, cascade?: boolean) {
  return api.delete('/engine-rest/process-definition/' + id, {
    params: { cascade: cascade || false }
  })
}

export function getProcessDefinitionDiagram(id: string) {
  return api.get('/engine-rest/process-definition/' + id + '/diagram', {
    responseType: 'blob'
  })
}

export function getProcessDefinitionXml(id: string) {
  return api.get<{ id: string; bpmn20Xml: string }>('/engine-rest/process-definition/' + id + '/xml')
}

export function getProcessDefinitionStatistics(params?: {
  processDefinitionIdIn?: string
  processDefinitionKeyIn?: string
  includeFailedJobs?: boolean
  includeIncidents?: boolean
  includeRootIncidents?: boolean
  incidentsForRootProcessInstance?: boolean
  includeIncidentsForType?: string
  tenantIdIn?: string
  withoutTenantId?: boolean
  includeProcessDefinitionsWithoutTenantId?: boolean
}) {
  return api.get<ActivityStatistics[]>('/engine-rest/process-definition/statistics', { params })
}

export function getProcessDefinitionStartForm(id: string) {
  return api.get<{ key: string; contextPath?: string }>('/engine-rest/process-definition/' + id + '/startForm')
}

export function getProcessDefinitionFormVariables(id: string, variableNames?: string[], deserializeValues?: boolean) {
  return api.get<Record<string, { value: any; type: string; valueInfo?: Record<string, any> }>>(
    '/engine-rest/process-definition/' + id + '/form-variables',
    {
      params: {
        variableNames: variableNames?.join(','),
        deserializeValues: deserializeValues !== undefined ? deserializeValues : true
      }
    }
  )
}

export function getProcessDefinitionActivityInstanceStatistics(
  id: string,
  params?: {
    includeFailedJobs?: boolean
    includeIncidents?: boolean
    includeRootIncidents?: boolean
    incidentsForRootProcessInstance?: boolean
    includeIncidentsForType?: string
  }
) {
  return api.get<ActivityStatistics[]>('/engine-rest/process-definition/' + id + '/statistics', { params })
}