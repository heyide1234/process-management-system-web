<template>
  <div class="user-list-page">
    <div class="page-header">
      <h3>用户列表</h3>
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="search.id"
        placeholder="用户名"
        clearable
        style="width: 180px"
        @keyup.enter="fetchUsers"
      />
      <el-input
        v-model="search.firstNameLike"
        placeholder="姓名"
        clearable
        style="width: 180px"
        @keyup.enter="fetchUsers"
      />
      <el-input
        v-model="search.emailLike"
        placeholder="邮箱"
        clearable
        style="width: 200px"
        @keyup.enter="fetchUsers"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="userList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="用户名" min-width="120" />
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          {{ row.firstName || '' }}{{ row.lastName || '' }}
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openViewDialog(row.id)">查看</el-button>
          <el-button size="small" link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
          <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button size="small" link type="primary" @click="openGroupDialog(row.id)">管理组</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="640px"
      :close-on-click-modal="false"
      class="account-dialog"
    >
      <div class="dialog-summary">
        <div>
          <h4>{{ isEdit ? '用户资料' : '创建用户' }}</h4>
          <p>{{ isEdit ? '更新用户基础信息，密码留空则不修改。' : '填写登录账号、联系方式和初始密码。' }}</p>
        </div>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="account-form"
      >
        <div class="form-grid">
          <el-form-item label="用户名" prop="id">
            <el-input
              v-model="formData.id"
              :disabled="isEdit"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="fullName">
            <el-input
              v-model="formData.fullName"
              placeholder="请输入姓名"
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email" class="grid-span-2">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password" class="grid-span-2" :required="!isEdit">
            <el-input
              v-model="formData.password"
              type="password"
              show-password
              :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
            />
            <div class="field-tip">{{ isEdit ? '留空则不修改；如填写，需为 6-64 位' : '6-64 位，不限制字符组合' }}</div>
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer-actions">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建用户' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="viewDialogVisible"
      title="用户详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ viewData.firstName || '' }}{{ viewData.lastName || '' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
        <el-descriptions-item label="所属组">
          <el-tag
            v-for="g in viewGroups"
            :key="g.id"
            style="margin-right: 6px; margin-bottom: 4px"
          >
            {{ g.name || g.id }}
          </el-tag>
          <span v-if="viewGroups.length === 0" style="color: #999">暂无</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      v-model="groupDialogVisible"
      title="管理用户组"
      width="700px"
    >
      <div class="group-transfer">
        <div class="transfer-panel">
          <h4>可用组</h4>
          <el-table
            :data="availableGroups"
            height="300"
            @row-click="addGroupToUser"
            highlight-current-row
          >
            <el-table-column prop="id" label="组ID" />
            <el-table-column prop="name" label="组名称" />
          </el-table>
        </div>
        <div class="transfer-panel">
          <h4>已加入的组</h4>
          <el-table
            :data="userGroups"
            height="300"
            @row-click="removeGroupFromUser"
            highlight-current-row
          >
            <el-table-column prop="id" label="组ID" />
            <el-table-column prop="name" label="组名称" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getUsers,
  getUser,
  getUserCount,
  createUser,
  updateUserProfile,
  updateUserCredentials,
  deleteUser,
  getUserGroups,
  type CamundaUser,
  type CamundaUserProfile
} from '../../api/user'
import { getGroups, addGroupMember, removeGroupMember, type CamundaGroup } from '../../api/group'

const userList = ref<CamundaUser[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const search = reactive({
  id: '',
  firstNameLike: '',
  emailLike: ''
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      firstResult: (currentPage.value - 1) * pageSize.value,
      maxResults: pageSize.value
    }
    const countParams: Record<string, string> = {}
    if (search.id) {
      params.id = search.id
      countParams.id = search.id
    }
    if (search.firstNameLike) {
      params.firstNameLike = `%${search.firstNameLike}%`
      countParams.firstNameLike = params.firstNameLike
    }
    if (search.emailLike) {
      params.emailLike = `%${search.emailLike}%`
      countParams.emailLike = params.emailLike
    }
    const [res, countRes] = await Promise.all([
      getUsers(params),
      getUserCount(countParams)
    ])
    userList.value = res.data
    total.value = countRes.data.count
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const resetSearch = () => {
  search.id = ''
  search.firstNameLike = ''
  search.emailLike = ''
  currentPage.value = 1
  fetchUsers()
}

const onPageSizeChange = () => {
  currentPage.value = 1
  fetchUsers()
}

const onPageChange = () => {
  fetchUsers()
}

const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: '',
  fullName: '',
  email: '',
  password: ''
})

const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 64

const passwordRule = (_rule: any, value: string, callback: any) => {
  if (isEdit.value && !value) {
    callback()
    return
  }
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  if (value) {
    if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      callback(new Error(`密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`))
      return
    }
  }
  callback()
}

const formRules: FormRules = {
  id: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ validator: passwordRule, trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  formData.id = ''
  formData.fullName = ''
  formData.email = ''
  formData.password = ''
  formDialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

const openEditDialog = async (userId: string) => {
  isEdit.value = true
  try {
    const res = await getUser(userId)
    formData.id = res.data.id
    formData.fullName = (res.data.firstName || '') + (res.data.lastName || '')
    formData.email = res.data.email || ''
    formData.password = ''
    formDialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  } catch {
    ElMessage.error('获取用户信息失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const fullName = formData.fullName.trim()
    const spaceIndex = fullName.indexOf(' ')
    const firstName = spaceIndex > -1 ? fullName.substring(0, spaceIndex) : fullName
    const lastName = spaceIndex > -1 ? fullName.substring(spaceIndex + 1) : ''

    if (isEdit.value) {
      await updateUserProfile(formData.id, {
        id: formData.id,
        firstName,
        lastName,
        email: formData.email
      })
      if (formData.password) {
        await updateUserCredentials(formData.id, {
          password: formData.password,
          authenticatedUserPassword: 'admin'
        })
      }
      ElMessage.success('编辑成功')
    } else {
      await createUser({
        profile: {
          id: formData.id,
          firstName,
          lastName,
          email: formData.email
        },
        credentials: {
          password: formData.password
        }
      })
      ElMessage.success('新增成功')
    }
    formDialogVisible.value = false
    fetchUsers()
  } catch {
    ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: CamundaUser) => {
  ElMessageBox.confirm(
    `确定删除用户 ${row.id}？此操作不可撤销`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUsers()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const viewDialogVisible = ref(false)
const viewData = ref<CamundaUserProfile>({ id: '', firstName: '', lastName: '', email: '' })
const viewGroups = ref<{ id: string; name: string }[]>([])

const openViewDialog = async (userId: string) => {
  try {
    const [userRes, groupsRes] = await Promise.all([
      getUser(userId),
      getUserGroups(userId)
    ])
    viewData.value = userRes.data
    viewGroups.value = groupsRes.data.groups
    viewDialogVisible.value = true
  } catch {
    ElMessage.error('获取用户详情失败')
  }
}

const groupDialogVisible = ref(false)
const currentGroupUserId = ref('')
const availableGroups = ref<CamundaGroup[]>([])
const userGroups = ref<{ id: string; name: string }[]>([])

const openGroupDialog = async (userId: string) => {
  currentGroupUserId.value = userId
  try {
    const [allGroupsRes, userGroupsRes] = await Promise.all([
      getGroups(),
      getUserGroups(userId)
    ])
    const allGroups = allGroupsRes.data
    const userGroupIds = new Set(userGroupsRes.data.groups.map((g: any) => g.id))
    availableGroups.value = allGroups.filter(g => !userGroupIds.has(g.id))
    userGroups.value = userGroupsRes.data.groups
    groupDialogVisible.value = true
  } catch {
    ElMessage.error('获取组信息失败')
  }
}

const addGroupToUser = async (group: CamundaGroup) => {
  try {
    await addGroupMember(group.id, currentGroupUserId.value)
    availableGroups.value = availableGroups.value.filter(g => g.id !== group.id)
    userGroups.value.push({ id: group.id, name: group.name })
    ElMessage.success('添加成功')
  } catch {
    ElMessage.error('添加失败')
  }
}

const removeGroupFromUser = async (group: { id: string; name: string }) => {
  try {
    await removeGroupMember(group.id, currentGroupUserId.value)
    userGroups.value = userGroups.value.filter(g => g.id !== group.id)
    availableGroups.value.push({ ...group, type: '' })
    ElMessage.success('移除成功')
  } catch {
    ElMessage.error('移除失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list-page {
  background: #fff;
  /* padding: 20px; */
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
  flex-wrap: wrap;
}

.dialog-summary {
  padding: 16px 18px;
  margin-bottom: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.dialog-summary h4 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.dialog-summary p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.account-form {
  margin-top: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 18px;
}

.grid-span-2 {
  grid-column: 1 / -1;
}

.field-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.account-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.group-transfer {
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
