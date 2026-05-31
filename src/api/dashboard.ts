import api from './request'

export interface CountResult {
  count: number
}

export interface DashboardMetrics {
  runningProcessInstances: number
  incidents: number
  tasks: number
  processDefinitions: number
  decisionDefinitions: number
  deployments: number
}

export function getRunningProcessInstanceCount() {
  return api.get<CountResult>('/engine-rest/process-instance/count', {
    params: { active: true }
  })
}

export function getIncidentCount() {
  return api.get<CountResult>('/engine-rest/incident/count')
}

export function getTaskCount() {
  return api.get<CountResult>('/engine-rest/task/count')
}

export function getProcessDefinitionCount() {
  return api.get<CountResult>('/engine-rest/process-definition/count')
}

export function getDecisionDefinitionCount() {
  return api.get<CountResult>('/engine-rest/decision-definition/count')
}

export function getDeploymentCount() {
  return api.get<CountResult>('/engine-rest/deployment/count')
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    runningRes,
    incidentRes,
    taskRes,
    processDefRes,
    decisionDefRes,
    deploymentRes
  ] = await Promise.all([
    getRunningProcessInstanceCount(),
    getIncidentCount(),
    getTaskCount(),
    getProcessDefinitionCount(),
    getDecisionDefinitionCount(),
    getDeploymentCount()
  ])

  return {
    runningProcessInstances: runningRes.data.count,
    incidents: incidentRes.data.count,
    tasks: taskRes.data.count,
    processDefinitions: processDefRes.data.count,
    decisionDefinitions: decisionDefRes.data.count,
    deployments: deploymentRes.data.count
  }
}
