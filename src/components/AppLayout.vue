<template>
  <el-container class="app-layout">
    <el-aside width="220px" class="app-aside">
      <div class="logo">
        <h2>流程管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/tasks/my">
          <el-icon><Checked /></el-icon>
          <span>我的待办</span>
        </el-menu-item>

        <el-sub-menu index="process-mgmt">
          <template #title>
            <el-icon><Operation /></el-icon>
            <span>流程管理</span>
          </template>
          <el-menu-item index="/process/definitions">
            <el-icon><Memo /></el-icon>
            <span>流程定义</span>
          </el-menu-item>
          <el-menu-item index="/process/instances">
            <el-icon><Document /></el-icon>
            <span>流程实例</span>
          </el-menu-item>
          <el-menu-item index="/process/deployments">
            <el-icon><Upload /></el-icon>
            <span>流程部署</span>
          </el-menu-item>
          <el-menu-item index="/process/designer">
            <el-icon><Edit /></el-icon>
            <span>流程设计</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user-mgmt">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <el-icon><List /></el-icon>
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/groups">
            <el-icon><Grid /></el-icon>
            <span>组列表</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><UserFilled /></el-icon>
              {{ username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  User,
  List,
  Grid,
  UserFilled,
  ArrowDown,
  SwitchButton,
  Checked,
  Operation,
  Memo,
  Document,
  Upload,
  Edit
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const username = ref(localStorage.getItem('username') || '')

const activeMenu = computed(() => route.path)

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.app-aside {
  background-color: #304156;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #303133;
  font-size: 14px;
}

.user-dropdown:hover {
  color: #409EFF;
}

.app-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>