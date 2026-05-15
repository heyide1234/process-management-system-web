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
      <el-table-column prop="id" label="实例ID" min-width="220" show-overflow-tooltip />
      <el-table-column prop="definitionId" label="流程定义ID" min-width="220" show-overflow-tooltip />
      <el-table-column prop="businessKey" label="业务Key" min-width="150" />
      <el-table-column label="状态" width="180" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.ended" type="info">已结束</el-tag>
          <el-tag v-else :type="row.suspended ? 'danger' : 'success'">
            {{ row.suspended ? '已挂起' : '运行中' }}
          </el-tag>
        </template>
      </el-table-column>
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

    <el-dialog v-model="detailDialogVisible" title="实例详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="实例ID" :span="2">{{ detail?.id }}</el-descriptions-item>
        <el-descriptions-item label="流程定义ID">{{ detail?.definitionId }}</el-descriptions-item>
        <el-descriptions-item label="业务Key">{{ detail?.businessKey || '-' }}</el-descriptions-item>
        <el-descriptions-item label="租户ID">{{ detail?.tenantId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="detail?.ended" type="info">已结束</el-tag>
          <el-tag v-else :type="detail?.suspended ? 'danger' : 'success'">
            {{ detail?.suspended ? '已挂起' : '运行中' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-top: 20px">当前活动节点</h4>
      <el-table :data="activityList" v-loading="activityLoading" border stripe>
        <el-table-column prop="activityId" label="节点ID" min-width="180" />
        <el-table-column prop="activityName" label="节点名称" min-width="150" />
        <el-table-column prop="activityType" label="节点类型" min-width="180" />

        <el-table-column prop="incidentIdsCount" label="异常数" width="80" align="center" />
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

const instanceList = ref<ProcessInstance[]>([])
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
    const res = await getProcessInstances(params)
    instanceList.value = res.data
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
const detail = ref<ProcessInstance | null>(null)
const activityList = ref<any[]>([])
const activityLoading = ref(false)
const variableList = ref<{ name: string; value: any; type: string }[]>([])
const varLoading = ref(false)

const flattenActivities = (items: any[]): any[] => {
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
  try {
    const res = await getProcessInstance(id)
    detail.value = res.data
  } catch {
    ElMessage.error('获取实例详情失败')
  }

  activityLoading.value = true
  try {
    const res = await getActivityInstances(id)
    const root = res.data[id]
    activityList.value = root ? flattenActivities([root]) : []
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
