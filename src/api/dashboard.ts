import api from './request'
import { getHistoricTasks, getHistoricVariableInstances, type HistoricVariableInstance } from './history'
import { getTasks, type Task } from './task'

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
  onTimeCompletionRate: number
  pendingReleaseSignCount: number
  complianceScore: number
}

export interface MetricIntervalResult {
  timestamp: string
  name: string
  reporter: string
  value: number
}

export interface MetricSumResult {
  result: number
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

export function getMetrics(params?: {
  name?: string
  reporter?: string
  startDate?: string
  endDate?: string
  firstResult?: number
  maxResults?: number
  interval?: number
  aggregateByReporter?: boolean
}) {
  return api.get<MetricIntervalResult[]>('/engine-rest/metrics', { params })
}

export function getMetricsSum(
  name: string,
  params?: {
    startDate?: string
    endDate?: string
    reporter?: string
  }
) {
  return api.get<MetricSumResult>(`/engine-rest/metrics/${name}/sum`, { params })
}

const RELEASE_SIGN_KEYWORDS = ['放行', '签署', 'sign-off']

function isReleaseSignTask(task: Task): boolean {
  const text = [task.name, task.taskDefinitionKey, task.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return RELEASE_SIGN_KEYWORDS.some(k => text.includes(k.toLowerCase()))
}

/**
 * 统计当前待办中属于“放行/签署”类的任务数量。
 * 按任务名、任务定义 key、描述中的关键字匹配；可按实际业务调整关键字或改成 candidateGroup 筛选。
 */
export async function getPendingReleaseSignCount(): Promise<number> {
  const res = await getTasks({ maxResults: 1000 })
  return res.data.filter(isReleaseSignTask).length
}

/**
 * 计算已完成的用户任务中，在 due 截止时间之前完成的比例。
 * 只统计有 due 且已结束的任务；若没有符合条件的数据，返回 100。
 */
export async function getOnTimeCompletionRate(): Promise<number> {
  const res = await getHistoricTasks({
    finished: true,
    maxResults: 10000
  })
  const tasks = res.data
  const validTasks = tasks.filter(t => t.due && t.endTime)
  if (validTasks.length === 0) {
    return 100
  }
  const onTimeCount = validTasks.filter(t => new Date(t.endTime!) <= new Date(t.due!)).length
  return Math.round((onTimeCount / validTasks.length) * 1000) / 10
}

/**
 * 从历史变量实例列表中按 createTime 取最新的一条。
 */
function getLatestVariable(variables: HistoricVariableInstance[]): HistoricVariableInstance | null {
  if (variables.length === 0) return null
  return [...variables].sort(
    (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  )[0]
}

/**
 * 将 Date 格式化为 Camunda 可识别的日期时间字符串。
 * Camunda 不接受 ISO 8601 的 "Z" 格式，需要带时区偏移，例如：2026-05-30T10:48:35.000+0800
 */
function toCamundaDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const HH = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  const ms = date.getMilliseconds().toString().padStart(3, '0')

  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const offsetHours = pad(Math.abs(Math.floor(offset / 60)))
  const offsetMinutes = pad(Math.abs(offset % 60))

  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${ms}${sign}${offsetHours}${offsetMinutes}`
}

/**
 * 计算合规得分。
 * 1. 优先读取流程变量 complianceScore；
 * 2. 否则取各子指标变量（文件完整率、资质合规率、缺陷整改率、工具检验率、件料追溯率）的平均值；
 * 3. 仍无数据时，用 metrics 的 activity 完成率作为兜底参考。
 */
export async function getComplianceScore(): Promise<number> {
  // 1. 优先读取 complianceScore 变量
  const scoreRes = await getHistoricVariableInstances({
    variableName: 'complianceScore',
    maxResults: 1000
  })

  const latestScore = getLatestVariable(scoreRes.data)
  if (latestScore && latestScore.value != null) {
    const score = Number(latestScore.value)
    if (!isNaN(score)) {
      return Math.min(100, Math.max(0, Math.round(score * 10) / 10))
    }
  }

  // 2. fallback：读取各子指标变量并取平均
  const subMetrics = [
    'documentCompleteness',
    'qualificationCompliance',
    'defectRectification',
    'toolInspectionRate',
    'partsTraceability'
  ]

  let total = 0
  let count = 0

  for (const variableName of subMetrics) {
    const res = await getHistoricVariableInstances({
      variableName,
      maxResults: 1000
    })
    const latest = getLatestVariable(res.data)
    if (latest && latest.value != null) {
      const val = Number(latest.value)
      if (!isNaN(val)) {
        total += val
        count++
      }
    }
  }

  if (count > 0) {
    return Math.min(100, Math.max(0, Math.round((total / count) * 10) / 10))
  }

  // 3. 兜底：用 metrics 的 activity 完成率
  try {
    const thirtyDaysAgo = toCamundaDateTime(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    const [startRes, endRes] = await Promise.all([
      getMetricsSum('activity-instance-start', { startDate: thirtyDaysAgo }),
      getMetricsSum('activity-instance-end', { startDate: thirtyDaysAgo })
    ])

    const started = startRes.data.result
    const ended = endRes.data.result
    if (started > 0) {
      return Math.min(100, Math.round((ended / started) * 1000) / 10)
    }
  } catch {
    // metrics 兜底失败时忽略
  }

  return 0
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    runningRes,
    incidentRes,
    taskRes,
    processDefRes,
    decisionDefRes,
    deploymentRes,
    onTimeCompletionRate,
    pendingReleaseSignCount,
    complianceScore
  ] = await Promise.all([
    getRunningProcessInstanceCount(),
    getIncidentCount(),
    getTaskCount(),
    getProcessDefinitionCount(),
    getDecisionDefinitionCount(),
    getDeploymentCount(),
    getOnTimeCompletionRate(),
    getPendingReleaseSignCount(),
    getComplianceScore()
  ])

  return {
    runningProcessInstances: runningRes.data.count,
    incidents: incidentRes.data.count,
    tasks: taskRes.data.count,
    processDefinitions: processDefRes.data.count,
    decisionDefinitions: decisionDefRes.data.count,
    deployments: deploymentRes.data.count,
    onTimeCompletionRate,
    pendingReleaseSignCount,
    complianceScore
  }
}
