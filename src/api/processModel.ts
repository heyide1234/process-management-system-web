import api from './request'

export interface ProcessModel {
  id: number
  modelKey: string
  name: string
  description?: string
  bpmnXml: string
  status: 'DRAFT' | 'DEPLOYED' | string
  version: number
  deploymentId?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface ProcessModelPayload {
  modelKey: string
  name: string
  description?: string
  bpmnXml: string
}

const LOCAL_STORAGE_KEY = 'process_designer_model_drafts'

export async function getProcessModels(params?: { keyword?: string }) {
  try {
    return await api.get<ProcessModel[]>('/api/process-models', { params })
  } catch (error) {
    if (!shouldUseLocalDraftStore(error)) throw error

    const keyword = params?.keyword?.trim().toLowerCase()
    const drafts = readLocalDrafts()
      .filter((item) => {
        if (!keyword) return true
        return item.name.toLowerCase().includes(keyword) || item.modelKey.toLowerCase().includes(keyword)
      })
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))

    return asResponse(drafts)
  }
}

export function getProcessModel(id: number) {
  return api.get<ProcessModel>(`/api/process-models/${id}`)
}

export async function createProcessModel(data: ProcessModelPayload) {
  try {
    return await api.post<ProcessModel>('/api/process-models', data)
  } catch (error) {
    if (!shouldUseLocalDraftStore(error)) throw error

    const drafts = readLocalDrafts()
    const now = new Date().toISOString()
    const version = nextLocalVersion(drafts, data.modelKey)
    const draft: ProcessModel = {
      id: Date.now(),
      modelKey: data.modelKey,
      name: data.name,
      description: data.description,
      bpmnXml: data.bpmnXml,
      status: 'DRAFT',
      version,
      createdAt: now,
      updatedAt: now,
      createdBy: 'local',
      updatedBy: 'local'
    }

    writeLocalDrafts([draft, ...drafts])
    return asResponse(draft)
  }
}

export async function updateProcessModel(id: number, data: ProcessModelPayload) {
  try {
    return await api.put<ProcessModel>(`/api/process-models/${id}`, data)
  } catch (error) {
    if (!shouldUseLocalDraftStore(error)) throw error

    const drafts = readLocalDrafts()
    const now = new Date().toISOString()
    const existing = drafts.find((item) => item.id === id)
    const updated: ProcessModel = {
      id,
      modelKey: data.modelKey,
      name: data.name,
      description: data.description,
      bpmnXml: data.bpmnXml,
      status: 'DRAFT',
      version: existing?.version || nextLocalVersion(drafts, data.modelKey),
      deploymentId: existing?.deploymentId,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      createdBy: existing?.createdBy || 'local',
      updatedBy: 'local'
    }

    writeLocalDrafts([updated, ...drafts.filter((item) => item.id !== id)])
    return asResponse(updated)
  }
}

export async function markProcessModelDeployed(id: number, deploymentId: string) {
  try {
    return await api.post<ProcessModel>(`/api/process-models/${id}/deployed`, { deploymentId })
  } catch (error) {
    if (!shouldUseLocalDraftStore(error)) throw error

    const drafts = readLocalDrafts()
    const existing = drafts.find((item) => item.id === id)
    if (!existing) throw error

    const updated: ProcessModel = {
      ...existing,
      status: 'DEPLOYED',
      deploymentId,
      updatedAt: new Date().toISOString(),
      updatedBy: 'local'
    }
    writeLocalDrafts([updated, ...drafts.filter((item) => item.id !== id)])
    return asResponse(updated)
  }
}

export async function deleteProcessModel(id: number) {
  try {
    return await api.delete(`/api/process-models/${id}`)
  } catch (error) {
    if (!shouldUseLocalDraftStore(error)) throw error
    writeLocalDrafts(readLocalDrafts().filter((item) => item.id !== id))
    return asResponse(undefined)
  }
}

function shouldUseLocalDraftStore(error: any): boolean {
  const status = error?.response?.status
  if (status === 401 || status === 403) return false
  return !status || status === 404 || status >= 500
}

function readLocalDrafts(): ProcessModel[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalDrafts(drafts: ProcessModel[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts))
}

function nextLocalVersion(drafts: ProcessModel[], modelKey: string): number {
  const versions = drafts
    .filter((item) => item.modelKey === modelKey)
    .map((item) => item.version || 1)
  return versions.length > 0 ? Math.max(...versions) + 1 : 1
}

function asResponse<T>(data: T) {
  return { data } as any
}
