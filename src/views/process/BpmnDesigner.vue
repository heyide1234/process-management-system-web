<template>
  <div class="bpmn-designer">
    <div class="designer-toolbar">
      <el-button-group class="toolbar-left">
        <el-button size="small" @click="createNew">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
        <el-button size="small" @click="openModelDialog">
          <el-icon><FolderOpened /></el-icon>
          打开草稿
        </el-button>
        <el-button size="small" @click="openSaveModelDialog">
          <el-icon><DocumentChecked /></el-icon>
          保存草稿
        </el-button>
        <el-button size="small" @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button size="small" @click="handleExportXml">
          <el-icon><Download /></el-icon>
          导出XML
        </el-button>
        <el-button size="small" @click="handleExportSvg">
          <el-icon><Picture /></el-icon>
          导出SVG
        </el-button>
        <el-button size="small" type="success" @click="openFormDialog" :disabled="!selectedFormElement">
          <el-icon><Tickets /></el-icon>
          关联表单
        </el-button>
      </el-button-group>

      <div class="selected-info">
        <template v-if="selectedFormElement">
          <span>当前节点：{{ selectedFormElementName }}</span>
          <el-tag v-if="selectedFormKey" size="small" type="success">{{ selectedFormKey }}</el-tag>
          <el-tag v-else size="small" type="warning">未关联表单</el-tag>
        </template>
        <span v-else>请选择开始事件或用户任务以关联表单</span>
      </div>

      <div class="toolbar-right">
        <el-input
          v-model="deploymentName"
          placeholder="部署名称"
          size="small"
          style="width: 200px; margin-right: 8px"
        />
        <el-button type="primary" size="small" @click="handleDeploy" :loading="deploying">
          部署到引擎
        </el-button>
      </div>
    </div>

    <div class="designer-body">
      <div class="designer-canvas" ref="canvasRef"></div>
      <div class="designer-side">
        <div class="form-key-panel">
          <div class="form-key-panel-title">节点表单</div>
          <template v-if="selectedFormElement">
            <div class="form-key-node">{{ selectedFormElementName }}</div>
            <el-input
              v-model="manualFormKey"
              size="small"
              placeholder="例如 html:部署ID 或 vform:部署ID"
              clearable
              @keyup.enter="applyManualFormKey"
            />
            <div class="form-key-actions">
              <el-button size="small" type="primary" @click="applyManualFormKey">应用</el-button>
              <el-button size="small" @click="clearManualFormKey">清空</el-button>
              <el-button size="small" type="success" @click="openFormDialog">选择模板</el-button>
            </div>
          </template>
          <div v-else class="form-key-empty">选择开始事件或用户任务后，可在这里填写 fromKey。</div>
        </div>
        <div class="designer-properties" ref="propertiesRef">
        </div>
      </div> 
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".bpmn,.xml"
      style="display: none"
      @change="handleFileChange"
    />

    <el-dialog v-model="modelDialogVisible" title="流程模型草稿" width="900px">
      <div class="dialog-search-bar">
        <el-input
          v-model="modelSearch"
          placeholder="搜索流程名称或Key"
          clearable
          style="width: 260px"
          @keyup.enter="fetchModels"
        />
        <el-button type="primary" @click="fetchModels">搜索</el-button>
      </div>
      <el-table :data="models" v-loading="modelLoading" border stripe height="420">
        <el-table-column prop="name" label="流程名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="modelKey" label="流程Key" min-width="150" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'DEPLOYED' ? 'success' : 'info'" size="small">
              {{ row.status === 'DEPLOYED' ? '已部署' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="170" :formatter="formatTableTime" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openModel(row)">打开</el-button>
            <el-button size="small" link type="danger" @click="removeModel(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="saveDialogVisible" title="保存流程草稿" width="520px" :close-on-click-modal="false">
      <el-form :model="modelForm" label-width="100px">
        <el-form-item label="流程名称" required>
          <el-input v-model="modelForm.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="流程Key" required>
          <el-input v-model="modelForm.modelKey" placeholder="请输入流程Key" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="modelForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingModel" @click="handleSaveModel">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="formDialogVisible" title="关联表单模板" width="900px">
      <div class="dialog-search-bar">
        <el-input
          v-model="formSearch"
          placeholder="搜索表单名称"
          clearable
          style="width: 260px"
        />
        <el-radio-group v-model="formTypeFilter" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="vform">低代码</el-radio-button>
          <el-radio-button value="html">HTML</el-radio-button>
        </el-radio-group>
        <el-button :loading="formLoading" @click="fetchFormTemplates">刷新</el-button>
      </div>
      <el-table :data="filteredFormTemplates" v-loading="formLoading" border stripe height="420">
        <el-table-column prop="name" label="模板名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.formType === 'html' ? 'warning' : 'success'" size="small">
              {{ row.formType === 'html' ? 'HTML' : '低代码' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="formKey" label="formKey" min-width="260" show-overflow-tooltip />
        <el-table-column prop="deploymentTime" label="部署时间" min-width="170" :formatter="formatTableTime" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="applyFormTemplate(row)">关联</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  FolderOpened,
  Download,
  Picture,
  Upload,
  Tickets,
  DocumentChecked
} from '@element-plus/icons-vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform'
import {
  createDeployment,
  getDeployments,
  translateDeployError,
  type Deployment,
  type FormType
} from '../../api/deployment'
import {
  createProcessModel,
  deleteProcessModel,
  getProcessModels,
  markProcessModelDeployed,
  updateProcessModel,
  type ProcessModel
} from '../../api/processModel'
import {
  getProcessDefinition,
  getProcessDefinitionXml,
  type ProcessDefinition
} from '../../api/processDefinition'
import { buildFormKey } from '../../api/form'
import { formatTableTime } from '../../utils/format'
import BpmnChineseTranslateModule from '../../utils/bpmnChineseTranslate'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'

interface FormTemplateOption extends Deployment {
  formType: FormType
  formKey: string
}

interface ValidationResult {
  errors: string[]
  warnings: string[]
}

const BLANK_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:modeler="http://camunda.org/schema/modeler/1.0"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" name="新建流程" isExecutable="true" camunda:historyTimeToLive="180">
    <bpmn:startEvent id="StartEvent_1" name="开始" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

const CAMUNDA_NS = 'http://camunda.org/schema/1.0/bpmn'
const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const LEGACY_LOCAL_DRAFT_KEY = 'process-designer-local-draft'
const DEFAULT_PROCESS_NAME = '新建流程'

const canvasRef = ref<HTMLDivElement>()
const propertiesRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()
const route = useRoute()
const deploymentName = ref('')
const deploying = ref(false)

const currentModelId = ref<number | null>(null)
const modelDialogVisible = ref(false)
const saveDialogVisible = ref(false)
const modelLoading = ref(false)
const savingModel = ref(false)
const modelSearch = ref('')
const models = ref<ProcessModel[]>([])
const modelForm = reactive({
  name: '',
  modelKey: '',
  description: ''
})

const formDialogVisible = ref(false)
const formLoading = ref(false)
const formSearch = ref('')
const formTypeFilter = ref<'all' | FormType>('all')
const formTemplates = ref<FormTemplateOption[]>([])

const selectedFormElement = ref<any | null>(null)
const selectedFormKey = ref('')
const manualFormKey = ref('')

let modeler: any = null

const createProcessKey = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, '')
    .slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `Process_${timestamp}_${suffix}`
}

const createBlankDiagram = () => {
  const processKey = createProcessKey()
  return {
    processKey,
    processName: DEFAULT_PROCESS_NAME,
    xml: BLANK_DIAGRAM.replace(/Process_1/g, processKey)
  }
}

const selectedFormElementName = computed(() => {
  if (!selectedFormElement.value) return ''
  const bo = selectedFormElement.value.businessObject
  return bo?.name || bo?.id || selectedFormElement.value.id
})

const filteredFormTemplates = computed(() => {
  const keyword = formSearch.value.trim().toLowerCase()
  return formTemplates.value.filter((item) => {
    const matchType = formTypeFilter.value === 'all' || item.formType === formTypeFilter.value
    const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.formKey.toLowerCase().includes(keyword)
    return matchType && matchKeyword
  })
})

const initModeler = async () => {
  if (!canvasRef.value || !propertiesRef.value) return
  modeler = new BpmnModeler({
    container: canvasRef.value,
    propertiesPanel: {
      parent: propertiesRef.value
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      CamundaBehaviorsModule,
      BpmnChineseTranslateModule
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    }
  })

  const eventBus = modeler.get('eventBus')
  eventBus.on('selection.changed', (event: any) => {
    updateSelectedElement(event.newSelection?.[0] || null)
  })
  eventBus.on('element.changed', (event: any) => {
    if (selectedFormElement.value && event.element?.id === selectedFormElement.value.id) {
      nextTick(() => updateSelectedElement(event.element))
    }
  })

  localStorage.removeItem(LEGACY_LOCAL_DRAFT_KEY)
  const sourceDefinitionId = getRouteSourceDefinitionId()
  if (sourceDefinitionId) {
    await openDeployedDefinitionAsEditable(sourceDefinitionId)
    return
  }

  await openBlankDiagram()
}

const getRouteSourceDefinitionId = () => {
  const sourceDefinitionId = route.query.sourceDefinitionId
  return typeof sourceDefinitionId === 'string' ? sourceDefinitionId : ''
}

const openDeployedDefinitionAsEditable = async (definitionId: string) => {
  try {
    const [definitionRes, xmlRes] = await Promise.all([
      getProcessDefinition(definitionId),
      getProcessDefinitionXml(definitionId)
    ])
    const definition = definitionRes.data
    currentModelId.value = null
    applyDefinitionMeta(definition)
    if (xmlRes.data.bpmn20Xml) {
      await importDiagram(xmlRes.data.bpmn20Xml)
    } else {
      await openBlankDiagram()
    }
    ElMessage.success(`已打开 ${definition.name || definition.key} v${definition.version}，修改后部署会生成新版本`)
  } catch (error) {
    console.error('打开流程版本失败:', error)
    await openBlankDiagram()
    ElMessage.error('打开流程版本失败')
  }
}

const applyDefinitionMeta = (definition: ProcessDefinition) => {
  const name = definition.name || definition.key || '流程'
  modelForm.name = name
  modelForm.modelKey = definition.key || ''
  modelForm.description = definition.description || ''
  deploymentName.value = `${name}-v${definition.version}`
}

const importDiagram = async (xml: string) => {
  if (!modeler) return
  await modeler.importXML(xml)
  const canvas = modeler.get('canvas')
  canvas.zoom('fit-viewport')
  syncMetaFromXml(xml)
  updateSelectedElement(null)
}

const updateSelectedElement = (element: any | null) => {
  if (element?.type === 'bpmn:UserTask' || element?.type === 'bpmn:StartEvent') {
    const liveElement = getLiveElement(element) || element
    selectedFormElement.value = liveElement
    selectedFormKey.value = getElementFormKey(liveElement)
    manualFormKey.value = selectedFormKey.value
  } else {
    selectedFormElement.value = null
    selectedFormKey.value = ''
    manualFormKey.value = ''
  }
}

const getElementFormKey = (element: any) => {
  const bo = element?.businessObject
  const formKey = bo?.get?.('camunda:formKey')
  if (typeof formKey === 'string') {
    return formKey
  }
  return bo?.formKey || ''
}

const getElementFormData = (element: any) => {
  const extensionElements = element?.businessObject?.get?.('extensionElements')
  const values = extensionElements?.get?.('values') || extensionElements?.values || []
  return values.find((value: any) => value?.$type === 'camunda:FormData') || null
}

const getLiveElement = (element: any | null) => {
  if (!element || !modeler) return element
  const elementRegistry = modeler.get('elementRegistry')
  return elementRegistry?.get?.(element.id) || element
}

const refreshSelectedFormElement = () => {
  if (!selectedFormElement.value) return
  updateSelectedElement(getLiveElement(selectedFormElement.value))
}

const openBlankDiagram = async () => {
  if (!modeler) return
  const blankDiagram = createBlankDiagram()
  currentModelId.value = null
  deploymentName.value = ''
  modelForm.name = blankDiagram.processName
  modelForm.modelKey = blankDiagram.processKey
  modelForm.description = ''
  await importDiagram(blankDiagram.xml)
}

const createNew = async () => {
  await openBlankDiagram()
  ElMessage.success('新建空白流程图')
}

const openModelDialog = () => {
  modelDialogVisible.value = true
  fetchModels()
}

const fetchModels = async () => {
  modelLoading.value = true
  try {
    const res = await getProcessModels({ keyword: modelSearch.value || undefined })
    models.value = res.data
  } catch {
    ElMessage.error('获取流程模型草稿失败')
  } finally {
    modelLoading.value = false
  }
}

const openModel = async (row: ProcessModel) => {
  try {
    currentModelId.value = row.id
    deploymentName.value = row.name
    modelForm.name = row.name
    modelForm.modelKey = row.modelKey
    modelForm.description = row.description || ''
    await importDiagram(row.bpmnXml)
    modelDialogVisible.value = false
    ElMessage.success('流程草稿已打开')
  } catch {
    ElMessage.error('打开流程草稿失败')
  }
}

const removeModel = async (row: ProcessModel) => {
  try {
    await ElMessageBox.confirm(`确定删除流程草稿 "${row.name}"？`, '删除确认', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
    await deleteProcessModel(row.id)
    ElMessage.success('删除成功')
    fetchModels()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error('删除失败')
  }
}

const openSaveModelDialog = async () => {
  const xml = await getCurrentXml()
  if (xml) {
    syncMetaFromXml(xml)
  }
  saveDialogVisible.value = true
}

const handleSaveModel = async () => {
  if (!modelForm.name.trim()) {
    ElMessage.warning('请输入流程名称')
    return
  }
  if (!modelForm.modelKey.trim()) {
    ElMessage.warning('请输入流程Key')
    return
  }

  savingModel.value = true
  try {
    const xml = await getCurrentXml()
    if (!xml) return
    const payload = {
      name: modelForm.name.trim(),
      modelKey: modelForm.modelKey.trim(),
      description: modelForm.description,
      bpmnXml: xml
    }
    const res = currentModelId.value
      ? await updateProcessModel(currentModelId.value, payload)
      : await createProcessModel(payload)

    currentModelId.value = res.data.id
    deploymentName.value = res.data.name
    saveDialogVisible.value = false
    ElMessage.success('流程草稿已保存')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.error || '保存流程草稿失败')
  } finally {
    savingModel.value = false
  }
}

const handleImport = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !modeler) return

  try {
    const text = await file.text()
    currentModelId.value = null
    await importDiagram(text)
    deploymentName.value = file.name.replace(/\.(bpmn|xml)$/i, '')
    ElMessage.success('导入成功')
  } catch {
    ElMessage.error('导入失败，请检查文件是否为有效的 BPMN 文件')
  } finally {
    target.value = ''
  }
}

const handleExportXml = async () => {
  if (!modeler) return
  try {
    const xml = await getCurrentXml()
    if (!xml) return
    downloadFile(xml, deploymentName.value || modelForm.name || 'process', 'bpmn')
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const handleExportSvg = async () => {
  if (!modeler) return
  try {
    const result = await modeler.saveSVG()
    downloadFile(result.svg, deploymentName.value || modelForm.name || 'process', 'svg')
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const openFormDialog = async () => {
  if (!selectedFormElement.value) {
    ElMessage.warning('请先选择开始事件或用户任务')
    return
  }
  formDialogVisible.value = true
  if (formTemplates.value.length === 0) {
    await fetchFormTemplates()
  }
}

const fetchFormTemplates = async () => {
  formLoading.value = true
  try {
    const [vformRes, htmlRes, legacyRes] = await Promise.all([
      getDeployments({ source: 'form-designer-vform', sortBy: 'deploymentTime', sortOrder: 'desc' }),
      getDeployments({ source: 'form-designer-html', sortBy: 'deploymentTime', sortOrder: 'desc' }),
      getDeployments({ source: 'form-designer', sortBy: 'deploymentTime', sortOrder: 'desc' })
    ])
    formTemplates.value = [
      ...vformRes.data.map(toFormOption('vform')),
      ...htmlRes.data.map(toFormOption('html')),
      ...legacyRes.data.map(toFormOption('vform'))
    ]
  } catch {
    ElMessage.error('获取表单模板失败')
  } finally {
    formLoading.value = false
  }
}

const toFormOption = (type: FormType) => (deployment: Deployment): FormTemplateOption => ({
  ...deployment,
  formType: type,
  formKey: buildFormKey(type, deployment.id)
})

const applyFormTemplate = (row: FormTemplateOption) => {
  if (!modeler) {
    ElMessage.error('设计器未就绪，请刷新页面后重试')
    return
  }
  if (!selectedFormElement.value) {
    ElMessage.error('请先选择一个开始事件或用户任务节点')
    return
  }
  try {
    updateElementFormKey(row.formKey)
    formDialogVisible.value = false
    ElMessage.success(`已关联表单：${row.name}`)
  } catch (error) {
    console.error('关联表单失败:', error)
    ElMessage.error('关联表单失败，请重新选择节点后再试')
  }
}

const applyManualFormKey = () => {
  const formKey = manualFormKey.value.trim()
  if (!formKey) {
    clearManualFormKey()
    return
  }
  if (!formKey.includes(':')) {
    ElMessage.warning('formKey 格式不正确，应为 "vform:部署ID" 或 "html:部署ID"')
    return
  }
  if (!modeler) {
    ElMessage.error('设计器未就绪，请刷新页面后重试')
    return
  }
  if (!selectedFormElement.value) {
    ElMessage.error('请先选择一个开始事件或用户任务节点')
    return
  }
  try {
    updateElementFormKey(formKey)
    ElMessage.success('formKey 已应用到当前节点')
  } catch (error) {
    console.error('应用 formKey 失败:', error)
    ElMessage.error('应用 formKey 失败，请重新选择节点后再试')
  }
}

const clearManualFormKey = () => {
  if (!modeler || !selectedFormElement.value) {
    manualFormKey.value = ''
    selectedFormKey.value = ''
    return
  }
  updateElementFormKey('')
  ElMessage.success('当前节点 formKey 已清空')
}

const updateElementFormKey = (formKey: string) => {
  if (!modeler || !selectedFormElement.value) return
  const element = getLiveElement(selectedFormElement.value)
  const businessObject = element?.businessObject
  if (!element || !businessObject) return

  const commandStack = modeler.get('commandStack')
  const extensionElements = businessObject.get?.('extensionElements')
  const formData = getElementFormData(element)

  const commands: any[] = [{
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:formKey': formKey || undefined,
        'camunda:formRef': undefined,
        'camunda:formRefBinding': undefined,
        'camunda:formRefVersion': undefined
      }
    }
  }]

  if (extensionElements && formData) {
    const values = extensionElements.get?.('values') || extensionElements.values || []
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: values.filter((value: any) => value !== formData)
        }
      }
    })
  }

  commandStack.execute('properties-panel.multi-command-executor', commands)
  selectedFormElement.value = getLiveElement(element)
  selectedFormKey.value = formKey
  manualFormKey.value = formKey
  nextTick(refreshSelectedFormElement)
}

const handleDeploy = async () => {
  if (!modeler) return
  if (!deploymentName.value.trim()) {
    ElMessage.warning('请输入部署名称')
    return
  }

  deploying.value = true
  try {
    const rawXml = await getCurrentXml()
    if (!rawXml) return
    const xml = normalizeFormKeys(rawXml)
    const validation = validateBpmnXml(xml)

    if (validation.errors.length > 0) {
      await ElMessageBox.alert(validation.errors.join('\n'), '部署前校验失败', {
        type: 'error',
        confirmButtonText: '确定'
      })
      return
    }

    if (validation.warnings.length > 0) {
      await ElMessageBox.confirm(
        validation.warnings.join('\n') + '\n\n仍然继续部署吗？',
        '部署前校验提醒',
        { type: 'warning', confirmButtonText: '继续部署', cancelButtonText: '返回修改' }
      )
    }

    const blob = new Blob([xml], { type: 'application/xml' })
    const file = new File([blob], deploymentName.value + '.bpmn', { type: 'application/xml' })
    const formData = new FormData()
    formData.append('deployment-name', deploymentName.value)
    formData.append('deployment-source', 'bpmn-designer')
    formData.append('enable-duplicate-filtering', 'false')
    formData.append('content', file)

    const res = await createDeployment(formData)
    if (currentModelId.value) {
      await markProcessModelDeployed(currentModelId.value, res.data.id)
    }
    ElMessage.success(`部署成功，部署ID: ${res.data.id}`)
  } catch (error: any) {
    if (error === 'cancel') return
    ElMessage.error(translateDeployError(error))
  } finally {
    deploying.value = false
  }
}

const getCurrentXml = async (): Promise<string> => {
  if (!modeler) return ''
  const result = await modeler.saveXML({ format: true })
  return result.xml || ''
}

const syncMetaFromXml = (xml: string) => {
  const meta = extractProcessMeta(xml)
  if (meta.modelKey) modelForm.modelKey = meta.modelKey
  if (meta.name) {
    modelForm.name = meta.name
    deploymentName.value = deploymentName.value || meta.name
  }
}

const extractProcessMeta = (xml: string) => {
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const process = doc.getElementsByTagNameNS(BPMN_NS, 'process')[0]
    return {
      modelKey: process?.getAttribute('id') || '',
      name: process?.getAttribute('name') || ''
    }
  } catch {
    return { modelKey: '', name: '' }
  }
}

function normalizeFormKeys(xml: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const formElements = [
      ...Array.from(doc.getElementsByTagNameNS(BPMN_NS, 'startEvent')),
      ...Array.from(doc.getElementsByTagNameNS(BPMN_NS, 'userTask'))
    ]

    for (const element of formElements) {
      if (element.hasAttributeNS(CAMUNDA_NS, 'formKey')) continue

      const extElements = element.getElementsByTagNameNS(BPMN_NS, 'extensionElements')
      if (extElements.length === 0) continue

      const extEl = extElements[0]
      const formDataEls = findElementsByLocalName(extEl, ['formData', 'FormData'])
      for (let j = 0; j < formDataEls.length; j++) {
        const key = formDataEls[j].getAttribute('formKey')
        if (key) {
          element.setAttributeNS(CAMUNDA_NS, 'camunda:formKey', key)
          break
        }
      }
      if (element.hasAttributeNS(CAMUNDA_NS, 'formKey')) continue

      const formRefs = findElementsByLocalName(extEl, ['formRef'])
      for (let j = 0; j < formRefs.length; j++) {
        const key = formRefs[j].getAttribute('key')
        if (key) {
          element.setAttributeNS(CAMUNDA_NS, 'camunda:formKey', key)
          break
        }
      }
      if (element.hasAttributeNS(CAMUNDA_NS, 'formKey')) continue

      const formKeys = findElementsByLocalName(extEl, ['formKey'])
      for (let j = 0; j < formKeys.length; j++) {
        const key = formKeys[j].textContent?.trim()
        if (key) {
          element.setAttributeNS(CAMUNDA_NS, 'camunda:formKey', key)
          break
        }
      }
    }
    const serializer = new XMLSerializer()
    return serializer.serializeToString(doc)
  } catch {
    return xml
  }
}

const validateBpmnXml = (xml: string): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  const doc = new DOMParser().parseFromString(xml, 'text/xml')

  if (doc.getElementsByTagName('parsererror').length > 0) {
    return { errors: ['BPMN XML 格式不正确，无法解析'], warnings }
  }

  const process = doc.getElementsByTagNameNS(BPMN_NS, 'process')[0]
  if (!process) {
    errors.push('缺少 bpmn:process 定义')
    return { errors, warnings }
  }

  const processId = process.getAttribute('id') || ''
  const processName = process.getAttribute('name') || ''
  const ttl = process.getAttributeNS(CAMUNDA_NS, 'historyTimeToLive')
  if (!processId.trim()) errors.push('流程定义缺少 process id')
  if (!processName.trim()) warnings.push('流程定义缺少流程名称')
  if (!ttl) errors.push('流程定义缺少 historyTimeToLive，Camunda 7 部署时可能拒绝')
  if (process.getAttribute('isExecutable') !== 'true') warnings.push('流程未设置 isExecutable=true')

  if (process.getElementsByTagNameNS(BPMN_NS, 'startEvent').length === 0) {
    errors.push('流程缺少开始事件')
  }
  if (process.getElementsByTagNameNS(BPMN_NS, 'endEvent').length === 0) {
    warnings.push('流程缺少结束事件')
  }

  Array.from(process.getElementsByTagNameNS(BPMN_NS, 'userTask')).forEach((task) => {
    const name = task.getAttribute('name') || task.getAttribute('id') || '未命名用户任务'
    if (!task.getAttributeNS(CAMUNDA_NS, 'formKey')) {
      warnings.push(`用户任务「${name}」未关联表单`)
    }
    if (
      !task.getAttributeNS(CAMUNDA_NS, 'assignee') &&
      !task.getAttributeNS(CAMUNDA_NS, 'candidateUsers') &&
      !task.getAttributeNS(CAMUNDA_NS, 'candidateGroups')
    ) {
      warnings.push(`用户任务「${name}」未设置处理人、候选人或候选组`)
    }
  })

  validateExclusiveGateways(process, errors, warnings)

  return { errors, warnings }
}

const validateExclusiveGateways = (process: Element, errors: string[], warnings: string[]) => {
  const sequenceFlows = new Map<string, Element>()
  Array.from(process.getElementsByTagNameNS(BPMN_NS, 'sequenceFlow')).forEach((flow) => {
    const id = flow.getAttribute('id')
    if (id) sequenceFlows.set(id, flow)
  })

  Array.from(process.getElementsByTagNameNS(BPMN_NS, 'exclusiveGateway')).forEach((gateway) => {
    const name = gateway.getAttribute('name') || gateway.getAttribute('id') || '未命名网关'
    const defaultFlowId = gateway.getAttribute('default')
    const outgoingIds = Array.from(gateway.getElementsByTagNameNS(BPMN_NS, 'outgoing'))
      .map((node) => node.textContent?.trim())
      .filter(Boolean) as string[]

    if (outgoingIds.length < 2) {
      warnings.push(`排他网关「${name}」出口少于 2 条`)
    }

    outgoingIds.forEach((flowId) => {
      const flow = sequenceFlows.get(flowId)
      if (!flow) return
      const hasCondition = flow.getElementsByTagNameNS(BPMN_NS, 'conditionExpression').length > 0
      const flowName = flow.getAttribute('name') || flowId
      if (flowId === defaultFlowId && hasCondition) {
        errors.push(`排他网关「${name}」的默认流「${flowName}」不能配置条件表达式`)
      }
      if (flowId !== defaultFlowId && !hasCondition) {
        warnings.push(`排他网关「${name}」的流转「${flowName}」缺少条件表达式`)
      }
    })
  })
}

const findElementsByLocalName = (root: Element, names: string[]) => {
  return Array.from(root.getElementsByTagName('*')).filter((el) => names.includes(el.localName))
}

const downloadFile = (content: string, filename: string, ext: string) => {
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${ext}`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await nextTick()
  initModeler()
})

onBeforeUnmount(() => {
  if (modeler) {
    modeler.destroy()
    modeler = null
  }
})
</script>

<style scoped>
.bpmn-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 132px);
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.designer-toolbar {
  display: grid;
  grid-template-columns: auto minmax(180px, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.selected-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  color: #606266;
  font-size: 13px;
}

.designer-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.designer-canvas {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #e6e6e6;
}

.designer-canvas :deep(.bjs-powered-by) {
  display: none;
}

.designer-side {
  display: flex;
  flex-direction: column;
  width: 360px;
  flex-shrink: 0;
  background: #fff;
}

.form-key-panel {
  padding: 12px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.form-key-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.form-key-node {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-key-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.form-key-empty {
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
}

.designer-properties {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.dialog-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
