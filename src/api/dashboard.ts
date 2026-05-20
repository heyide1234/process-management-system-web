import api from './request'

export interface DashboardMetrics {
  rightNow: {
    processInstances: number
    incidents: number
    humanTasks: number
  }
  deployed: {
    processDefinitions: number
    decisionDefinitions: number
    deployments: number
  }
}

export function getDashboardMetrics() {
  return api.get<DashboardMetrics>('/api/v1/dashboard/metrics')
}
