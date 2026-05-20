<template>
  <div class="form-template-page">
    <div class="page-header">
      <h3>表单模板管理</h3>
      <el-button type="primary" @click="handleCreate">+ 新建模板</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.name"
        placeholder="模板名称"
        clearable
        style="width: 200px"
        @keyup.enter="fetchTemplates"
      />
      <el-button type="primary" @click="fetchTemplates">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="templateList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" min-width="120" show-overflow-tooltip />
      <el-table-column prop="name" label="模板名称" min-width="180" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="deploymentTime" label="部署时间" min-width="170" />
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDeployments,
  deleteDeployment,
  getDeploymentResources,
  getDeploymentResourceData
} from '../../api/deployment'
import type { Deployment } from '../../api/deployment'

const router = useRouter()

const templateList = ref<Array<Deployment & { description?: string }>>([])
const loading = ref(false)
const isMounted = ref(false)

const search = reactive({
  name: ''
})

const fetchTemplates = async () => {
  if (loading.value) return // 防止重复调用
  loading.value = true
  try {
    const params: Record<string, any> = {
      source: 'form-designer',
      sortBy: 'deploymentTime',
      sortOrder: 'desc'
    }
    if (search.name) params.nameLike = `%${search.name}%`
    const res = await getDeployments(params)
    
    const deployments = await Promise.all(res.data.map(async (deployment) => {
      let description = ''
      try {
        const resources = await getDeploymentResources(deployment.id)
        const descResource = resources.data.find(r => r.name.endsWith('.description.txt'))
        if (descResource) {
          const blobRes = await getDeploymentResourceData(deployment.id, descResource.id)
          description = await (blobRes.data as Blob).text()
        }
      } catch (e) {
        console.error('Failed to load description for deployment', deployment.id, e)
      }
      return { ...deployment, description }
    }))
    
    templateList.value = deployments
  } catch (error) {
    console.error('获取模板列表失败:', error)
    ElMessage.error('获取模板列表失败')
    templateList.value = []
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.name = ''
  fetchTemplates()
}

const handleCreate = () => {
  router.push('/form/designer')
}

const handleEdit = (row: Deployment) => {
  router.push(`/form/designer?id=${row.id}`)
}

const handleDelete = async (row: Deployment) => {
  await ElMessageBox.confirm('确定要删除这个模板吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteDeployment(row.id, true)
    ElMessage.success('删除成功')
    fetchTemplates()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  isMounted.value = true
  fetchTemplates()
})
</script>

<style scoped>
.form-template-page {
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
}
</style>