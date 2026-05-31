<template>
  <div class="form-record-page">
    <div class="page-header">
      <h3>我填过的表单</h3>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.keyword"
        placeholder="搜索流程或表单名称"
        clearable
        style="width: 250px"
        @keyup.enter="applyFilter"
      />
      <el-button type="primary" @click="applyFilter">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="recordList" v-loading="loading" border stripe>
      <el-table-column prop="processDefinitionName" label="所属流程" min-width="180" show-overflow-tooltip />
      <el-table-column prop="formName" label="表单名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.formName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="发起时间" width="180" :formatter="formatTableTime" />
      <el-table-column prop="endTime" label="完成时间" width="180">
        <template #default="{ row }">
          {{ row.endTime ? formatDateTime(row.endTime) : '进行中' }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.state === 'COMPLETED' ? 'success' : 'warning'" size="small">
            {{ row.state === 'COMPLETED' ? '已完成' : '进行中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" @click="viewRecord(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="viewDialogVisible"
      :title="viewingTitle || '表单详情'"
      width="900px"
      destroy-on-close
    >
      <div v-if="viewLoading" class="view-loading">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="viewError" class="view-error">
        <el-empty :description="viewError" />
      </div>
      <div v-else-if="viewResult && viewResult.formData" class="form-detail">
        <div class="detail-header">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="所属流程">{{ viewingRow?.processDefinitionName }}</el-descriptions-item>
            <el-descriptions-item label="发起时间">{{ formatDateTime(viewingRow?.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ viewingRow?.endTime ? formatDateTime(viewingRow.endTime) : '进行中' }}</el-descriptions-item>
            <el-descriptions-item label="表单名称">{{ viewResult.templateName }}</el-descriptions-item>
            <el-descriptions-item label="表单类型">
              <el-tag :type="viewResult.formType === 'html' ? 'warning' : 'success'" size="small">
                {{ viewResult.formType === 'html' ? 'HTML 表单' : '低代码表单' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="form-content">
          <h4>我当时填的内容</h4>
          <FormRenderer
            :template="viewResult.template"
            :form-data="viewResult.formData"
            disabled
          />
        </div>
      </div>
      <div v-else class="view-empty">
        <el-empty description="该流程没有可查看的表单" />
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import FormRenderer from '../../components/FormRenderer.vue'
import {
  getHistoricProcessInstances,
  getHistoricTasks,
  getHistoricVariableInstances,
  type HistoricProcessInstance,
  type HistoricTaskInstance,
  type HistoricVariableInstance
} from '../../api/history'
import { getProcessDefinitionXml } from '../../api/processDefinition'
import {
  getDeployment,
  getDeploymentResources,
  getDeploymentResourceData
} from '../../api/deployment'
import { extractFormKeyFromBpmnXml, parseFormKey, type FormKeyInfo } from '../../api/form'
import { formatDateTime, formatTableTime } from '../../utils/format'
import type { FormTemplate } from '../../api/deployment'

interface RecordRow {
  id: string
  processDefinitionId: string
  processDefinitionName: string
  formName: string
  startTime: string
  endTime: string | null
  state: string
}

interface ViewResult {
  template: FormTemplate
  templateName: string
  formType: string
  formData: Record<string, any>
}

const loading = ref(false)
const recordList = ref<RecordRow[]>([])

const search = reactive({
  keyword: ''
})

const viewDialogVisible = ref(false)
const viewLoading = ref(false)
const viewingRow = ref<RecordRow | null>(null)
const viewingTitle = ref('')
const viewError = ref('')
const viewResult = ref<ViewResult | null>(null)

const allRecords = ref<RecordRow[]>([])
const definitionXmlCache = new Map<string, Promise<string>>()
const templateNameCache = new Map<string, Promise<string>>()

const fetchRecords = async () => {
  loading.value = true
  try {
    const username = localStorage.getItem('username') || ''

    const tasksRes = await getHistoricTasks({
      taskAssignee: username,
      finished: true,
      maxResults: 500
    })

    const processInstanceIds = [...new Set(
      tasksRes.data
        .map(t => t.processInstanceId)
        .filter(Boolean)
    )]

    if (processInstanceIds.length === 0) {
      allRecords.value = []
      recordList.value = []
      loading.value = false
      return
    }

    const instancesRes = await getHistoricProcessInstances({
      processInstanceIds: processInstanceIds.join(','),
      sortBy: 'startTime',
      sortOrder: 'desc',
      maxResults: 200
    })

    const tasksByProcessInstanceId = groupTasksByProcessInstance(tasksRes.data)
    const rows: RecordRow[] = instancesRes.data.map((pi: HistoricProcessInstance) => ({
      id: pi.id,
      processDefinitionId: pi.processDefinitionId,
      processDefinitionName: pi.processDefinitionName || pi.processDefinitionKey,
      formName: '-',
      startTime: pi.startTime,
      endTime: pi.endTime,
      state: pi.state
    }))

    allRecords.value = await enrichRecordFormNames(rows, tasksByProcessInstanceId)
    applyFilter()
  } catch (error) {
    console.error('获取历史流程实例失败:', error)
    ElMessage.error('获取表单记录失败，请检查 Camunda History 是否开启')
    recordList.value = []
  } finally {
    loading.value = false
  }
}

const applyFilter = () => {
  if (!search.keyword) {
    recordList.value = allRecords.value
    return
  }
  const kw = search.keyword.toLowerCase()
  recordList.value = allRecords.value.filter(row =>
    row.processDefinitionName.toLowerCase().includes(kw) ||
    row.formName.toLowerCase().includes(kw)
  )
}

const resetSearch = () => {
  search.keyword = ''
  applyFilter()
}

const groupTasksByProcessInstance = (tasks: HistoricTaskInstance[]) => {
  const grouped = new Map<string, HistoricTaskInstance[]>()
  tasks.forEach((task) => {
    if (!task.processInstanceId) return
    if (!grouped.has(task.processInstanceId)) {
      grouped.set(task.processInstanceId, [])
    }
    grouped.get(task.processInstanceId)?.push(task)
  })
  return grouped
}

const enrichRecordFormNames = async (
  rows: RecordRow[],
  tasksByProcessInstanceId: Map<string, HistoricTaskInstance[]>
) => {
  return Promise.all(rows.map(async (row) => ({
    ...row,
    formName: await resolveRecordFormName(row, tasksByProcessInstanceId.get(row.id) || [])
  })))
}

const resolveRecordFormName = async (row: RecordRow, tasks: HistoricTaskInstance[]) => {
  try {
    const found = await resolveRecordFormKey(row.processDefinitionId, tasks)
    if (!found) return '-'
    return await getCachedTemplateName(found)
  } catch {
    return '-'
  }
}

const resolveRecordFormKey = async (processDefinitionId: string, tasks: HistoricTaskInstance[]) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aTime = a.endTime || a.startTime || ''
    const bTime = b.endTime || b.startTime || ''
    return bTime.localeCompare(aTime)
  })

  let bpmnXml = ''
  for (const task of sortedTasks) {
    const taskFormKey = parseFormKey(task.formKey)
    if (taskFormKey) return taskFormKey

    if (!task.taskDefinitionKey) continue
    if (!bpmnXml) {
      bpmnXml = await getCachedDefinitionXml(processDefinitionId)
    }
    const bpmnFormKey = extractFormKeyFromBpmnXml(bpmnXml, task.taskDefinitionKey)
    if (bpmnFormKey) return bpmnFormKey
  }

  return null
}

const getCachedDefinitionXml = (processDefinitionId: string) => {
  if (!definitionXmlCache.has(processDefinitionId)) {
    definitionXmlCache.set(
      processDefinitionId,
      getProcessDefinitionXml(processDefinitionId).then((res) => res.data.bpmn20Xml || '')
    )
  }
  return definitionXmlCache.get(processDefinitionId) as Promise<string>
}

const getCachedTemplateName = (formKeyInfo: FormKeyInfo) => {
  const cacheKey = `${formKeyInfo.type}:${formKeyInfo.templateId}`
  if (!templateNameCache.has(cacheKey)) {
    templateNameCache.set(
      cacheKey,
      getDeployment(formKeyInfo.templateId).then((res) => normalizeDeploymentFormName(res.data.name) || '-')
    )
  }
  return templateNameCache.get(cacheKey) as Promise<string>
}

const normalizeDeploymentFormName = (deploymentName: string) => {
  let cleanName = deploymentName || ''
  if (cleanName.endsWith('.form.json') || cleanName.endsWith('.form.html')) {
    cleanName = cleanName.slice(0, -10)
  } else if (cleanName.endsWith('.json')) {
    cleanName = cleanName.slice(0, -5)
  } else if (cleanName.endsWith('.html')) {
    cleanName = cleanName.slice(0, -5)
  } else if (cleanName.endsWith('.htm')) {
    cleanName = cleanName.slice(0, -4)
  }
  return cleanName
}

const loadTemplateFromDeployment = async (deploymentId: string, formType: string): Promise<FormTemplate> => {
  const deploymentRes = await getDeployment(deploymentId)
  const resourcesRes = await getDeploymentResources(deploymentId)

  const cleanName = normalizeDeploymentFormName(deploymentRes.data.name)

  const tmpl: FormTemplate = {
    id: deploymentId,
    name: cleanName,
    type: formType as FormTemplate['type'],
    fields: [],
    createdAt: deploymentRes.data.deploymentTime,
    updatedAt: deploymentRes.data.deploymentTime
  }

  for (const resource of resourcesRes.data) {
    if (resource.name.endsWith('.description.txt')) {
      try {
        const descRes = await getDeploymentResourceData(deploymentId, resource.id)
        tmpl.description = await (descRes.data as Blob).text()
      } catch { /* ignore */ }
    }
    if (resource.name.endsWith('.form.json')) {
      try {
        const jsonRes = await getDeploymentResourceData(deploymentId, resource.id)
        const jsonText = await (jsonRes.data as Blob).text()
        tmpl.vformJson = JSON.parse(jsonText)
      } catch { /* ignore */ }
    }
    if (resource.name.endsWith('.form.html')) {
      try {
        const htmlRes = await getDeploymentResourceData(deploymentId, resource.id)
        tmpl.htmlContent = await (htmlRes.data as Blob).text()
      } catch { /* ignore */ }
    }
  }

  return tmpl
}

const viewRecord = async (row: RecordRow) => {
  viewingRow.value = row
  viewingTitle.value = row.formName && row.formName !== '-'
    ? `${row.formName} - ${row.processDefinitionName}`
    : row.processDefinitionName
  viewResult.value = null
  viewError.value = ''
  viewDialogVisible.value = true
  viewLoading.value = true

  try {
    const username = localStorage.getItem('username') || ''

    const [tasksRes, xmlRes] = await Promise.all([
      getHistoricTasks({
        processInstanceId: row.id,
        taskAssignee: username
      }),
      getProcessDefinitionXml(row.processDefinitionId)
    ])

    const bpmnXml = xmlRes.data.bpmn20Xml

    let found: FormKeyInfo | null = null
    const tasks = [...tasksRes.data].sort((a, b) => {
      const aTime = a.endTime || a.startTime || ''
      const bTime = b.endTime || b.startTime || ''
      return bTime.localeCompare(aTime)
    })

    for (const task of tasks) {
      found = parseFormKey(task.formKey)
      if (found) break

      if (!task.taskDefinitionKey) continue
      found = extractFormKeyFromBpmnXml(bpmnXml, task.taskDefinitionKey)
      if (found) break
    }

    if (!found) {
      viewError.value = '该流程没有关联表单模板'
      viewLoading.value = false
      return
    }

    const template = await loadTemplateFromDeployment(found.templateId, found.type)
    const taskIds = tasks.map(task => task.id).filter(Boolean)
    const variableQueries = [
      getHistoricVariableInstances({
        processInstanceId: row.id,
        maxResults: 1000,
        deserializeValues: true
      })
    ]

    if (taskIds.length > 0) {
      variableQueries.push(getHistoricVariableInstances({
        taskIdIn: taskIds.join(','),
        maxResults: 1000,
        deserializeValues: true
      }))
    }

    const variableResponses = await Promise.all(variableQueries)
    const formData = buildFormDataFromHistoricVariables(
      variableResponses.flatMap(res => res.data || [])
    )

    viewResult.value = {
      template,
      templateName: template.name,
      formType: found.type,
      formData
    }
  } catch (error: any) {
    console.error('加载表单详情失败:', error)
    if (error?.response?.status === 404) {
      viewError.value = '流程定义可能已被删除，无法查看历史表单'
    } else {
      viewError.value = '加载表单详情失败'
    }
  } finally {
    viewLoading.value = false
  }
}

const buildFormDataFromHistoricVariables = (variables: HistoricVariableInstance[]): Record<string, any> => {
  const data: Record<string, any> = {}

  for (const variable of variables) {
    if (!variable.name) continue
    data[variable.name] = normalizeHistoricVariableValue(variable)
  }

  return data
}

const normalizeHistoricVariableValue = (variable: HistoricVariableInstance) => {
  const value = variable.value
  if (typeof value === 'string' && shouldParseHistoricJsonValue(variable)) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

const shouldParseHistoricJsonValue = (variable: HistoricVariableInstance) => {
  const type = (variable.type || '').toLowerCase()
  const value = variable.value
  if (type === 'json' || type === 'object') return true
  if (typeof value !== 'string') return false

  const text = value.trim()
  return (
    (text.startsWith('{') && text.endsWith('}')) ||
    (text.startsWith('[') && text.endsWith(']'))
  )
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.form-record-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.view-loading {
  padding: 24px;
}

.view-error {
  padding: 24px;
}

.view-empty {
  padding: 24px;
}

.form-detail {
  padding: 0 8px;
}

.detail-header {
  margin-bottom: 20px;
}

.form-content h4 {
  margin: 0 0 16px 0;
  color: #606266;
}
</style>
