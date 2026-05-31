<template>
  <el-container class="app-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="app-aside">
      <div class="logo">
        <div class="logo-icon">
          <img :src="logoIcon" class="logo-img" alt="" />
        </div>
        <h2 style="margin-left: 10px;" v-if="!isCollapse">机务流程系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.8)"
        active-text-color="#FFD86b"
      >
        <el-menu-item index="/dashboard">
          <img :src="menuDashboard" class="menu-icon" alt="" />
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/tasks/my">
          <img :src="menuMyTask" class="menu-icon" alt="" />
          <template #title>我的待办</template>
        </el-menu-item>

        <el-sub-menu index="process-mgmt" :class="{ 'sub-active': activeSubMenuIndex === 'process-mgmt' }">
          <template #title>
            <img :src="menuProcessMgmt" class="menu-icon" alt="" />
            <span>流程管理</span>
          </template>
          <el-menu-item index="/process/definitions">
            <img :src="menuProcessDefinition" class="menu-icon" alt="" />
            <template #title>流程定义</template>
          </el-menu-item>
          <el-menu-item index="/process/instances">
            <img :src="menuProcessInstance" class="menu-icon" alt="" />
            <template #title>流程实例</template>
          </el-menu-item>
          <el-menu-item index="/process/deployments">
            <img :src="menuProcessDeployment" class="menu-icon" alt="" />
            <template #title>资源部署</template>
          </el-menu-item>
          <el-menu-item index="/process/designer">
            <img :src="menuProcessDesigner" class="menu-icon" alt="" />
            <template #title>流程设计</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user-mgmt" :class="{ 'sub-active': activeSubMenuIndex === 'user-mgmt' }">
          <template #title>
            <img :src="menuUserMgmt" class="menu-icon" alt="" />
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <img :src="menuUserList" class="menu-icon" alt="" />
            <template #title>用户列表</template>
          </el-menu-item>
          <el-menu-item index="/admin/groups">
            <img :src="menuGroupList" class="menu-icon" alt="" />
            <template #title>组列表</template>
          </el-menu-item>
          <el-menu-item index="/admin/authorizations">
            <img :src="menuAuthMgmt" class="menu-icon" alt="" />
            <template #title>权限管理</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="form-mgmt" :class="{ 'sub-active': activeSubMenuIndex === 'form-mgmt' }">
          <template #title>
            <img :src="menuFormMgmt" class="menu-icon" alt="" />
            <span>表单管理</span>
          </template>
          <el-menu-item index="/form/templates">
            <img :src="menuTemplateMgmt" class="menu-icon" alt="" />
            <template #title>模板管理</template>
          </el-menu-item>
          <el-menu-item index="/form/designer">
            <img :src="menuFormDesigner" class="menu-icon" alt="" />
            <template #title>表单设计</template>
          </el-menu-item>
          <el-menu-item index="/form/records">
            <img :src="menuFormRecord" class="menu-icon" alt="" />
            <template #title>表单记录</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="toggle-icon" @click="toggleCollapse">
            <component :is="isCollapse ? Expand : Fold" />
          </el-icon>
          <div class="breadcrumb-area" >
            <el-breadcrumb separator="›">
              <el-breadcrumb-item>
                <el-icon><HomeFilled /></el-icon>
              </el-breadcrumb-item>
              <el-breadcrumb-item>
                <span style="font-family: 'PingFang SC-Medium';">{{ currentPageName }}</span>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
              <div class="user-avatar">
                <el-icon ><UserFilled /></el-icon>
              </div>
              <span class="user-name">{{ username }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
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
          <!-- <span class="header-right-item">
            <el-icon class="header-icon"><Bell /></el-icon>
            <span class="header-text">消息通知</span>
          </span>
          <span class="header-right-item">
            <el-icon class="header-icon"><Setting /></el-icon>
            <span class="header-text">系统设置</span>
          </span> -->
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
  UserFilled,
  ArrowDown,
  SwitchButton,
  Fold,
  Expand,
  HomeFilled
} from '@element-plus/icons-vue'

import logoIcon from '../styles/切图/1 1@2x.png'
import menuDashboard from '../styles/切图/菜单图标 - 仪表盘@2x.png'
import menuMyTask from '../styles/切图/菜单图标 - 我的待办@2x.png'
import menuProcessMgmt from '../styles/切图/菜单图标 - 流程管理@2x.png'
import menuProcessDefinition from '../styles/切图/菜单图标 - 流程定义@2x.png'
import menuProcessInstance from '../styles/切图/菜单图标 - 流程实例@2x.png'
import menuProcessDeployment from '../styles/切图/菜单图标 - 流程部署@2x.png'
import menuProcessDesigner from '../styles/切图/菜单图标 - 流程设计@2x.png'
import menuUserMgmt from '../styles/切图/菜单图标 - 用户管理@2x.png'
import menuUserList from '../styles/切图/菜单图标 - 用户列表@2x.png'
import menuGroupList from '../styles/切图/菜单图标 - 组列表@2x.png'
import menuAuthMgmt from '../styles/切图/菜单图标 - 权限管理@2x.png'
import menuFormMgmt from '../styles/切图/菜单图标 - 表单管理@2x.png'
import menuTemplateMgmt from '../styles/切图/菜单图标 - 模板管理@2x.png'
import menuFormDesigner from '../styles/切图/菜单图标 - 表单设计@2x.png'
import menuFormRecord from '../styles/切图/Frame@2x.png'

const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const username = ref(localStorage.getItem('username') || '')

const activeMenu = computed(() => route.path)

const activeSubMenuIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/process/')) return 'process-mgmt'
  if (path.startsWith('/admin/')) return 'user-mgmt'
  if (path.startsWith('/form/')) return 'form-mgmt'
  return ''
})

const currentPageName = computed(() => {
  const path = route.path
  const nameMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/tasks/my': '我的待办',
    '/process/definitions': '流程定义',
    '/process/instances': '流程实例',
    '/process/deployments': '资源部署',
    '/process/designer': '流程设计',
    '/admin/users': '用户列表',
    '/admin/groups': '组列表',
    '/admin/authorizations': '权限管理',
    '/form/templates': '模板管理',
    '/form/designer': '表单设计',
    '/form/records': '表单记录'
  }
  return nameMap[path] || '页面'
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

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
  background: #4285F4;;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s;
}

.app-aside::-webkit-scrollbar {
  width: 4px;
}

.app-aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'PingFang SC-Medium';
}

.logo-icon {
  color: #EF4444;
  font-size: 20px;
  height: 24px;
  width: 24px;
  flex-shrink: 0;
  img{
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}

.logo h2 {
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.app-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-icon {
  font-size: 20px;
  color: #6B7280;
  cursor: pointer;
  transition: color 0.3s;
}

.toggle-icon:hover {
  color: #3B82F6;
}

.breadcrumb-area {
  display: flex;
  align-items: center;
  background: #F3F4F6;
  padding: 8px 16px;
  border-radius: 4px;
}

.breadcrumb-area :deep(.el-breadcrumb__item) {
  font-size: 14px;
}

.breadcrumb-area :deep(.el-breadcrumb__inner) {
  color: #6B7280;
}

.breadcrumb-area :deep(.el-breadcrumb__inner.is-link) {
  color: #3B82F6;
}

.breadcrumb-area :deep(.el-breadcrumb__separator) {
  color: #9CA3AF;
  margin: 0 8px;
}

.breadcrumb-area :deep(.el-icon) {
  color: #3B82F6;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.header-right-item:hover {
  background: #F3F4F6;
}

.header-icon {
  font-size: 20px;
  color: #6B7280;
  transition: color 0.3s;
}

.header-right-item:hover .header-icon {
  color: #3B82F6;
}

.header-text {
  font-size: 12px;
  color: #374151;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #F3F4F6;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 20px;
}

.user-name {
  color: #1F2937;
  font-size: 14px;
  /* font-weight: 500; */
}

.arrow-icon {
  color: #6B7280;
  font-size: 12px;
}

.app-main {
  background: #F8FAFC;
  padding: 24px;
  overflow-y: auto;
}
</style>

<style>
/* ===== 菜单容器 ===== */
.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
  padding: 12px 0;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px !important;
}

/* ===== 菜单项与子菜单标题 ===== */
.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: rgba(255, 255, 255, 0.8) !important;
  height: 44px !important;
  line-height: 44px !important;
  margin: 2px 0 !important;
  border-radius: 0 !important;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: rgba(0, 0, 0, 0.2) !important;
  color: #FFFFFF !important;
}

/* ===== 选中菜单项（黄色） ===== */
.sidebar-menu .el-menu-item.is-active {
  background: rgba(0, 0, 0, 0.35) !important;
  color: #FFD86b !important;
}

.sidebar-menu .el-menu-item.is-active .menu-icon {
  filter: sepia(100%) saturate(2500%) hue-rotate(-20deg) brightness(110%) !important;
}

/* ===== 子菜单内选中项 ===== */
.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background: rgba(0, 0, 0, 0.35) !important;
  color: #FFD86b !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active .menu-icon {
  filter: sepia(100%) saturate(2500%) hue-rotate(-20deg) brightness(110%) !important;
}

/* ===== 当前活跃子菜单的父标题变黄 ===== */
.sidebar-menu .el-sub-menu.sub-active > .el-sub-menu__title {
  color: #FFD86b !important;
}

.sidebar-menu .el-sub-menu.sub-active > .el-sub-menu__title .menu-icon {
  filter: sepia(100%) saturate(2500%) hue-rotate(-20deg) brightness(110%) !important;
}

/* ===== focus ===== */
.sidebar-menu .el-menu-item:focus,
.sidebar-menu .el-sub-menu__title:focus {
  background: rgba(0, 0, 0, 0.2) !important;
  color: #FFFFFF !important;
  outline: none !important;
}

.sidebar-menu .el-menu-item.is-active:focus,
.sidebar-menu .el-sub-menu.is-active > .el-sub-menu__title:focus {
  color: #FFD86b !important;
}

/* ===== 图标 ===== */
.sidebar-menu .menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
}

.sidebar-menu.el-menu--collapse .menu-icon {
  margin-right: 0;
}

/* ===== 子菜单缩进 ===== */
.sidebar-menu .el-sub-menu .el-menu {
  background: transparent !important;
}

.sidebar-menu:not(.el-menu--collapse) .el-sub-menu .el-menu-item {
  padding-left: 52px !important;
}

.sidebar-menu.el-menu--collapse .el-sub-menu .el-menu-item {
  padding-left: 20px !important;
}
</style>
