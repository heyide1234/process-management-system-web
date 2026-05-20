<template>
  <div class="form-create-page">
    <div class="page-header">
      <h3>表单创建</h3>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="选择模板" name="template">
        <div class="search-bar">
          <el-input
            v-model="searchTemplate.keyword"
            placeholder="搜索表单模板"
            clearable
            style="width: 300px"
            @keyup.enter="fetchTemplates"
          />
          <el-button type="primary" @click="fetchTemplates">搜索</el-button>
        </div>

        <el-row :gutter="20" class="template-grid">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="template in templateList" :key="template.id">
            <el-card class="template-card" shadow="hover">
              <div class="card-header">
                <h4>{{ template.name }}</h4>
              </div>
              <p class="card-description" v-if="template.description">{{ template.description }}</p>
              <p class="card-meta">
                <span>创建时间：{{ template.deploymentTime }}</span>
              </p>
              <el-button type="primary" style="width: 100%" @click="fillForm(template)">
                填写此表单
              </el-button>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="templateList.length === 0 && !templateLoading" description="暂无表单模板" />
      </el-tab-pane>

      <el-tab-pane label="我的任务" name="task">
        <div class="search-bar">
          <el-input
            v-model="searchTask.keyword"
            placeholder="搜索任务名称"
            clearable
            style="width: 250px"
            @keyup.enter="fetchTasks"
          />
          <el-button type="primary" @click="fetchTasks">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="taskList" v-loading="taskLoading" border stripe>
          <el-table-column prop="name" label="任务名称" width="200" />
          <el-table-column prop="processDefinitionId" label="流程定义" width="200" show-overflow-tooltip />
          <el-table-column prop="created" label="创建时间" width="180" />
          <el-table-column prop="assignee" label="办理人" width="120" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleTask(row)">办理</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="taskList.length === 0 && !taskLoading" description="暂无待办任务" />
      </el-tab-pane>

      <el-tab-pane label="流程实例" name="instance">
        <div class="search-bar">
          <el-input
            v-model="searchInstance.keyword"
            placeholder="搜索流程实例"
            clearable
            style="width: 250px"
            @keyup.enter="fetchInstances"
          />
          <el-button type="primary" @click="fetchInstances">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>

        <el-table :data="instanceList" v-loading="instanceLoading" border stripe>
          <el-table-column prop="id" label="实例ID" width="200" show-overflow-tooltip />
          <el-table-column prop="definitionId" label="流程定义" width="200" show-overflow-tooltip />
          <el-table-column prop="businessKey" label="业务Key" width="150" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.ended ? 'info' : 'success'">
                {{ row.ended ? '已结束' : '运行中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="instanceList.length === 0 && !instanceLoading" description="暂无流程实例" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFormTemplates, getFormTemplate } from '../../api/deployment'
import { getTasks } from '../../api/task'
import { getProcessInstances } from '../../api/instance'
import type { Deployment } from '../../api/deployment'
import type { Task } from '../../api/task'
import type { ProcessInstance } from '../../api/instance'

const router = useRouter()
const activeTab = ref('template')

const templateList = ref<Deployment[]>([])
const templateLoading = ref(false)
const searchTemplate = reactive({
  keyword: ''
})

const taskList = ref<Task[]>([])
const taskLoading = ref(false)
const searchTask = reactive({
  keyword: ''
})

const instanceList = ref<ProcessInstance[]>([])
const instanceLoading = ref(false)
const searchInstance = reactive({
  keyword: ''
})

const fetchTemplates = async () => {
  templateLoading.value = true
  try {
    const res = await getFormTemplates()
    let list = res.data
    if (searchTemplate.keyword) {
      list = list.filter((item: Deployment) =>
        item.name?.toLowerCase().includes(searchTemplate.keyword.toLowerCase())
      )
    }
    templateList.value = list
  } catch {
    ElMessage.error('获取表单模板失败')
  } finally {
    templateLoading.value = false
  }
}

const fetchTasks = async () => {
  taskLoading.value = true
  try {
    const res = await getTasks()
    let list = res.data
    if (searchTask.keyword) {
      list = list.filter((item: Task) =>
        item.name?.toLowerCase().includes(searchTask.keyword.toLowerCase())
      )
    }
    taskList.value = list
  } catch {
    ElMessage.error('获取任务列表失败')
  } finally {
    taskLoading.value = false
  }
}

const fetchInstances = async () => {
  instanceLoading.value = true
  try {
    const res = await getProcessInstances()
    let list = res.data
    if (searchInstance.keyword) {
      list = list.filter((item: ProcessInstance) =>
        item.id?.toLowerCase().includes(searchInstance.keyword.toLowerCase()) ||
        item.businessKey?.toLowerCase().includes(searchInstance.keyword.toLowerCase())
      )
    }
    instanceList.value = list
  } catch {
    ElMessage.error('获取流程实例失败')
  } finally {
    instanceLoading.value = false
  }
}

const resetSearch = () => {
  if (activeTab.value === 'task') {
    searchTask.keyword = ''
    fetchTasks()
  } else if (activeTab.value === 'instance') {
    searchInstance.keyword = ''
    fetchInstances()
  }
}

const fillForm = async (template: Deployment) => {
  // 获取完整的模板信息
  try {
    const templateRes = await getFormTemplate(template.id)
    router.push({
      path: '/form/fill',
      query: { templateId: template.id }
    })
  } catch {
    ElMessage.error('加载表单模板失败')
  }
}

const handleTask = (task: Task) => {
  router.push({
    path: '/form/fill',
    query: { taskId: task.id }
  })
}

onMounted(() => {
  fetchTemplates()
  fetchTasks()
  fetchInstances()
})
</script>

<style scoped>
.form-create-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.template-grid {
  margin-top: 20px;
}

.template-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.card-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  min-height: 40px;
}

.card-meta {
  margin: 0 0 16px 0;
  color: #999;
  font-size: 12px;
}

.form-detail {
  padding: 0 8px;
}

.detail-header {
  margin-bottom: 20px;
}

.form-content h4 {
  margin-bottom: 16px;
}
</style>
