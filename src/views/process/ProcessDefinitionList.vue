<template>
  <div class="process-def-page">
    <div class="page-header">
      <h3>流程定义</h3>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.name"
        placeholder="流程名称"
        clearable
        style="width: 200px"
        @keyup.enter="fetchDefinitions"
      />
      <el-input
        v-model="search.key"
        placeholder="流程Key"
        clearable
        style="width: 180px"
        @keyup.enter="fetchDefinitions"
      />
      <el-button type="primary" @click="fetchDefinitions">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="definitionList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" min-width="220" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="key" label="Key" min-width="150" />
      <el-table-column prop="version" label="版本" width="80" align="center" />
      <el-table-column prop="category" label="分类" min-width="100" />
      <el-table-column prop="deploymentId" label="部署ID" min-width="200" show-overflow-tooltip />
      <el-table-column prop="resource" label="资源文件" min-width="150" show-overflow-tooltip />
      <el-table-column prop="suspended" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.suspended ? 'danger' : 'success'">
            {{ row.suspended ? '已挂起' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openStartDialog(row)">启动实例</el-button>
          <el-button
            v-if="row.suspended"
            size="small"
            link
            type="success"
            @click="handleActivate(row)"
          >
            激活
          </el-button>
          <el-button
            v-else
            size="small"
            link
            type="warning"
            @click="handleSuspend(row)"
          >
            挂起
          </el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="startDialogVisible" title="启动流程实例" width="500px" :close-on-click-modal="false">
      <el-form ref="startFormRef" :model="startForm" label-width="100px">
        <el-form-item label="流程名称">
          <el-input :model-value="startProcessName" disabled />
        </el-form-item>
        <el-form-item label="业务Key">
          <el-input v-model="startForm.businessKey" placeholder="请输入业务标识Key（可选）" />
        </el-form-item>
        <el-form-item label="流程变量">
          <div class="variable-list">
            <div
              v-for="(item, index) in startForm.variables"
              :key="index"
              class="variable-row"
            >
              <el-input v-model="item.key" placeholder="变量名" style="width: 180px" />
              <el-input v-model="item.value" placeholder="变量值" style="width: 180px" />
              <el-select v-model="item.type" style="width: 100px">
                <el-option label="String" value="String" />
                <el-option label="Boolean" value="Boolean" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Long" value="Long" />
                <el-option label="Double" value="Double" />
                <el-option label="Date" value="Date" />
              </el-select>
              <el-button link type="danger" @click="removeVariable(index)">删除</el-button>
            </div>
          </div>
          <el-button size="small" @click="addVariable" style="margin-top: 8px">+ 添加变量</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="startLoading" @click="handleStart">启动</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  getProcessDefinitions,
  startProcessInstance,
  suspendProcessDefinition,
  activateProcessDefinition,
  deleteProcessDefinition,
  type ProcessDefinition
} from '../../api/processDefinition'

const definitionList = ref<ProcessDefinition[]>([])
const allDefinitions = ref<ProcessDefinition[]>([])
const loading = ref(false)

const search = reactive({ name: '', key: '' })

const fetchDefinitions = async () => {
  loading.value = true
  try {
    const res = await getProcessDefinitions()
    allDefinitions.value = res.data

    let filtered = res.data
    if (search.name) {
      const nameLower = search.name.toLowerCase()
      filtered = filtered.filter(d => (d.name || '').toLowerCase().includes(nameLower))
    }
    if (search.key) {
      const keyLower = search.key.toLowerCase()
      filtered = filtered.filter(d => (d.key || '').toLowerCase().includes(keyLower))
    }
    definitionList.value = filtered
  } catch {
    ElMessage.error('获取流程定义失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.name = ''
  search.key = ''
  fetchDefinitions()
}

const startDialogVisible = ref(false)
const startLoading = ref(false)
const startFormRef = ref<FormInstance>()
const startProcessId = ref('')
const startProcessName = ref('')

const startForm = reactive({
  businessKey: '',
  variables: [] as { key: string; value: string; type: string }[]
})

const addVariable = () => {
  startForm.variables.push({ key: '', value: '', type: 'String' })
}

const removeVariable = (index: number) => {
  startForm.variables.splice(index, 1)
}

const openStartDialog = (row: ProcessDefinition) => {
  startProcessId.value = row.id
  startProcessName.value = row.name || row.key || row.id
  startForm.businessKey = ''
  startForm.variables = []
  startDialogVisible.value = true
}

const handleStart = async () => {
  startLoading.value = true
  try {
    const variables: Record<string, any> = {}
    startForm.variables.forEach((v) => {
      if (v.key) {
        let val: any = v.value
        if (v.type === 'Boolean') val = v.value === 'true'
        else if (v.type === 'Integer') val = parseInt(v.value, 10)
        else if (v.type === 'Long') val = parseInt(v.value, 10)
        else if (v.type === 'Double') val = parseFloat(v.value)
        variables[v.key] = { value: val, type: v.type }
      }
    })
    await startProcessInstance(startProcessId.value, variables, startForm.businessKey || undefined)
    ElMessage.success('流程实例启动成功')
    startDialogVisible.value = false
  } catch {
    ElMessage.error('启动失败')
  } finally {
    startLoading.value = false
  }
}

const handleSuspend = async (row: ProcessDefinition) => {
  try {
    await ElMessageBox.confirm(
      `确定挂起流程定义 "${row.name || row.key}"？挂起后已运行的实例不受影响。`,
      '挂起确认',
      { type: 'warning' }
    )
    await suspendProcessDefinition(row.id)
    ElMessage.success('已挂起')
    fetchDefinitions()
  } catch {
    // cancelled
  }
}

const handleActivate = async (row: ProcessDefinition) => {
  try {
    await activateProcessDefinition(row.id)
    ElMessage.success('已激活')
    fetchDefinitions()
  } catch {
    ElMessage.error('激活失败')
  }
}

const handleDelete = async (row: ProcessDefinition) => {
  try {
    await ElMessageBox.confirm(
      `确定删除流程定义 "${row.name || row.key}" v${row.version}？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteProcessDefinition(row.id)
    ElMessage.success('删除成功')
    fetchDefinitions()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchDefinitions()
})
</script>

<style scoped>
.process-def-page {
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

.variable-list {
  width: 100%;
}

.variable-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
