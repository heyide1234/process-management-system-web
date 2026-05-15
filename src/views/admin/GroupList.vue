<template>
  <div class="group-list-page">
    <div class="page-header">
      <h3>组列表</h3>
      <el-button type="primary" @click="openAddDialog">新增组</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.id"
        placeholder="组ID"
        clearable
        style="width: 180px"
        @keyup.enter="fetchGroups"
      />
      <el-input
        v-model="search.name"
        placeholder="组名称"
        clearable
        style="width: 180px"
        @keyup.enter="fetchGroups"
      />
      <el-select
        v-model="search.type"
        placeholder="组类型"
        clearable
        style="width: 160px"
      >
        <el-option label="WORKFLOW" value="WORKFLOW" />
        <el-option label="SYSTEM" value="SYSTEM" />
        <el-option label="camunda-admin" value="camunda-admin" />
      </el-select>
      <el-button type="primary" @click="fetchGroups">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="groupList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="组ID" min-width="150" />
      <el-table-column prop="name" label="组名称" min-width="150" />
      <el-table-column prop="type" label="组类型" min-width="120" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button size="small" link type="primary" @click="openMemberDialog(row.id)">管理成员</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑组' : '新增组'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="组ID" prop="id">
          <el-input
            v-model="formData.id"
            :disabled="isEdit"
            placeholder="请输入组ID"
          />
        </el-form-item>
        <el-form-item label="组名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入组名称"
          />
        </el-form-item>
        <el-form-item label="组类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择组类型" style="width: 100%">
            <el-option label="WORKFLOW" value="WORKFLOW" />
            <el-option label="SYSTEM" value="SYSTEM" />
            <el-option label="camunda-admin" value="camunda-admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="memberDialogVisible"
      title="管理组成员"
      width="700px"
    >
      <div class="member-transfer">
        <div class="transfer-panel">
          <h4>可用用户</h4>
          <el-table
            :data="availableUsers"
            height="300"
            @row-click="addMemberToGroup"
            highlight-current-row
          >
            <el-table-column prop="id" label="用户名" />
            <el-table-column label="姓名">
              <template #default="{ row }">
                {{ row.firstName || '' }}{{ row.lastName || '' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="transfer-panel">
          <h4>已有成员</h4>
          <el-table
            :data="groupMembers"
            height="300"
            @row-click="removeMemberFromGroup"
            highlight-current-row
          >
            <el-table-column prop="id" label="用户名" />
            <el-table-column label="姓名">
              <template #default="{ row }">
                {{ row.firstName || '' }}{{ row.lastName || '' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  type CamundaGroup
} from '../../api/group'
import { getUsers, type CamundaUser } from '../../api/user'

const groupList = ref<CamundaGroup[]>([])
const loading = ref(false)

const search = reactive({
  id: '',
  name: '',
  type: ''
})

const fetchGroups = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (search.id) params.id = search.id
    if (search.name) params.name = `%${search.name}%`
    if (search.type) params.type = search.type
    const res = await getGroups(params)
    groupList.value = res.data
  } catch {
    ElMessage.error('获取组列表失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  search.id = ''
  search.name = ''
  search.type = ''
  fetchGroups()
}

const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: '',
  name: '',
  type: ''
})

const formRules: FormRules = {
  id: [{ required: true, message: '请输入组ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入组名称', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  formData.id = ''
  formData.name = ''
  formData.type = ''
  formDialogVisible.value = true
}

const openEditDialog = async (groupId: string) => {
  isEdit.value = true
  try {
    const res = await getGroup(groupId)
    formData.id = res.data.id
    formData.name = res.data.name || ''
    formData.type = res.data.type || ''
    formDialogVisible.value = true
  } catch {
    ElMessage.error('获取组信息失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateGroup(formData.id, {
        name: formData.name,
        type: formData.type
      })
      ElMessage.success('编辑成功')
    } else {
      await createGroup({
        id: formData.id,
        name: formData.name,
        type: formData.type
      })
      ElMessage.success('新增成功')
    }
    formDialogVisible.value = false
    fetchGroups()
  } catch {
    ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: CamundaGroup) => {
  ElMessageBox.confirm(
    `确定删除组 ${row.id}？此操作不可撤销`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteGroup(row.id)
      ElMessage.success('删除成功')
      fetchGroups()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const memberDialogVisible = ref(false)
const currentMemberGroupId = ref('')
const availableUsers = ref<CamundaUser[]>([])
const groupMembers = ref<{ id: string; firstName: string; lastName: string; email: string }[]>([])

const openMemberDialog = async (groupId: string) => {
  currentMemberGroupId.value = groupId
  try {
    const [allUsersRes, membersRes] = await Promise.all([
      getUsers(),
      getGroupMembers(groupId)
    ])
    const allUsers = allUsersRes.data
    const memberIds = new Set(membersRes.data.map((m: any) => m.id))
    availableUsers.value = allUsers.filter(u => !memberIds.has(u.id))
    groupMembers.value = membersRes.data
    memberDialogVisible.value = true
  } catch {
    ElMessage.error('获取成员信息失败')
  }
}

const addMemberToGroup = async (user: CamundaUser) => {
  try {
    await addGroupMember(currentMemberGroupId.value, user.id)
    availableUsers.value = availableUsers.value.filter(u => u.id !== user.id)
    groupMembers.value.push({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    })
    ElMessage.success('添加成功')
  } catch {
    ElMessage.error('添加失败')
  }
}

const removeMemberFromGroup = async (member: { id: string }) => {
  try {
    await removeGroupMember(currentMemberGroupId.value, member.id)
    const removed = groupMembers.value.find(m => m.id === member.id)
    groupMembers.value = groupMembers.value.filter(m => m.id !== member.id)
    if (removed) {
      availableUsers.value.push({
        id: removed.id,
        firstName: removed.firstName,
        lastName: removed.lastName,
        email: removed.email
      })
    }
    ElMessage.success('移除成功')
  } catch {
    ElMessage.error('移除失败')
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.group-list-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.member-transfer {
  display: flex;
  gap: 20px;
}

.transfer-panel {
  flex: 1;
}

.transfer-panel h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}
</style>