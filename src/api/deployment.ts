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

export type FormType = 'vform' | 'html'

export interface FormTemplate {
  id: string
  name: string
  description?: string
  type: FormType
  fields: any[]
  processDefinitionKey?: string
  taskDefinitionKey?: string
  formKey?: string
  vformJson?: any
  htmlContent?: string
  formioSchema?: any
  fcRules?: any
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

export function translateDeployError(error: any): string {
  const raw = error?.response?.data?.message || error?.message || ''

  if (raw.includes('ENGINE-12018') || raw.includes('History Time To Live')) {
    return 'BPMN 流程定义缺少「历史数据保留天数」，请在流程设计器右侧属性面板中设置 historyTimeToLive 字段'
  }
  if (raw.includes('ENGINE-09005') || raw.includes('Could not parse BPMN')) {
    return 'BPMN 文件格式错误，无法解析。请检查 XML 语法是否正确'
  }
  if (raw.includes('ENGINE-03041') || raw.includes('already exists')) {
    return '该 BPMN 文件内容与已有部署重复，请修改流程后重试'
  }
  if (raw.includes('ENGINE-03042') || raw.includes('no resources')) {
    return '部署包中没有找到有效的 BPMN 文件，请确认上传了正确的 .bpmn 或 .xml 文件'
  }
  if (raw.includes('ENGINE-03043')) {
    return '部署名称已被使用，请更换一个名称'
  }
  if (raw.includes('ENGINE-03044')) {
    return '上传的文件不是有效的 BPMN 2.0 XML'
  }
  if (raw.includes('ENGINE-03045')) {
    return '部署失败：包含多个 .bpmn 文件且 process id 冲突'
  }
  if (raw.includes('ENGINE-03046')) {
    return '部署失败：BPMN 文件中 process id 与已存在的流程定义冲突'
  }
  if (raw.includes('deploy-changed-only')) {
    return '部署失败：只部署变更的资源，但没有检测到任何变更'
  }

  return raw || '部署失败，请检查网络连接或联系管理员'
}
