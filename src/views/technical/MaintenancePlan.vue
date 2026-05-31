<template>
  <div class="plan-page">
    <div class="page-header">
      <h2 class="page-title">年度定期检修计划表</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <h3 class="doc-title">{{ form.title }}</h3>
      
      <div class="info-bar">
        <span>日期：<el-input v-model="form.date" :disabled="!isEditMode" class="inline-input" /></span>
        <span>审查人：<el-input v-model="form.reviewer" :disabled="!isEditMode" class="inline-input" /></span>
        <span>批准人：<el-input v-model="form.approver" :disabled="!isEditMode" class="inline-input" /></span>
      </div>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">序号</td>
          <td class="label-cell">飞机号</td>
          <td class="label-cell">出厂号码</td>
          <td class="label-cell">机型</td>
          <td class="label-cell">单位</td>
          <td class="label-cell">工作单元</td>
          <td class="label-cell">计划月份</td>
          <td class="label-cell">完成日期</td>
        </tr>
        <tr v-for="(item, index) in form.items" :key="index">
          <td class="value-cell"><el-input v-model="item.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.aircraftNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.factoryNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.model" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.unit" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.workUnit" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.planMonth" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.completionDate" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

interface PlanItem {
  serialNumber: string
  aircraftNumber: string
  factoryNumber: string
  model: string
  unit: string
  workUnit: string
  planMonth: string
  completionDate: string
}

const isEditMode = ref(false)

const form = reactive({
  title: '空 XX 旅旅 XXXX 年度定期检修计划表',
  date: 'XXXX.XX.XX',
  reviewer: '',
  approver: '',
  items: [
    { serialNumber: '1', aircraftNumber: 'XX', factoryNumber: '0203', model: '歼-XX', unit: '机务1中队', workUnit: '(400±30)飞行小时/3年', planMonth: '1', completionDate: '2022.01.25' },
    { serialNumber: '2', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: '机务1中队', workUnit: '(400±30)飞行小时/3年', planMonth: '1', completionDate: '2022.01.25' },
    { serialNumber: '3', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '更换左发动机', planMonth: '1', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '4', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '2', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '5', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '2', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '6', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '2', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '7', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '3', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '8', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '4', completionDate: '' },
    { serialNumber: '9', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '4', completionDate: 'XXXX.XX.XX' },
    { serialNumber: '10', aircraftNumber: 'XX', factoryNumber: '', model: 'XX', unit: 'XX', workUnit: '(400±30)飞行小时/3年', planMonth: '4', completionDate: 'XXXX.XX.XX' }
  ] as PlanItem[]
})

const defaultForm = JSON.parse(JSON.stringify(form))

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const resetForm = () => {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
}

const exportToWord = () => {
  let rows = ''
  form.items.forEach(item => {
    rows += '<tr>' +
      '<td style="padding: 8px;">' + item.serialNumber + '</td>' +
      '<td style="padding: 8px;">' + item.aircraftNumber + '</td>' +
      '<td style="padding: 8px;">' + item.factoryNumber + '</td>' +
      '<td style="padding: 8px;">' + item.model + '</td>' +
      '<td style="padding: 8px;">' + item.unit + '</td>' +
      '<td style="padding: 8px;">' + item.workUnit + '</td>' +
      '<td style="padding: 8px;">' + item.planMonth + '</td>' +
      '<td style="padding: 8px;">' + item.completionDate + '</td>' +
      '</tr>'
  })

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>年度定期检修计划表</title></head><body>' +
    '<h1 style="text-align: center;">' + form.title + '</h1>' +
    '<p style="margin-bottom: 10px;">日期：' + form.date + '&nbsp;&nbsp;&nbsp;&nbsp;审查人：' + form.reviewer + '&nbsp;&nbsp;&nbsp;&nbsp;批准人：' + form.approver + '</p>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px;">序号</td>' +
    '<td style="font-weight: bold; padding: 8px;">飞机号</td>' +
    '<td style="font-weight: bold; padding: 8px;">出厂号码</td>' +
    '<td style="font-weight: bold; padding: 8px;">机型</td>' +
    '<td style="font-weight: bold; padding: 8px;">单位</td>' +
    '<td style="font-weight: bold; padding: 8px;">工作单元</td>' +
    '<td style="font-weight: bold; padding: 8px;">计划月份</td>' +
    '<td style="font-weight: bold; padding: 8px;">完成日期</td>' +
    '</tr>' +
    rows +
    '</table>' +
    '</body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '年度定期检修计划表.doc'
  link.click()
}
</script>

<style scoped>
.plan-page {
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

.info-bar {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.inline-input {
  width: 150px;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.doc-table td {
  border: 1px solid #000;
  padding: 8px;
  vertical-align: top;
}

.label-cell {
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
}

.value-cell {
  min-width: 80px;
}

:deep(.plain-input .el-input__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

:deep(.inline-input .el-input__inner) {
  background: transparent;
  border: none;
  border-bottom: 1px solid #000;
  box-shadow: none;
}
</style>