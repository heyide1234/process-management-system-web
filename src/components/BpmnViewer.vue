<template>
  <div class="bpmn-viewer" :style="props.height ? { height: props.height } : {}">
    <div v-if="loading" class="viewer-loading" :style="props.height ? { height: props.height } : {}">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载流程图中...</span>
    </div>
    <div v-if="errorMsg" class="viewer-error">
      <el-empty :description="errorMsg" :image-size="80" />
    </div>
    <div ref="canvasRef" class="viewer-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

const props = defineProps<{
  xml: string | null
  activeActivityIds: string[]
  completedActivityIds: string[]
  height?: string
}>()

const canvasRef = ref<HTMLDivElement>()
const loading = ref(false)
const errorMsg = ref('')

let viewer: any = null
let resizeObserver: ResizeObserver | null = null

const activeMarkerClass = 'bpmn-activity-active'
const completedMarkerClass = 'bpmn-activity-completed'

const activeOverlayHtml = `<div class="activity-overlay active">进行中</div>`
const completedOverlayHtml = `<div class="activity-overlay completed">已完成</div>`

function initViewer() {
  if (!canvasRef.value) return
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
  viewer = new NavigatedViewer({
    container: canvasRef.value,
    width: '100%',
    height: '100%'
  })
}

function fitDiagram() {
  if (!viewer) return
  const canvas = viewer.get('canvas')
  canvas.resized()
  canvas.zoom('fit-viewport', 'auto')
}

function findPath(graph: Record<string, string[]>, start: string, target: string): string[] | null {
  const visited = new Set<string>()
  const queue: string[][] = [[start]]
  while (queue.length) {
    const path = queue.shift()!
    const node = path[path.length - 1]
    if (node === target) return path
    if (visited.has(node)) continue
    visited.add(node)
    const neighbors = graph[node] || []
    for (const neighbor of neighbors) {
      queue.push([...path, neighbor])
    }
  }
  return null
}

function findCompletedByTrace(elementRegistry: any, activeIds: string[]): string[] {
  const allElements = elementRegistry.getAll()
  const sequenceFlows = allElements.filter((e: any) => e.type === 'bpmn:SequenceFlow')
  const graph: Record<string, string[]> = {}
  sequenceFlows.forEach((flow: any) => {
    const source = flow.source?.id
    const target = flow.target?.id
    if (source && target) {
      if (!graph[source]) graph[source] = []
      graph[source].push(target)
    }
  })

  const startEvents = allElements
    .filter((e: any) => e.type === 'bpmn:StartEvent')
    .map((e: any) => e.id)

  const completed = new Set<string>()
  activeIds.forEach((activeId) => {
    for (const startId of startEvents) {
      const path = findPath(graph, startId, activeId)
      if (path) {
        path.forEach((id) => {
          if (id !== activeId) completed.add(id)
        })
        break
      }
    }
  })

  return Array.from(completed)
}

async function renderDiagram() {
  if (!canvasRef.value || !props.xml) return
  loading.value = true
  errorMsg.value = ''

  try {
    if (!viewer) initViewer()
    await viewer.importXML(props.xml)

    const canvas = viewer.get('canvas')
    const elementRegistry = viewer.get('elementRegistry')
    const overlays = viewer.get('overlays')

    canvas.resized()
    canvas.zoom('fit-viewport', 'auto')

    const allBpmnElements = elementRegistry.filter((e: any) => e.businessObject)
    allBpmnElements.forEach((el: any) => {
      try { canvas.removeMarker(el.id, activeMarkerClass) } catch { /* ignore */ }
      try { canvas.removeMarker(el.id, completedMarkerClass) } catch { /* ignore */ }
      try { overlays.remove({ element: el.id }) } catch { /* ignore */ }
    })

    const activeIds = props.activeActivityIds || []
    const completedIds = props.completedActivityIds || []
    const traceCompletedIds = completedIds.length === 0 && activeIds.length > 0
      ? findCompletedByTrace(elementRegistry, activeIds)
      : []
    const effectiveCompletedIds = completedIds.length > 0 ? completedIds : traceCompletedIds
    console.log('BPMN activeIds:', activeIds, 'completedIds:', completedIds, 'traceCompletedIds:', traceCompletedIds)

    activeIds.forEach((activityId) => {
      const el = elementRegistry.get(activityId)
      if (el) {
        canvas.addMarker(activityId, activeMarkerClass)
        overlays.add(activityId, {
          position: { bottom: 0, right: 5 },
          html: activeOverlayHtml,
          show: { minZoom: -Infinity, maxZoom: Infinity }
        })
      }
    })

    effectiveCompletedIds.forEach((activityId) => {
      const el = elementRegistry.get(activityId)
      if (el) {
        canvas.addMarker(activityId, completedMarkerClass)
        overlays.add(activityId, {
          position: { bottom: 0, right: 5 },
          html: completedOverlayHtml,
          show: { minZoom: -Infinity, maxZoom: Infinity }
        })
      }
    })
  } catch (e: any) {
    console.error('BPMN viewer render error:', e)
    errorMsg.value = e?.message || '流程图渲染失败'
  } finally {
    loading.value = false
  }
}

watch(() => [props.xml, props.activeActivityIds, props.completedActivityIds], () => {
  if (props.xml) {
    nextTick(() => renderDiagram())
  }
}, { deep: true })

onMounted(() => {
  if (props.xml) renderDiagram()
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      fitDiagram()
    })
    resizeObserver.observe(canvasRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.bpmn-viewer {
  width: 100%;
  height: 500px;
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.viewer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  color: #909399;
  gap: 8px;
}

.viewer-error {
  padding: 20px;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
}

.viewer-canvas :deep(.bjs-powered-by) {
  display: none;
}

:deep(.bpmn-activity-active .djs-visual > :first-child) {
  stroke: #67c23a !important;
  stroke-width: 3px !important;
  fill: rgba(103, 194, 58, 0.1) !important;
}

:deep(.bpmn-activity-completed .djs-visual > :first-child) {
  stroke: #9ca3af !important;
  stroke-width: 2px !important;
  stroke-dasharray: 4 2;
  fill: rgba(156, 163, 175, 0.3) !important;
}

.viewer-canvas :deep(.activity-overlay) {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  pointer-events: none;
  white-space: nowrap;
}

.viewer-canvas :deep(.activity-overlay.active) {
  background: #67c23a;
}

.viewer-canvas :deep(.activity-overlay.completed) {
  background: #9ca3af;
}
</style>
