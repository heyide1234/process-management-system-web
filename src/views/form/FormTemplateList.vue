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
      <el-table-column prop="name" label="模板名称" min-width="150" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="(row as any).formType === 'html' ? 'warning' : 'success'" size="small">
            {{ (row as any).formType === 'html' ? 'HTML' : '低代码' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="formKey" min-width="220">
        <template #default="{ row }">
          <div class="formkey-cell">
            <code class="formkey-text">{{ getFormKey(row) }}</code>
            <el-button link type="primary" size="small" @click="copyFormKey(row)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
      <el-table-column prop="deploymentTime" label="部署时间" min-width="160" :formatter="formatTableTime" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" link type="success" @click="handlePreview(row)">预览</el-button>
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
import { buildFormKey, META_FILENAME, type FormMeta } from '../../api/form'
import type { Deployment } from '../../api/deployment'
import { CopyDocument } from '@element-plus/icons-vue'
import { formatTableTime } from '../../utils/format'

const router = useRouter()

const templateList = ref<Array<Deployment & { description?: string; formType?: string; templateFormKey?: string }>>([])
const loading = ref(false)

const search = reactive({
  name: ''
})

const detectFormType = async (deployment: Deployment): Promise<string> => {
  if (deployment.source === 'form-designer-vform') return 'vform'
  if (deployment.source === 'form-designer-html') return 'html'

  try {
    const resources = await getDeploymentResources(deployment.id)
    for (const r of resources.data) {
      if (r.name.endsWith('.form.html')) return 'html'
      if (r.name.endsWith('.form.json')) return 'vform'
    }
  } catch { /* ignore */ }
  return 'vform'
}

const fetchTemplates = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params: Record<string, any> = {
      sortBy: 'deploymentTime',
      sortOrder: 'desc'
    }
    if (search.name) params.nameLike = `%${search.name}%`

    const vformRes = await getDeployments({ ...params, source: 'form-designer-vform' })
    const htmlRes = await getDeployments({ ...params, source: 'form-designer-html' })
    const legacyRes = await getDeployments({ ...params, source: 'form-designer' })

    const allDeployments = [
      ...vformRes.data.map(d => ({ ...d, formType: 'vform' })),
      ...htmlRes.data.map(d => ({ ...d, formType: 'html' })),
      ...(await Promise.all(legacyRes.data.map(async (d) => ({
        ...d,
        formType: await detectFormType(d)
      }))))
    ]

    const deployments = await Promise.all(allDeployments.map(async (deployment) => {
      let description = ''
      let templateFormKey = ''
      try {
        const resources = await getDeploymentResources(deployment.id)
        const descResource = resources.data.find(r => r.name.endsWith('.description.txt'))
        if (descResource) {
          const blobRes = await getDeploymentResourceData(deployment.id, descResource.id)
          description = await (blobRes.data as Blob).text()
        }
        const metaResource = resources.data.find(r => r.name === META_FILENAME)
        if (metaResource) {
          const metaRes = await getDeploymentResourceData(deployment.id, metaResource.id)
          const metaText = await (metaRes.data as Blob).text()
          const meta = JSON.parse(metaText) as FormMeta
          if (meta.formKey) templateFormKey = meta.formKey
        }
      } catch (e) {
        console.error('Failed to load description for deployment', deployment.id, e)
      }
      return { ...deployment, description, templateFormKey }
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

const getFormKey = (row: Deployment & { formType?: string; templateFormKey?: string }) => {
  return buildFormKey((row.formType || 'vform') as any, row.id)
}

const copyFormKey = async (row: Deployment & { formType?: string; templateFormKey?: string }) => {
  const key = getFormKey(row)
  try {
    await navigator.clipboard.writeText(key)
    ElMessage.success(`已复制: ${key}`)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleEdit = (row: Deployment & { formType?: string; templateFormKey?: string }) => {
  router.push(`/form/designer?id=${row.id}`)
}

const handlePreview = (row: Deployment & { formType?: string; templateFormKey?: string }) => {
  const formKey = getFormKey(row)
  router.push({
    path: '/form/fill',
    query: { formKey, preview: '1' }
  })
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

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.formkey-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.formkey-text {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}
</style>