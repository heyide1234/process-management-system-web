<template>
  <div v-loading="loading">
    <el-form v-if="hasFields" ref="formRef" :model="formData" label-width="120px">
      <el-form-item
        v-for="(info, name) in formFields"
        :key="name"
        :label="name"
        :prop="name"
      >
        <el-select
          v-if="info.type === 'Boolean'"
          v-model="formData[name]"
          style="width: 100%"
        >
          <el-option label="true" :value="true" />
          <el-option label="false" :value="false" />
        </el-select>
        <el-date-picker
          v-else-if="info.type === 'Date'"
          v-model="formData[name]"
          type="date"
          style="width: 100%"
        />
        <el-input-number
          v-else-if="info.type === 'Long' || info.type === 'Integer' || info.type === 'Double'"
          v-model="formData[name]"
          style="width: 100%"
        />
        <el-input
          v-else-if="info.type === 'String' || info.type === 'string'"
          v-model="formData[name]"
          style="width: 100%"
        />
        <el-input
          v-else
          v-model="formData[name]"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
        <el-button @click="emit('cancel')">取消</el-button>
      </el-form-item>
    </el-form>
    <div v-else-if="!loading" style="padding: 20px; text-align: center; color: #909399">
      该任务没有表单字段，点击提交按钮直接完成。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  taskId: string
}>()

const emit = defineEmits<{
  success: [variables: Record<string, any>]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const formFields = ref<Record<string, { value: any; type: string }>>({})
const formData = reactive<Record<string, any>>({})

const hasFields = computed(() => Object.keys(formFields.value).length > 0)

const fetchFormVariables = async () => {
  loading.value = true
  try {
    const { getTaskFormVariables } = await import('../api/task')
    const res = await getTaskFormVariables(props.taskId)
    formFields.value = res.data
    Object.keys(formFields.value).forEach((name) => {
      formData[name] = formFields.value[name].value
    })
  } catch {
    formFields.value = {}
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const variables: Record<string, { value: any; type: string }> = {}
    Object.keys(formData).forEach((name) => {
      const type = formFields.value[name]?.type || 'String'
      variables[name] = { value: formData[name], type }
    })
    const { submitTaskForm } = await import('../api/task')
    await submitTaskForm(props.taskId, variables)
    ElMessage.success('提交成功')
    emit('success', variables)
  } catch {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchFormVariables()
})
</script>
