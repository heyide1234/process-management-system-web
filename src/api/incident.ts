import api from './request'

export interface Incident {
  id: string
  processDefinitionId: string
  processInstanceId: string
  executionId: string
  incidentType: string
  activityId: string
  causeIncidentId: string | null
  rootCauseIncidentId: string | null
  configuration: string
  incidentMessage: string
  tenantId: string | null
  jobDefinitionId: string
  open: boolean
  deleted: boolean
  resolved: boolean
  incidentTimestamp: string
}

export interface IncidentQueryParams {
  incidentId?: string
  incidentType?: string
  incidentMessage?: string
  processDefinitionId?: string
  processInstanceId?: string
  executionId?: string
  activityId?: string
  causeIncidentId?: string
  rootCauseIncidentId?: string
  configuration?: string
  open?: boolean
  resolved?: boolean
  deleted?: boolean
  sortBy?: 'incidentId' | 'incidentMessage' | 'incidentTimestamp' | 'incidentType' | 'executionId' | 'activityId' | 'processInstanceId' | 'processDefinitionId' | 'causeIncidentId' | 'rootCauseIncidentId' | 'configuration' | 'tenantId'
  sortOrder?: 'asc' | 'desc'
  firstResult?: number
  maxResults?: number
}

export function getIncidents(params?: IncidentQueryParams) {
  return api.get<Incident[]>('/engine-rest/incident', { params })
}

export function getIncidentCount(params?: IncidentQueryParams) {
  return api.get<{ count: number }>('/engine-rest/incident/count', { params })
}
