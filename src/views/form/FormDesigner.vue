<template>
  <div class="form-designer-page">
    <div class="designer-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h3>{{ isEdit ? '编辑表单模板' : '新建表单模板' }}</h3>
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

    <div class="designer-content">
      <div class="main-panel">
        <v-form-designer ref="vfdRef"></v-form-designer>
      </div>
    </div>

    <el-dialog v-model="previewDialogVisible" title="表单预览" width="900px">
      <div class="form-preview-container">
        <v-form-render
          :form-json="previewFormJson"
          :form-data="previewFormData"
          ref="previewFormRef"
        ></v-form-render>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="saveDialogVisible" title="保存表单模板" width="500px">
      <el-form :model="templateMeta" label-width="80px">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateMeta.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="templateMeta.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
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
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Checked, View } from '@element-plus/icons-vue'
import { createDeployment, getDeployment, deleteDeployment, getDeploymentResources, getDeploymentResourceData } from '../../api/deployment'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const saveLoading = ref(false)
const submitLoading = ref(false)
const previewDialogVisible = ref(false)
const saveDialogVisible = ref(false)

const vfdRef = ref<any>(null)
const previewFormRef = ref<any>(null)

const previewFormJson = ref<any>({})
const previewFormData = ref({})

const templateMeta = reactive<{
  id?: string
  name: string
  description: string
}>({
  name: '',
  description: ''
})

// 保存待加载的表单数据
const pendingFormJson = ref<any>(null)

// 等待并设置表单数据
const setFormJsonWithRetry = async (formJson: any, maxRetries = 10, interval = 100) => {
  for (let i = 0; i < maxRetries; i++) {
    if (vfdRef.value && typeof vfdRef.value.setFormJson === 'function') {
      try {
        vfdRef.value.setFormJson(formJson)
        console.log('Form JSON set successfully on attempt', i + 1)
        return true
      } catch (e) {
        console.error('Attempt', i + 1, 'failed:', e)
      }
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  console.error('Failed to set form JSON after', maxRetries, 'attempts')
  return false
}

const getEmptyFormJson = () => ({
  widgetList: [],
  formConfig: {
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
  }
})

const initDesigner = async () => {
  await nextTick()
  if (vfdRef.value) {
    const emptyJson = getEmptyFormJson()
    vfdRef.value.setFormJson(emptyJson)
  }
}

const handlePreview = () => {
  if (!vfdRef.value) {
    ElMessage.error('设计器未准备好')
    return
  }
  try {
    console.log('=== Preview ===')
    console.log('vfdRef.value:', vfdRef.value)
    console.log('vfdRef.getFormJson:', typeof vfdRef.value.getFormJson)
    
    if (typeof vfdRef.value.getFormJson === 'function') {
      previewFormJson.value = vfdRef.value.getFormJson()
    } else if (typeof vfdRef.value.exportSchema === 'function') {
      previewFormJson.value = vfdRef.value.exportSchema()
    }
    
    console.log('Preview form json:', previewFormJson.value)
    previewDialogVisible.value = true
  } catch (error) {
    console.error('Preview error:', error)
    ElMessage.error('获取表单数据失败')
  }
}

const openSaveDialog = () => {
  if (!vfdRef.value) {
    ElMessage.error('设计器未准备好')
    return
  }
  // 如果是新建但没有填写名称，先从表单设计器获取标题
  if (!isEdit.value && !templateMeta.name.trim()) {
    try {
      const formJson = vfdRef.value.getFormJson()
      if (formJson.formConfig && formJson.formConfig.formTitle) {
        templateMeta.name = formJson.formConfig.formTitle
      }
    } catch (e) {
      // ignore
    }
  }
  saveDialogVisible.value = true
}

const handleSubmitSave = async () => {
  if (!templateMeta.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }
  if (!vfdRef.value) {
    ElMessage.error('设计器未准备好，请刷新页面重试')
    return
  }

  submitLoading.value = true
  try {
    console.log('=== Starting save ===')
    console.log('vfdRef:', vfdRef.value)
    console.log('vfdRef.getFormJson:', typeof vfdRef.value.getFormJson)
    
    let formJson: any = null
    
    // 尝试获取表单数据
    if (typeof vfdRef.value.getFormJson === 'function') {
      formJson = vfdRef.value.getFormJson()
      console.log('Form JSON from getFormJson():', formJson)
    } else if (typeof vfdRef.value.getFormData === 'function') {
      formJson = vfdRef.value.getFormData()
      console.log('Form JSON from getFormData():', formJson)
    } else if (typeof vfdRef.value.exportSchema === 'function') {
      formJson = vfdRef.value.exportSchema()
      console.log('Form JSON from exportSchema():', formJson)
    } else {
      // 如果没有合适的方法，尝试访问内部数据
      console.log('No known method found, trying internal access')
      if (vfdRef.value.formJson) {
        formJson = vfdRef.value.formJson
      } else if (vfdRef.value.schema) {
        formJson = vfdRef.value.schema
      }
      console.log('Form JSON from internal:', formJson)
    }
    
    if (!formJson) {
      ElMessage.error('无法获取表单数据，请重试')
      return
    }
    
    console.log('Final form JSON to save:', formJson)
    
    const formData = new FormData()
    
    // 按照 Camunda 文档格式添加参数
    formData.append('deployment-name', templateMeta.name)
    formData.append('enable-duplicate-filtering', 'true')
    formData.append('deployment-source', 'form-designer')
    formData.append('deploy-changed-only', 'false')
    
    // 添加表单文件 - 文件名作为 key
    const formFileName = `${templateMeta.name}.form.json`
    const formJsonBlob = new Blob([JSON.stringify(formJson)], { type: 'application/json' })
    formData.append(formFileName, formJsonBlob, formFileName)
    
    // 添加描述文件
    if (templateMeta.description) {
      const descFileName = `${templateMeta.name}.description.txt`
      const descBlob = new Blob([templateMeta.description], { type: 'text/plain' })
      formData.append(descFileName, descBlob, descFileName)
    }
    
    console.log('FormData prepared, will send...')
    console.log('FormData entries:', Array.from(formData.entries()))
    
    if (isEdit.value && templateMeta.id) {
      console.log('Deleting old deployment:', templateMeta.id)
      await deleteDeployment(templateMeta.id, true)
    }
    
    console.log('Creating new deployment...')
    const result = await createDeployment(formData)
    console.log('Deployment result:', result)
    
    ElMessage.success(isEdit.value ? '模板更新成功' : '模板创建成功')
    saveDialogVisible.value = false
    
    setTimeout(() => {
      router.push('/form/templates')
    }, 1500)
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error(isEdit.value ? '更新失败，请稍后重试' : '创建失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

const handleBack = () => {
  router.push('/form/templates')
}

const loadTemplate = async (deploymentId: string) => {
  try {
    const deploymentRes = await getDeployment(deploymentId)
    const resourcesRes = await getDeploymentResources(deploymentId)
    
    templateMeta.id = deploymentId
    
    // 清理部署名称（去掉可能的后缀）
    let cleanName = deploymentRes.data.name
    if (cleanName.endsWith('.form.json')) {
      cleanName = cleanName.substring(0, cleanName.length - 10)
    } else if (cleanName.endsWith('.json')) {
      cleanName = cleanName.substring(0, cleanName.length - 5)
    }
    templateMeta.name = cleanName
    
    let formJsonData: any = null
    
    console.log('Loading deployment resources:', resourcesRes.data)
    
    for (const resource of resourcesRes.data) {
      if (resource.name.endsWith('.description.txt')) {
        try {
          const descRes = await getDeploymentResourceData(deploymentId, resource.id)
          const text = await (descRes.data as Blob).text()
          templateMeta.description = text
          console.log('Description loaded:', text)
        } catch (e) {
          console.error('Failed to load description', e)
        }
      }
      if (resource.name.endsWith('.form.json')) {
        try {
          const jsonRes = await getDeploymentResourceData(deploymentId, resource.id)
          const jsonText = await (jsonRes.data as Blob).text()
          console.log('Form JSON raw text:', jsonText)
          formJsonData = JSON.parse(jsonText)
          console.log('Form JSON parsed:', formJsonData)
        } catch (e) {
          console.error('Failed to load form json', e)
        }
      }
    }
    
    if (formJsonData) {
      console.log('Will load form JSON, waiting for designer...')
      pendingFormJson.value = formJsonData
      // 使用重试机制设置表单数据
      const success = await setFormJsonWithRetry(formJsonData, 20, 100)
      if (!success) {
        ElMessage.error('表单设计器加载失败，请刷新重试')
      }
    } else {
      console.warn('No form json found in deployment, initializing empty')
      await setFormJsonWithRetry(getEmptyFormJson(), 10, 100)
    }

    isEdit.value = true
    ElMessage.success('模板加载成功')
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error('加载模板失败，请稍后重试')
  }
}

onMounted(async () => {
  const templateId = route.query.id as string
  if (templateId) {
    await loadTemplate(templateId)
  } else {
    await initDesigner()
  }
})
</script>

<style scoped>
.form-designer-page {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.designer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #fff;
}

.main-panel {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.main-panel :deep(.v-form-designer) {
  height: 100% !important;
}

.main-panel :deep(.v-form-designer .vform-header) {
  display: none !important;
}

.form-preview-container {
  padding: 16px;
  min-height: 400px;
}
.main-panel :deep(.main-header) {
  display: none !important;
}

</style>
