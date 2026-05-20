import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AppLayout from '../components/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue')
      },
      {
        path: 'tasks/my',
        name: 'TaskList',
        component: () => import('../views/task/TaskList.vue')
      },
      {
        path: 'process/definitions',
        name: 'ProcessDefinitionList',
        component: () => import('../views/process/ProcessDefinitionList.vue')
      },
      {
        path: 'process/instances',
        name: 'InstanceList',
        component: () => import('../views/process/InstanceList.vue')
      },
      {
        path: 'process/deployments',
        name: 'DeploymentList',
        component: () => import('../views/process/DeploymentList.vue')
      },
      {
        path: 'process/designer',
        name: 'BpmnDesigner',
        component: () => import('../views/process/BpmnDesigner.vue')
      },
      {
        path: 'admin/users',
        name: 'UserList',
        component: () => import('../views/admin/UserList.vue')
      },
      {
        path: 'admin/groups',
        name: 'GroupList',
        component: () => import('../views/admin/GroupList.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue')
      },
      {
        path: 'form/templates',
        name: 'FormTemplateList',
        component: () => import('../views/form/FormTemplateList.vue')
      },
      {
        path: 'form/create',
        name: 'FormCreateList',
        component: () => import('../views/form/FormCreateList.vue')
      },
      {
        path: 'form/approval',
        name: 'FormApproval',
        component: () => import('../views/form/FormApproval.vue')
      },
      {
        path: 'form/designer',
        name: 'FormDesigner',
        component: () => import('../views/form/FormDesigner.vue')
      },
      {
        path: 'form/fill',
        name: 'FormFill',
        component: () => import('../views/form/FormFill.vue')
      },
      {
        path: 'form/records',
        name: 'FormRecordList',
        component: () => import('../views/form/FormRecordList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router