<template>
  <div class="form-designer-page">
    <div class="designer-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h3>{{ isEdit ? '编辑表单模板' : '新建表单模板' }}</h3>
        <el-tag v-if="formType" :type="formType === 'vform' ? 'success' : 'warning'" size="small">
          {{ formType === 'vform' ? '低代码表单' : 'HTML 表单' }}
        </el-tag>
      </div>
      <div class="header-center" v-if="templateMeta.formKey">
        <span class="formkey-label">formKey:</span>
        <code class="formkey-value">{{ templateMeta.formKey }}</code>
        <el-button link type="primary" size="small" @click="copyFormKey">
          <el-icon><CopyDocument /></el-icon>
        </el-button>
      </div>
      <div class="header-right">
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" :loading="saveLoading" @click="openSaveDialog">
          <el-icon><Checked /></el-icon>
          {{ isEdit ? '保存修改' : '保存模板' }}
        </el-button>
      </div>
    </div>

    <div v-if="!isEdit" class="form-type-selector">
      <el-radio-group v-model="formType" size="large">
        <el-radio-button value="vform">
          <el-icon><Grid /></el-icon>
          低代码设计器（vform）
        </el-radio-button>
        <el-radio-button value="html">
          <el-icon><Edit /></el-icon>
          HTML 自定义表单
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="designer-content">
      <div v-if="formType === 'vform'" class="main-panel">
        <div ref="vformShellRef" class="vform-designer-shell">
          <v-form-designer ref="vfdRef" :designer-config="vformDesignerConfig" />
        </div>
      </div>

      <div v-else-if="formType === 'html'" class="main-panel">
        <HtmlFormEditor v-model="htmlContent" />
      </div>
    </div>

    <el-dialog v-model="previewDialogVisible" title="表单预览" width="min(1400px, 96vw)" class="form-preview-dialog">
      <FormRenderer
        :template="previewTemplate"
        :form-data="previewFormData"
        ref="previewRendererRef"
      />
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="saveDialogVisible" title="保存表单模板" width="500px">
      <el-form :model="templateMeta" label-width="100px">
        <el-form-item label="表单类型" required>
          <el-radio-group v-model="templateMeta.type" :disabled="isEdit">
            <el-radio value="vform">低代码表单（vform）</el-radio>
            <el-radio value="html">HTML 表单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板名称" required>
          <el-input v-model="templateMeta.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="templateMeta.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
        </el-form-item>
        <el-form-item label="formKey">
          <div class="formkey-inline">
            <code class="formkey-display">{{ templateMeta.formKey }}</code>
            <el-button link type="primary" size="small" @click="copyFormKey">复制</el-button>
          </div>
          <div class="form-tip">将此 formKey 填入 BPMN UserTask 的 formKey 字段即可关联</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Checked, View, Grid, Edit, CopyDocument } from '@element-plus/icons-vue'
import {
  createDeployment,
  getDeployment,
  deleteDeployment,
  getDeploymentResources,
  getDeploymentResourceData
} from '../../api/deployment'
import { generateFormKey, buildFormKey, META_FILENAME, type FormMeta } from '../../api/form'
import type { FormTemplate, FormType } from '../../api/deployment'
import HtmlFormEditor from '../../components/HtmlFormEditor.vue'
import FormRenderer from '../../components/FormRenderer.vue'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const saveLoading = ref(false)
const submitLoading = ref(false)
const previewDialogVisible = ref(false)
const saveDialogVisible = ref(false)

const formType = ref<FormType>('vform')
const htmlContent = ref('')
const vformShellRef = ref<HTMLElement | null>(null)
const vfdRef = ref<any>(null)
const previewRendererRef = ref<any>(null)
let vformResizeObserver: ResizeObserver | null = null

const vformDesignerConfig = {
  formTemplates: false,
  generateSFCButton: false
}

const previewFormJson = ref<any>({})
const previewFormData = ref({})

const getDefaultFormConfig = () => ({
  modelName: 'formData',
  refName: 'vForm',
  rulesName: 'rules',
  labelWidth: 80,
  labelPosition: 'left',
  size: '',
  labelAlign: 'label-left-align',
  cssCode: '',
  customClass: '',
  functions: '',
  layoutType: 'PC',
  jsonVersion: 3
})

const normalizeVformJson = (formJson: any) => {
  const normalized = formJson || {}
  normalized.widgetList = Array.isArray(normalized.widgetList) ? normalized.widgetList : []
  normalized.formConfig = {
    ...getDefaultFormConfig(),
    ...(normalized.formConfig || {}),
    layoutType: 'PC'
  }
  return normalized
}

const previewTemplate = computed<FormTemplate | null>(() => {
  if (formType.value === 'vform') {
    return {
      id: '',
      name: templateMeta.name || '预览',
      type: 'vform',
      vformJson: previewFormJson.value,
      fields: [],
      createdAt: '',
      updatedAt: ''
    }
  }
  if (formType.value === 'html') {
    return {
      id: '',
      name: templateMeta.name || '预览',
      type: 'html',
      htmlContent: htmlContent.value,
      fields: [],
      createdAt: '',
      updatedAt: ''
    }
  }
  return null
})

const templateMeta = reactive<{
  id?: string
  name: string
  description: string
  type: FormType
  formKey: string
}>({
  name: '',
  description: '',
  type: 'vform',
  formKey: ''
})

const getEmptyFormJson = () => ({
  widgetList: [],
  formConfig: getDefaultFormConfig()
})

const initVformDesigner = async () => {
  await nextTick()
  if (vfdRef.value) {
    vfdRef.value.setFormJson(getEmptyFormJson())
    updateVformScrollerHeight()
  }
}

const updateVformScrollerHeight = async () => {
  await nextTick()
  const formWidgetMain = vformShellRef.value?.querySelector('.form-widget-main') as HTMLElement | null
  if (!formWidgetMain || !vfdRef.value) return

  const height = formWidgetMain.clientHeight - 16
  if (height > 0) {
    vfdRef.value.scrollerHeight = `${height}px`
  }
}

const setupVformScrollerHeight = async () => {
  await updateVformScrollerHeight()

  vformResizeObserver?.disconnect()
  if (vformShellRef.value && typeof ResizeObserver !== 'undefined') {
    vformResizeObserver = new ResizeObserver(() => {
      updateVformScrollerHeight()
    })
    vformResizeObserver.observe(vformShellRef.value)
  }
}

const initNewDesigner = () => {
  templateMeta.formKey = generateFormKey(formType.value)
}

const getCleanTemplateName = (deploymentName: string) => {
  if (deploymentName.endsWith('.form.json')) {
    return deploymentName.slice(0, -10)
  }
  if (deploymentName.endsWith('.form.html')) {
    return deploymentName.slice(0, -10)
  }
  if (deploymentName.endsWith('.json')) {
    return deploymentName.slice(0, -5)
  }
  return deploymentName
}

const handlePreview = () => {
  if (formType.value === 'vform' && vfdRef.value) {
    try {
      const formJson = vfdRef.value.getFormJson?.() ||
        vfdRef.value.exportSchema?.() || {}
      previewFormJson.value = normalizeVformJson(formJson)
      previewDialogVisible.value = true
    } catch {
      ElMessage.error('获取表单数据失败')
    }
  } else if (formType.value === 'html') {
    if (!htmlContent.value.trim()) {
      ElMessage.warning('请先编写 HTML 代码')
      return
    }
    previewDialogVisible.value = true
  }
}

const openSaveDialog = () => {
  if (formType.value === 'vform' && !vfdRef.value) {
    ElMessage.error('设计器未准备好')
    return
  }

  if (!isEdit.value && !templateMeta.name.trim()) {
    if (formType.value === 'vform') {
      try {
        const formJson = vfdRef.value?.getFormJson?.()
        if (formJson?.formConfig?.formTitle) {
          templateMeta.name = formJson.formConfig.formTitle
        }
      } catch { /* ignore */ }
    }
  }

  templateMeta.type = formType.value
  saveDialogVisible.value = true
}

const handleSubmitSave = async () => {
  if (!templateMeta.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  submitLoading.value = true
  try {
    const type = templateMeta.type
    const formData = new FormData()

    formData.append('deployment-name', templateMeta.name)
    formData.append('enable-duplicate-filtering', 'true')
    formData.append('deployment-source', type === 'vform' ? 'form-designer-vform' : 'form-designer-html')
    formData.append('deploy-changed-only', 'false')

    if (type === 'vform') {
      let formJson = vfdRef.value?.getFormJson?.() ||
        vfdRef.value?.exportSchema?.()
      if (!formJson) {
        ElMessage.error('无法获取表单数据，请重试')
        return
      }
      formJson = normalizeVformJson(formJson)
      const formFileName = `${templateMeta.name}.form.json`
      const blob = new Blob([JSON.stringify(formJson)], { type: 'application/json' })
      formData.append(formFileName, blob, formFileName)
    } else {
      if (!htmlContent.value.trim()) {
        ElMessage.warning('HTML 内容不能为空')
        return
      }
      const formFileName = `${templateMeta.name}.form.html`
      const blob = new Blob([htmlContent.value], { type: 'text/html' })
      formData.append(formFileName, blob, formFileName)
    }

    if (templateMeta.description) {
      const descFileName = `${templateMeta.name}.description.txt`
      const descBlob = new Blob([templateMeta.description], { type: 'text/plain' })
      formData.append(descFileName, descBlob, descFileName)
    }

    const meta: FormMeta = {
      formType: type,
      createdAt: new Date().toISOString()
    }
    const metaBlob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
    formData.append(META_FILENAME, metaBlob, META_FILENAME)

    if (isEdit.value && templateMeta.id) {
      await deleteDeployment(templateMeta.id, true)
    }

    const result = await createDeployment(formData)
    const deploymentId = result.data.id

    templateMeta.id = deploymentId
    templateMeta.formKey = buildFormKey(type, deploymentId)

    ElMessage.success(
      `${isEdit.value ? '更新' : '创建'}成功！formKey: ${templateMeta.formKey}\n请在 BPMN UserTask 的 formKey 中填入此值`
    )
    saveDialogVisible.value = false

    setTimeout(() => {
      router.push('/form/templates')
    }, 2500)
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const handleBack = () => {
  router.push('/form/templates')
}

const copyFormKey = async () => {
  try {
    await navigator.clipboard.writeText(templateMeta.formKey)
    ElMessage.success('formKey 已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const loadTemplate = async (deploymentId: string, options: { copy?: boolean } = {}) => {
  try {
    const deploymentRes = await getDeployment(deploymentId)
    const resourcesRes = await getDeploymentResources(deploymentId)

    templateMeta.id = options.copy ? undefined : deploymentId

    const cleanName = getCleanTemplateName(deploymentRes.data.name)
    templateMeta.name = options.copy ? `${cleanName}-副本` : cleanName

    for (const resource of resourcesRes.data) {
      if (resource.name.endsWith('.description.txt')) {
        try {
          const descRes = await getDeploymentResourceData(deploymentId, resource.id)
          templateMeta.description = await (descRes.data as Blob).text()
        } catch { /* ignore */ }
      }
      if (resource.name === META_FILENAME) {
        try {
          const metaRes = await getDeploymentResourceData(deploymentId, resource.id)
          const metaText = await (metaRes.data as Blob).text()
          const meta = JSON.parse(metaText) as FormMeta
          if (meta.formKey) {
            templateMeta.formKey = meta.formKey
          }
        } catch { /* ignore */ }
      }
      if (resource.name.endsWith('.form.json')) {
        try {
          const jsonRes = await getDeploymentResourceData(deploymentId, resource.id)
          const jsonText = await (jsonRes.data as Blob).text()
          const parsed = normalizeVformJson(JSON.parse(jsonText))
          previewFormJson.value = parsed
          formType.value = 'vform'
          templateMeta.type = 'vform'
          await nextTick()
          if (vfdRef.value) {
            vfdRef.value.setFormJson(parsed)
            updateVformScrollerHeight()
          }
        } catch { /* ignore */ }
      }
      if (resource.name.endsWith('.form.html')) {
        try {
          const htmlRes = await getDeploymentResourceData(deploymentId, resource.id)
          htmlContent.value = await (htmlRes.data as Blob).text()
          formType.value = 'html'
          templateMeta.type = 'html'
        } catch { /* ignore */ }
      }
    }

    templateMeta.formKey = options.copy
      ? generateFormKey(templateMeta.type)
      : buildFormKey(templateMeta.type, deploymentId)
    isEdit.value = !options.copy
    ElMessage.success(options.copy ? '已复制模板，请保存为新模板' : '模板加载成功')
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error('加载模板失败')
  }
}

onMounted(async () => {
  const templateId = route.query.id as string
  const copyFrom = route.query.copyFrom as string
  if (templateId) {
    await loadTemplate(templateId)
  } else if (copyFrom) {
    await loadTemplate(copyFrom, { copy: true })
  } else {
    formType.value = 'vform'
    initNewDesigner()
    await initVformDesigner()
  }

  await setupVformScrollerHeight()
  window.addEventListener('resize', updateVformScrollerHeight)
})

onBeforeUnmount(() => {
  vformResizeObserver?.disconnect()
  window.removeEventListener('resize', updateVformScrollerHeight)
})
</script>

<style scoped>
.form-designer-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 132px);
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.formkey-label {
  font-size: 12px;
  color: #909399;
}

.formkey-value {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
}

.form-type-selector {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.designer-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-panel {
  height: 100%;
  overflow: auto;
}

.vform-designer-shell {
  height: 100%;
  overflow: hidden !important;
}

.vform-designer-shell :deep(.container-scroll-bar .el-scrollbar__view) {
  padding-bottom: 160px;
}

.vform-designer-shell :deep(.form-widget-container > .el-form.full-height-width > .form-widget-list) {
  padding-bottom: 160px !important;
}

.vform-designer-shell :deep(.toolbar-container .left-toolbar > .el-button-group[style*="margin-left"]) {
  display: none !important;
}

.vform-designer-shell :deep(.panel-container > .el-tabs > .el-tabs__content > .el-tab-pane:nth-child(2) .setting-form .setting-collapse > .el-collapse-item:first-child .el-collapse-item__content > .el-form-item:nth-last-of-type(-n + 4)) {
  display: none !important;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.formkey-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.formkey-display {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  white-space: nowrap;
}
</style>
