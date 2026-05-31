const fs = require('fs');

const content = `<template>
  <div class="command-card-page">
    <div class="page-header">
      <h2 class="page-title">技术通报/专项普查落实指令卡片</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <table class="doc-table" border="1">
        <tr>
          <td class="title-row" colspan="7">技术通报/专项普查落实指令卡片</td>
        </tr>
        <tr>
          <td class="label-cell">飞机号:</td>
          <td class="value-cell"><el-input v-model="form.aircraftNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">填报人:</td>
          <td class="value-cell"><el-input v-model="form.reporter" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">填发日期:</td>
          <td class="value-cell"><el-input v-model="form.reportDate" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">编号:</td>
          <td class="value-cell"><el-input v-model="form.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">发文机关</td>
          <td class="value-cell"><el-input v-model="form.issuingAuthority" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">通报/普查文号</td>
          <td class="value-cell"><el-input v-model="form.documentNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">装外飞专号</td>
          <td class="value-cell"><el-input v-model="form.specialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.major" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">通报/普查名称</td>
          <td colspan="7" class="value-cell"><el-input v-model="form.noticeName" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">通报/普查内容</td>
          <td colspan="7" class="value-cell"><el-input v-model="form.content" type="textarea" :rows="4" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">落实期限</td>
          <td class="value-cell"><el-input v-model="form.deadline" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">落实方式</td>
          <td class="value-cell"><el-input v-model="form.implementationMethod" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">控制分工</td>
          <td class="value-cell"><el-input v-model="form.controlDivision" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">专业主任</td>
          <td class="value-cell"><el-input v-model="form.majorDirector" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell" rowspan="2">审核签字</td>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.auditMajor1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.auditMajor2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">审核人</td>
          <td class="value-cell"><el-input v-model="form.auditor1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.auditor2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">落实情况</td>
          <td colspan="7" class="value-cell"><el-input v-model="form.implementationStatus" type="textarea" :rows="3" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">落实单位</td>
          <td colspan="5" class="value-cell"><el-input v-model="form.implementationUnit" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">完成日期</td>
          <td class="value-cell"><el-input v-model="form.completionDate" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell" rowspan="4">落实签字</td>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.signMajor1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.signMajor2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">完成人</td>
          <td class="value-cell"><el-input v-model="form.completedBy1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.completedBy2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">检查人</td>
          <td class="value-cell"><el-input v-model="form.inspector1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.inspector2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">检查人</td>
          <td class="value-cell"><el-input v-model="form.inspector3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.inspector4" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
          <td class="value-cell"></td>
        </tr>
        <tr>
          <td class="label-cell">备注</td>
          <td colspan="7" class="value-cell"><el-input v-model="form.remark" type="textarea" :rows="4" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

const isEditMode = ref(false)

const form = reactive({
  aircraftNumber: '10',
  reporter: '×××',
  reportDate: '2021.01.01',
  serialNumber: '',
  issuingAuthority: '空军装备部',
  documentNumber: '通报/普查文号',
  specialNumber: '装外飞〔2019〕20号',
  major: '机械、特设',
  noticeName: '×××××××××××××××××××',
  content: '××××××××××××××××××××。\n××××××××××××××××××××。',
  deadline: '2021.03.31',
  implementationMethod: '一次性落实',
  controlDivision: '控制分工',
  majorDirector: '专业主任',
  auditMajor1: '机械',
  auditMajor2: '特设',
  auditor1: '×××',
  auditor2: '×××',
  implementationStatus: '按技术通报/专项普查的内容和标准完成落实工作，情况良好。',
  implementationUnit: '空×旅机务大队',
  completionDate: '2021.01.03',
  signMajor1: '机械',
  signMajor2: '特设',
  completedBy1: '×××',
  completedBy2: '×××',
  inspector1: '×××',
  inspector2: '×××',
  inspector3: '×××',
  inspector4: '×××',
  remark: ''
})

const defaultForm = JSON.parse(JSON.stringify(form))

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const resetForm = () => {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
}

const exportToWord = () => {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>技术通报落实指令卡片</title></head><body>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td colspan="8" style="text-align: center; font-weight: bold; padding: 12px;">技术通报/专项普查落实指令卡片</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">飞机号:</td><td style="padding: 8px;">' + form.aircraftNumber + '</td><td style="font-weight: bold; padding: 8px;">填报人:</td><td style="padding: 8px;">' + form.reporter + '</td><td style="font-weight: bold; padding: 8px;">填发日期:</td><td style="padding: 8px;">' + form.reportDate + '</td><td style="font-weight: bold; padding: 8px;">编号:</td><td style="padding: 8px;">' + form.serialNumber + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">发文机关</td><td style="padding: 8px;">' + form.issuingAuthority + '</td><td style="font-weight: bold; padding: 8px;">通报/普查文号</td><td style="padding: 8px;">' + form.documentNumber + '</td><td style="font-weight: bold; padding: 8px;">装外飞专号</td><td style="padding: 8px;">' + form.specialNumber + '</td><td style="font-weight: bold; padding: 8px;">专业</td><td style="padding: 8px;">' + form.major + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">通报/普查名称</td><td colspan="7" style="padding: 8px;">' + form.noticeName + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">通报/普查内容</td><td colspan="7" style="padding: 8px; height: 100px;">' + form.content + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">落实期限</td><td style="padding: 8px;">' + form.deadline + '</td><td style="font-weight: bold; padding: 8px;">落实方式</td><td style="padding: 8px;">' + form.implementationMethod + '</td><td style="font-weight: bold; padding: 8px;">控制分工</td><td style="padding: 8px;">' + form.controlDivision + '</td><td style="font-weight: bold; padding: 8px;">专业主任</td><td style="padding: 8px;">' + form.majorDirector + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">审核签字</td><td style="font-weight: bold; padding: 8px;">专业</td><td style="padding: 8px;">' + form.auditMajor1 + '</td><td style="padding: 8px;">' + form.auditMajor2 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td></td><td style="font-weight: bold; padding: 8px;">审核人</td><td style="padding: 8px;">' + form.auditor1 + '</td><td style="padding: 8px;">' + form.auditor2 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">落实情况</td><td colspan="7" style="padding: 8px; height: 80px;">' + form.implementationStatus + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">落实单位</td><td colspan="5" style="padding: 8px;">' + form.implementationUnit + '</td><td style="font-weight: bold; padding: 8px;">完成日期</td><td style="padding: 8px;">' + form.completionDate + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">落实签字</td><td style="font-weight: bold; padding: 8px;">专业</td><td style="padding: 8px;">' + form.signMajor1 + '</td><td style="padding: 8px;">' + form.signMajor2 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td></td><td style="font-weight: bold; padding: 8px;">完成人</td><td style="padding: 8px;">' + form.completedBy1 + '</td><td style="padding: 8px;">' + form.completedBy2 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td></td><td style="font-weight: bold; padding: 8px;">检查人</td><td style="padding: 8px;">' + form.inspector1 + '</td><td style="padding: 8px;">' + form.inspector2 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td></td><td style="font-weight: bold; padding: 8px;">检查人</td><td style="padding: 8px;">' + form.inspector3 + '</td><td style="padding: 8px;">' + form.inspector4 + '</td><td></td><td></td><td></td><td></td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">备注</td><td colspan="7" style="padding: 8px; height: 100px;">' + form.remark + '</td></tr>' +
    '</table></body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '技术通报落实指令卡片.doc'
  link.click()
}
</script>

<style scoped>
.command-card-page {
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

:deep(.plain-input .el-input__inner),
:deep(.plain-input .el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
</style>`;

fs.writeFileSync('src/views/technical/CommandCard.vue', content, { encoding: 'utf8' });
console.log('CommandCard.vue created successfully!');