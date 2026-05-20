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

export interface FormTemplate {
  id: string
  name: string
  description?: string
  fields: any[]
  processDefinitionKey?: string
  vformJson?: any
  formioSchema?: any
  fcRules?: any
  createdAt: string
  updatedAt: string
}

export interface FormInstance {
  id: string
  templateId: string
  templateName: string
  applicantName: string
  status: 'pending' | 'approved' | 'rejected'
  data: Record<string, any>
  approvalComment?: string
  taskId?: string
  processInstanceId?: string
  createdAt: string
  updatedAt: string
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
  return api.post<DeploymentWithDefinitions>('/engine-rest/deployment/create', formData)
}

export function getDeploymentResources(id: string) {
  return api.get<{ id: string; name: string; deploymentId: string }[]>(
    '/engine-rest/deployment/' + id + '/resources'
  )
}

export function getDeploymentResourceData(deploymentId: string, resourceId: string) {
  return api.get('/engine-rest/deployment/' + deploymentId + '/resources/' + resourceId + '/data', {
    responseType: 'blob'
  })
}
