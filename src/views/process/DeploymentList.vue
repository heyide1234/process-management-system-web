<template>
  <div class="deployment-page">
    <div class="page-header">
      <h3>流程部署</h3>
      <el-button type="primary" @click="openUploadDialog">部署新流程</el-button>
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
      <el-table-column prop="id" label="部署ID" min-width="200" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="source" label="来源" min-width="120" />
      <el-table-column prop="deploymentTime" label="部署时间" min-width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openResourceDialog(row.id)">查看资源</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="uploadDialogVisible" title="部署新流程" width="500px" :close-on-click-modal="false">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="部署名称" prop="deploymentName">
          <el-input v-model="uploadForm.deploymentName" placeholder="请输入部署名称" />
        </el-form-item>
        <el-form-item label="BPMN 文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".bpmn,.xml"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 .bpmn 或 .xml 格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="启用重复检查">
          <el-switch v-model="uploadForm.enableDuplicateFiltering" />
        </el-form-item>
        <el-form-item label="部署来源">
          <el-input v-model="uploadForm.deploymentSource" placeholder="如：process application" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="handleUpload">部署</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resourceDialogVisible" title="部署资源" width="600px">
      <el-table :data="resources" v-loading="resourceLoading" border stripe>
        <el-table-column prop="id" label="资源ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="name" label="文件名" min-width="200" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadInstance } from 'element-plus'
import {
  getDeployments,
  createDeployment,
  deleteDeployment,
  getDeploymentResources
} from '../../api/deployment'
import type { Deployment } from '../../api/deployment'

const deploymentList = ref<Deployment[]>([])
const loading = ref(false)

const search = reactive({ name: '', source: '' })

const fetchDeployments = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (search.name) params.nameLike = '%' + search.name + '%'
    if (search.source) params.source = search.source
    const res = await getDeployments(params)
    deploymentList.value = res.data
  } catch {
    ElMessage.error('获取部署列表失败')
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
    `确定删除部署 "${row.name}" 及所有关联的流程实例吗？`,
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
  enableDuplicateFiltering: false,
  deploymentSource: ''
})

const uploadRules: FormRules = {
  deploymentName: [{ required: true, message: '请输入部署名称', trigger: 'blur' }]
}

const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw ?? null
}

const handleFileRemove = () => {
  selectedFile.value = null
}

const openUploadDialog = () => {
  uploadForm.deploymentName = ''
  uploadForm.enableDuplicateFiltering = false
  uploadForm.deploymentSource = ''
  selectedFile.value = null
  uploadRef.value?.clearFiles()
  uploadDialogVisible.value = true
}

const handleUpload = async () => {
  const valid = await uploadFormRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!selectedFile.value) {
    ElMessage.warning('请选择 BPMN 文件')
    return
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append(uploadForm.deploymentName, selectedFile.value)
    formData.append('deployment-name', uploadForm.deploymentName)
    formData.append('enable-duplicate-filtering', String(uploadForm.enableDuplicateFiltering))
    if (uploadForm.deploymentSource) {
      formData.append('deployment-source', uploadForm.deploymentSource)
    }
    await createDeployment(formData)
    ElMessage.success('部署成功')
    uploadDialogVisible.value = false
    fetchDeployments()
  } catch {
    ElMessage.error('部署失败')
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
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
