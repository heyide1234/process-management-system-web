<template>
  <div class="authorization-page">
    <div class="page-header">
      <h3>权限管理</h3>
      <el-button type="primary" @click="openAddDialog()">新增授权</el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="search.userOrGroup" placeholder="用户 / 组 ID" clearable style="width: 200px" @keyup.enter="fetchData" />
      <el-select v-model="search.resourceType" placeholder="资源类型" clearable style="width: 160px" @change="fetchData">
        <el-option v-for="o in RESOURCE_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <div class="filter-tabs">
      <el-radio-group v-model="subjectFilter" size="small">
        <el-radio-button value="all">全部 {{ totalAuthorizationCount }}</el-radio-button>
        <el-radio-button value="group">组授权 {{ sectionAuthCount('group') }}</el-radio-button>
        <el-radio-button value="user">用户授权 {{ sectionAuthCount('user') }}</el-radio-button>
        <el-radio-button value="global">全局授权 {{ sectionAuthCount('global') }}</el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="authorization-sections">
      <template v-if="hasVisibleAuthorizations">
        <section v-for="section in visibleSections" :key="section.type" class="authorization-section">
          <div class="section-header">
            <div>
              <h4>{{ section.title }}</h4>
              <span>{{ section.groups.length }} 个授权对象，{{ section.total }} 项授权</span>
            </div>
          </div>

          <el-table :data="section.groups" border stripe row-key="key">
            <el-table-column type="expand" width="48">
              <template #default="{ row }">
                <el-table :data="row.items" border size="small" class="detail-table">
                  <el-table-column label="资源" min-width="170">
                    <template #default="{ row: item }">
                      <div class="resource-cell">
                        <span>{{ getResourceLabel(item.resourceType) }}</span>
                        <small>{{ formatResourceId(item.resourceId) }}</small>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作权限" min-width="260">
                    <template #default="{ row: item }">
                      <el-tag
                        v-for="p in item.permissions"
                        :key="p"
                        size="small"
                        :type="p === 'ALL' ? 'danger' : ''"
                        class="permission-tag"
                      >
                        {{ getPermissionLabel(p) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="类型" width="100">
                    <template #default="{ row: item }">
                      <span :class="['auth-type', `auth-type-${item.type}`]">
                        {{ getAuthTypeLabel(item.type) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="140" fixed="right">
                    <template #default="{ row: item }">
                      <el-button size="small" link type="primary" @click="openEditDialog(item)">编辑</el-button>
                      <el-button size="small" link type="danger" @click="handleDelete(item)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column label="授权对象" min-width="180">
              <template #default="{ row }">
                <div class="subject-cell">
                  <el-tag :type="row.tagType" size="small">{{ row.label }}</el-tag>
                  <small>{{ row.subjectLabel }}</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="资源概览" min-width="260">
              <template #default="{ row }">
                <el-tag
                  v-for="resource in row.resourceLabels.slice(0, 6)"
                  :key="resource"
                  size="small"
                  class="summary-tag"
                >
                  {{ resource }}
                </el-tag>
                <span v-if="row.resourceLabels.length > 6" class="summary-more">
                  +{{ row.resourceLabels.length - 6 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="权限摘要" min-width="220">
              <template #default="{ row }">
                <el-tag
                  v-for="permission in row.permissionLabels.slice(0, 5)"
                  :key="permission"
                  size="small"
                  :type="permission === '全部' ? 'danger' : 'info'"
                  class="summary-tag"
                >
                  {{ permission }}
                </el-tag>
                <span v-if="row.permissionLabels.length > 5" class="summary-more">
                  +{{ row.permissionLabels.length - 5 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="授权数量" width="110">
              <template #default="{ row }">
                <span>{{ row.items.length }} 项</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="openAddDialog(row)">新增资源授权</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </template>
      <el-empty v-else description="暂无授权数据" />
    </div>

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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑授权' : '新增授权'" width="520px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="授权对象" prop="subjectType">
          <el-radio-group v-model="form.subjectType" @change="onSubjectChange">
            <el-radio value="user">指定用户</el-radio>
            <el-radio value="group">指定组</el-radio>
            <el-radio value="global">所有人</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.subjectType === 'user'" label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="输入用户ID" />
        </el-form-item>
        <el-form-item v-if="form.subjectType === 'group'" label="组ID" prop="groupId">
          <el-input v-model="form.groupId" placeholder="输入组ID" />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select v-model="form.resourceType" placeholder="选择" style="width:100%">
            <el-option v-for="o in RESOURCE_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源ID">
          <el-input v-model="form.resourceId" placeholder="留空 = 全部资源" />
        </el-form-item>
        <el-form-item label="操作权限" prop="permissions">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox v-for="o in PERMISSION_OPTIONS" :key="o.value" :value="o.value" :label="o.label" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getAuthorizations,
  getAuthorizationCount,
  createAuthorization,
  updateAuthorization,
  deleteAuthorization,
  getResourceLabel,
  getAuthTypeLabel,
  getPermissionLabel,
  RESOURCE_TYPE_OPTIONS,
  PERMISSION_OPTIONS,
  type AuthorizationDto,
  type AuthorizationQueryParams
} from '../../api/authorization'

const list = ref<AuthorizationDto[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
type SubjectType = 'group' | 'user' | 'global'
type SubjectFilter = SubjectType | 'all'

interface AuthorizationSubjectGroup {
  key: string
  subjectType: SubjectType
  subjectId: string
  label: string
  subjectLabel: string
  tagType: 'success' | 'primary' | 'info'
  items: AuthorizationDto[]
  resourceLabels: string[]
  permissionLabels: string[]
}

interface AuthorizationSection {
  type: SubjectType
  title: string
  groups: AuthorizationSubjectGroup[]
  total: number
}

const subjectFilter = ref<SubjectFilter>('all')

const search = reactive({
  userOrGroup: '',
  resourceType: undefined as number | undefined
})

const getSubjectType = (row: AuthorizationDto): SubjectType => {
  if (row.groupId) return 'group'
  if (row.userId) return 'user'
  return 'global'
}

const getSubjectId = (row: AuthorizationDto) => {
  if (row.groupId) return row.groupId
  if (row.userId) return row.userId
  return 'global'
}

const sortAuthorizations = (items: AuthorizationDto[]) => {
  return [...items].sort((a, b) => {
    if (a.resourceType !== b.resourceType) return a.resourceType - b.resourceType
    return (a.resourceId || '*').localeCompare(b.resourceId || '*')
  })
}

const buildSubjectGroup = (type: SubjectType, subjectId: string, items: AuthorizationDto[]): AuthorizationSubjectGroup => {
  const sortedItems = sortAuthorizations(items)
  const resourceLabels = Array.from(new Set(sortedItems.map((item) => getResourceLabel(item.resourceType))))
  const permissionLabels = Array.from(
    new Set(sortedItems.flatMap((item) => item.permissions.map((permission) => getPermissionLabel(permission))))
  )

  return {
    key: `${type}:${subjectId}`,
    subjectType: type,
    subjectId,
    label: type === 'group' ? subjectId : type === 'user' ? subjectId : '全局授权',
    subjectLabel: type === 'group' ? '组' : type === 'user' ? '用户' : '所有人',
    tagType: type === 'group' ? 'success' : type === 'user' ? 'primary' : 'info',
    items: sortedItems,
    resourceLabels,
    permissionLabels
  }
}

const groupedSections = computed<AuthorizationSection[]>(() => {
  const buckets: Record<SubjectType, Map<string, AuthorizationDto[]>> = {
    group: new Map(),
    user: new Map(),
    global: new Map()
  }

  list.value.forEach((item) => {
    const subjectType = getSubjectType(item)
    const subjectId = getSubjectId(item)
    const bucket = buckets[subjectType]
    if (!bucket.has(subjectId)) {
      bucket.set(subjectId, [])
    }
    bucket.get(subjectId)?.push(item)
  })

  const buildSection = (type: SubjectType, title: string): AuthorizationSection => {
    const groups = Array.from(buckets[type].entries())
      .map(([subjectId, items]) => buildSubjectGroup(type, subjectId, items))
      .sort((a, b) => a.subjectId.localeCompare(b.subjectId))
    return {
      type,
      title,
      groups,
      total: groups.reduce((sum, group) => sum + group.items.length, 0)
    }
  }

  return [
    buildSection('group', '组授权'),
    buildSection('user', '用户授权'),
    buildSection('global', '全局授权')
  ]
})

const visibleSections = computed(() => {
  const sections = subjectFilter.value === 'all'
    ? groupedSections.value
    : groupedSections.value.filter((section) => section.type === subjectFilter.value)
  return sections.filter((section) => section.groups.length > 0)
})

const totalAuthorizationCount = computed(() => list.value.length)
const hasVisibleAuthorizations = computed(() => visibleSections.value.some((section) => section.groups.length > 0))

const sectionAuthCount = (type: SubjectType) => {
  return groupedSections.value.find((section) => section.type === type)?.total || 0
}

const formatResourceId = (resourceId: string | null) => {
  if (!resourceId || resourceId === '*') return '全部资源'
  return resourceId
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: AuthorizationQueryParams = {
      firstResult: (currentPage.value - 1) * pageSize.value,
      maxResults: pageSize.value
    }
    const countParams: AuthorizationQueryParams = {}
    if (search.resourceType !== undefined) {
      params.resourceType = search.resourceType
      countParams.resourceType = search.resourceType
    }
    if (search.userOrGroup) {
      params.userIdIn = search.userOrGroup
      params.groupIdIn = search.userOrGroup
      countParams.userIdIn = search.userOrGroup
      countParams.groupIdIn = search.userOrGroup
    }
    const [res, countRes] = await Promise.all([
      getAuthorizations(params),
      getAuthorizationCount(countParams)
    ])
    list.value = res.data
    total.value = countRes.data.count
  } catch {
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const resetSearch = () => {
  search.userOrGroup = ''
  search.resourceType = undefined
  currentPage.value = 1
  fetchData()
}

const onPageSizeChange = () => {
  currentPage.value = 1
  fetchData()
}

const onPageChange = () => {
  fetchData()
}

const handleDelete = (row: AuthorizationDto) => {
  ElMessageBox.confirm('确定删除该授权吗？', '删除确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      await deleteAuthorization(row.id)
      ElMessage.success('已删除')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  })
}

const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()

const form = reactive({
  subjectType: 'user' as 'user' | 'group' | 'global',
  userId: '',
  groupId: '',
  resourceType: undefined as number | undefined,
  resourceId: '',
  permissions: [] as string[]
})

const formRules: FormRules = {
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  groupId: [{ required: true, message: '请输入组ID', trigger: 'blur' }],
  resourceType: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  permissions: [{ required: true, message: '至少选一个权限', trigger: 'change' }]
}

const onSubjectChange = () => {
  form.userId = ''
  form.groupId = ''
}

const openAddDialog = (subject?: AuthorizationSubjectGroup) => {
  isEdit.value = false
  editId.value = ''
  form.subjectType = subject?.subjectType || 'user'
  form.userId = subject?.subjectType === 'user' ? subject.subjectId : ''
  form.groupId = subject?.subjectType === 'group' ? subject.subjectId : ''
  form.resourceType = undefined
  form.resourceId = ''
  form.permissions = []
  dialogVisible.value = true
}

const openEditDialog = (row: AuthorizationDto) => {
  isEdit.value = true
  editId.value = row.id
  form.resourceType = row.resourceType
  form.resourceId = row.resourceId || ''
  form.permissions = [...row.permissions]
  if (row.userId) {
    form.subjectType = 'user'
    form.userId = row.userId
    form.groupId = ''
  } else if (row.groupId) {
    form.subjectType = 'group'
    form.userId = ''
    form.groupId = row.groupId
  } else {
    form.subjectType = 'global'
    form.userId = ''
    form.groupId = ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const userId = form.subjectType === 'user' ? form.userId : null
  const groupId = form.subjectType === 'group' ? form.groupId : null

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateAuthorization(editId.value, {
        permissions: form.permissions,
        userId,
        groupId,
        resourceType: form.resourceType,
        resourceId: form.resourceId || '*'
      })
      ElMessage.success('更新成功')
    } else {
      await createAuthorization({
        type: 1,
        permissions: form.permissions,
        userId,
        groupId,
        resourceType: form.resourceType,
        resourceId: form.resourceId || '*'
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.authorization-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h3 { margin: 0; }
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-tabs {
  margin-bottom: 12px;
}

.authorization-sections {
  min-height: 240px;
}

.authorization-section {
  margin-bottom: 18px;
}

.authorization-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-header h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-header span,
.subject-cell small,
.resource-cell small,
.summary-more {
  color: #909399;
  font-size: 12px;
}

.subject-cell,
.resource-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.resource-cell span {
  color: #303133;
}

.permission-tag,
.summary-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.detail-table {
  margin: 4px 0 4px 48px;
  width: calc(100% - 48px);
}

.auth-type {
  font-size: 13px;
}

.auth-type-1 {
  color: #67c23a;
}

.auth-type-2 {
  color: #f56c6c;
}

.auth-type-0 {
  color: #909399;
}
</style>
