<template>
  <div class="deployment-page">
    <div class="page-header">
      <h3>资源部署</h3>
      <el-button type="primary" @click="openUploadDialog">部署资源</el-button>
    </div>

    <div class="filter-tabs">
      <el-radio-group v-model="deploymentFilter" @change="fetchDeployments" size="small">
        <el-radio-button value="bpmn">流程</el-radio-button>
        <el-radio-button value="form">表单</el-radio-button>
        <el-radio-button value="all">全部</el-radio-button>
      </el-radio-group>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.name"
        placeholder="部署名称"
        clearable
        style="width: 200px"
        @keyup.enter="fetchDeployments"
      />
      <el-input
        v-model="search.source"
        placeholder="来源"
        clearable
        style="width: 180px"
        @keyup.enter="fetchDeployments"
      />
      <el-button type="primary" @click="fetchDeployments">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="deploymentList" v-loading="loading" border stripe>
      <el-table-column label="资源名称" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ formatDeploymentResourceNames(row) }}</template>
      </el-table-column>
      <el-table-column label="资源ID / Key" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ formatDeploymentResourceKeys(row) }}</template>
      </el-table-column>
      <el-table-column label="类型/来源" min-width="150">
        <template #default="{ row }">
          <el-tag :type="getDeploymentSourceType(row.source)" size="small">
            {{ formatDeploymentSource(row.source) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deploymentTime" label="部署时间" min-width="180" :formatter="formatTableTime" />
      <el-table-column prop="name" label="部署名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="id" label="部署ID" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openResourceDialog(row.id)">查看资源</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="uploadDialogVisible" title="部署资源文件" width="500px" :close-on-click-modal="false">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="部署名称" prop="deploymentName">
          <el-input v-model="uploadForm.deploymentName" placeholder="用于区分本次发布，例如 请假审批-20260529" />
        </el-form-item>
        <el-form-item label="选择文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".bpmn,.xml,.json,.html"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .bpmn .xml（流程）和 .form.json .form.html（表单）</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="类型" prop="deploymentSource">
          <el-input v-model="uploadForm.deploymentSource" placeholder="自动识别" :disabled="autoSource">
            <template #prepend>
              <el-tag v-if="uploadForm.deploymentSource" :type="autoSource ? 'success' : 'info'" size="small">
                {{ sourceLabel }}
              </el-tag>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="handleUpload">部署</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resourceDialogVisible" title="部署内容" width="600px">
      <el-table :data="resources" v-loading="resourceLoading" border stripe>
        <el-table-column prop="id" label="资源ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="name" label="文件名" min-width="200" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadInstance } from 'element-plus'
import {
  getDeployments,
  createDeployment,
  deleteDeployment,
  getDeploymentResources,
  translateDeployError
} from '../../api/deployment'
import type { Deployment } from '../../api/deployment'
import { getProcessDefinitions, type ProcessDefinition } from '../../api/processDefinition'
import { formatTableTime } from '../../utils/format'

const deploymentList = ref<Deployment[]>([])
const definitionsByDeploymentId = ref<Record<string, ProcessDefinition[]>>({})
const loading = ref(false)
const deploymentFilter = ref<'bpmn' | 'form' | 'all'>('bpmn')

const search = reactive({ name: '', source: '' })

const FORM_SOURCES = ['form-designer-vform', 'form-designer-html', 'form-designer']

const formatDeploymentSource = (source?: string | null) => {
  if (!source) return '未知来源'
  if (source === 'bpmn-designer') return '流程设计器'
  if (source === 'form-designer-vform') return '低代码表单'
  if (source === 'form-designer-html') return 'HTML 表单'
  if (source === 'form-designer') return '旧版表单'
  if (source === 'process application') return '流程应用'
  return source
}

const getDeploymentSourceType = (source?: string | null) => {
  if (source === 'bpmn-designer') return 'primary'
  if (FORM_SOURCES.includes(source || '')) return 'success'
  return 'info'
}

const getFormDeploymentName = (deployment: Deployment) => {
  let name = deployment.name || deployment.id
  if (name.endsWith('.form.json')) return name.slice(0, -10)
  if (name.endsWith('.form.html')) return name.slice(0, -10)
  if (name.endsWith('.json')) return name.slice(0, -5)
  if (name.endsWith('.html')) return name.slice(0, -5)
  if (name.endsWith('.htm')) return name.slice(0, -4)
  return name
}

const getFormDeploymentKey = (deployment: Deployment) => {
  if (deployment.source === 'form-designer-html') return `html:${deployment.id}`
  return `vform:${deployment.id}`
}

const formatDeploymentResourceNames = (deployment: Deployment) => {
  const definitions = definitionsByDeploymentId.value[deployment.id] || []
  if (definitions.length > 0) {
    return definitions
      .map((definition) => definition.name || definition.key || '-')
      .join('，')
  }
  if (FORM_SOURCES.includes(deployment.source || '')) {
    return getFormDeploymentName(deployment)
  }
  return '-'
}

const formatDeploymentResourceKeys = (deployment: Deployment) => {
  const definitions = definitionsByDeploymentId.value[deployment.id] || []
  if (definitions.length > 0) {
    return definitions
      .map((definition) => `${definition.key || definition.id}（v${definition.version}）`)
      .join('，')
  }
  if (FORM_SOURCES.includes(deployment.source || '')) {
    return getFormDeploymentKey(deployment)
  }
  return '-'
}

const loadDeploymentDefinitions = async () => {
  try {
    const res = await getProcessDefinitions()
    const grouped: Record<string, ProcessDefinition[]> = {}
    res.data.forEach((definition) => {
      if (!grouped[definition.deploymentId]) {
        grouped[definition.deploymentId] = []
      }
      grouped[definition.deploymentId].push(definition)
    })
    definitionsByDeploymentId.value = grouped
  } catch {
    definitionsByDeploymentId.value = {}
  }
}

const fetchDeployments = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (search.name) params.nameLike = '%' + search.name + '%'
    if (search.source) params.source = search.source

    if (deploymentFilter.value === 'form') {
      const results: Deployment[] = []
      for (const source of FORM_SOURCES) {
        const res = await getDeployments({ ...params, source })
        results.push(...res.data)
      }
      deploymentList.value = results
    } else if (deploymentFilter.value === 'bpmn') {
      const res = await getDeployments(params)
      deploymentList.value = res.data.filter(d => !FORM_SOURCES.includes(d.source || ''))
    } else {
      const res = await getDeployments(params)
      deploymentList.value = res.data
    }
    await loadDeploymentDefinitions()
  } catch {
    ElMessage.error('获取资源部署列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.name = ''
  search.source = ''
  fetchDeployments()
}

const handleDelete = (row: Deployment) => {
  ElMessageBox.confirm(
    `确定删除资源部署 "${row.name}" 及所有关联数据吗？`,
    '删除确认',
    { confirmButtonText: '级联删除', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteDeployment(row.id, true)
      ElMessage.success('删除成功')
      fetchDeployments()
    } catch {
      ElMessage.error('删除失败')
    }
  })
}

const uploadDialogVisible = ref(false)
const uploadLoading = ref(false)
const uploadFormRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)

const uploadForm = reactive({
  deploymentName: '',
  file: null as any,
  deploymentSource: ''
})

const autoSource = ref(false)

const sourceLabel = computed(() => {
  if (uploadForm.deploymentSource === 'form-designer-vform') return '低代码表单'
  if (uploadForm.deploymentSource === 'form-designer-html') return 'HTML 表单'
  if (uploadForm.deploymentSource) return '流程'
  return ''
})

const uploadRules: FormRules = {
  deploymentName: [{ required: true, message: '请输入部署名称', trigger: 'blur' }]
}

const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw ?? null

  const raw = file.raw
  if (!raw) return

  const name = raw.name.toLowerCase()
  if (name.endsWith('.form.json')) {
    uploadForm.deploymentSource = 'form-designer-vform'
    autoSource.value = true
  } else if (name.endsWith('.form.html')) {
    uploadForm.deploymentSource = 'form-designer-html'
    autoSource.value = true
  } else if (name.endsWith('.json')) {
    uploadForm.deploymentSource = 'form-designer-vform'
    autoSource.value = true
  } else if (name.endsWith('.html') || name.endsWith('.htm')) {
    uploadForm.deploymentSource = 'form-designer-html'
    autoSource.value = true
  } else {
    uploadForm.deploymentSource = uploadForm.deploymentSource || ''
    autoSource.value = false
  }
}

const handleFileRemove = () => {
  selectedFile.value = null
  uploadForm.deploymentSource = ''
  autoSource.value = false
}

const openUploadDialog = () => {
  uploadForm.deploymentName = ''
  uploadForm.deploymentSource = ''
  autoSource.value = false
  selectedFile.value = null
  uploadRef.value?.clearFiles()
  uploadDialogVisible.value = true
}

const handleUpload = async () => {
  const valid = await uploadFormRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!selectedFile.value) {
    ElMessage.warning('请选择要部署的文件')
    return
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('deployment-name', uploadForm.deploymentName)
    formData.append('enable-duplicate-filtering', 'false')
    if (uploadForm.deploymentSource) {
      formData.append('deployment-source', uploadForm.deploymentSource)
    }
    formData.append(selectedFile.value.name, selectedFile.value)
    await createDeployment(formData)
    ElMessage.success('部署成功')
    uploadDialogVisible.value = false
    fetchDeployments()
  } catch (error: any) {
    ElMessage.error(translateDeployError(error))
  } finally {
    uploadLoading.value = false
  }
}

const resourceDialogVisible = ref(false)
const resources = ref<any[]>([])
const resourceLoading = ref(false)

const openResourceDialog = async (deploymentId: string) => {
  resourceDialogVisible.value = true
  resourceLoading.value = true
  try {
    const res = await getDeploymentResources(deploymentId)
    resources.value = res.data
  } catch {
    ElMessage.error('获取资源列表失败')
  } finally {
    resourceLoading.value = false
  }
}

onMounted(() => {
  fetchDeployments()
})
</script>

<style scoped>
.deployment-page {
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

.filter-tabs {
  margin-bottom: 12px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
