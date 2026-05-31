<template>
  <div class="instance-page">
    <div class="page-header">
      <h3>流程实例</h3>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.processDefinitionKey"
        placeholder="流程Key"
        clearable
        style="width: 180px"
        @keyup.enter="fetchInstances"
      />
      <el-input
        v-model="search.processDefinitionId"
        placeholder="流程定义ID"
        clearable
        style="width: 220px"
        @keyup.enter="fetchInstances"
      />
      <el-input
        v-model="search.businessKey"
        placeholder="业务Key"
        clearable
        style="width: 180px"
        @keyup.enter="fetchInstances"
      />
      <el-select v-model="search.active" placeholder="状态" clearable style="width: 140px">
        <el-option label="运行中" :value="true" />
        <el-option label="已挂起" :value="false" />
      </el-select>
      <el-button type="primary" @click="fetchInstances">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="instanceList" v-loading="loading" border stripe>
      <el-table-column label="流程名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ getDefinitionName(row.definitionId) }}</template>
      </el-table-column>
      <el-table-column label="流程Key / 版本" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ getDefinitionKeyVersion(row.definitionId) }}</template>
      </el-table-column>
      <el-table-column prop="businessKey" label="业务Key" min-width="150">
        <template #default="{ row }">{{ row.businessKey || '-' }}</template>
      </el-table-column>
      <el-table-column label="当前节点" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ currentActivityMap[row.id] || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.ended" type="info">已结束</el-tag>
          <el-tag v-else :type="row.suspended ? 'danger' : 'success'">
            {{ row.suspended ? '已挂起' : '运行中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="实例ID" min-width="220" show-overflow-tooltip />
      <el-table-column prop="definitionId" label="定义ID" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openDetailDialog(row.id)">详情</el-button>
          <el-button
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
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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

      <h4 style="margin-top: 20px">流程进度</h4>
      <BpmnViewer
        :xml="processXml"
        :active-activity-ids="activeActivityIds"
        :completed-activity-ids="completedActivityIds"
      />

      <h4 style="margin-top: 20px">{{ detail?.ended ? '历史活动节点' : '当前活动节点' }}</h4>
      <el-table :data="activityList" v-loading="activityLoading" border stripe>
        <el-table-column prop="activityId" label="节点ID" min-width="180" />
        <el-table-column prop="activityName" label="节点名称" min-width="150" />
        <el-table-column prop="activityType" label="节点类型" min-width="160" />
        <el-table-column v-if="detail?.ended" prop="endTime" label="完成时间" min-width="160" :formatter="formatTableTime" />
        <el-table-column v-if="!detail?.ended" prop="incidentIdsCount" label="异常数" width="80" align="center" />
      </el-table>

      <h4 style="margin-top: 20px">流程变量</h4>
      <el-table :data="variableList" v-loading="varLoading" border stripe>
        <el-table-column prop="name" label="变量名" min-width="180" />
        <el-table-column prop="type" label="类型" min-width="100" />
        <el-table-column label="值" min-width="200">
          <template #default="{ row }">{{ JSON.stringify(row.value) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProcessInstances,
  getProcessInstance,
  deleteProcessInstance,
  suspendProcessInstance,
  activateProcessInstance,
  getActivityInstances,
  getInstanceVariables,
  type ProcessInstance
} from '../../api/instance'
import { getHistoricActivityInstances } from '../../api/history'
import { getProcessDefinitions, getProcessDefinitionXml, type ProcessDefinition } from '../../api/processDefinition'
import BpmnViewer from '../../components/BpmnViewer.vue'
import { formatTableTime } from '../../utils/format'

const instanceList = ref<ProcessInstance[]>([])
const definitionMap = ref<Record<string, ProcessDefinition>>({})
const currentActivityMap = ref<Record<string, string>>({})
const loading = ref(false)

const search = reactive({
  processDefinitionKey: '',
  processDefinitionId: '',
  businessKey: '',
  active: undefined as boolean | undefined
})

const fetchInstances = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (search.processDefinitionKey) params.processDefinitionKey = search.processDefinitionKey
    if (search.processDefinitionId) params.processDefinitionId = search.processDefinitionId
    if (search.businessKey) params.businessKeyLike = '%' + search.businessKey + '%'
    if (search.active !== undefined) {
      if (search.active) {
        params.active = true
      } else {
        params.suspended = true
      }
    }
    const [res, definitionRes] = await Promise.all([
      getProcessInstances(params),
      getProcessDefinitions()
    ])
    definitionMap.value = Object.fromEntries(definitionRes.data.map((definition) => [definition.id, definition]))
    instanceList.value = res.data
    await loadCurrentActivities(res.data)
  } catch {
    ElMessage.error('获取流程实例失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.processDefinitionKey = ''
  search.processDefinitionId = ''
  search.businessKey = ''
  search.active = undefined
  fetchInstances()
}

const getDefinition = (definitionId: string) => {
  return definitionMap.value[definitionId]
}

const getDefinitionName = (definitionId: string) => {
  const definition = getDefinition(definitionId)
  return definition?.name || definition?.key || '-'
}

const getDefinitionKeyVersion = (definitionId: string) => {
  const definition = getDefinition(definitionId)
  if (!definition) return '-'
  return `${definition.key} / v${definition.version}`
}

const loadCurrentActivities = async (instances: ProcessInstance[]) => {
  const activeInstances = instances.filter((instance) => !instance.ended && !instance.suspended)
  const entries = await Promise.all(activeInstances.map(async (instance) => {
    try {
      const res = await getActivityInstances(instance.id)
      const root = res.data[instance.id]
      if (!root) return [instance.id, '-'] as const
      const leaves = collectLeafActivities([root])
      const label = leaves
        .map((activity) => activity.activityName || activity.activityId)
        .filter(Boolean)
        .join('，')
      return [instance.id, label || '-'] as const
    } catch {
      return [instance.id, '-'] as const
    }
  }))
  currentActivityMap.value = Object.fromEntries(entries)
}

const handleSuspend = async (row: ProcessInstance) => {
  try {
    await ElMessageBox.confirm('确定挂起该流程实例？', '挂起确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
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
    await ElMessageBox.confirm('确定删除该流程实例？', '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await deleteProcessInstance(row.id)
    ElMessage.success('删除成功')
    fetchInstances()
  } catch {
    // cancelled
  }
}

const detailDialogVisible = ref(false)
const detail = ref<ProcessInstance | null>(null)
const activityList = ref<any[]>([])
const activityLoading = ref(false)
const variableList = ref<{ name: string; value: any; type: string }[]>([])
const varLoading = ref(false)
const processXml = ref('')
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
  variableList.value = []

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
      const root = res.data[id]
      if (root) {
        const allFlat = flattenActivities([root])
        activityList.value = allFlat
        const leaves = collectLeafActivities([root])
        activeActivityIds.value = leaves.map((a: any) => a.activityId)
        const parents = allFlat.filter((a: any) =>
          !leaves.some((l: any) => l.id === a.id)
        )
        completedActivityIds.value = parents.map((a: any) => a.activityId)
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

  varLoading.value = true
  try {
    const res = await getInstanceVariables(id)
    variableList.value = Object.entries(res.data).map(([name, val]) => ({
      name,
      value: val.value,
      type: val.type
    }))
  } catch {
    // ignore
  } finally {
    varLoading.value = false
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

onMounted(() => {
  fetchInstances()
})
</script>

<style scoped>
.instance-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  position: relative;
  padding-bottom: 8px;
  font-family: 'PingFang SC-Semibold';
}

.page-header h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
  border-radius: 2px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

h4 {
  margin: 0 0 10px;
  color: #303133;
}
</style>
