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

    <el-table :data="definitionGroups" v-loading="loading" border stripe>
      <el-table-column label="流程名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.latest.name || row.key || '-' }}</template>
      </el-table-column>
      <el-table-column prop="key" label="流程Key" min-width="160" show-overflow-tooltip />
      <el-table-column label="最新版本" width="100" align="center">
        <template #default="{ row }">v{{ row.latest.version }}</template>
      </el-table-column>
      <el-table-column label="版本数" width="90" align="center">
        <template #default="{ row }">{{ row.versions.length }}</template>
      </el-table-column>
      <el-table-column label="分类" min-width="100" show-overflow-tooltip>
        <template #default="{ row }">{{ row.latest.category || '-' }}</template>
      </el-table-column>
      <el-table-column label="最新部署时间" min-width="170">
        <template #default="{ row }">{{ formatDeploymentTime(row.latest) }}</template>
      </el-table-column>
      <el-table-column label="资源文件" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.latest.resource || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.latest.suspended ? 'danger' : 'success'">
            {{ row.latest.suspended ? '已挂起' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="定义ID" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.latest.id }}</template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openStartDialog(row.latest)">启动最新版</el-button>
          <el-button size="small" link type="primary" @click="openVersionDialog(row)">版本</el-button>
          <el-button
            v-if="row.latest.suspended"
            size="small"
            link
            type="success"
            @click="handleActivate(row.latest)"
          >
            激活
          </el-button>
          <el-button
            v-else
            size="small"
            link
            type="warning"
            @click="handleSuspend(row.latest)"
          >
            挂起
          </el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row.latest)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="versionDialogVisible"
      :title="selectedVersionGroup ? `${selectedVersionGroup.latest.name || selectedVersionGroup.key} 的版本` : '流程版本'"
      width="980px"
    >
      <el-table :data="selectedVersionGroup?.versions || []" border stripe>
        <el-table-column prop="version" label="版本" width="80" align="center">
          <template #default="{ row }">v{{ row.version }}</template>
        </el-table-column>
        <el-table-column prop="name" label="流程名称" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.name || row.key || '-' }}</template>
        </el-table-column>
        <el-table-column label="部署时间" min-width="170">
          <template #default="{ row }">{{ formatDeploymentTime(row) }}</template>
        </el-table-column>
        <el-table-column label="发布名称" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">{{ getDeploymentName(row.deploymentId) }}</template>
        </el-table-column>
        <el-table-column prop="resource" label="资源文件" min-width="150" show-overflow-tooltip />
        <el-table-column prop="suspended" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.suspended ? 'danger' : 'success'">
              {{ row.suspended ? '已挂起' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="定义ID" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDefinitionViewer(row)">查看流程</el-button>
            <el-button size="small" link type="primary" @click="openDefinitionDesigner(row)">设计</el-button>
            <el-button size="small" link type="primary" @click="openStartDialog(row)">启动</el-button>
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
    </el-dialog>

    <BpmnDefinitionViewerDialog
      v-model="definitionViewerVisible"
      :definition="viewingDefinition"
      :deployment-name="viewingDefinition ? getDeploymentName(viewingDefinition.deploymentId) : ''"
      :deployment-time="viewingDefinition ? formatDeploymentTime(viewingDefinition) : ''"
    />

    <el-dialog v-model="startDialogVisible" title="启动流程实例" width="500px" :close-on-click-modal="false">
      <el-form ref="startFormRef" :model="startForm" label-width="100px">
        <el-form-item label="流程名称">
          <el-input :model-value="startProcessName" disabled />
        </el-form-item>
        <el-form-item label="业务Key">
          <el-input v-model="startForm.businessKey" placeholder="请输入业务标识Key（可选）" />
        </el-form-item>
        <el-form-item v-if="startFormTemplate" label="启动表单">
          <div class="start-form-wrapper">
            <FormRenderer
              :template="startFormTemplate"
              :form-data="startFormData"
              ref="startFormRendererRef"
            />
          </div>
        </el-form-item>
        <el-form-item v-else label="流程变量">
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import BpmnDefinitionViewerDialog from '../../components/BpmnDefinitionViewerDialog.vue'
import FormRenderer from '../../components/FormRenderer.vue'
import { getDeployments, type Deployment } from '../../api/deployment'
import {
  getProcessDefinitions,
  startProcessInstance,
  suspendProcessDefinition,
  activateProcessDefinition,
  deleteProcessDefinition,
  getProcessDefinitionXml,
  type ProcessDefinition
} from '../../api/processDefinition'
import {
  getDeployment,
  getDeploymentResources,
  getDeploymentResourceData
} from '../../api/deployment'
import type { FormTemplate } from '../../api/deployment'
import {
  buildFormKey,
  buildFormSubmissionData,
  convertToCamundaVariables,
  extractStartFormKeyFromBpmnXml,
  hasFormSubmissionData,
  type FormKeyInfo
} from '../../api/form'
import { getProcessInstanceCount } from '../../api/instance'
import { formatTableTime } from '../../utils/format'

interface ProcessDefinitionGroup {
  key: string
  latest: ProcessDefinition
  versions: ProcessDefinition[]
}

const definitionGroups = ref<ProcessDefinitionGroup[]>([])
const allDefinitions = ref<ProcessDefinition[]>([])
const deploymentMap = ref<Record<string, Deployment>>({})
const loading = ref(false)
const versionDialogVisible = ref(false)
const selectedVersionGroup = ref<ProcessDefinitionGroup | null>(null)
const definitionViewerVisible = ref(false)
const viewingDefinition = ref<ProcessDefinition | null>(null)
const router = useRouter()

const search = reactive({ name: '', key: '' })

const fetchDefinitions = async () => {
  loading.value = true
  try {
    const [res, deploymentRes] = await Promise.all([
      getProcessDefinitions(),
      getDeployments({ sortBy: 'deploymentTime', sortOrder: 'desc' })
    ])
    allDefinitions.value = res.data
    deploymentMap.value = Object.fromEntries(deploymentRes.data.map((deployment) => [deployment.id, deployment]))

    const allGroups = buildDefinitionGroups(res.data)
    definitionGroups.value = filterDefinitionGroups(allGroups)
    syncSelectedVersionGroup(allGroups)
  } catch {
    ElMessage.error('获取流程定义失败')
  } finally {
    loading.value = false
  }
}

const buildDefinitionGroups = (definitions: ProcessDefinition[]): ProcessDefinitionGroup[] => {
  const grouped = new Map<string, ProcessDefinition[]>()
  definitions.forEach((definition) => {
    const key = definition.key || definition.id
    grouped.set(key, [...(grouped.get(key) || []), definition])
  })

  return Array.from(grouped.entries())
    .map(([key, versions]) => {
      const sortedVersions = [...versions].sort((a, b) => b.version - a.version)
      return {
        key,
        latest: sortedVersions[0],
        versions: sortedVersions
      }
    })
    .sort((a, b) => {
      const aTime = deploymentMap.value[a.latest.deploymentId]?.deploymentTime || ''
      const bTime = deploymentMap.value[b.latest.deploymentId]?.deploymentTime || ''
      return bTime.localeCompare(aTime)
    })
}

const filterDefinitionGroups = (groups: ProcessDefinitionGroup[]) => {
  const nameLower = search.name.trim().toLowerCase()
  const keyLower = search.key.trim().toLowerCase()

  return groups.filter((group) => {
    const matchesName = !nameLower || group.versions.some((definition) => {
      const name = definition.name || ''
      return name.toLowerCase().includes(nameLower)
    })
    const matchesKey = !keyLower || group.key.toLowerCase().includes(keyLower)
    return matchesName && matchesKey
  })
}

const syncSelectedVersionGroup = (groups: ProcessDefinitionGroup[]) => {
  if (!selectedVersionGroup.value) return

  const refreshed = groups.find(group => group.key === selectedVersionGroup.value?.key)
  if (refreshed) {
    selectedVersionGroup.value = refreshed
    return
  }

  selectedVersionGroup.value = null
  versionDialogVisible.value = false
}

const getDeploymentName = (deploymentId: string) => {
  return deploymentMap.value[deploymentId]?.name || '-'
}

const formatDeploymentTime = (row: ProcessDefinition) => {
  const deploymentTime = deploymentMap.value[row.deploymentId]?.deploymentTime
  return deploymentTime ? formatTableTime(null, null, deploymentTime) : '-'
}

const resetSearch = () => {
  search.name = ''
  search.key = ''
  fetchDefinitions()
}

const openVersionDialog = (group: ProcessDefinitionGroup) => {
  selectedVersionGroup.value = group
  versionDialogVisible.value = true
}

const openDefinitionViewer = (row: ProcessDefinition) => {
  viewingDefinition.value = row
  definitionViewerVisible.value = true
}

const openDefinitionDesigner = (row: ProcessDefinition) => {
  versionDialogVisible.value = false
  router.push({
    name: 'BpmnDesigner',
    query: {
      sourceDefinitionId: row.id
    }
  })
}

const startDialogVisible = ref(false)
const startLoading = ref(false)
const startFormRef = ref<FormInstance>()
const startProcessId = ref('')
const startProcessName = ref('')
const startFormRendererRef = ref<any>(null)
const startFormTemplate = ref<FormTemplate | null>(null)
const startFormKeyInfo = ref<FormKeyInfo | null>(null)
const startFormData = reactive<Record<string, any>>({})

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

const openStartDialog = async (row: ProcessDefinition) => {
  startProcessId.value = row.id
  startProcessName.value = row.name || row.key || row.id
  startForm.businessKey = ''
  startForm.variables = []
  startFormTemplate.value = null
  startFormKeyInfo.value = null
  Object.keys(startFormData).forEach((key) => delete startFormData[key])
  startDialogVisible.value = true

  try {
    const xmlRes = await getProcessDefinitionXml(row.id)
    const startFormKey = extractStartFormKeyFromBpmnXml(xmlRes.data.bpmn20Xml || '')
    if (startFormKey) {
      startFormKeyInfo.value = startFormKey
      startFormTemplate.value = await loadTemplateFromDeployment(startFormKey.templateId, startFormKey.type)
    }
  } catch {
    // 启动表单是增强能力，读取失败时仍保留手工变量启动。
  }
}

const handleStart = async () => {
  startLoading.value = true
  try {
    const variables: Record<string, any> = {}
    if (startFormTemplate.value && startFormRendererRef.value) {
      const formData = await startFormRendererRef.value.getFormData()
      if (startFormTemplate.value.type === 'html' && !hasFormSubmissionData(formData)) {
        ElMessage.warning('没有采集到 HTML 表单字段，请给输入控件配置 name、id、data-field，或暴露 window.htmlFormApi.getData()')
        return
      }

      const formKey = startFormKeyInfo.value
        ? buildFormKey(startFormKeyInfo.value.type, startFormKeyInfo.value.templateId)
        : startFormTemplate.value.formKey
      const formPayload = buildFormSubmissionData(formData, {
        formKey,
        formType: startFormTemplate.value.type,
        processDefinitionKey: startProcessId.value,
        source: 'start'
      })
      Object.assign(variables, convertToCamundaVariables(formPayload))
    } else {
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
    }
    await startProcessInstance(startProcessId.value, variables, startForm.businessKey || undefined)
    ElMessage.success('流程实例启动成功')
    startDialogVisible.value = false
  } catch {
    ElMessage.error('启动失败')
  } finally {
    startLoading.value = false
  }
}

const loadTemplateFromDeployment = async (deploymentId: string, formType: string): Promise<FormTemplate> => {
  const deploymentRes = await getDeployment(deploymentId)
  const resourcesRes = await getDeploymentResources(deploymentId)

  let cleanName = deploymentRes.data.name
  if (cleanName.endsWith('.form.json') || cleanName.endsWith('.form.html')) {
    cleanName = cleanName.slice(0, -10)
  } else if (cleanName.endsWith('.json')) {
    cleanName = cleanName.slice(0, -5)
  }

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

const handleSuspend = async (row: ProcessDefinition) => {
  try {
    await ElMessageBox.confirm(
      `确定挂起流程定义 "${row.name || row.key}"？挂起后已运行的实例不受影响。`,
      '挂起确认',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
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

const getErrorMessage = (error: any) => {
  return error?.response?.data?.message || error?.message || ''
}

const isDeleteBlockedByInstances = (error: any) => {
  const message = getErrorMessage(error)
  return (
    message.includes('without cascading failed') ||
    message.includes("can't be deleted") ||
    message.includes('dependening process instances') ||
    message.includes('dependent process instances')
  )
}

const getRunningInstanceCount = async (processDefinitionId: string) => {
  try {
    const res = await getProcessInstanceCount({ processDefinitionId })
    return res.data.count
  } catch {
    return null
  }
}

const confirmDeleteDefinition = async (
  row: ProcessDefinition,
  options?: { cascade?: boolean; runningCount?: number | null; afterBlockedError?: boolean }
) => {
  const cascade = options?.cascade || false
  const runningCount = options?.runningCount
  const processName = row.name || row.key
  const detail = runningCount !== undefined && runningCount !== null
    ? `当前版本下还有 ${runningCount} 个运行中的流程实例。`
    : '当前版本下仍有关联流程实例。'
  const message = cascade
    ? `确定级联删除流程定义 "${processName}" v${row.version}？${detail}级联删除会同时删除这些实例相关的任务、变量和运行数据。`
    : `确定删除流程定义 "${processName}" v${row.version}？如果该版本下存在流程实例，Camunda 会拒绝普通删除。`
  const title = cascade
    ? (options?.afterBlockedError ? '普通删除失败，需要级联删除' : '级联删除确认')
    : '删除确认'

  try {
    await ElMessageBox.confirm(
      message,
      title,
      {
        type: 'warning',
        confirmButtonText: cascade ? '级联删除' : '删除',
        cancelButtonText: '取消',
        confirmButtonClass: cascade ? 'el-button--danger' : undefined
      }
    )
    return true
  } catch {
    return false
  }
}

const deleteDefinition = async (row: ProcessDefinition, cascade: boolean) => {
  await deleteProcessDefinition(row.id, cascade)
  ElMessage.success(cascade ? '已级联删除' : '删除成功')
  await fetchDefinitions()
}

const handleDelete = async (row: ProcessDefinition) => {
  const runningCount = await getRunningInstanceCount(row.id)
  const shouldCascade = runningCount !== null && runningCount > 0
  const confirmed = await confirmDeleteDefinition(row, {
    cascade: shouldCascade,
    runningCount: shouldCascade ? runningCount : null
  })
  if (!confirmed) return

  try {
    await deleteDefinition(row, shouldCascade)
  } catch (error: any) {
    if (!shouldCascade && isDeleteBlockedByInstances(error)) {
      const cascadeConfirmed = await confirmDeleteDefinition(row, {
        cascade: true,
        runningCount: null,
        afterBlockedError: true
      })
      if (!cascadeConfirmed) return

      try {
        await deleteDefinition(row, true)
      } catch (cascadeError: any) {
        ElMessage.error(getErrorMessage(cascadeError) || '级联删除失败')
      }
      return
    }

    ElMessage.error(getErrorMessage(error) || '删除失败')
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

.start-form-wrapper {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}
</style>
