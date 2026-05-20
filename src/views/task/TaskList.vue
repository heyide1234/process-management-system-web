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
      <el-button type="primary" @click="fetchTasks">搜索</el-button>
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
      <el-table-column prop="created" label="创建时间" min-width="170" />
      <el-table-column prop="priority" label="优先级" width="80" align="center" />
      <el-table-column label="操作" width="320" fixed="right">
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
            @click="openCompleteDialog(row)"
          >
            完成
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

    <el-dialog v-model="completeDialogVisible" title="完成任务" width="600px" :close-on-click-modal="false" @closed="onCompleteDialogClosed">
      <el-descriptions v-if="completingTask" :column="1" border style="margin-bottom: 16px">
        <el-descriptions-item label="任务名称">{{ completingTask.name }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ completingTask.assignee }}</el-descriptions-item>
      </el-descriptions>
      <FormRenderer
        v-if="completingTask"
        :key="completingTask.id"
        :task-id="completingTask.id"
        @success="onFormSuccess"
        @cancel="completeDialogVisible = false"
      />
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
        <el-descriptions-item label="创建时间">{{ taskDetail.created }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ taskDetail.due || '-' }}</el-descriptions-item>
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
import { ElMessage } from 'element-plus'
import {
  getTasks,
  getTask,
  claimTask,
  unclaimTask,
  delegateTask
} from '../../api/task'
import type { Task } from '../../api/task'
import FormRenderer from '../../components/FormRenderer.vue'

const currentUser = ref(localStorage.getItem('username') || '')

const taskList = ref<Task[]>([])
const loading = ref(false)
const taskTab = ref('myTasks')

const search = reactive({
  name: '',
  processDefinitionKey: '',
  processInstanceId: ''
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (taskTab.value === 'myTasks') {
      params.assignee = currentUser.value
    } else if (taskTab.value === 'unclaimed') {
      params.unassigned = true
    }
    if (search.name) params.nameLike = '%' + search.name + '%'
    if (search.processDefinitionKey) params.processDefinitionKey = search.processDefinitionKey
    if (search.processInstanceId) params.processInstanceId = search.processInstanceId
    const res = await getTasks(params)
    taskList.value = res.data
  } catch {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.name = ''
  search.processDefinitionKey = ''
  search.processInstanceId = ''
  fetchTasks()
}

const onTabChange = () => {
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
const completingTask = ref<Task | null>(null)

const openCompleteDialog = (row: Task) => {
  completingTask.value = row
  completeDialogVisible.value = true
}

const onFormSuccess = () => {
  completeDialogVisible.value = false
  fetchTasks()
}

const onCompleteDialogClosed = () => {
  completingTask.value = null
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
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

</style>
