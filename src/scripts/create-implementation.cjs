const fs = require('fs');

const content = `<template>
  <div class="implementation-page">
    <div class="page-header">
      <h2 class="page-title">技术通报/专项普查单机落实情况</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <table class="doc-table" border="1">
        <tr>
          <td class="title-row" colspan="7">技术通报/专项普查单机落实情况</td>
        </tr>
        <tr>
          <td class="label-cell">序号</td>
          <td class="label-cell">飞机、发动机号</td>
          <td class="label-cell">机件型别号码</td>
          <td class="label-cell">完成单位<br/>完成人</td>
          <td class="label-cell">完成日期</td>
          <td class="label-cell">未落实原因</td>
          <td class="label-cell">备注</td>
        </tr>
        <tr v-for="(item, index) in form.items" :key="index">
          <td class="value-cell"><el-input v-model="item.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.aircraftNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.partNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.completedBy" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.completedDate" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.reason" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.remark" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

interface ImplementationItem {
  serialNumber: string
  aircraftNumber: string
  partNumber: string
  completedBy: string
  completedDate: string
  reason: string
  remark: string
}

const isEditMode = ref(false)

const form = reactive({
  items: [
    { serialNumber: '1', aircraftNumber: '1/10A0101', partNumber: '', completedBy: '××/××', completedDate: '2021.01.10', reason: '', remark: '' },
    { serialNumber: '2', aircraftNumber: '3/10A0102', partNumber: '', completedBy: '××/××', completedDate: '2021.01.10', reason: '', remark: '' },
    { serialNumber: '3', aircraftNumber: '11/10A0103', partNumber: '', completedBy: '××/××', completedDate: '', reason: '', remark: '' },
    { serialNumber: '4', aircraftNumber: '12/10S0226', partNumber: '', completedBy: '××/××', completedDate: '', reason: '', remark: '' },
    { serialNumber: '5', aircraftNumber: '12/10S0226', partNumber: '', completedBy: '××/××', completedDate: '2021.07.10', reason: '在厂大修', remark: '2021.01.20调往空2旅' },
    { serialNumber: '6', aircraftNumber: '13/10A0105', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '7', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '8', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '9', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '10', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '11', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '12', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '13', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '14', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '15', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '16', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '17', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '18', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '19', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '20', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '21', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '22', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '23', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '24', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '25', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '26', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '27', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' },
    { serialNumber: '28', aircraftNumber: '', partNumber: '', completedBy: '', completedDate: '', reason: '', remark: '' }
  ] as ImplementationItem[]
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
      '<td style="padding: 8px;">' + item.partNumber + '</td>' +
      '<td style="padding: 8px;">' + item.completedBy + '</td>' +
      '<td style="padding: 8px;">' + item.completedDate + '</td>' +
      '<td style="padding: 8px;">' + item.reason + '</td>' +
      '<td style="padding: 8px;">' + item.remark + '</td>' +
      '</tr>'
  })

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>技术通报单机落实情况</title></head><body>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td colspan="7" style="text-align: center; font-weight: bold; padding: 12px;">技术通报/专项普查单机落实情况</td></tr>' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">序号</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">飞机、发动机号</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">机件型别号码</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">完成单位<br/>完成人</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">完成日期</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">未落实原因</td>' +
    '<td style="font-weight: bold; padding: 8px; text-align: center;">备注</td>' +
    '</tr>' +
    rows +
    '</table></body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '技术通报单机落实情况.doc'
  link.click()
}
</script>

<style scoped>
.implementation-page {
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

:deep(.plain-input .el-input__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
</style>`;

fs.writeFileSync('src/views/technical/Implementation.vue', content, { encoding: 'utf8' });
console.log('Implementation.vue created successfully!');