<template>
  <div class="form-record-page">
    <div class="page-header">
      <h3>我的表单记录</h3>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.keyword"
        placeholder="搜索表单名称"
        clearable
        style="width: 250px"
        @keyup.enter="fetchRecords"
      />
      <el-select v-model="search.status" placeholder="状态筛选" clearable style="width: 150px">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      <el-button type="primary" @click="fetchRecords">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="recordList" v-loading="loading" border stripe>
      <el-table-column prop="templateName" label="表单名称" width="200" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="approvalComment" label="审批意见" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="提交时间" width="180" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="viewRecord(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="viewDialogVisible" :title="viewRecordData?.templateName || '表单详情'" width="900px">
      <div v-if="viewRecordData" class="form-detail">
        <div class="detail-header">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="表单名称">{{ viewRecordData.templateName }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(viewRecordData.status)">
                {{ getStatusText(viewRecordData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ viewRecordData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="审批意见" v-if="viewRecordData.approvalComment">
              {{ viewRecordData.approvalComment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="form-content">
          <h4>表单内容</h4>
          <v-form-render
            :form-json="viewFormJson"
            :form-data="viewRecordData.data"
            :option-data="viewOptionData"
            disabled
          ></v-form-render>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFormInstances, getFormTemplate } from '../../api/deployment'
import type { FormInstance } from '../../api/deployment'

const recordList = ref<FormInstance[]>([])
const loading = ref(false)

const search = reactive({
  keyword: '',
  status: ''
})

const viewDialogVisible = ref(false)
const viewRecordData = ref<FormInstance | null>(null)
const viewFormJson = reactive({})
const viewOptionData = reactive({})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (search.status) params.status = search.status
    const res = await getFormInstances(params)
    
    let list = res.data
    if (search.keyword) {
      list = list.filter((item: FormInstance) =>
        item.templateName?.toLowerCase().includes(search.keyword.toLowerCase())
      )
    }
    
    recordList.value = list
  } catch {
    ElMessage.error('获取表单记录失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.keyword = ''
  search.status = ''
  fetchRecords()
}

const viewRecord = async (row: FormInstance) => {
  viewRecordData.value = row
  viewDialogVisible.value = true
  
  Object.assign(viewFormJson, {})
  Object.assign(viewOptionData, {})
  
  try {
    if (row.templateId) {
      const templateRes = await getFormTemplate(row.templateId)
      if (templateRes.data.vformJson) {
        Object.assign(viewFormJson, templateRes.data.vformJson)
      }
    }
  } catch (error) {
    console.error('加载表单模板失败:', error)
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.form-record-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.form-detail {
  padding: 0 8px;
}

.detail-header {
  margin-bottom: 20px;
}

.form-content h4 {
  margin-bottom: 16px;
}
</style>
