<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>仪表盘</h2>
      <el-button type="primary" :icon="Refresh" :loading="loading" @click="fetchMetrics">
        手动刷新
      </el-button>
    </div>

    <div class="dashboard-section">
      <h3 class="section-title">实时动态</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon metric-icon-blue">
            <el-icon :size="28"><VideoPlay /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">运行中实例</div>
            <div class="metric-value">{{ metrics.rightNow.processInstances }}</div>
          </div>
        </div>

        <div class="metric-card" :class="{ 'metric-card-danger': metrics.rightNow.incidents > 0 }">
          <div class="metric-icon" :class="metrics.rightNow.incidents > 0 ? 'metric-icon-red' : 'metric-icon-orange'">
            <el-icon :size="28"><WarningFilled /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">未解决故障</div>
            <div class="metric-value" :class="{ 'metric-value-danger': metrics.rightNow.incidents > 0 }">
              {{ metrics.rightNow.incidents }}
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-green">
            <el-icon :size="28"><UserFilled /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">待办人工任务</div>
            <div class="metric-value">{{ metrics.rightNow.humanTasks }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <h3 class="section-title">已部署定义</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon metric-icon-purple">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">流程定义数</div>
            <div class="metric-value">{{ metrics.deployed.processDefinitions }}</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-teal">
            <el-icon :size="28"><Tickets /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">决策定义数</div>
            <div class="metric-value">{{ metrics.deployed.decisionDefinitions }}</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon metric-icon-cyan">
            <el-icon :size="28"><Upload /></el-icon>
          </div>
          <div class="metric-body">
            <div class="metric-label">部署批次数</div>
            <div class="metric-value">{{ metrics.deployed.deployments }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  VideoPlay,
  WarningFilled,
  UserFilled,
  Document,
  Tickets,
  Upload
} from '@element-plus/icons-vue'
import { getDashboardMetrics, type DashboardMetrics } from '../../api/dashboard'

const loading = ref(false)
const metrics = ref<DashboardMetrics>({
  rightNow: { processInstances: 0, incidents: 0, humanTasks: 0 },
  deployed: { processDefinitions: 0, decisionDefinitions: 0, deployments: 0 }
})

let timer: ReturnType<typeof setInterval> | null = null

const fetchMetrics = async () => {
  loading.value = true
  try {
    const res = await getDashboardMetrics()
    metrics.value = res.data
  } catch {
    ElMessage.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
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
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.section-title {
  margin: 0 0 14px 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.dashboard-section + .dashboard-section {
  margin-top: 28px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s, transform 0.3s;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.metric-card-danger {
  border-color: #fde2e2;
  background: #fef5f5;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-blue {
  background-color: #ecf5ff;
  color: #409eff;
}

.metric-icon-orange {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.metric-icon-red {
  background-color: #fef0f0;
  color: #f56c6c;
}

.metric-icon-green {
  background-color: #f0f9eb;
  color: #67c23a;
}

.metric-icon-purple {
  background-color: #f4f0fe;
  color: #a855f7;
}

.metric-icon-teal {
  background-color: #f0fdfa;
  color: #14b8a6;
}

.metric-icon-cyan {
  background-color: #ecfeff;
  color: #06b6d4;
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.metric-label {
  font-size: 13px;
  color: #909399;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.metric-value-danger {
  color: #f56c6c;
}
</style>
