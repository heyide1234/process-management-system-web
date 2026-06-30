<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <!-- <h2 style="font-family: 'PingFang SC-Semibold';">仪表盘</h2> -->
    </div>

    <div class="dashboard-section">
      <div class="overview-grid">
        <div class="overview-card">
          <div class="overview-top">
            <span class="overview-period">较昨日</span>
            <span class="overview-trend up">0</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-blue">
              <img src="../../assets/online_ icon.png" style="width: 48px;height: 48px;">
              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">已完成的任务</div>
              <div class="overview-value">{{ completedTaskCount }}</div>
            </div>
          </div>
        </div>

        <div class="overview-card" @click="goToMyTasks" style="cursor: pointer;">
          <div class="overview-top">
            <span class="overview-period">需处理</span>
            <span class="overview-trend up">+1</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-purple">
              <img src="../../assets/sign.png" style="width: 48px;height: 48px;">
              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">正在审批的流程</div>
              <div class="overview-value">{{ pendingTaskCount }}</div>
            </div>
          </div>
        </div>


        <div class="overview-card">
          <div class="overview-top">
            <span class="overview-period">本月</span>
            <span class="overview-trend up">+1.3%</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-orange">
              <img src="../../assets/final.png" style="width: 48px;height: 48px;">

              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">准时率</div>
              <div class="overview-value">94.2<span class="overview-unit">%</span></div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-top">
            <span class="overview-period">本季度</span>
            <span class="overview-trend up">+0.4%</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-green">
              <img src="../../assets/goal.png" style="width: 48px;height: 48px;">

              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">合规得分</div>
              <div class="overview-value">{{ metrics.complianceScore }}<span class="overview-unit">%</span></div>
            </div>
          </div>
        </div>


        <!-- <div class="overview-card">
          <div class="overview-top">
            <span class="overview-period">昨日</span>
            <span class="overview-trend up">+3</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-green">
              <img src="../../assets/goal.png" style="width: 48px;height: 48px;"> -->

              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg> -->
            <!-- </div>
            <div class="overview-content">
              <div class="overview-label">正在审批</div>
              <div class="overview-value">1<span class="overview-unit"></span></div>
            </div>
          </div>
        </div> -->

        <!-- <div class="overview-card">
          <div class="overview-top">
            <span class="overview-period">昨日</span>
            <span class="overview-trend up">+1</span>
          </div>
          <div class="overview-main">
            <div class="overview-icon icon-green">
              <img src="../../assets/goal.png" style="width: 48px;height: 48px;">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg> -->
            <!-- </div>
            <div class="overview-content">
              <div class="overview-label">已审批</div>
              <div class="overview-value">3<span class="overview-unit"></span></div>
            </div>
          </div>
        </div> -->

        
      </div>
    </div>

    <div class="dashboard-section">
      <div class="dashboard-row">
        <!-- 机队维修状态 -->
        <div class="dashboard-card fleet-status-card">
          <div class="card-header">
            <span class="card-title">流程进行状态</span>
            <!-- <span class="card-link">全部 →</span> -->
          </div>
          <div class="fleet-grid">
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-6792</div>
                <div class="fleet-model">B737-800</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">
              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-5432</div>
                <div class="fleet-model">A320neo</div>
                <div class="fleet-tag tag-orange">C检进行中</div>
              </div>
              <div class="fleet-plane">                
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">
            </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-7892</div>
                <div class="fleet-model">B787-9</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-1423</div>
                <div class="fleet-model">A321XLR</div>
                <div class="fleet-tag tag-yellow">A检进行中</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-9031</div>
                <div class="fleet-model">B737 MAX8</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-8821</div>
                <div class="fleet-model">A330-00</div>
                <div class="fleet-tag tag-blue">计划检修</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
          </div>
        </div>

        <!-- 实时告警 -->
        <div class="dashboard-card alert-card">
          <div class="card-header">
            <span class="card-title">实时告警</span>
            <!-- <span class="card-link">全部告警 →</span> -->
          </div>
          <div class="alert-list">
            <div class="alert-item">
              <div class="alert-dot dot-red"></div>
              <div class="alert-content">
                <div class="alert-title">流程实例 #2847 发动机孔探任务已超期 3 天未处理</div>
                <!-- <div class="alert-meta">17:12 · 运行中 · 优先级 P1</div> -->
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-dot dot-orange"></div>
              <div class="alert-content">
                <div class="alert-title">流程实例 #2901 液压系统检查节点已超期 8 小时</div>
                <!-- <div class="alert-meta">16:45 · 运行中 · 优先级 P1</div> -->
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-dot dot-yellow"></div>
              <div class="alert-content">
                <div class="alert-title">流程实例 #2883 起落架维护流程中报异常，等待人工介入</div>
                <!-- <div class="alert-meta">16:20 · 运行中 · 优先级 P2</div> -->
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-dot dot-blue"></div>
              <div class="alert-content">
                <div class="alert-title">流程实例 #2856 方向舵更换流程挂起，需故障排查</div>
                <!-- <div class="alert-meta">15:58 · 已挂起 · 待处理</div> -->
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-dot dot-green"></div>
              <div class="alert-content">
                <div class="alert-title">流程实例 #2831 定检任务逾期 1 天，已自动升级</div>
                <!-- <div class="alert-meta">14:33 · 运行中 · 已升级</div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="dashboard-row">
        <!-- B-5432 C检进度 -->
        <div class="dashboard-card progress-card">
          <div class="card-header">
            <span class="card-title">流程进度</span>
            <!-- <span v-if="total > 10" class="card-link" @click="goToInstanceList">更多 →</span> -->
            <span  class="card-link" @click="goToInstanceList">更多 →</span>

          </div>
          <div class="content">
            <el-table :data="instanceList" v-loading="loading" border stripe>
              <el-table-column label="流程名称" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">{{ getDefinitionName(row.definitionId) }}</template>
              </el-table-column>
              <el-table-column label="启动时间" min-width="170">
                <template #default="{ row }">{{ formatTableTime(null, null, historicMap[row.id]?.startTime) || '-' }}</template>
              </el-table-column>
              <el-table-column label="操作" width="260" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" link type="primary" @click="openDetailDialog(row.id)">流程监控</el-button>
                  <!-- <el-button
                    v-if="!row.ended && !row.suspended"
                    size="small"
                    link
                    type="warning"
                    @click="handleSuspend(row)"
                  >
                    挂起
                  </el-button>
                  <el-button
                    v-if="!row.ended && row.suspended"
                    size="small"
                    link
                    type="success"
                    @click="handleActivate(row)"
                  >
                    激活
                  </el-button>
                  <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button> -->
                </template>
              </el-table-column>
            </el-table>
          </div>
          
        </div>

        <!-- 合规指标概览 -->
        <div class="dashboard-card gauge-card">
          <div class="card-header">
            <span class="card-title">合规指标概览</span>
            <!-- <span class="card-link">详细报告 →</span> -->
          </div>
          <div class="gauge-grid">
            <div
              v-for="(_, index) in gaugeData"
              :key="index"
              :ref="el => setGaugeRef(el, index)"
              class="gauge-item"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="detailDialogVisible" title="实例详情" width="900px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="实例ID" :span="2">{{ detail?.id }}</el-descriptions-item>
      <el-descriptions-item label="流程名称">{{ detail ? getDefinitionName(detail.definitionId) : '-' }}</el-descriptions-item>
      <el-descriptions-item label="流程Key / 版本">{{ detail ? getDefinitionKeyVersion(detail.definitionId) : '-' }}</el-descriptions-item>
      <el-descriptions-item label="流程定义ID" :span="2">{{ detail?.definitionId }}</el-descriptions-item>
      <el-descriptions-item label="业务Key">{{ detail?.businessKey || '-' }}</el-descriptions-item>
      <el-descriptions-item label="租户ID">{{ detail?.tenantId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="detail?.ended" type="info">已结束</el-tag>
        <el-tag v-else :type="detail?.suspended ? 'danger' : 'success'">
          {{ detail?.suspended ? '已挂起' : '运行中' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div class="diagram-header" style="margin-top: 20px">
      <h4 style="margin: 0">流程进度</h4>
      <el-button size="small" link type="primary" @click="fullscreenDiagramVisible = true" :disabled="!processXml">
        <el-icon><FullScreen /></el-icon>
        放大查看
      </el-button>
    </div>
    <BpmnViewer
      :xml="processXml"
      :active-activity-ids="activeActivityIds"
      :completed-activity-ids="completedActivityIds"
    />

    <h4 style="margin-top: 20px">{{ detail?.ended ? '历史活动节点' : '当前活动节点' }}</h4>
    <el-table :data="activityList" v-loading="activityLoading" border stripe>
      <el-table-column prop="activityName" label="节点名称" min-width="150" />
      <el-table-column prop="activityId" label="节点ID" min-width="180" />
      <el-table-column prop="activityType" label="节点类型" min-width="160" />
      <el-table-column v-if="!detail?.ended" label="执行人" min-width="120">
        <template #default="{ row }">
          <template v-if="row.activityType === 'userTask'">
            <el-tag v-if="taskAssigneeMap[row.activityId]" size="small">{{ taskAssigneeMap[row.activityId] }}</el-tag>
            <el-tag v-else size="small" type="warning">待认领</el-tag>
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column v-if="detail?.ended" prop="endTime" label="完成时间" min-width="160" :formatter="formatTableTime" />
      <el-table-column v-if="!detail?.ended" prop="incidentIdsCount" label="异常数" width="80" align="center" />
    </el-table>
  </el-dialog>

  <el-dialog
    v-model="fullscreenDiagramVisible"
    title="流程进度"
    width="95vw"
    top="2vh"
    :close-on-click-modal="false"
    @opened="onFullscreenDiagramOpened"
  >
    <BpmnViewer
      v-if="fullscreenDiagramVisible"
      :key="'fullscreen-' + (detail?.id || '')"
      :xml="processXml"
      :active-activity-ids="activeActivityIds"
      :completed-activity-ids="completedActivityIds"
      height="75vh"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FullScreen } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardMetrics, type DashboardMetrics } from '../../api/dashboard'

import {
  getProcessInstances,
  getProcessInstance,
  getProcessInstanceCount,
  getActivityInstances,
  deleteProcessInstance,
  suspendProcessInstance,
  activateProcessInstance,
  type ProcessInstance
} from '../../api/instance'
import { getHistoricProcessInstances, getHistoricActivityInstances } from '../../api/history'
import { getProcessDefinitions, getProcessDefinitionXml, type ProcessDefinition } from '../../api/processDefinition'
import { getTasks, getTaskCount, getHistoricTaskInstanceCount } from '../../api/task'
import { formatTableTime } from '../../utils/format'
import { useAuthStore } from '../../stores/auth'
import BpmnViewer from '../../components/BpmnViewer.vue'

const router = useRouter()
const authStore = useAuthStore()

const goToInstanceList = () => {
  router.push('/process/instances')
}

const goToMyTasks = () => {
  router.push('/tasks/my')
}

const metrics = ref<DashboardMetrics>({
  runningProcessInstances: 0,
  incidents: 0,
  tasks: 0,
  processDefinitions: 0,
  decisionDefinitions: 0,
  deployments: 0,
  onTimeCompletionRate: 0,
  pendingReleaseSignCount: 0,
  complianceScore: 0
})

let timer: ReturnType<typeof setInterval> | null = null

const fetchMetrics = async () => {
  try {
    const res = await getDashboardMetrics()
    metrics.value = res
  } catch {
    ElMessage.error('获取仪表盘数据失败')
  }
}

const startPolling = () => {
  timer = setInterval(fetchMetrics, 10000)
}

// ===== 我的待办数量 =====
const pendingTaskCount = ref(0)

const fetchPendingTaskCount = async () => {
  try {
    const res = await getTaskCount({ assignee: authStore.username })
    pendingTaskCount.value = res.data.count
  } catch {
    ElMessage.error('获取待办任务数量失败')
  }
}

// ===== 已完成任务数量 =====
const completedTaskCount = ref(0)

const fetchCompletedTaskCount = async () => {
  try {
    const res = await getHistoricTaskInstanceCount({
      taskAssignee: authStore.username,
      finished: true
    })
    completedTaskCount.value = res.data.count
  } catch {
    ElMessage.error('获取已完成任务数量失败')
  }
}

// ===== 流程实例列表 =====
const instanceList = ref<ProcessInstance[]>([])
const definitionMap = ref<Record<string, ProcessDefinition>>({})
const historicMap = ref<Record<string, { startTime: string }>>({})
const loading = ref(false)
const total = ref(0)

const fetchInstances = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      sortBy: 'instanceId',
      sortOrder: 'desc',
      maxResults: 10
    }
    const [res, definitionRes, countRes] = await Promise.all([
      getProcessInstances(params),
      getProcessDefinitions(),
      getProcessInstanceCount({})
    ])
    definitionMap.value = Object.fromEntries(definitionRes.data.map((definition) => [definition.id, definition]))
    instanceList.value = res.data
    total.value = countRes.data.count

    if (res.data.length > 0) {
      const historicRes = await getHistoricProcessInstances({
        processInstanceIds: res.data.map((i) => i.id).join(','),
        maxResults: Math.max(res.data.length, 100)
      })
      const map: Record<string, { startTime: string }> = {}
      historicRes.data.forEach((h: any) => {
        map[h.id] = { startTime: h.startTime }
      })
      historicMap.value = map
    }
  } catch {
    ElMessage.error('获取流程实例失败')
  } finally {
    loading.value = false
  }
}

const getDefinitionName = (definitionId: string) => {
  const definition = definitionMap.value[definitionId]
  return definition?.name || definition?.key || '-'
}

const getDefinitionKeyVersion = (definitionId: string) => {
  const definition = definitionMap.value[definitionId]
  if (!definition) return '-'
  return `${definition.key} / v${definition.version}`
}

const handleSuspend = async (row: ProcessInstance) => {
  try {
    await ElMessageBox.confirm('确定挂起该流程实例？', '挂起确认', { type: 'warning' })
    await suspendProcessInstance(row.id)
    ElMessage.success('已挂起')
    fetchInstances()
  } catch {
    // cancelled
  }
}

const handleActivate = async (row: ProcessInstance) => {
  try {
    await activateProcessInstance(row.id)
    ElMessage.success('已激活')
    fetchInstances()
  } catch {
    ElMessage.error('激活失败')
  }
}

const handleDelete = async (row: ProcessInstance) => {
  try {
    await ElMessageBox.confirm('确定删除该流程实例？', '删除确认', { type: 'warning' })
    await deleteProcessInstance(row.id)
    ElMessage.success('删除成功')
    fetchInstances()
  } catch {
    // cancelled
  }
}

const detailDialogVisible = ref(false)
const fullscreenDiagramVisible = ref(false)
const detail = ref<ProcessInstance | null>(null)
const activityList = ref<any[]>([])
const activityLoading = ref(false)
const processXml = ref('')
const taskAssigneeMap = ref<Record<string, string | null>>({})
const activeActivityIds = ref<string[]>([])
const completedActivityIds = ref<string[]>([])

function collectLeafActivities(items: any[]): any[] {
  const leaves: any[] = []
  for (const item of items) {
    if (item.childActivityInstances && item.childActivityInstances.length) {
      leaves.push(...collectLeafActivities(item.childActivityInstances))
    } else {
      leaves.push(item)
    }
  }
  return leaves
}

function flattenActivities(items: any[]): any[] {
  const result: any[] = []
  for (const item of items) {
    result.push(item)
    if (item.childActivityInstances && item.childActivityInstances.length) {
      result.push(...flattenActivities(item.childActivityInstances))
    }
  }
  return result
}

const openDetailDialog = async (id: string) => {
  detailDialogVisible.value = true
  processXml.value = ''
  activeActivityIds.value = []
  completedActivityIds.value = []
  activityList.value = []
  taskAssigneeMap.value = {}

  try {
    const res = await getProcessInstance(id)
    detail.value = res.data
  } catch {
    ElMessage.error('获取实例详情失败')
  }

  activityLoading.value = true
  try {
    if (detail.value && !detail.value.ended) {
      const res = await getActivityInstances(id)
      const root = res.data
      if (root) {
        const allFlat = flattenActivities([root])
        activityList.value = allFlat
        const leaves = collectLeafActivities([root])
        activeActivityIds.value = leaves.map((a: any) => a.activityId)
        try {
          const historicRes = await getHistoricActivityInstances({
            processInstanceId: id,
            sortBy: 'startTime',
            sortOrder: 'asc',
            maxResults: 200
          })
          completedActivityIds.value = historicRes.data
            .filter((a: any) => a.endTime && a.activityType !== 'processInstance')
            .map((a: any) => a.activityId)
        } catch {
          const parents = allFlat.filter((a: any) =>
            !leaves.some((l: any) => l.id === a.id)
          )
          completedActivityIds.value = parents.map((a: any) => a.activityId)
        }
        try {
          const taskRes = await getTasks({ processInstanceId: id, maxResults: 200 })
          const map: Record<string, string | null> = {}
          taskRes.data.forEach((t) => {
            map[t.taskDefinitionKey] = t.assignee
          })
          taskAssigneeMap.value = map
        } catch {
          // ignore
        }
      }
    } else if (detail.value) {
      const res = await getHistoricActivityInstances({
        processInstanceId: id,
        sortBy: 'startTime',
        sortOrder: 'asc',
        maxResults: 200
      })
      activityList.value = res.data
      completedActivityIds.value = res.data
        .filter((a: any) => a.endTime)
        .map((a: any) => a.activityId)
      activeActivityIds.value = []
    }
  } catch {
    // ignore
  } finally {
    activityLoading.value = false
  }

  if (detail.value?.definitionId) {
    try {
      const xmlRes = await getProcessDefinitionXml(detail.value.definitionId)
      processXml.value = xmlRes.data.bpmn20Xml || ''
    } catch {
      // xml load failed, diagram won't show
    }
  }
}

const onFullscreenDiagramOpened = () => {
  // BpmnViewer 组件在挂载时会自动渲染，无需额外处理
}

onMounted(() => {
  fetchMetrics()
  startPolling()
  fetchPendingTaskCount()
  fetchCompletedTaskCount()
  fetchInstances()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

// ===== ECharts =====
const progressChart = ref<HTMLDivElement | null>(null)
const gaugeItemRefs = ref<HTMLDivElement[]>([])
let progressChartInstance: echarts.ECharts | null = null
const gaugeChartInstances: echarts.ECharts[] = []

const progressData = [
  { name: '结构检查', value: 100, color: '#10B981' },
  { name: '发动机维护', value: 87, color: '#3B82F6' },
  { name: '电气系统', value: 72, color: '#3B82F6' },
  { name: '客舱内饰', value: 45, color: '#F59E0B' },
  { name: '起落架系统', value: 28, color: '#EF4444' },
  { name: '燃油系统', value: 0, color: '#E5E7EB' }
]

const gaugeData = [
  { name: '工单按时完成', value: 95, color: '#3B82F6' },
  { name: '文件完整率', value: 98, color: '#10B981' },
  { name: '资质合规率', value: 90, color: '#3B82F6' },
  { name: '缺陷整改率', value: 80, color: '#F59E0B' },
  { name: '工具检验率', value: 98, color: '#10B981' },
  { name: '件料追溯率', value: 96, color: '#3B82F6' }
]

const setGaugeRef = (el: any, index: number) => {
  if (el) {
    gaugeItemRefs.value[index] = el as HTMLDivElement
  }
}

const initProgressChart = () => {
  if (!progressChart.value) return
  progressChartInstance = echarts.init(progressChart.value)
  progressChartInstance.setOption({
    grid: {
      left: '3%',
      right: '8%',
      top: '2%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      show: false
    },
    yAxis: {
      type: 'category',
      data: progressData.map(item => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#374151',
        fontSize: 13,
        fontFamily: 'Source Han Sans SC'
      }
    },
    series: [
      {
        type: 'bar',
        data: progressData.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.color,
            borderRadius: [0, 6, 6, 0]
          }
        })),
        barWidth: 10,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#374151',
          fontSize: 13,
          fontFamily: 'Source Han Sans SC'
        },
        showBackground: true,
        backgroundStyle: {
          color: '#F3F4F6',
          borderRadius: [0, 6, 6, 0]
        }
      }
    ]
  })
}

const initGaugeCharts = () => {
  gaugeData.forEach((item, index) => {
    const el = gaugeItemRefs.value[index]
    if (!el) return
    const chart = echarts.init(el)
    chart.setOption({
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: { color: item.color }
          },
          axisLine: {
            lineStyle: {
              width: 8,
              color: [[1, '#F3F4F6']]
            }
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value: item.value, name: item.name }],
          title: {
            offsetCenter: ['0%', '35%'],
            fontSize: 12,
            color: '#6B7280',
            fontFamily: 'Source Han Sans SC'
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '-5%'],
            fontSize: 22,
            fontWeight: 'bold',
            color: item.color,
            formatter: '{value}%',
            fontFamily: 'Source Han Sans SC'
          }
        }
      ]
    })
    gaugeChartInstances.push(chart)
  })
}

const initCharts = () => {
  initProgressChart()
  initGaugeCharts()
}

const handleResize = () => {
  progressChartInstance?.resize()
  gaugeChartInstances.forEach(chart => chart.resize())
}

const disposeCharts = () => {
  progressChartInstance?.dispose()
  progressChartInstance = null
  gaugeChartInstances.forEach(chart => chart.dispose())
  gaugeChartInstances.length = 0
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 16px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  position: relative;
  padding-bottom: 8px;
  font-family: 'PingFang SC-Semibold';
}

.dashboard-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
  border-radius: 2px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
  padding-left: 8px;
  font-family: 'PingFang SC-Medium';
  /* border-left: 4px solid #3B82F6; */
}
.dashboard-section{
  margin:0px 20px;
}

.dashboard-section + .dashboard-section {
  margin-top: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 80px;
  height: 180px;
  /* width: 480px; */
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  padding-left: 40px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  div:nth-child(1) {
    flex: 1;
    margin-top: -20px;
    margin-right: 10px;

  }
  div:nth-child(2) {
    flex: 3;
    height: 60px;
  }
  >img {
    flex: 2;
    margin-top: 20px;
  }
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 90px;
  height: 90px;
}
/* 
.metric-icon-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.metric-icon-orange {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.metric-icon-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.metric-icon-purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.metric-icon-teal {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
}

.metric-icon-cyan {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
} */

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.metric-label {
  font-size: 18px;
  color: #6B7280;
  font-weight: 500;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
}

/* ===== 顶部概览卡片 ===== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  font-family: 'Source Han Sans SC', sans-serif;
}

.overview-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 20px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 130px;
  /* flex: 1; */
}

.overview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.overview-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  /* margin-bottom: 8px; */
  font-size: 13px;
}

.overview-period {
  color: #9CA3AF;
}

.overview-trend {
  color: #EF4444;
  font-weight: 500;
}

.overview-trend.up {
  color: #EF4444;
}

.overview-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-icon svg {
  width: 24px;
  height: 24px;
}

.icon-blue {
  background: #EFF6FF;
  color: #3B82F6;
}

.icon-orange {
  background: #FFF7ED;
  color: #F97316;
}

.icon-purple {
  background: #F5F3FF;
  color: #8B5CF6;
}

.icon-green {
  background: #ECFDF5;
  color: #10B981;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-label {
  font-size: 14px;
  color: #6B7280;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
  font-family: 'Source Han Sans SC', sans-serif;
}

.overview-unit {
  font-size: 16px;
  font-weight: 500;
  color: #6B7280;
  margin-left: 2px;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dashboard-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -20px -20px 16px -20px;
  padding: 20px 20px 12px 20px;
  border-bottom: 1px solid #E5E7EB;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.card-link {
  font-size: 13px;
  color: #3B82F6;
  cursor: pointer;
}

/* ===== 机队维修状态 ===== */
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.fleet-item {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fleet-reg {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.fleet-model {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
}

.fleet-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-green {
  background: #D1FAE5;
  color: #059669;
}

.tag-orange {
  background: #FFEDD5;
  color: #EA580C;
}

.tag-yellow {
  background: #FEF3C7;
  color: #D97706;
}

.tag-blue {
  background: #DBEAFE;
  color: #2563EB;
}

.fleet-plane {
  font-size: 32px;
  opacity: 0.6;
}

/* ===== 实时告警 ===== */
.alert-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-left: 16px;
}

.alert-list::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 16px;
  bottom: 16px;
  width: 2px;
  background: #E5E7EB;
}

.alert-item {
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
  padding: 6px 0;
}

.alert-dot {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
  flex-shrink: 0;
}

.dot-red {
  background: #EF4444;
}

.dot-orange {
  background: #F97316;
}

.dot-yellow {
  background: #EAB308;
}

.dot-blue {
  background: #3B82F6;
}

.dot-green {
  background: #10B981;
}

.alert-title {
  font-size: 14px;
  color: #1F2937;
  line-height: 1.5;
  margin-bottom: 4px;
  margin-left: 4px;
}

.alert-badge {
  display: inline-block;
  background: #DBEAFE;
  color: #2563EB;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin: 0 4px;
}

.alert-meta {
  font-size: 12px;
  color: #9CA3AF;
}

/* ===== 底部 ECharts 图表 ===== */
.progress-card,
.gauge-card {
  min-height: 360px;
}

.progress-chart {
  width: 100%;
  height: 280px;
}

.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 280px;
}

.gauge-item {
  width: 100%;
  height: 140px;
}

/* .bg-illustration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 150px;
  height: 126px;
  pointer-events: none;
} */

/* ===== 实例详情弹窗 ===== */
h4 {
  margin: 0 0 10px;
  color: #303133;
}

.diagram-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
