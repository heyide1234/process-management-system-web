<template>
  <el-container class="app-layout">
    <el-aside :width="isCollapse ? '100px' : '332px'" :class="['app-aside', { 'is-collapsed': isCollapse }]">
      <div class="logo">
        <div class="logo-icon">
          <img :src="logoIcon" class="logo-img" alt="" />
        </div>
        <h2 v-if="!isCollapse" style="font-family: 'Source Han Sans SC';font-size: 20px;">空军九十八旅机务流程系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        @select="handleMenuSelect"
        class="sidebar-menu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.8)"
        active-text-color="#FFFFFF"
      >
        <el-menu-item index="/dashboard">
          <img :src="menuDashboard" class="menu-icon" alt="" />
          <template #title>流程监控</template>
        </el-menu-item>

        <el-sub-menu index="task-mgmt" :class="{ 'sub-active': activeSubMenuIndex === 'task-mgmt' }">
          <template #title>
            <img :src="menuMyTask" class="menu-icon" alt="" />
            <span>我的待办</span>
          </template>
          <el-menu-item index="/tasks/my">
            <span class="menu-dot"></span>
            <template #title>我的待办</template>
          </el-menu-item>
          <el-menu-item index="/tasks/unclaimed">
            <span class="menu-dot"></span>
            <template #title>可签收</template>
          </el-menu-item>
          <el-menu-item index="/tasks/all">
            <span class="menu-dot"></span>
            <template #title>全部任务</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/process/definitions">
          <img :src="menuProcessDefinition" class="menu-icon" alt="" />
          <template #title>流程定义</template>
        </el-menu-item>

        <el-menu-item index="/process/instances">
          <img :src="menuProcessInstance" class="menu-icon" alt="" />
          <template #title>流程实例</template>
        </el-menu-item>

        <el-menu-item index="/process/designer">
          <img :src="menuProcessDesigner" class="menu-icon" alt="" />
          <template #title>流程设计</template>
        </el-menu-item>

        <el-menu-item index="/process/deployments">
          <img :src="menuProcessDeployment" class="menu-icon" alt="" />
          <template #title>资源部署</template>
        </el-menu-item>

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

        <el-sub-menu index="user-mgmt" :class="{ 'sub-active': activeSubMenuIndex === 'user-mgmt' }">
          <template #title>
            <img :src="menuUserMgmt" class="menu-icon" alt="" />
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <!-- <img :src="menuUserList" class="menu-icon" alt="" /> -->
            <span class="menu-dot"></span>
            <template #title>用户列表</template>
          </el-menu-item>
          <el-menu-item index="/admin/groups">
            <!-- <img :src="menuGroupList" class="menu-icon" alt="" /> -->
            <span class="menu-dot"></span>
            <template #title>组列表</template>
          </el-menu-item>
          <el-menu-item index="/admin/authorizations">
            <!-- <img :src="menuAuthMgmt" class="menu-icon" alt="" /> -->
            <span class="menu-dot"></span>

            <template #title>权限管理</template>
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
                <img :src="breadcrumbIcon" class="breadcrumb-icon" alt="" />
                <!-- <el-icon><HomeFilled /></el-icon> -->
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
  Expand
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

import logoIcon from '../styles/切图/1 1@2x.png'
import menuDashboard from '@/assets/Monitor.png'
import menuMyTask from '../assets/unFinal.png'
import menuProcessDefinition from '../assets/define.png'
import menuProcessInstance from '../assets/example.png'
import menuProcessDeployment from '../assets/source.png'
import menuProcessDesigner from '../assets/design.png'
import menuUserMgmt from '../assets/userManage.png'
import menuUserList from '../styles/切图/菜单图标 - 用户列表@2x.png'
import menuGroupList from '../styles/切图/菜单图标 - 组列表@2x.png'
import menuAuthMgmt from '../styles/切图/菜单图标 - 权限管理@2x.png'
import menuTemplateMgmt from '../assets/Template.png'
import menuFormDesigner from '../assets/formDesign.png'
import menuFormRecord from '../assets/formRecord.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapse = ref(false)
const username = computed(() => authStore.username)

const activeMenu = computed(() => route.path)

const activeSubMenuIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/')) return 'user-mgmt'
  if (path.startsWith('/tasks/')) return 'task-mgmt'
  return ''
})

const breadcrumbIcon = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard')) return menuDashboard
  if (path.startsWith('/tasks/')) return menuMyTask
  if (path.startsWith('/process/definitions')) return menuProcessDefinition
  if (path.startsWith('/process/instances')) return menuProcessInstance
  if (path.startsWith('/process/designer')) return menuProcessDesigner
  if (path.startsWith('/process/deployments')) return menuProcessDeployment
  if (path.startsWith('/form/templates')) return menuTemplateMgmt
  if (path.startsWith('/form/designer')) return menuFormDesigner
  if (path.startsWith('/form/records')) return menuFormRecord
  if (path.startsWith('/admin/')) return menuUserMgmt
  return menuDashboard
})

const currentPageName = computed(() => {
  const path = route.path
  const nameMap: Record<string, string> = {
    '/dashboard': '流程监控',
    '/tasks/my': '我的待办',
    '/tasks/unclaimed': '可签收任务',
    '/tasks/all': '全部任务',
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

const handleMenuSelect = (index: string) => {
  if (!index.startsWith('/') || index === route.path) return
  router.push(index)
}

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.app-aside {
  background: url('../assets/mideel_bk.png') no-repeat center center / cover;
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
  justify-content: flex-start;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'PingFang SC-Medium';
  gap: 10px;
}

.app-aside.is-collapsed .logo {
  justify-content: center;
  padding: 0;
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
  font-size: 14px;
  font-weight: 500;
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

.breadcrumb-area :deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
}

.breadcrumb-area :deep(.el-breadcrumb__item) {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.breadcrumb-icon {
  width: 16px;
  height: 20px;
  display: block;
  filter: invert(42%) sepia(91%) saturate(1557%) hue-rotate(190deg) brightness(97%) contrast(101%);
}

.breadcrumb-area :deep(.el-breadcrumb__inner) {
  color: #6B7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  padding: 0 20px 20px 20px;
  overflow-y: auto;
}
</style>

<style>
/* ===== 菜单容器 ===== */
.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
  padding: 12px 0;
  font-family: 'Source Han Sans SC';
  font-size: 16px;
  color: #fff !important;
}

.sidebar-menu:not(.el-menu--collapse) {
  /* width: 220px !important; */
  width: 100% !important;

}

/* ===== 菜单项与子菜单标题 ===== */
.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #FFFFFF !important;
  height: 44px !important;
  line-height: 44px !important;
  margin: 4px 12px !important;
  border-radius: 8px !important;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #FFFFFF !important;
}

/* ===== 选中菜单项 ===== */
.sidebar-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-size: 16px;
  font-weight: 500;
}

/* ===== 子菜单内选中项 ===== */
.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-size: 16px;
  font-weight: 500;
}

/* ===== 当前活跃子菜单的父标题 ===== */
.sidebar-menu .el-sub-menu.sub-active > .el-sub-menu__title {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #FFFFFF !important;
  font-weight: 500;
}

/* ===== focus ===== */
.sidebar-menu .el-menu-item:focus,
.sidebar-menu .el-sub-menu__title:focus {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #FFFFFF !important;
  outline: none !important;
}

.sidebar-menu .el-menu-item.is-active:focus,
.sidebar-menu .el-sub-menu.is-active > .el-sub-menu__title:focus {
  color: #FFFFFF !important;
}

/* ===== 图标 ===== */
.sidebar-menu .menu-icon {
  width: 16px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
}

.sidebar-menu .menu-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 1);
  margin-right: 18px;
  margin-left: 4px;
  vertical-align: middle;
  flex-shrink: 0;
}

.sidebar-menu.el-menu--collapse .menu-icon {
  margin: 0 !important;
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 折叠时隐藏子菜单箭头 */
.sidebar-menu.el-menu--collapse .el-sub-menu__icon-arrow {
  display: none !important;
}

/* ===== 折叠状态下菜单项居中 ===== */
.sidebar-menu.el-menu--collapse {
  width: 100% !important;
}

.sidebar-menu.el-menu--collapse .el-menu-item,
.sidebar-menu.el-menu--collapse .el-sub-menu__title {
  margin: 4px auto !important;
  padding: 0 !important;
  width: 52px !important;
  min-width: 52px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  text-align: center !important;
}

.sidebar-menu.el-menu--collapse .el-sub-menu.is-active .el-sub-menu__title {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* ===== 折叠状态下 tooltip 触发器居中 ===== */
.sidebar-menu.el-menu--collapse .el-menu-tooltip__trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
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

/* ===== 折叠状态下弹出的二级菜单文字为黑色 ===== */
.el-menu--popup-container .el-menu-item,
.el-menu--popup-container .el-sub-menu__title {
  color: #000000 !important;
}

.el-menu--popup-container .el-menu-item:hover,
.el-menu--popup-container .el-sub-menu__title:hover,
.el-menu--popup-container .el-menu-item.is-active {
  color: #000000 !important;
  background-color: #F3F4F6 !important;
}

.el-menu--popup-container .el-sub-menu__icon-arrow {
  color: #000000 !important;
}

/* 折叠弹出的二级菜单图标变黑 */
.el-menu--popup-container .menu-icon {
  filter: brightness(0) !important;
}
</style>
