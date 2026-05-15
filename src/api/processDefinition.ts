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
}

export function getProcessDefinitions() {
  return api.get<ProcessDefinition[]>('/engine-rest/process-definition', {
    params: { latestVersionOnly: false, sortBy: 'name', sortOrder: 'asc' }
  })
}

export function getProcessDefinition(id: string) {
  return api.get<ProcessDefinition>('/engine-rest/process-definition/' + id)
}

export function startProcessInstance(
  id: string,
  variables?: Record<string, { value: any; type?: string }>,
  businessKey?: string
) {
  return api.post('/engine-rest/process-definition/' + id + '/start', {
    variables: variables || {},
    businessKey: businessKey || undefined
  })
}

export function suspendProcessDefinition(id: string) {
  return api.put('/engine-rest/process-definition/' + id + '/suspended', {
    suspended: true,
    includeProcessInstances: false
  })
}

export function activateProcessDefinition(id: string) {
  return api.put('/engine-rest/process-definition/' + id + '/suspended', {
    suspended: false,
    includeProcessInstances: false
  })
}

export function deleteProcessDefinition(id: string) {
  return api.delete('/engine-rest/process-definition/' + id)
}

export function getProcessDefinitionDiagram(id: string) {
  return api.get('/engine-rest/process-definition/' + id + '/diagram', {
    responseType: 'blob'
  })
}

export function getProcessDefinitionStatistics() {
  return api.get('/engine-rest/process-definition/statistics')
}