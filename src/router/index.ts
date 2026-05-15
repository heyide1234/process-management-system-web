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
        redirect: '/tasks/my'
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