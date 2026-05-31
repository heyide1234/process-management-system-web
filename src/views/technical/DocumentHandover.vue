<template>
  <div class="document-handover-page">
    <div class="page-header">
      <h2 class="page-title">飞机定期检修进、出厂履历文件交接单</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <h3 class="doc-title">飞机定期检修进、出厂履历文件交接单</h3>

      <h4 class="section-title">一、飞机基本情况</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">机型</td>
          <td class="value-cell"><el-input v-model="form.model" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">出厂号码</td>
          <td class="value-cell"><el-input v-model="form.factoryNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">部队编号</td>
          <td class="value-cell"><el-input v-model="form.unitNumber" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">大修次数</td>
          <td class="value-cell"><el-input v-model="form.overhaulCount" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">修后使用时限</td>
          <td class="value-cell"><el-input v-model="form.postRepairLimit" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">总规定寿命</td>
          <td class="value-cell"><el-input v-model="form.totalLife" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">总飞行时间</td>
          <td class="value-cell"><el-input v-model="form.totalFlightTime" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">剩余使用时间</td>
          <td class="value-cell"><el-input v-model="form.remainingTime" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">定检依据</td>
          <td colspan="15" class="value-cell"><el-input v-model="form.inspectionBasis" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">与定检差别</td>
          <td colspan="15" class="value-cell"><el-input v-model="form.inspectionDifference" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">二、履历本情况（此处机械与飞机履历本位置是否可颠倒好些）</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell" rowspan="2">机载设备履历本数量</td>
          <td class="label-cell">系统</td>
          <td class="value-cell"><el-input v-model="form.system1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system4" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system5" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system6" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system7" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system8" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system9" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system10" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system11" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.system12" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">电气系统</td>
          <td class="value-cell"><el-input v-model="form.electrical" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical4" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical5" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical6" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical7" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical8" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical9" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical10" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical11" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.electrical12" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell" rowspan="4">飞机履历本附件数量</td>
          <td class="label-cell">名称</td>
          <td class="value-cell"><el-input v-model="form.attachName1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName4" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName5" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName6" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName7" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName8" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName9" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachName10" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">数量</td>
          <td class="value-cell"><el-input v-model="form.attachQty1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty4" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty5" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty6" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty7" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty8" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty9" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="form.attachQty10" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">备注</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.remark" type="textarea" :rows="3" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <h4 class="section-title">三、存在问题</h4>
      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">单位</td>
          <td colspan="11" class="value-cell">交接时需特殊说明情况</td>
        </tr>
        <tr>
          <td class="label-cell">中队</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.squadronIssue" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">质控室</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.qualityIssue" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">机组</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.crewIssue" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">修理厂</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.repairShopIssue" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">质控室</td>
          <td colspan="11" class="value-cell"><el-input v-model="form.qualityIssue2" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <div class="instructions">
        <h4>填写说明:</h4>
        <p>1. 飞机、发动机基本情况和履历本情况由机务中队质控室负责填写，机组清查核对表内信息。</p>
        <p>2. 存在问题由机务中队质控室事先说明情况，机组清查核对后由机组人员填写，如：该因机进厂时缺</p>
        <p>3. 此交接证明书一式两份，用于飞机定检进厂、出厂移交履历本时使用，机务中队质控室和修理厂</p>
        <p>软件等证明情况。</p>
        <p>4. 移交文件各一份，双方签字后生效。移交文件一式两份，机务中队质控室和修理厂质控室各留存一份。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

const isEditMode = ref(false)

const form = reactive({
  model: '',
  factoryNumber: '',
  unitNumber: '',
  overhaulCount: '',
  postRepairLimit: '',
  totalLife: '',
  totalFlightTime: '',
  remainingTime: '',
  inspectionBasis: '',
  inspectionDifference: '',
  system1: '飞机系统',
  system2: '发动机系统',
  system3: '操纵系统',
  system4: '机电综合',
  system5: '液压系统',
  system6: '氧气系统',
  system7: '环控系统',
  system8: '救生、防冰系统',
  system9: '燃油系统',
  system10: '动力装置',
  system11: '',
  system12: '',
  electrical: '电气',
  electrical2: '座舱',
  electrical3: '监控',
  electrical4: '射频、光',
  electrical5: '武器',
  electrical6: '武器',
  electrical7: '电磁',
  electrical8: '配电',
  electrical9: '自制功能',
  electrical10: '合计',
  electrical11: '',
  electrical12: '',
  attachName1: '飞机正本',
  attachName2: '飞机副本',
  attachName3: '飞机副',
  attachName4: '飞机附录',
  attachName5: '左发履历本',
  attachName6: '右发履历本',
  attachName7: '右发履历本',
  attachName8: '左机匣履历本',
  attachName9: '右机匣履历本',
  attachName10: '右起动',
  attachQty1: '',
  attachQty2: '',
  attachQty3: '',
  attachQty4: '',
  attachQty5: '',
  attachQty6: '',
  attachQty7: '',
  attachQty8: '',
  attachQty9: '',
  attachQty10: '',
  remark: '1.飞机履历本1份；2.飞机履历副本1份；3.飞机附录1份；4.发动机履历本2份；5.飞机水平测量记录1份；6.螺旋桨记录1份；7.歼-16型飞机机载设备履历本清单及档案本1份。',
  squadronIssue: '',
  qualityIssue: '',
  crewIssue: '',
  repairShopIssue: '',
  qualityIssue2: ''
})

const defaultForm = JSON.parse(JSON.stringify(form))

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const resetForm = () => {
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
}

const exportToWord = () => {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>飞机定期检修进、出厂履历文件交接单</title></head><body>' +
    '<h1 style="text-align: center;">飞机定期检修进、出厂履历文件交接单</h1>' +
    '<h3>一、飞机基本情况</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px;">机型</td>' +
    '<td style="padding: 8px;">' + form.model + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">出厂号码</td>' +
    '<td style="padding: 8px;">' + form.factoryNumber + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">部队编号</td>' +
    '<td style="padding: 8px;">' + form.unitNumber + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">大修次数</td>' +
    '<td style="padding: 8px;">' + form.overhaulCount + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">修后使用时限</td>' +
    '<td style="padding: 8px;">' + form.postRepairLimit + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">总规定寿命</td>' +
    '<td style="padding: 8px;">' + form.totalLife + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">总飞行时间</td>' +
    '<td style="padding: 8px;">' + form.totalFlightTime + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">剩余使用时间</td>' +
    '<td style="padding: 8px;">' + form.remainingTime + '</td>' +
    '</tr>' +
    '</table>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">定检依据</td><td colspan="15" style="padding: 8px;">' + form.inspectionBasis + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">与定检差别</td><td colspan="15" style="padding: 8px;">' + form.inspectionDifference + '</td></tr>' +
    '</table>' +
    '<h3>二、履历本情况（此处机械与飞机履历本位置是否可颠倒好些）</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px; vertical-align: top;">机载设备履历本数量</td>' +
    '<td style="font-weight: bold; padding: 8px;">系统</td>' +
    '<td style="padding: 8px;">' + form.system1 + '</td>' +
    '<td style="padding: 8px;">' + form.system2 + '</td>' +
    '<td style="padding: 8px;">' + form.system3 + '</td>' +
    '<td style="padding: 8px;">' + form.system4 + '</td>' +
    '<td style="padding: 8px;">' + form.system5 + '</td>' +
    '<td style="padding: 8px;">' + form.system6 + '</td>' +
    '<td style="padding: 8px;">' + form.system7 + '</td>' +
    '<td style="padding: 8px;">' + form.system8 + '</td>' +
    '<td style="padding: 8px;">' + form.system9 + '</td>' +
    '<td style="padding: 8px;">' + form.system10 + '</td>' +
    '</tr>' +
    '<tr>' +
    '<td></td>' +
    '<td style="font-weight: bold; padding: 8px;">电气系统</td>' +
    '<td style="padding: 8px;">' + form.electrical + '</td>' +
    '<td style="padding: 8px;">' + form.electrical2 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical3 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical4 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical5 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical6 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical7 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical8 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical9 + '</td>' +
    '<td style="padding: 8px;">' + form.electrical10 + '</td>' +
    '</tr>' +
    '</table>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px; vertical-align: top;">飞机履历本附件数量</td>' +
    '<td style="font-weight: bold; padding: 8px;">名称</td>' +
    '<td style="padding: 8px;">' + form.attachName1 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName2 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName3 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName4 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName5 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName6 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName7 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName8 + '</td>' +
    '<td style="padding: 8px;">' + form.attachName9 + '</td>' +
    '</tr>' +
    '<tr>' +
    '<td></td>' +
    '<td style="font-weight: bold; padding: 8px;">数量</td>' +
    '<td style="padding: 8px;">' + form.attachQty1 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty2 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty3 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty4 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty5 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty6 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty7 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty8 + '</td>' +
    '<td style="padding: 8px;">' + form.attachQty9 + '</td>' +
    '</tr>' +
    '</table>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">备注</td><td colspan="11" style="padding: 8px;">' + form.remark + '</td></tr>' +
    '</table>' +
    '<h3>三、存在问题</h3>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px;">单位</td><td colspan="11" style="padding: 8px;">交接时需特殊说明情况</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">中队</td><td colspan="11" style="padding: 8px;">' + form.squadronIssue + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">质控室</td><td colspan="11" style="padding: 8px;">' + form.qualityIssue + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">机组</td><td colspan="11" style="padding: 8px;">' + form.crewIssue + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">修理厂</td><td colspan="11" style="padding: 8px;">' + form.repairShopIssue + '</td></tr>' +
    '<tr><td style="font-weight: bold; padding: 8px;">质控室</td><td colspan="11" style="padding: 8px;">' + form.qualityIssue2 + '</td></tr>' +
    '</table>' +
    '<h3>填写说明:</h3>' +
    '<p>1. 飞机、发动机基本情况和履历本情况由机务中队质控室负责填写，机组清查核对表内信息。</p>' +
    '<p>2. 存在问题由机务中队质控室事先说明情况，机组清查核对后由机组人员填写，如：该因机进厂时缺</p>' +
    '<p>3. 此交接证明书一式两份，用于飞机定检进厂、出厂移交履历本时使用，机务中队质控室和修理厂</p>' +
    '<p>软件等证明情况。</p>' +
    '<p>4. 移交文件各一份，双方签字后生效。移交文件一式两份，机务中队质控室和修理厂质控室各留存一份。</p>' +
    '</body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '飞机定期检修进、出厂履历文件交接单.doc'
  link.click()
}
</script>

<style scoped>
.document-handover-page {
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

.instructions {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
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

:deep(.plain-input .el-input__inner),
:deep(.plain-input .el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
</style>