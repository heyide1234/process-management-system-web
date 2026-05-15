<template>
  <div class="home-container">
    <div class="home-header">
      <h1>流程管理系统</h1>
      <div class="user-info">
        <span>当前用户：{{ username }}</span>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    <ProcessDefinitionTable />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProcessDefinitionTable from '../components/ProcessDefinitionTable.vue'

const router = useRouter()
const username = ref('')

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.home-header h1 {
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>