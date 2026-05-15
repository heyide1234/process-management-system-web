<template>
  <div class="bpmn-designer">
    <div class="designer-toolbar">
      <el-button-group class="toolbar-left">
        <el-button size="small" @click="createNew">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
        <el-button size="small" @click="handleImport">
          <el-icon><FolderOpened /></el-icon>
          导入
        </el-button>
        <el-button size="small" @click="handleExportXml">
          <el-icon><Download /></el-icon>
          导出XML
        </el-button>
        <el-button size="small" @click="handleExportSvg">
          <el-icon><Picture /></el-icon>
          导出SVG
        </el-button>
      </el-button-group>
      <div class="toolbar-right">
        <el-input
          v-model="deploymentName"
          placeholder="部署名称"
          size="small"
          style="width: 200px; margin-right: 8px"
        />
        <el-button type="primary" size="small" @click="handleDeploy" :loading="deploying">
          部署到引擎
        </el-button>
      </div>
    </div>
    <div class="designer-body">
      <div class="designer-canvas" ref="canvasRef"></div>
      <div class="designer-properties" ref="propertiesRef"></div>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      accept=".bpmn,.xml"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, FolderOpened, Download, Picture } from '@element-plus/icons-vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform'
import { createDeployment } from '../../api/deployment'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'

const BLANK_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:modeler="http://camunda.org/schema/modeler/1.0"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

const canvasRef = ref<HTMLDivElement>()
const propertiesRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()
const deploymentName = ref('')
const deploying = ref(false)

let modeler: any = null

const initModeler = async () => {
  if (!canvasRef.value || !propertiesRef.value) return
  modeler = new BpmnModeler({
    container: canvasRef.value,
    propertiesPanel: {
      parent: propertiesRef.value
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      CamundaBehaviorsModule
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    }
  })
  await modeler.importXML(BLANK_DIAGRAM)
}

const createNew = async () => {
  if (!modeler) return
  deploymentName.value = ''
  await modeler.importXML(BLANK_DIAGRAM)
  ElMessage.success('新建空白流程图')
}

const handleImport = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !modeler) return

  try {
    const text = await file.text()
    await modeler.importXML(text)
    deploymentName.value = file.name.replace(/\.(bpmn|xml)$/i, '')
    ElMessage.success('导入成功')
  } catch {
    ElMessage.error('导入失败，请检查文件是否为有效的 BPMN 文件')
  } finally {
    target.value = ''
  }
}

const handleExportXml = async () => {
  if (!modeler) return
  try {
    const result = await modeler.saveXML({ format: true })
    downloadFile(result.xml, deploymentName.value || 'process', 'bpmn')
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const handleExportSvg = async () => {
  if (!modeler) return
  try {
    const result = await modeler.saveSVG()
    downloadFile(result.svg, deploymentName.value || 'process', 'svg')
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const handleDeploy = async () => {
  if (!modeler) return
  if (!deploymentName.value.trim()) {
    ElMessage.warning('请输入部署名称')
    return
  }

  deploying.value = true
  try {
    const result = await modeler.saveXML({ format: true })
    const blob = new Blob([result.xml], { type: 'application/xml' })
    const file = new File([blob], deploymentName.value + '.bpmn', { type: 'application/xml' })
    const formData = new FormData()
    formData.append('deployment-name', deploymentName.value)
    formData.append('deployment-source', 'bpmn-designer')
    formData.append('content', file)

    const res = await createDeployment(formData)
    ElMessage.success(`部署成功，部署ID: ${res.data.id}`)
  } catch {
    ElMessage.error('部署失败')
  } finally {
    deploying.value = false
  }
}

const downloadFile = (content: string, filename: string, ext: string) => {
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${ext}`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await nextTick()
  initModeler()
})

onBeforeUnmount(() => {
  if (modeler) {
    modeler.destroy()
    modeler = null
  }
})
</script>

<style scoped>
.bpmn-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 132px);
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.designer-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.designer-canvas {
  flex: 1;
  min-width: 0;
  border-right: 1px solid #e6e6e6;
}

.designer-canvas :deep(.bjs-powered-by) {
  display: none;
}

.designer-properties {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
