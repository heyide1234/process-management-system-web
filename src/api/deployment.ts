import api from './request'

export interface Deployment {
  id: string
  name: string
  source: string
  deploymentTime: string
  tenantId: string | null
}

export interface DeploymentProcessDefinition {
  id: string
  key: string
  category: string
  name: string
  version: number
  resource: string
  deploymentId: string
}

export interface DeploymentWithDefinitions extends Deployment {
  deployedProcessDefinitions: Record<string, DeploymentProcessDefinition>
  deployedDecisionDefinitions: any
  deployedCaseDefinitions: any
}

export function getDeployments(params?: {
  name?: string
  nameLike?: string
  source?: string
  sortBy?: 'id' | 'name' | 'deploymentTime' | 'tenantId'
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}) {
  return api.get<Deployment[]>('/engine-rest/deployment', { params })
}

export function getDeployment(id: string) {
  return api.get<Deployment>('/engine-rest/deployment/' + id)
}

export function deleteDeployment(id: string, cascade?: boolean) {
  return api.delete('/engine-rest/deployment/' + id, {
    params: { cascade: cascade ?? false }
  })
}

export function createDeployment(formData: FormData) {
  return api.post<DeploymentWithDefinitions>('/engine-rest/deployment/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getDeploymentResources(id: string) {
  return api.get<{ id: string; name: string; deploymentId: string }[]>(
    '/engine-rest/deployment/' + id + '/resources'
  )
}
