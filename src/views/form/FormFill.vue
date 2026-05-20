<template>
  <div class="form-fill-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="title-section">
          <h3>{{ isEdit ? '编辑' : '填写' }} - {{ template?.name }}</h3>
          <p class="description" v-if="template?.description">{{ template.description }}</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="template" class="form-container">
      <v-form-render
        :form-json="template.vformJson"
        :form-data="formData"
        :option-data="optionData"
        ref="vFormRef"
      ></v-form-render>

      <div class="form-actions">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交表单</el-button>
      </div>
    </div>

    <div v-else class="empty-container">
      <el-empty description="表单模板加载失败" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getFormTemplate } from '../../api/deployment'
import { getProcessDefinitions, startProcessInstance } from '../../api/processDefinition'
import { getTasks, completeTask } from '../../api/task'
import type { FormTemplate } from '../../api/deployment'
import type { ProcessDefinition } from '../../api/processDefinition'

const router = useRouter()
const route = useRoute()

const template = ref<FormTemplate | null>(null)
const processDefinitions = ref<ProcessDefinition[]>([])
const loading = ref(true)
const submitLoading = ref(false)
const vFormRef = ref<any>(null)
const formData = reactive({})
const optionData = reactive({})

const loadTemplate = async () => {
  const templateId = route.query.templateId as string
  const taskId = route.query.taskId as string
  
  if (!templateId && !taskId) {
    ElMessage.error('缺少表单模板ID或任务ID')
    router.back()
    return
  }

  loading.value = true
  try {
    // 加载流程定义列表
    const pdRes = await getProcessDefinitions()
    processDefinitions.value = pdRes.data
    
    if (templateId) {
      // 通过模板ID加载
      const response = await getFormTemplate(templateId)
      template.value = response.data
      console.log('加载的模板:', template.value)
    } else if (taskId) {
      // 通过任务ID加载
      // TODO: 实现通过任务获取表单模板的逻辑
      ElMessage.error('通过任务ID加载表单的功能尚未实现')
      router.back()
      return
    }
    
    // 等待 DOM 更新
    await nextTick()
    
    // 先设置表单 JSON
    if (vFormRef.value && template.value?.vformJson) {
      vFormRef.value.setFormJson(template.value.vformJson)
      console.log('已设置表单 JSON')
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (!vFormRef.value) return
  vFormRef.value.resetForm()
  ElMessage.success('表单已重置')
}

// 将表单数据转换为 Camunda 变量格式
const convertToCamundaVariables = (data: Record<string, any>): Record<string, { value: any; type?: string }> => {
  const variables: Record<string, { value: any; type?: string }> = {}
  for (const key in data) {
    const value = data[key]
    let type: string | undefined
    
    if (typeof value === 'string') {
      type = 'String'
    } else if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'Integer' : 'Double'
    } else if (typeof value === 'boolean') {
      type = 'Boolean'
    } else if (value instanceof Date) {
      type = 'Date'
    }
    
    variables[key] = {
      value: value,
      type: type
    }
  }
  return variables
}

const handleSubmit = async () => {
  if (!vFormRef.value) {
    ElMessage.error('表单未正确加载')
    return
  }

  let submissionData: any = {}
  
  // 尝试多种方式获取表单数据
  try {
    submissionData = await vFormRef.value.getFormData()
  } catch (e) {
    submissionData = { ...formData }
  }
  
  if (!submissionData || Object.keys(submissionData).length === 0) {
    try {
      if (vFormRef.value.formData) {
        submissionData = { ...vFormRef.value.formData }
      }
    } catch (e) {
      // ignore
    }
  }

  submitLoading.value = true
  try {
    const taskId = route.query.taskId as string
    
    if (taskId) {
      // 完成任务
      const variables = convertToCamundaVariables(submissionData)
      await completeTask(taskId, variables)
      ElMessage.success('任务完成成功！')
    } else {
      // 启动流程实例
      // 查找匹配的流程定义
      let processDefId: string | undefined
      
      if (template.value?.processDefinitionKey) {
        const pd = processDefinitions.value.find(
          p => p.key === template.value?.processDefinitionKey
        )
        if (pd) {
          processDefId = pd.id
        }
      }
      
      // 如果没有找到，使用第一个流程定义
      if (!processDefId && processDefinitions.value.length > 0) {
        processDefId = processDefinitions.value[0].id
      }
      
      if (!processDefId) {
        ElMessage.error('没有可用的流程定义')
        return
      }
      
      const variables = convertToCamundaVariables(submissionData)
      await startProcessInstance(processDefId, variables)
      ElMessage.success('流程启动成功！')
    }
    
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  await loadTemplate()
})
</script>

<style scoped>
.form-fill-page {
  padding: 20px;
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
  margin: 0;
  color: #666;
  font-size: 14px;
}

.loading-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.empty-container {
  background: #fff;
  padding: 48px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  margin-top: 24px;
}
</style>
