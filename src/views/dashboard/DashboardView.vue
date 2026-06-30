<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <!-- <h2 style="font-family: 'PingFang SC-Semibold';">仪表盘</h2> -->
    </div>

    <div class="dashboard-section">
      <div class="overview-grid">
        <div class="overview-card">
          <!-- <div class="overview-top">
            <span class="overview-period">较昨日</span>
            <span class="overview-trend up">+8</span>
          </div> -->
          <div class="overview-main">
            <div class="overview-icon icon-blue">
              <img src="../../assets/online_ icon.png" style="width: 48px;height: 48px;">
              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">未完成任务数</div>
              <div class="overview-value">{{ metrics.tasks }}</div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <!-- <div class="overview-top">
            <span class="overview-period">本月</span>
            <span class="overview-trend up">+1.3%</span>
          </div> -->
          <div class="overview-main">
            <div class="overview-icon icon-orange">
              <img src="../../assets/final.png" style="width: 48px;height: 48px;">

              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">准时完成率</div>
              <div class="overview-value">{{ metrics.onTimeCompletionRate }}<span class="overview-unit">%</span></div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <!-- <div class="overview-top">
            <span class="overview-period">需处理</span>
            <span class="overview-trend up">+2</span>
          </div> -->
          <div class="overview-main">
            <div class="overview-icon icon-purple">
              <img src="../../assets/sign.png" style="width: 48px;height: 48px;">
              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">待放行签署</div>
              <div class="overview-value">{{ metrics.pendingReleaseSignCount }}</div>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <!-- <div class="overview-top">
            <span class="overview-period">本季度</span>
            <span class="overview-trend up">+0.4%</span>
          </div> -->
          <div class="overview-main">
            <div class="overview-icon icon-green">
              <img src="../../assets/goal.png" style="width: 48px;height: 48px;">

              <!-- <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg> -->
            </div>
            <div class="overview-content">
              <div class="overview-label">合规得分</div>
              <div class="overview-value">{{ metrics.complianceScore }}<span class="overview-unit">%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="dashboard-row">
        <!-- 机队维修状态 -->
        <div class="dashboard-card fleet-status-card">
          <div class="card-header">
            <span class="card-title">机队维修状态</span>
            <!-- <span class="card-link">全部 →</span> -->
          </div>
          <div class="fleet-grid">
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-6792</div>
                <div class="fleet-model">B737-800</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">
              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-5432</div>
                <div class="fleet-model">A320neo</div>
                <div class="fleet-tag tag-orange">C检进行中</div>
              </div>
              <div class="fleet-plane">                
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">
            </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-7892</div>
                <div class="fleet-model">B787-9</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-1423</div>
                <div class="fleet-model">A321XLR</div>
                <div class="fleet-tag tag-yellow">A检进行中</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-9031</div>
                <div class="fleet-model">B737 MAX8</div>
                <div class="fleet-tag tag-green">正常运营</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-info">
                <div class="fleet-reg">B-8821</div>
                <div class="fleet-model">A330-00</div>
                <div class="fleet-tag tag-blue">计划检修</div>
              </div>
              <div class="fleet-plane">
                <img src="../../assets/airport.png" style="width: 40px;height: 40px;">

              </div>
            </div>
          </div>
        </div>

        <!-- 实时告警 -->
        <div class="dashboard-card alert-card">
          <div class="card-header">
            <span class="card-title">实时告警 <span class="alert-count-badge">{{ alertCount }}</span></span>
            <!-- <span class="card-link">全部告警 →</span> -->
          </div>
          <div class="alert-list">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item"
            >
              <div class="alert-dot" :class="getIncidentDotClass(alert.incidentType)"></div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.incidentMessage || alert.incidentType }}</div>
                <div class="alert-meta">{{ formatIncidentTime(alert.incidentTimestamp) }} · 优先级 {{ getIncidentPriority(alert.incidentType) }}</div>
              </div>
            </div>
            <div v-if="alerts.length === 0" class="alert-empty">暂无未处理告警</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-section">
      <div class="dashboard-row">
        <!-- B-5432 C检进度 -->
        <div class="dashboard-card progress-card">
          <div class="card-header">
            <span class="card-title">B-5432 C检进度</span>
            <!-- <span class="card-link">工单详情 →</span> -->
          </div>
          <div ref="progressChart" class="progress-chart"></div>
        </div>

        <!-- 合规指标概览 -->
        <div class="dashboard-card gauge-card">
          <div class="card-header">
            <span class="card-title">合规指标概览</span>
            <!-- <span class="card-link">详细报告 →</span> -->
          </div>
          <div class="gauge-grid">
            <div
              v-for="(_item, index) in gaugeData"
              :key="index"
              :ref="el => setGaugeRef(el, index)"
              class="gauge-item"
            ></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDashboardMetrics, type DashboardMetrics } from '../../api/dashboard'
import { getIncidents, getIncidentCount, type Incident } from '../../api/incident'

const metrics = ref<DashboardMetrics>({
  runningProcessInstances: 0,
  incidents: 0,
  tasks: 0,
  processDefinitions: 0,
  decisionDefinitions: 0,
  deployments: 0,
  onTimeCompletionRate: 100,
  pendingReleaseSignCount: 0,
  complianceScore: 0
})

const alerts = ref<Incident[]>([])
const alertCount = ref(0)

let timer: ReturnType<typeof setInterval> | null = null
let lastInitTime = 0

const fetchMetrics = async () => {
  try {
    const res = await getDashboardMetrics()
    console.log('res', res);

    metrics.value = res
  } catch {
    ElMessage.error('获取仪表盘数据失败')
  }
}

const P1_TYPES = ['failedJob', 'failedExternalTask']

function getIncidentPriority(incidentType: string): string {
  return P1_TYPES.includes(incidentType) ? 'P1' : 'P2'
}

function getIncidentDotClass(incidentType: string): string {
  if (incidentType === 'failedJob') return 'dot-red'
  if (incidentType === 'failedExternalTask') return 'dot-orange'
  if (incidentType === 'failedJobDefinition') return 'dot-yellow'
  return 'dot-blue'
}

function formatIncidentTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchAlerts = async () => {
  try {
    const [incidentsRes, countRes] = await Promise.all([
      getIncidents({ sortBy: 'incidentTimestamp', sortOrder: 'desc', maxResults: 10 }),
      getIncidentCount()
    ])
    alerts.value = incidentsRes.data
    alertCount.value = countRes.data.count
  } catch {
    ElMessage.error('获取实时告警失败')
  }
}

const startPolling = () => {
  timer = setInterval(() => {
    fetchMetrics()
    fetchAlerts()
  }, 10000)
}

onMounted(() => {
  const now = Date.now()
  const isDevRemount = now - lastInitTime < 1000
  lastInitTime = now

  if (!isDevRemount) {
    fetchMetrics()
    fetchAlerts()
  }
  startPolling()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

// ===== ECharts =====
const progressChart = ref<HTMLDivElement | null>(null)
const gaugeItemRefs = ref<HTMLDivElement[]>([])
let progressChartInstance: echarts.ECharts | null = null
const gaugeChartInstances: echarts.ECharts[] = []

const progressData = [
  { name: '结构检查', value: 100, color: '#10B981' },
  { name: '发动机维护', value: 87, color: '#3B82F6' },
  { name: '电气系统', value: 72, color: '#3B82F6' },
  { name: '客舱内饰', value: 45, color: '#F59E0B' },
  { name: '起落架系统', value: 28, color: '#EF4444' },
  { name: '燃油系统', value: 0, color: '#E5E7EB' }
]

const gaugeData = [
  { name: '工单按时完成', value: 95, color: '#3B82F6' },
  { name: '文件完整率', value: 98, color: '#10B981' },
  { name: '资质合规率', value: 90, color: '#3B82F6' },
  { name: '缺陷整改率', value: 80, color: '#F59E0B' },
  { name: '工具检验率', value: 98, color: '#10B981' },
  { name: '件料追溯率', value: 96, color: '#3B82F6' }
]

const setGaugeRef = (el: any, index: number) => {
  if (el) {
    gaugeItemRefs.value[index] = el as HTMLDivElement
  }
}

const initProgressChart = () => {
  if (!progressChart.value) return
  progressChartInstance = echarts.init(progressChart.value)
  progressChartInstance.setOption({
    grid: {
      left: '3%',
      right: '8%',
      top: '2%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      show: false
    },
    yAxis: {
      type: 'category',
      data: progressData.map(item => item.name),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#374151',
        fontSize: 13,
        fontFamily: 'Source Han Sans SC'
      }
    },
    series: [
      {
        type: 'bar',
        data: progressData.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.color,
            borderRadius: [0, 6, 6, 0]
          }
        })),
        barWidth: 10,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#374151',
          fontSize: 13,
          fontFamily: 'Source Han Sans SC'
        },
        showBackground: true,
        backgroundStyle: {
          color: '#F3F4F6',
          borderRadius: [0, 6, 6, 0]
        }
      }
    ]
  })
}

const initGaugeCharts = () => {
  gaugeData.forEach((item, index) => {
    const el = gaugeItemRefs.value[index]
    if (!el) return
    const chart = echarts.init(el)
    chart.setOption({
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: { color: item.color }
          },
          axisLine: {
            lineStyle: {
              width: 8,
              color: [[1, '#F3F4F6']]
            }
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value: item.value, name: item.name }],
          emphasis: { disabled: true },
          animation: false,
          title: {
            offsetCenter: ['0%', '35%'],
            fontSize: 12,
            color: '#6B7280',
            fontFamily: 'Source Han Sans SC'
          },
          detail: {
            valueAnimation: false,
            offsetCenter: ['0%', '-5%'],
            fontSize: 22,
            fontWeight: 'bold',
            color: item.color,
            formatter: '{value}%',
            fontFamily: 'Source Han Sans SC'
          }
        }
      ]
    })
    gaugeChartInstances.push(chart)
  })
}

const initCharts = () => {
  initProgressChart()
  initGaugeCharts()
}

const handleResize = () => {
  progressChartInstance?.resize()
  gaugeChartInstances.forEach(chart => chart.resize())
}

const disposeCharts = () => {
  progressChartInstance?.dispose()
  progressChartInstance = null
  gaugeChartInstances.forEach(chart => chart.dispose())
  gaugeChartInstances.length = 0
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 16px;
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
  margin-top: 20px;
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

/* ===== 顶部概览卡片 ===== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  font-family: 'Source Han Sans SC', sans-serif;
}

.overview-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 20px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 130px;
}

.overview-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.overview-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  /* margin-bottom: 8px; */
  font-size: 13px;
}

.overview-period {
  color: #9CA3AF;
}

.overview-trend {
  color: #EF4444;
  font-weight: 500;
}

.overview-trend.up {
  color: #EF4444;
}

.overview-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-icon svg {
  width: 24px;
  height: 24px;
}

.icon-blue {
  background: #EFF6FF;
  color: #3B82F6;
}

.icon-orange {
  background: #FFF7ED;
  color: #F97316;
}

.icon-purple {
  background: #F5F3FF;
  color: #8B5CF6;
}

.icon-green {
  background: #ECFDF5;
  color: #10B981;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-label {
  font-size: 14px;
  color: #6B7280;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  line-height: 1;
  font-family: 'Source Han Sans SC', sans-serif;
}

.overview-unit {
  font-size: 16px;
  font-weight: 500;
  color: #6B7280;
  margin-left: 2px;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dashboard-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -20px -20px 16px -20px;
  padding: 20px 20px 12px 20px;
  border-bottom: 1px solid #E5E7EB;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.card-link {
  font-size: 13px;
  color: #3B82F6;
  cursor: pointer;
}

/* ===== 机队维修状态 ===== */
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.fleet-item {
  background: #F8FAFC;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fleet-reg {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.fleet-model {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
}

.fleet-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-green {
  background: #D1FAE5;
  color: #059669;
}

.tag-orange {
  background: #FFEDD5;
  color: #EA580C;
}

.tag-yellow {
  background: #FEF3C7;
  color: #D97706;
}

.tag-blue {
  background: #DBEAFE;
  color: #2563EB;
}

.fleet-plane {
  font-size: 32px;
  opacity: 0.6;
}

/* ===== 实时告警 ===== */
.alert-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 16px;
}

.alert-list::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 10px;
  bottom: 33px;
  width: 2px;
  background: #E5E7EB;
}

.alert-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  position: relative;
}

.alert-dot {
  position: absolute;
  left: -10px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
  flex-shrink: 0;
}

.dot-red {
  background: #EF4444;
}

.dot-orange {
  background: #F97316;
}

.dot-yellow {
  background: #EAB308;
}

.dot-blue {
  background: #3B82F6;
}

.dot-green {
  background: #10B981;
}

.alert-title {
  font-size: 14px;
  color: #1F2937;
  line-height: 1.5;
  margin-bottom: 4px;
}

.alert-badge {
  display: inline-block;
  background: #DBEAFE;
  color: #2563EB;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin: 0 4px;
}

.alert-meta {
  font-size: 12px;
  color: #9CA3AF;
}

.alert-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: #EF4444;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.alert-empty {
  text-align: center;
  color: #9CA3AF;
  font-size: 14px;
  padding: 24px 0;
}

/* ===== 底部 ECharts 图表 ===== */
.progress-card,
.gauge-card {
  min-height: 360px;
}

.progress-chart {
  width: 100%;
  height: 280px;
}

.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 280px;
}

.gauge-item {
  width: 100%;
  height: 140px;
}
</style>
