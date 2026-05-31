<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <span class="star-icon">
          <img :src="loginBg" class="logo-img" alt="" style="width: 100%; height: 100%;" />
        </span>
        <h2>机务流程系统</h2>
      </div>
      <el-form ref="formRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账户" size="large">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password size="large">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import loginBg from '../styles/切图/1 1@2x.png'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账户', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  errorMsg.value = ''
  try {
    const res = await login(loginForm.username, loginForm.password)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', res.data.username)
    router.push('/')
  } catch {
    errorMsg.value = '用户名或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('../styles/切图/image 19@2x.png');
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 400px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.star-icon {
  display: inline-block;
  color: #EF4444;
  font-size: 20px;
  margin-right: 8px;
  vertical-align: middle;

  position: absolute;
  height: 35px;
  width: 35px;
  transform: translate(-41px, -7px);
}

.login-header h2 {
  display: inline-block;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  vertical-align: middle;
    font-family: PingFang SC, PingFang SC;
  font-weight: 600;
  font-size: 20px;
  color: #0D162A;
  line-height: 17px;
  letter-spacing: 5px;
  text-align: right;
  font-style: normal;
  text-transform: none;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #E5E7EB inset;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3B82F6 inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3B82F6 inset;
  background: #FFFFFF;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #9CA3AF;
}

.login-form :deep(.el-input__prefix) {
  color: #9CA3AF;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.error-msg {
  color: #EF4444;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}
</style>
