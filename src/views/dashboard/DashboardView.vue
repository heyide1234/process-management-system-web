<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 style="font-family: 'PingFang SC-Semibold';">仪表盘</h2>
    </div>

    <div class="dashboard-section">
      <h3 class="section-title">运行时状态</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon metric-icon-blue">
            <img :src="iconRunning" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">运行中流程实例</div>
            <div class="metric-value">{{ metrics.runningProcessInstances }}</div>
          </div>
          <img :src="bgRunning" class="bg-illustration" alt="" />
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-orange">
            <img :src="iconError" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">运行异常</div>
            <div class="metric-value">{{ metrics.incidents }}</div>
          </div>
          <img :src="bgError" class="bg-illustration" alt="" />
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-green">
            <img :src="iconTask" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">待办任务</div>
            <div class="metric-value">{{ metrics.tasks }}</div>
          </div>
          <img :src="bgTask" class="bg-illustration" alt="" />
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <h3 class="section-title">已部署资源</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon metric-icon-purple">
            <img :src="iconProcess" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">流程定义</div>
            <div class="metric-value">{{ metrics.processDefinitions }}</div>
          </div>
          <img :src="bgProcess" class="bg-illustration" alt="" />
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-teal">
            <img :src="iconDecision" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">决策定义</div>
            <div class="metric-value">{{ metrics.decisionDefinitions }}</div>
          </div>
          <img :src="bgDecision" class="bg-illustration" alt="" />
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-cyan">
            <img :src="iconDeployment" class="icon-img" alt="" />
          </div>
          <div class="metric-body">
            <div class="metric-label">部署</div>
            <div class="metric-value">{{ metrics.deployments }}</div>
          </div>
          <img :src="bgDeployment" class="bg-illustration" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardMetrics, type DashboardMetrics } from '../../api/dashboard'

import iconRunning from '../../styles/切图/图标渐变底 - 运行中流程实例@2x.png'
import iconError from '../../styles/切图/图标渐变底 - 运行异常@2x.png'
import iconTask from '../../styles/切图/图标渐变底 - 待办任务@2x.png'
import iconProcess from '../../styles/切图/图标渐变底 - 流程定义@2x.png'
import iconDecision from '../../styles/切图/图标渐变底 - 决策定义@2x.png'
import iconDeployment from '../../styles/切图/图标渐变底 - 部署@2x.png'

import bgRunning from '../../styles/切图/淡色插画 - 运行中流程实例@2x.png'
import bgError from '../../styles/切图/淡色插画 - 运行异常@2x.png'
import bgTask from '../../styles/切图/淡色插画 - 待办任务@2x.png'
import bgProcess from '../../styles/切图/淡色插画 - 流程定义@2x.png'
import bgDecision from '../../styles/切图/淡色插画 - 决策定义@2x.png'
import bgDeployment from '../../styles/切图/淡色插画 - 部署@2x.png'

const metrics = ref<DashboardMetrics>({
  runningProcessInstances: 0,
  incidents: 0,
  tasks: 0,
  processDefinitions: 0,
  decisionDefinitions: 0,
  deployments: 0
})

let timer: ReturnType<typeof setInterval> | null = null

const fetchMetrics = async () => {
  try {
    const res = await getDashboardMetrics()
    metrics.value = res
  } catch {
    ElMessage.error('获取仪表盘数据失败')
  }
}

const startPolling = () => {
  timer = setInterval(fetchMetrics, 10000)
}

onMounted(() => {
  fetchMetrics()
  startPolling()
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  position: relative;
  padding-bottom: 8px;
  font-family: 'PingFang SC-Semibold';
}

.dashboard-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%);
  border-radius: 2px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
  padding-left: 8px;
  font-family: 'PingFang SC-Medium';
  /* border-left: 4px solid #3B82F6; */
}
.dashboard-section{
  margin:0px 20px;
}

.dashboard-section + .dashboard-section {
  margin-top: 36px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 80px;
  height: 180px;
  /* width: 480px; */
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  padding-left: 40px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  div:nth-child(1) {
    flex: 1;
    margin-top: -20px;
    margin-right: 10px;

  }
  div:nth-child(2) {
    flex: 3;
    height: 60px;
  }
  >img {
    flex: 2;
    margin-top: 20px;
  }
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 90px;
  height: 90px;
}
/* 
.metric-icon-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.metric-icon-orange {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.metric-icon-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.metric-icon-purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.metric-icon-teal {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
}

.metric-icon-cyan {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
} */

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.metric-label {
  font-size: 18px;
  color: #6B7280;
  font-weight: 500;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
}

/* .bg-illustration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 150px;
  height: 126px;
  pointer-events: none;
} */
</style>
