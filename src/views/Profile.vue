<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <h3>个人资料</h3>
      </template>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        style="max-width: 500px"
      >
        <el-form-item label="用户名">
          <el-input :model-value="formData.id" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="fullName">
          <el-input v-model="formData.fullName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            placeholder="留空则不修改密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUser, updateUserProfile, updateUserCredentials } from '../api/user'

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const formData = reactive({
  id: '',
  fullName: '',
  email: '',
  password: ''
})

const passwordRule = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
    return
  }
  if (value.length < 8) {
    callback(new Error('密码长度至少8位'))
    return
  }
  if (!/[A-Z]/.test(value)) {
    callback(new Error('密码必须包含大写字母'))
    return
  }
  if (!/[a-z]/.test(value)) {
    callback(new Error('密码必须包含小写字母'))
    return
  }
  if (!/[0-9]/.test(value)) {
    callback(new Error('密码必须包含数字'))
    return
  }
  callback()
}

const formRules: FormRules = {
  fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ validator: passwordRule, trigger: 'blur' }]
}

const fetchProfile = async () => {
  const userId = localStorage.getItem('username')
  if (!userId) return
  try {
    const res = await getUser(userId)
    formData.id = res.data.id
    formData.fullName = (res.data.firstName || '') + (res.data.lastName || '')
    formData.email = res.data.email || ''
  } catch {
    ElMessage.error('获取个人资料失败')
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
    ElMessage.success('保存成功')
    formData.password = ''
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.profile-card {
  width: 600px;
}

.profile-card h3 {
  margin: 0;
}
</style>