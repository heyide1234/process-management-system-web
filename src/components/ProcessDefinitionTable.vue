<template>
  <div class="process-definition-table">
    <h2>流程定义列表</h2>
    <el-table :data="processDefinitions" border stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" min-width="200" show-overflow-tooltip />
      <el-table-column prop="key" label="Key" min-width="150" />
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="version" label="版本" width="80" align="center" />
      <el-table-column prop="category" label="分类" min-width="120" />
      <el-table-column prop="deploymentId" label="部署ID" min-width="200" show-overflow-tooltip />
      <el-table-column prop="resource" label="资源文件" min-width="180" show-overflow-tooltip />
      <el-table-column prop="suspended" label="挂起状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.suspended ? 'danger' : 'success'">
            {{ row.suspended ? '已挂起' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProcessDefinitions, type ProcessDefinition } from '../api/processDefinition'

const processDefinitions = ref<ProcessDefinition[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await getProcessDefinitions()
    processDefinitions.value = response.data
  } catch (error) {
    console.error('获取流程定义失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.process-definition-table {
  margin-top: 20px;
}

h2 {
  margin-bottom: 16px;
  color: #303133;
}
</style>