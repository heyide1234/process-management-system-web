const fs = require('fs');

const content = `<template>
  <div class="notice-content-page">
    <div class="page-header">
      <h2 class="page-title">技术通报/专项普查内容</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <table class="doc-table" border="1">
        <tr><td colspan="4" class="title-row">技术通报/专项普查内容</td></tr>
        <tr>
          <td class="label-cell">序号</td>
          <td class="value-cell"><el-input v-model="form.serialNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td colspan="2" class="value-cell doc-title-cell">
            <span class="doc-title-label">通报/普查文件名称</span>
            <el-input v-model="form.documentName" :disabled="!isEditMode" class="plain-input doc-title-input" />
          </td>
        </tr>
        <tr>
          <td class="label-cell">发文单位</td>
          <td class="value-cell"><el-input v-model="form.issuingUnit" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">发文号</td>
          <td class="value-cell"><el-input v-model="form.documentNumber" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">执行等级</td>
          <td class="value-cell">
            <el-checkbox v-model="form.execLevel1" :disabled="!isEditMode">立即执行</el-checkbox>
            <el-checkbox v-model="form.execLevel2" :disabled="!isEditMode">限时执行</el-checkbox>
            <el-checkbox v-model="form.execLevel3" :disabled="!isEditMode">常规执行</el-checkbox>
          </td>
          <td class="label-cell">落实方式</td>
          <td class="value-cell">
            <el-checkbox v-model="form.implMethod1" :disabled="!isEditMode">一次性</el-checkbox>
            <el-checkbox v-model="form.implMethod2" :disabled="!isEditMode">周期性</el-checkbox>
            <el-checkbox v-model="form.implMethod3" :disabled="!isEditMode">其他</el-checkbox>
          </td>
        </tr>
        <tr>
          <td class="label-cell">工厂编号</td>
          <td class="value-cell"><el-input v-model="form.factoryNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">专业</td>
          <td class="value-cell"><el-input v-model="form.major" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">发文日期</td>
          <td class="value-cell"><el-date-picker v-model="form.issueDate" type="date" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">收文日期</td>
          <td class="value-cell"><el-date-picker v-model="form.receiptDate" type="date" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">内容摘要</td>
          <td colspan="3" class="value-cell"><el-input v-model="form.contentSummary" type="textarea" :rows="5" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">涉及范围</td>
          <td colspan="3" class="value-cell"><el-input v-model="form.scope" type="textarea" :rows="5" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">落实方法</td>
          <td colspan="3" class="value-cell"><el-input v-model="form.implementation" type="textarea" :rows="8" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">变更记录</td>
          <td colspan="3" class="value-cell"><el-input v-model="form.changeRecords" type="textarea" :rows="6" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">落实小结</td>
          <td colspan="3" class="value-cell"><el-input v-model="form.summary" type="textarea" :rows="4" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">落实负责人</td>
          <td class="value-cell"><el-input v-model="form.responsiblePerson" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">落实期限</td>
          <td class="value-cell"><el-date-picker v-model="form.deadline" type="date" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">收文人</td>
          <td class="value-cell"><el-input v-model="form.receiver" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">质控安监室主任</td>
          <td class="value-cell"><el-input v-model="form.director" :disabled="!isEditMode" class="plain-input" /></td>
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
  serialNumber: '1',
  documentName: '关于事项',
  issuingUnit: '空军装备部',
  documentNumber: '装外飞〔2019〕20号',
  execLevel1: true,
  execLevel2: false,
  execLevel3: false,
  implMethod1: true,
  implMethod2: false,
  implMethod3: false,
  factoryNumber: 'J10-2019-011-Q',
  major: '机械、特设',
  issueDate: new Date('2020-12-01'),
  receiptDate: new Date('2021-01-01'),
  contentSummary: '内容摘要',
  scope: '涉及范围',
  implementation: '落实方法',
  changeRecords: '变更记录',
  summary: '落实小结',
  responsiblePerson: '',
  deadline: new Date('2021-03-31'),
  receiver: '',
  director: ''
})

const defaultForm = JSON.parse(JSON.stringify(form))

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const resetForm = () => {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
}

const exportToWord = () => {
  const execLevelText = (form.execLevel1 ? '☑' : '□') + '立即执行 ' +
    (form.execLevel2 ? '☑' : '□') + '限时执行 ' +
    (form.execLevel3 ? '☑' : '□') + '常规执行'
  
  const implMethodText = (form.implMethod1 ? '☑' : '□') + '一次性 ' +
    (form.implMethod2 ? '☑' : '□') + '周期性 ' +
    (form.implMethod3 ? '☑' : '□') + '其他'

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>技术通报</title></head><body>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td colspan="4" style="text-align: center; font-weight: bold; padding: 12px;">技术通报/专项普查内容</td></tr>' +
    '<tr>' +
    '<td style="width: 100px; font-weight: bold; padding: 12px; text-align: center;">序号</td>' +
    '<td style="padding: 12px;">' + form.serialNumber + '</td>' +
    '<td colspan="2" style="padding: 12px;"><strong>通报/普查文件名称</strong><br/>' + form.documentName + '</td>' +
    '</tr>' +
    '<tr><td style="width: 100px; font-weight: bold; padding: 12px; text-align: center;">发文单位</td><td style="padding: 12px;">' + form.issuingUnit + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">发文号</td><td style="padding: 12px;">' + form.documentNumber + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">执行等级</td><td style="padding: 12px;">' + execLevelText + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">落实方式</td><td style="padding: 12px;">' + implMethodText + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">工厂编号</td><td style="padding: 12px;">' + form.factoryNumber + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">专业</td><td style="padding: 12px;">' + form.major + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">发文日期</td><td style="padding: 12px;">' + (form.issueDate ? new Date(form.issueDate).toLocaleDateString('zh-CN') : '') + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">收文日期</td><td style="padding: 12px;">' + (form.receiptDate ? new Date(form.receiptDate).toLocaleDateString('zh-CN') : '') + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center; vertical-align: top;">内容摘要</td><td colspan="3" style="padding: 12px; height: 80px;">' + form.contentSummary + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center; vertical-align: top;">涉及范围</td><td colspan="3" style="padding: 12px; height: 80px;">' + form.scope + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center; vertical-align: top;">落实方法</td><td colspan="3" style="padding: 12px; height: 80px;">' + form.implementation + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center; vertical-align: top;">变更记录</td><td colspan="3" style="padding: 12px; height: 80px;">' + form.changeRecords + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">落实小结</td><td colspan="3" style="padding: 12px;">' + form.summary + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">落实负责人</td><td style="padding: 12px;">' + form.responsiblePerson + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">落实期限</td><td style="padding: 12px;">' + (form.deadline ? new Date(form.deadline).toLocaleDateString('zh-CN') : '') + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 12px; text-align: center;">收文人</td><td style="padding: 12px;">' + form.receiver + '</td><td style="font-weight: bold; padding: 12px; text-align: center;">质控安监室主任</td><td style="padding: 12px;">' + form.director + '</td></tr>' +
    '</table></body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '技术通报.doc'
  link.click()
}
</script>

<style scoped>
.notice-content-page {
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
  max-width: 900px;
  margin: 0 auto;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table td {
  border: 1px solid #000;
  padding: 12px;
  vertical-align: top;
}

.title-row {
  text-align: center;
  font-weight: bold;
}

.label-cell {
  width: 120px;
  text-align: center;
  font-weight: bold;
}

.doc-title-cell {
  display: flex;
  flex-direction: column;
}

.doc-title-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.doc-title-input {
  width: 100%;
}

:deep(.plain-input .el-input__inner),
:deep(.plain-input .el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

:deep(.plain-input .el-date-editor) {
  background: transparent;
  border: none;
}
</style>`;

fs.writeFileSync('src/views/technical/NoticeContent.vue', content, { encoding: 'utf8' });
console.log('File restored successfully!');