<template>
  <div class="form-fill-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="title-section">
          <h3>{{ isEdit ? '编辑' : preview ? '预览' : '填写' }} - {{ template?.name || '加载中...' }}</h3>
          <p class="description" v-if="template?.description">{{ template.description }}</p>
          <div class="form-meta" v-if="template">
            <el-tag :type="template.type === 'vform' ? 'success' : 'warning'" size="small">
              {{ template.type === 'vform' ? '低代码表单' : 'HTML 表单' }}
            </el-tag>
            <el-tag v-if="formKey" type="info" size="small">{{ formKey }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="form-fill-container">
      <FormRenderer
        :template="template"
        :form-data="initialFormData"
        :option-data="optionData"
        :loading="loading"
        ref="formRendererRef"
      />

      <div v-if="template && !loading" class="form-actions">
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="taskId" type="primary" :loading="submitLoading" @click="handleSubmit">
          完成任务
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import FormRenderer from '../../components/FormRenderer.vue'
import type { FormTemplate } from '../../api/deployment'
import {
  getDeployment,
  getDeploymentResources,
  getDeploymentResourceData
} from '../../api/deployment'
import { getTask, completeTask } from '../../api/task'
import {
  parseFormKey,
  extractFormKeyFromBpmnXml,
  convertToCamundaVariables,
  buildFormSubmissionData,
  hasFormSubmissionData
} from '../../api/form'
import { getProcessDefinitionXml } from '../../api/processDefinition'

const router = useRouter()
const route = useRoute()

const template = ref<FormTemplate | null>(null)
const preview = ref(false)
const loading = ref(true)
const submitLoading = ref(false)
const formRendererRef = ref<any>(null)
const initialFormData = reactive<Record<string, any>>({})
const optionData = reactive({})
const formKey = ref('')
const taskId = ref('')
const processInstanceId = ref('')
const isEdit = ref(false)

const buildFormKey = (type: string, id: string) => `${type}:${id}`

const loadTemplateFromDeployment = async (deploymentId: string, formType: string): Promise<FormTemplate> => {
  let deploymentRes
  try {
    deploymentRes = await getDeployment(deploymentId)
  } catch (e: any) {
    if (e.response?.status === 404) {
      throw new Error(`表单模板部署不存在 (ID: ${deploymentId})，可能已被删除或未正确部署`)
    }
    throw e
  }
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

const loadTemplate = async () => {
  const queryTemplateId = route.query.templateId as string
  const queryTaskId = route.query.taskId as string
  const queryFormKey = route.query.formKey as string
  const queryPreview = route.query.preview as string

  preview.value = queryPreview === '1'

  loading.value = true
  try {

    if (queryTaskId) {
      const taskRes = await getTask(queryTaskId)
      taskId.value = taskRes.data.id
      processInstanceId.value = taskRes.data.processInstanceId

      if (taskRes.data.formKey) {
        const parsed = parseFormKey(taskRes.data.formKey)
        if (parsed) {
          try {
            const tmpl = await loadTemplateFromDeployment(parsed.templateId, parsed.type)
            tmpl.taskDefinitionKey = taskRes.data.taskDefinitionKey
            tmpl.formKey = taskRes.data.formKey
            formKey.value = taskRes.data.formKey
            template.value = tmpl
          } catch (e: any) {
            ElMessage.error(e.message || '加载表单模板失败')
            router.back()
            return
          }
        } else {
          ElMessage.error(`无法解析 formKey: ${taskRes.data.formKey}`)
        }
      }

      if (!template.value && taskRes.data.processDefinitionId) {
        try {
          const xmlRes = await getProcessDefinitionXml(taskRes.data.processDefinitionId)
          const bpmnXml = xmlRes.data.bpmn20Xml || ''
          const extracted = extractFormKeyFromBpmnXml(bpmnXml, taskRes.data.taskDefinitionKey)
          if (extracted) {
            try {
              const tmpl = await loadTemplateFromDeployment(extracted.templateId, extracted.type)
              tmpl.taskDefinitionKey = taskRes.data.taskDefinitionKey
              tmpl.formKey = extracted.type + ':' + extracted.templateId
              formKey.value = tmpl.formKey
              template.value = tmpl
            } catch (e: any) {
              ElMessage.error(e.message || '加载表单模板失败')
              router.back()
              return
            }
          }
        } catch { /* ignore */ }
      }

      if (!template.value) {
        ElMessage.warning('该任务未关联表单模板，请在 BPMN UserTask 中配置 formKey')
        setTimeout(() => router.back(), 1500)
        return
      }

      try {
        const { getTaskVariables } = await import('../../api/task')
        const varsRes = await getTaskVariables(queryTaskId)
        if (varsRes.data) {
          const data: Record<string, any> = {}
          for (const key in varsRes.data) {
            data[key] = varsRes.data[key].value
          }
          Object.assign(initialFormData, data)
        }
      } catch { /* task may not have variables */ }

      isEdit.value = true
      return
    }

    if (queryFormKey) {
      const parsed = parseFormKey(queryFormKey)
      if (parsed) {
        const tmpl = await loadTemplateFromDeployment(parsed.templateId, parsed.type)
        tmpl.formKey = queryFormKey
        formKey.value = queryFormKey
        template.value = tmpl
        return
      }
    }

    if (queryTemplateId) {
      const parsed = parseFormKey(queryTemplateId)
      if (parsed) {
        const tmpl = await loadTemplateFromDeployment(parsed.templateId, parsed.type)
        tmpl.formKey = queryTemplateId
        formKey.value = queryTemplateId
        template.value = tmpl
        return
      }

      try {
        const tmpl = await loadTemplateFromDeployment(queryTemplateId, 'vform')
        tmpl.formKey = buildFormKey('vform', queryTemplateId)
        formKey.value = tmpl.formKey
        template.value = tmpl
      } catch (e: any) {
        ElMessage.error(e.message || '加载表单模板失败')
        router.back()
        return
      }
      return
    }

    ElMessage.error('缺少表单模板ID、formKey 或任务ID')
    router.back()
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载失败，请稍后重试')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formRendererRef.value?.resetForm?.()
  ElMessage.success('表单已重置')
}

const handleSubmit = async () => {
  if (!formRendererRef.value || !template.value) {
    ElMessage.error('表单未正确加载')
    return
  }

  submitLoading.value = true
  try {
    const submissionData = await formRendererRef.value.getFormData()
    if (template.value.type === 'html' && !hasFormSubmissionData(submissionData)) {
      ElMessage.warning('没有采集到 HTML 表单字段，请给输入控件配置 name、id、data-field，或暴露 window.htmlFormApi.getData()')
      return
    }

    const submissionPayload = buildFormSubmissionData(submissionData, {
      formKey: formKey.value || template.value.formKey,
      formType: template.value.type,
      taskDefinitionKey: template.value.taskDefinitionKey,
      taskId: taskId.value,
      source: 'task'
    })
    const variables = convertToCamundaVariables(submissionPayload)

    await completeTask(taskId.value, variables)
    ElMessage.success('任务完成成功！')

    setTimeout(() => router.back(), 1500)
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || '提交失败'
    console.error('提交失败:', error)
    ElMessage.error(msg)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadTemplate()
})
</script>

<style scoped>
.form-fill-page {
  padding: 0;
  margin: -8px -16px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.title-section h3 {
  margin: 0 0 8px 0;
}

.title-section .description {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.form-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.form-fill-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: none;
  overflow-x: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .form-fill-page {
    margin: 0;
  }
}
</style>
