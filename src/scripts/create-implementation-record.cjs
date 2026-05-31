const fs = require('fs');

const content = `<template>
  <div class="record-page">
    <div class="page-header">
      <h2 class="page-title">技术通报实施记录</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <h3 class="doc-title">{{ form.title }}</h3>
      
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">机型</td>
          <td class="value-cell"><el-input v-model="form.model" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">机号</td>
          <td class="value-cell"><el-input v-model="form.aircraftNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">下发日期</td>
          <td class="value-cell"><el-input v-model="form.issueDate" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">编号</td>
          <td class="value-cell"><el-input v-model="form.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">下发日期</td>
          <td class="value-cell"><el-input v-model="form.issueDate2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">完成日期</td>
          <td class="value-cell"><el-input v-model="form.completionDate" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">填发:</td>
          <td class="value-cell"><el-input v-model="form.issuedBy" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">批准:</td>
          <td class="value-cell"><el-input v-model="form.approvedBy" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">接收:</td>
          <td class="value-cell"><el-input v-model="form.receivedBy" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">填发:</td>
          <td class="value-cell"><el-input v-model="form.issuedBy2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">批准:</td>
          <td class="value-cell"><el-input v-model="form.approvedBy2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">回收:</td>
          <td class="value-cell"><el-input v-model="form.recycledBy" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">改装依据:</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.basis" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">技术准备重点:</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.techPreparation" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">同步落实技术通报:</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.syncNotice" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">协同的专业及内容:</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.cooperation" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">仪器、设备、工具准备</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">名称</td>
          <td class="value-cell"><el-input v-model="form.equipmentName1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">型号</td>
          <td class="value-cell"><el-input v-model="form.equipmentModel1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">数量</td>
          <td class="value-cell"><el-input v-model="form.equipmentQty1" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">名称</td>
          <td class="value-cell"><el-input v-model="form.equipmentName2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">型号</td>
          <td class="value-cell"><el-input v-model="form.equipmentModel2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">数量</td>
          <td class="value-cell"><el-input v-model="form.equipmentQty2" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">特设工具箱</td>
          <td class="value-cell"></td>
          <td class="label-cell">型号</td>
          <td class="value-cell"></td>
          <td class="label-cell">数量</td>
          <td class="value-cell"><el-input v-model="form.specialQty" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">消耗器材准备</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.consumables" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">一、工作内容</h4>
      <p class="note">注意事项: {{ form.note }}</p>
      
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">序号</td>
          <td class="label-cell">工作内容</td>
          <td class="label-cell">完成情况/日期</td>
          <td class="label-cell">工作者</td>
          <td class="label-cell">复查者</td>
        </tr>
        <tr v-for="(item, index) in form.workItems" :key="index">
          <td class="value-cell"><el-input v-model="item.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.content" type="textarea" :rows="2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.status" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.worker" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.reviewer" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">二、专业排长以上干部重点检验项目</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.inspectionMajor" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">检查内容</td>
          <td class="value-cell"><el-input v-model="form.inspectionContent" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">完成情况</td>
          <td class="value-cell"><el-input v-model="form.inspectionStatus" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">检验者</td>
          <td class="value-cell"><el-input v-model="form.inspector" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">三、发现问题及处理情况</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">序号</td>
          <td class="label-cell">发现问题</td>
          <td class="label-cell">发现者</td>
          <td class="label-cell">处理情况</td>
          <td class="label-cell">负责人</td>
        </tr>
        <tr v-for="(item, index) in form.problemItems" :key="index">
          <td class="value-cell"><el-input v-model="item.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.problem" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.discoverer" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.handling" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.responsible" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">四、履历文件填写</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">序号</td>
          <td class="label-cell">填写栏目</td>
          <td class="label-cell">填写人</td>
        </tr>
        <tr>
          <td class="value-cell">1</td>
          <td class="value-cell"><el-input v-model="form.recordItem1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.recordPerson1" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">五、机务大队审核情况</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.auditMajor" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">质控</td>
          <td class="value-cell"><el-input v-model="form.auditQuality" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

interface WorkItem {
  serialNumber: string
  content: string
  status: string
  worker: string
  reviewer: string
}

interface ProblemItem {
  serialNumber: string
  problem: string
  discoverer: string
  handling: string
  responsible: string
}

const isEditMode = ref(false)

const form = reactive({
  title: '歼-16/16D飞机LF-70数字式防滑刹车控制模块软件升级至3.00A',
  model: 'J16',
  aircraftNumber: '',
  issueDate: '',
  serialNumber: 'XX-J16-JSTB',
  issueDate2: '',
  completionDate: '',
  issuedBy: '',
  approvedBy: '',
  receivedBy: '',
  issuedBy2: '',
  approvedBy2: '',
  recycledBy: '',
  basis: '空军装备部 J16-2024-07-005-00469-TS 转发《歼-16/16D飞机LF-70数字式防滑刹车控制模块软件升级至3.00A》技术通报',
  techPreparation: '机电管理计算机的拆卸与安装。',
  syncNotice: '机电管理计算机的拆卸与安装。',
  cooperation: '完成升级后，与机械专业配合，检查刹车系统功能、性能。',
  equipmentName1: '',
  equipmentModel1: '',
  equipmentQty1: '',
  equipmentName2: '',
  equipmentModel2: '',
  equipmentQty2: '',
  specialQty: '1',
  consumables: '无',
  note: '拆卸机电管理计算机前，断开蓄电池并拔下地面地面电源电缆。',
  workItems: [
    { serialNumber: '1', content: '拆下两个机电管理计算机并将序列号登记在表1，将机电管理计算机交给631所工作人员。', status: '', worker: '', reviewer: '' },
    { serialNumber: '2', content: '由631所工作人员从机电管理计算机上拆下LF-70数字式防滑刹车控制模块。', status: '', worker: '', reviewer: '' },
    { serialNumber: '3', content: '由北摩高科工作人员按工艺流程完成LF-70数字式防滑刹车控制模块软件升级，完成后由631所工作人员将LF-70数字式防滑刹车控制模块恢复到机电管理计算机上，并进行完检。', status: '', worker: '', reviewer: '' },
    { serialNumber: '4', content: '安装两个机电管理计算机，与机械专业配合检查刹车系统功能、性能。', status: '', worker: '', reviewer: '' },
    { serialNumber: '5', content: '进行刹车系统自检，与机械专业配合检查刹车系统功能、性能。', status: '', worker: '', reviewer: '' }
  ] as WorkItem[],
  inspectionMajor: '特设',
  inspectionContent: '工作内容第4、5项。',
  inspectionStatus: '□',
  inspector: '',
  problemItems: [
    { serialNumber: '1', problem: '', discoverer: '', handling: '', responsible: '' },
    { serialNumber: '2', problem: '', discoverer: '', handling: '', responsible: '' }
  ] as ProblemItem[],
  recordItem1: '飞机履历本正本第7项《技术通报实施记录》',
  recordPerson1: '',
  auditMajor: '特设',
  auditQuality: ''
})

const defaultForm = JSON.parse(JSON.stringify(form))

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const resetForm = () => {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
}

const exportToWord = () => {
  let workRows = ''
  form.workItems.forEach(item => {
    workRows += '<tr><td style="padding: 8px;">' + item.serialNumber + '</td><td style="padding: 8px;">' + item.content + '</td><td style="padding: 8px;">' + item.status + '</td><td style="padding: 8px;">' + item.worker + '</td><td style="padding: 8px;">' + item.reviewer + '</td></tr>'
  })

  let problemRows = ''
  form.problemItems.forEach(item => {
    problemRows += '<tr><td style="padding: 8px;">' + item.serialNumber + '</td><td style="padding: 8px;">' + item.problem + '</td><td style="padding: 8px;">' + item.discoverer + '</td><td style="padding: 8px;">' + item.handling + '</td><td style="padding: 8px;">' + item.responsible + '</td></tr>'
  })

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>技术通报实施记录</title></head><body>' +
    '<h1 style="text-align: center;">' + form.title + '</h1>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">机型</td><td style="padding: 8px;">' + form.model + '</td><td style="font-weight: bold; padding: 8px;">机号</td><td style="padding: 8px;">' + form.aircraftNumber + '</td><td style="font-weight: bold; padding: 8px;">下发日期</td><td style="padding: 8px;">' + form.issueDate + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">编号</td><td style="padding: 8px;">' + form.serialNumber + '</td><td style="font-weight: bold; padding: 8px;">下发日期</td><td style="padding: 8px;">' + form.issueDate2 + '</td><td style="font-weight: bold; padding: 8px;">完成日期</td><td style="padding: 8px;">' + form.completionDate + '</td></tr>' +
    '</table><br/>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">填发:</td><td style="padding: 8px;">' + form.issuedBy + '</td><td style="font-weight: bold; padding: 8px;">批准:</td><td style="padding: 8px;">' + form.approvedBy + '</td><td style="font-weight: bold; padding: 8px;">接收:</td><td style="padding: 8px;">' + form.receivedBy + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">填发:</td><td style="padding: 8px;">' + form.issuedBy2 + '</td><td style="font-weight: bold; padding: 8px;">批准:</td><td style="padding: 8px;">' + form.approvedBy2 + '</td><td style="font-weight: bold; padding: 8px;">回收:</td><td style="padding: 8px;">' + form.recycledBy + '</td></tr>' +
    '</table><br/>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">改装依据:</td><td colspan="5" style="padding: 8px;">' + form.basis + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">技术准备重点:</td><td colspan="5" style="padding: 8px;">' + form.techPreparation + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">同步落实技术通报:</td><td colspan="5" style="padding: 8px;">' + form.syncNotice + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">协同的专业及内容:</td><td colspan="5" style="padding: 8px;">' + form.cooperation + '</td></tr>' +
    '</table><br/>' +
    '<h3>仪器、设备、工具准备</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">名称</td><td style="padding: 8px;">' + form.equipmentName1 + '</td><td style="font-weight: bold; padding: 8px;">型号</td><td style="padding: 8px;">' + form.equipmentModel1 + '</td><td style="font-weight: bold; padding: 8px;">数量</td><td style="padding: 8px;">' + form.equipmentQty1 + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">名称</td><td style="padding: 8px;">' + form.equipmentName2 + '</td><td style="font-weight: bold; padding: 8px;">型号</td><td style="padding: 8px;">' + form.equipmentModel2 + '</td><td style="font-weight: bold; padding: 8px;">数量</td><td style="padding: 8px;">' + form.equipmentQty2 + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">特设工具箱</td><td></td><td style="font-weight: bold; padding: 8px;">型号</td><td></td><td style="font-weight: bold; padding: 8px;">数量</td><td style="padding: 8px;">' + form.specialQty + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">消耗器材准备</td><td colspan="5" style="padding: 8px;">' + form.consumables + '</td></tr>' +
    '</table><br/>' +
    '<h3>一、工作内容</h3>' +
    '<p>注意事项: ' + form.note + '</p>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">序号</td><td style="font-weight: bold; padding: 8px;">工作内容</td><td style="font-weight: bold; padding: 8px;">完成情况/日期</td><td style="font-weight: bold; padding: 8px;">工作者</td><td style="font-weight: bold; padding: 8px;">复查者</td></tr>' +
    workRows +
    '</table><br/>' +
    '<h3>二、专业排长以上干部重点检验项目</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">专业</td><td style="padding: 8px;">' + form.inspectionMajor + '</td><td style="font-weight: bold; padding: 8px;">检查内容</td><td style="padding: 8px;">' + form.inspectionContent + '</td><td style="font-weight: bold; padding: 8px;">完成情况</td><td style="padding: 8px;">' + form.inspectionStatus + '</td><td style="font-weight: bold; padding: 8px;">检验者</td><td style="padding: 8px;">' + form.inspector + '</td></tr>' +
    '</table><br/>' +
    '<h3>三、发现问题及处理情况</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">序号</td><td style="font-weight: bold; padding: 8px;">发现问题</td><td style="font-weight: bold; padding: 8px;">发现者</td><td style="font-weight: bold; padding: 8px;">处理情况</td><td style="font-weight: bold; padding: 8px;">负责人</td></tr>' +
    problemRows +
    '</table><br/>' +
    '<h3>四、履历文件填写</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">序号</td><td style="font-weight: bold; padding: 8px;">填写栏目</td><td style="font-weight: bold; padding: 8px;">填写人</td></tr>' +
    '<tr><td style="padding: 8px;">1</td><td style="padding: 8px;">' + form.recordItem1 + '</td><td style="padding: 8px;">' + form.recordPerson1 + '</td></tr>' +
    '</table><br/>' +
    '<h3>五、机务大队审核情况</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">专业</td><td style="padding: 8px;">' + form.auditMajor + '</td><td style="font-weight: bold; padding: 8px;">质控</td><td style="padding: 8px;">' + form.auditQuality + '</td></tr>' +
    '</table>' +
    '</body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '技术通报实施记录.doc'
  link.click()
}
</script>

<style scoped>
.record-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.word-document {
  background: #fff;
  padding: 40px;
  overflow-x: auto;
}

.doc-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin: 20px 0 10px 0;
}

.note {
  margin-bottom: 10px;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.doc-table td {
  border: 1px solid #000;
  padding: 8px;
  vertical-align: top;
}

.title-row {
  text-align: center;
  font-weight: bold;
}

.label-cell {
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
}

.value-cell {
  min-width: 100px;
}

:deep(.plain-input .el-input__inner),
:deep(.plain-input .el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
</style>`;

fs.writeFileSync('src/views/technical/ImplementationRecord.vue', content, { encoding: 'utf8' });
console.log('ImplementationRecord.vue created successfully!');