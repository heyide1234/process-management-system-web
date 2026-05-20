<template>
  <div class="form-approval-page">
    <div class="page-header">
      <h3>表单审批</h3>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.keyword"
        placeholder="搜索表单名称或申请人"
        clearable
        style="width: 250px"
        @keyup.enter="fetchInstances"
      />
      <el-select v-model="search.status" placeholder="状态筛选" clearable style="width: 150px">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      <el-button type="primary" @click="fetchInstances">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="instanceList" v-loading="loading" border stripe>
      <el-table-column prop="templateName" label="表单名称" width="200" />
      <el-table-column prop="applicantName" label="申请人" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="180" />
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" @click="viewForm(row)">查看</el-button>
          <el-button
            type="primary"
            size="small"
            @click="approveForm(row)"
            v-if="row.status === 'pending'"
          >通过</el-button>
          <el-button
            type="danger"
            size="small"
            @click="rejectForm(row)"
            v-if="row.status === 'pending'"
          >拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="viewDialogVisible" :title="viewFormInstance?.templateName || '表单详情'" width="900px">
      <div v-if="viewFormInstance" class="form-detail">
        <div class="detail-header">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="表单名称">{{ viewFormInstance.templateName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ viewFormInstance.applicantName }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(viewFormInstance.status)">
                {{ getStatusText(viewFormInstance.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ viewFormInstance.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="审批意见" v-if="viewFormInstance.approvalComment" :span="2">
              {{ viewFormInstance.approvalComment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="form-content">
          <h4>表单内容</h4>
          <v-form-render
            :form-json="viewFormJson"
            :form-data="viewFormInstance.data"
            disabled
          ></v-form-render>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="approvalDialogVisible"
      title="审批表单"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="操作">{{ isApprove ? '通过' : '拒绝' }}</el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="approvalLoading" @click="submitApproval">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { completeTask } from '../../api/task'
import { getFormInstances, updateFormInstance, getFormTemplate } from '../../api/deployment'
import type { FormInstance, FormTemplate } from '../../api/deployment'

const instanceList = ref<FormInstance[]>([])
const loading = ref(false)

const search = reactive({
  keyword: '',
  status: ''
})

const viewDialogVisible = ref(false)
const viewFormInstance = ref<FormInstance | null>(null)
const viewFormJson = reactive<any>({})

const approvalDialogVisible = ref(false)
const approvalLoading = ref(false)
const isApprove = ref(false)
const currentInstance = ref<FormInstance | null>(null)

const approvalForm = reactive({
  comment: ''
})

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

const fetchInstances = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}
    if (search.status) params.status = search.status
    const res = await getFormInstances(params)
    instanceList.value = res.data
  } catch {
    ElMessage.error('获取表单列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.keyword = ''
  search.status = ''
  fetchInstances()
}

const viewForm = async (row: FormInstance) => {
  viewFormInstance.value = row
  viewDialogVisible.value = true
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

const approveForm = (row: FormInstance) => {
  isApprove.value = true
  currentInstance.value = row
  approvalForm.comment = ''
  approvalDialogVisible.value = true
}

const rejectForm = (row: FormInstance) => {
  isApprove.value = false
  currentInstance.value = row
  approvalForm.comment = ''
  approvalDialogVisible.value = true
}

const submitApproval = async () => {
  if (!currentInstance.value) return

  approvalLoading.value = true
  try {
    const result = isApprove.value ? 'approved' : 'rejected'

    if (currentInstance.value.taskId) {
      await completeTask(currentInstance.value.taskId, {
        approvalResult: { value: result, type: 'String' },
        approvalComment: { value: approvalForm.comment, type: 'String' }
      })
    }

    await updateFormInstance(currentInstance.value.id, {
      status: result,
      approvalComment: approvalForm.comment
    })

    ElMessage.success(isApprove.value ? '审批通过' : '审批拒绝')
    approvalDialogVisible.value = false
    fetchInstances()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批操作失败，请稍后重试')
  } finally {
    approvalLoading.value = false
  }
}

onMounted(() => {
  fetchInstances()
})
</script>

<style scoped>
.form-approval-page {
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
