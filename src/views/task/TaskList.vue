<template>
  <div class="task-page">
    <div class="page-header">
      <h3>任务管理</h3>
      <div class="tab-buttons">
        <el-radio-group v-model="taskTab" @change="onTabChange">
          <el-radio-button value="myTasks">我的待办</el-radio-button>
          <el-radio-button value="unclaimed">可签收</el-radio-button>
          <el-radio-button value="all">全部任务</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.name"
        placeholder="任务名称"
        clearable
        style="width: 200px"
        @keyup.enter="fetchTasks"
      />
      <el-input
        v-model="search.processDefinitionKey"
        placeholder="流程Key"
        clearable
        style="width: 180px"
        @keyup.enter="fetchTasks"
      />
      <el-input
        v-model="search.processInstanceId"
        placeholder="实例ID"
        clearable
        style="width: 220px"
        @keyup.enter="fetchTasks"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="taskList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="任务ID" min-width="220" show-overflow-tooltip />
      <el-table-column prop="name" label="任务名称" min-width="150" />
      <el-table-column prop="processDefinitionId" label="流程定义" min-width="200" show-overflow-tooltip />
      <el-table-column prop="processInstanceId" label="实例ID" min-width="200" show-overflow-tooltip />
      <el-table-column prop="assignee" label="处理人" min-width="120">
        <template #default="{ row }">
          <span v-if="row.assignee">{{ row.assignee }}</span>
          <el-tag v-else size="small" type="info">未分配</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="formKey" label="表单" width="140">
        <template #default="{ row }">
          <el-tag v-if="row.formKey" size="small" type="success">
            <el-icon style="margin-right: 2px;"><Tickets /></el-icon>
            {{ formatFormKeyDisplay(row.formKey) }}
          </el-tag>
          <span v-else style="color: #c0c4cc;">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="created" label="创建时间" min-width="170" :formatter="formatTableTime" />
      <el-table-column prop="priority" label="优先级" width="80" align="center" />
      <el-table-column label="操作" width="380" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="!row.assignee"
            size="small"
            link
            type="primary"
            @click="handleClaim(row)"
          >
            签收
          </el-button>
          <el-button
            v-if="row.assignee === currentUser && !row.suspended"
            size="small"
            link
            type="success"
            @click="handleNavigateToForm(row)"
          >
            办理
          </el-button>
          <el-button
            v-if="row.assignee === currentUser && !row.suspended"
            size="small"
            link
            type="primary"
            @click="openCompleteDialog(row)"
          >
            快速完成
          </el-button>
          <el-button
            v-if="row.assignee === currentUser"
            size="small"
            link
            type="warning"
            @click="handleUnclaim(row)"
          >
            退签
          </el-button>
          <el-button
            v-if="row.assignee === currentUser"
            size="small"
            link
            type="primary"
            @click="openDelegateDialog(row)"
          >
            委派
          </el-button>
          <el-button size="small" link type="primary" @click="openDetailDialog(row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <el-dialog v-model="completeDialogVisible" title="完成任务" width="500px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="任务名称">
          <el-input :model-value="completingTask?.name" disabled />
        </el-form-item>
        <el-form-item label="任务ID">
          <el-input :model-value="completingTask?.id" disabled />
        </el-form-item>
        <el-form-item label="流程变量">
          <div class="variable-list">
            <div
              v-for="(item, index) in completeVariables"
              :key="index"
              class="variable-row"
            >
              <el-input v-model="item.key" placeholder="变量名" style="width: 160px" />
              <el-input v-model="item.value" placeholder="变量值" style="width: 160px" />
              <el-select v-model="item.type" style="width: 100px">
                <el-option label="String" value="String" />
                <el-option label="Boolean" value="Boolean" />
                <el-option label="Integer" value="Integer" />
              </el-select>
              <el-button link type="danger" @click="completeVariables.splice(index, 1)">删除</el-button>
            </div>
          </div>
          <el-button size="small" @click="completeVariables.push({ key: '', value: '', type: 'String' })" style="margin-top: 8px">
            + 添加变量
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="completeLoading" @click="handleComplete">完成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="delegateDialogVisible" title="委派任务" width="400px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="委派给">
          <el-input v-model="delegateUserId" placeholder="请输入用户ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="delegateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="delegateLoading" @click="handleDelegate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="任务详情" width="700px">
      <el-descriptions v-if="taskDetail" :column="2" border>
        <el-descriptions-item label="任务ID" :span="2">{{ taskDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ taskDetail.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ taskDetail.assignee || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(taskDetail.created) }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ taskDetail.due ? formatDateTime(taskDetail.due) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="流程定义ID" :span="2">{{ taskDetail.processDefinitionId }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID" :span="2">{{ taskDetail.processInstanceId }}</el-descriptions-item>
        <el-descriptions-item label="任务定义Key">{{ taskDetail.taskDefinitionKey }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ taskDetail.priority }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ taskDetail.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getTasks,
  getTask,
  getTaskCount,
  claimTask,
  unclaimTask,
  completeTask,
  delegateTask
} from '../../api/task'
import { parseFormKey } from '../../api/form'
import type { Task } from '../../api/task'
import { Tickets } from '@element-plus/icons-vue'
import { formatDateTime, formatTableTime } from '../../utils/format'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formatFormKeyDisplay = (formKey: string) => {
  const parsed = parseFormKey(formKey)
  if (!parsed) return formKey
  return parsed.type === 'vform' ? '低代码' : 'HTML'
}

const currentUser = ref(authStore.username)

const taskList = ref<Task[]>([])
const loading = ref(false)
const taskTab = ref('myTasks')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const search = reactive({
  name: '',
  processDefinitionKey: '',
  processInstanceId: ''
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      sortBy: 'created',
      sortOrder: 'desc',
      firstResult: (currentPage.value - 1) * pageSize.value,
      maxResults: pageSize.value
    }
    const countParams: Record<string, any> = {}
    if (taskTab.value === 'myTasks') {
      params.assignee = currentUser.value
      countParams.assignee = currentUser.value
    } else if (taskTab.value === 'unclaimed') {
      params.unassigned = true
      countParams.unassigned = true
    }
    if (search.name) {
      params.nameLike = '%' + search.name + '%'
      countParams.nameLike = params.nameLike
    }
    if (search.processDefinitionKey) {
      params.processDefinitionKey = search.processDefinitionKey
      countParams.processDefinitionKey = search.processDefinitionKey
    }
    if (search.processInstanceId) {
      params.processInstanceId = search.processInstanceId
      countParams.processInstanceId = search.processInstanceId
    }
    const [res, countRes] = await Promise.all([
      getTasks(params),
      getTaskCount(countParams)
    ])
    taskList.value = res.data
    total.value = countRes.data.count
  } catch {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTasks()
}

const resetSearch = () => {
  search.name = ''
  search.processDefinitionKey = ''
  search.processInstanceId = ''
  currentPage.value = 1
  fetchTasks()
}

const onTabChange = () => {
  currentPage.value = 1
  fetchTasks()
}

const onPageSizeChange = () => {
  currentPage.value = 1
  fetchTasks()
}

const onPageChange = () => {
  fetchTasks()
}

const handleClaim = async (row: Task) => {
  try {
    await claimTask(row.id, currentUser.value)
    ElMessage.success('签收成功')
    fetchTasks()
  } catch {
    ElMessage.error('签收失败')
  }
}

const handleNavigateToForm = (row: Task) => {
  if (row.formKey) {
    const parsed = parseFormKey(row.formKey)
    if (parsed) {
      router.push({
        path: '/form/fill',
        query: { taskId: row.id, formKey: row.formKey }
      })
      return
    }
  }
  router.push({
    path: '/form/fill',
    query: { taskId: row.id }
  })
}

const handleUnclaim = async (row: Task) => {
  try {
    await unclaimTask(row.id)
    ElMessage.success('退签成功')
    fetchTasks()
  } catch {
    ElMessage.error('退签失败')
  }
}

const completeDialogVisible = ref(false)
const completeLoading = ref(false)
const completingTask = ref<Task | null>(null)
const completeVariables = ref<{ key: string; value: string; type: string }[]>([])

const openCompleteDialog = (row: Task) => {
  completingTask.value = row
  completeVariables.value = []
  completeDialogVisible.value = true
}

const handleComplete = async () => {
  if (!completingTask.value) return
  completeLoading.value = true
  try {
    const variables: Record<string, any> = {}
    completeVariables.value.forEach((v) => {
      if (v.key) {
        let val: any = v.value
        if (v.type === 'Boolean') val = v.value === 'true'
        else if (v.type === 'Integer') val = parseInt(v.value, 10)
        variables[v.key] = { value: val, type: v.type }
      }
    })
    await completeTask(completingTask.value.id, variables)
    ElMessage.success('任务完成')
    completeDialogVisible.value = false
    fetchTasks()
  } catch {
    ElMessage.error('完成任务失败')
  } finally {
    completeLoading.value = false
  }
}

const delegateDialogVisible = ref(false)
const delegateLoading = ref(false)
const delegateTaskId = ref('')
const delegateUserId = ref('')

const openDelegateDialog = (row: Task) => {
  delegateTaskId.value = row.id
  delegateUserId.value = ''
  delegateDialogVisible.value = true
}

const handleDelegate = async () => {
  if (!delegateUserId.value) {
    ElMessage.warning('请输入委派用户ID')
    return
  }
  delegateLoading.value = true
  try {
    await delegateTask(delegateTaskId.value, delegateUserId.value)
    ElMessage.success('委派成功')
    delegateDialogVisible.value = false
    fetchTasks()
  } catch {
    ElMessage.error('委派失败')
  } finally {
    delegateLoading.value = false
  }
}

const detailDialogVisible = ref(false)
const taskDetail = ref<Task | null>(null)

const openDetailDialog = async (id: string) => {
  detailDialogVisible.value = true
  try {
    const res = await getTask(id)
    taskDetail.value = res.data
  } catch {
    ElMessage.error('获取任务详情失败')
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.task-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
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

.variable-list {
  width: 100%;
}

.variable-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
