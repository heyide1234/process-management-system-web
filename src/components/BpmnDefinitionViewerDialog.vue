<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="1120px"
    top="5vh"
    append-to-body
    destroy-on-close
    @update:model-value="updateVisible"
    @closed="handleClosed"
  >
    <el-descriptions v-if="definition" :column="3" border size="small" class="viewer-meta">
      <el-descriptions-item label="流程名称">
        {{ definition.name || definition.key || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="流程Key">
        {{ definition.key || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="版本">
        v{{ definition.version }}
      </el-descriptions-item>
      <el-descriptions-item label="发布名称">
        {{ deploymentName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="部署时间">
        {{ deploymentTime || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="资源文件">
        {{ definition.resource || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="定义ID" :span="3">
        {{ definition.id }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="viewer-body" v-loading="loading">
      <BpmnViewer
        v-if="xml"
        :xml="xml"
        :active-activity-ids="emptyActivityIds"
        :completed-activity-ids="emptyActivityIds"
      />
      <el-empty v-else-if="!loading" :description="errorMsg || '暂无流程图'" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BpmnViewer from './BpmnViewer.vue'
import { getProcessDefinitionXml, type ProcessDefinition } from '../api/processDefinition'

const props = defineProps<{
  modelValue: boolean
  definition: ProcessDefinition | null
  deploymentName?: string
  deploymentTime?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const xml = ref('')
const loading = ref(false)
const errorMsg = ref('')
const emptyActivityIds: string[] = []

const dialogTitle = computed(() => {
  if (!props.definition) return '查看流程'
  const name = props.definition.name || props.definition.key || props.definition.id
  return `${name} v${props.definition.version}`
})

const updateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

const loadDefinitionXml = async () => {
  if (!props.definition) return
  loading.value = true
  errorMsg.value = ''
  xml.value = ''

  try {
    const res = await getProcessDefinitionXml(props.definition.id)
    xml.value = res.data.bpmn20Xml || ''
    if (!xml.value) {
      errorMsg.value = '流程定义 XML 为空'
    }
  } catch (error: any) {
    errorMsg.value = error?.response?.data?.message || '获取流程定义 XML 失败'
  } finally {
    loading.value = false
  }
}

const handleClosed = () => {
  xml.value = ''
  errorMsg.value = ''
  loading.value = false
}

watch(
  () => [props.modelValue, props.definition?.id],
  () => {
    if (props.modelValue && props.definition?.id) {
      loadDefinitionXml()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.viewer-meta {
  margin-bottom: 12px;
}

.viewer-body {
  min-height: 500px;
}

.viewer-body :deep(.bpmn-viewer) {
  height: 560px;
}
</style>
