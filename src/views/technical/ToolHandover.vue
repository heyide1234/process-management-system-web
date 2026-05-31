<template>
  <div class="handover-page">
    <div class="page-header">
      <h2 class="page-title">飞机随机工具设备交接</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">{{ isEditMode ? '保存' : '编辑' }}</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Download" @click="exportToWord">导出 Word</el-button>
      </div>
    </div>
    <div class="word-document">
      <h3 class="doc-title">飞机随机工具设备交接</h3>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell">设备名称</td>
          <td class="label-cell">单位</td>
          <td class="label-cell">数量</td>
          <td class="label-cell">设备名称</td>
          <td class="label-cell">单位</td>
          <td class="label-cell">数量</td>
        </tr>
        <tr v-for="(item, index) in form.items" :key="index">
          <td class="value-cell"><el-input v-model="item.name1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.unit1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.qty1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.name2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.unit2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="value-cell"><el-input v-model="item.qty2" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>

      <div class="notes-section">
        <h4>注意事项:</h4>
        <p>1. 机组不需携带的伞舱工作梯进厂，以免划伤机尾环氧地坪漆。</p>
        <p>2. 机组根据飞机情况和实际工作将副油箱堵头、堵盖交接给修理厂。</p>
      </div>

      <table class="doc-table" border="1">
        <tr>
          <td class="label-cell" rowspan="4">备注</td>
          <td colspan="5" class="value-cell">
            <el-input v-model="form.remark" type="textarea" :rows="6" :disabled="!isEditMode" class="plain-input" />
          </td>
        </tr>
      </table>

      <table class="doc-table border-top" border="1">
        <tr>
          <td class="label-cell">进厂交接</td>
          <td class="value-cell"><el-input v-model="form.inFactory" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">外场机组</td>
          <td class="value-cell"><el-input v-model="form.outField" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">机械师</td>
          <td class="value-cell"><el-input v-model="form.mechanic1" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">修理厂</td>
          <td class="value-cell"><el-input v-model="form.repairShop" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">机械师</td>
          <td class="value-cell"><el-input v-model="form.mechanic2" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
        <tr>
          <td class="label-cell">出厂交接</td>
          <td class="value-cell"><el-input v-model="form.outFactory" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">修理厂</td>
          <td class="value-cell"><el-input v-model="form.repairShop2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">机械师</td>
          <td class="value-cell"><el-input v-model="form.mechanic3" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">外场机组</td>
          <td class="value-cell"><el-input v-model="form.outField2" :disabled="!isEditMode" class="plain-input" /></td>
          <td class="label-cell">机械师</td>
          <td class="value-cell"><el-input v-model="form.mechanic4" :disabled="!isEditMode" class="plain-input" /></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Edit, Refresh, Download } from '@element-plus/icons-vue'

interface ToolItem {
  name1: string
  unit1: string
  qty1: string
  name2: string
  unit2: string
  qty2: string
}

const isEditMode = ref(false)

const form = reactive({
  items: [
    { name1: '攻角、总温以及空速管套', unit1: '套', qty1: '', name2: '主机轮轮挡', unit2: '个', qty2: '' },
    { name1: '进气道堵盖', unit1: '个', qty1: '', name2: '油盘', unit2: '个', qty2: '' },
    { name1: '进气道堵盖', unit1: '块', qty1: '', name2: '接地线', unit2: '根', qty2: '' },
    { name1: '附面层堵盖', unit1: '块', qty1: '', name2: '接地线', unit2: '根', qty2: '' },
    { name1: '座舱盖布', unit1: '块', qty1: '', name2: '漏油筒', unit2: '根', qty2: '' },
    { name1: '座舱工作梯', unit1: '', qty1: '', name2: '漏油筒', unit2: '个', qty2: '' },
    { name1: '座舱工作梯', unit1: '个', qty1: '', name2: '尾喷口罩布', unit2: '个', qty2: '' },
    { name1: '屏显护罩', unit1: '块', qty1: '', name2: '', unit2: '', qty2: '' },
    { name1: '座舱盖撑杆（双座机需）', unit1: '根', qty1: '', name2: '紫（红）外告警堵盖', unit2: '套', qty2: '' },
    { name1: '起落架保险销', unit1: '套', qty1: '', name2: '假锁撞环', unit2: '根', qty2: '' },
    { name1: '起落架保险销', unit1: '', qty1: '', name2: '假锁撞环', unit2: '', qty2: '' },
    { name1: '座椅保险销', unit1: '套', qty1: '', name2: '环控堵头', unit2: '套', qty2: '' },
    { name1: 'EPU地面保险销', unit1: '', qty1: '', name2: '', unit2: '', qty2: '' },
    { name1: 'EPU地面保险销', unit1: '根', qty1: '', name2: '', unit2: '', qty2: '' }
  ] as ToolItem[],
  remark: '(清单以外的工具设备列入备注)',
  inFactory: '',
  outField: '',
  mechanic1: '',
  repairShop: '',
  mechanic2: '',
  outFactory: '',
  repairShop2: '',
  mechanic3: '',
  outField2: '',
  mechanic4: ''
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
      '<td style="padding: 8px;">' + item.name1 + '</td>' +
      '<td style="padding: 8px;">' + item.unit1 + '</td>' +
      '<td style="padding: 8px;">' + item.qty1 + '</td>' +
      '<td style="padding: 8px;">' + item.name2 + '</td>' +
      '<td style="padding: 8px;">' + item.unit2 + '</td>' +
      '<td style="padding: 8px;">' + item.qty2 + '</td>' +
      '</tr>'
  })

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>飞机随机工具设备交接</title></head><body>' +
    '<h1 style="text-align: center;">飞机随机工具设备交接</h1>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px;">设备名称</td>' +
    '<td style="font-weight: bold; padding: 8px;">单位</td>' +
    '<td style="font-weight: bold; padding: 8px;">数量</td>' +
    '<td style="font-weight: bold; padding: 8px;">设备名称</td>' +
    '<td style="font-weight: bold; padding: 8px;">单位</td>' +
    '<td style="font-weight: bold; padding: 8px;">数量</td>' +
    '</tr>' +
    rows +
    '</table>' +
    '<h3>注意事项:</h3>' +
    '<p>1. 机组不需携带的伞舱工作梯进厂，以免划伤机尾环氧地坪漆。</p>' +
    '<p>2. 机组根据飞机情况和实际工作将副油箱堵头、堵盖交接给修理厂。</p>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">备注</td><td colspan="5" style="padding: 8px; height: 100px;">' + form.remark + '</td></tr>' +
    '</table>' +
    '<table border="1" style="border-collapse: collapse; width: 100%;">' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px;">进厂交接</td>' +
    '<td style="padding: 8px;">' + form.inFactory + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">外场机组</td>' +
    '<td style="padding: 8px;">' + form.outField + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">机械师</td>' +
    '<td style="padding: 8px;">' + form.mechanic1 + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">修理厂</td>' +
    '<td style="padding: 8px;">' + form.repairShop + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">机械师</td>' +
    '<td style="padding: 8px;">' + form.mechanic2 + '</td>' +
    '</tr>' +
    '<tr>' +
    '<td style="font-weight: bold; padding: 8px;">出厂交接</td>' +
    '<td style="padding: 8px;">' + form.outFactory + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">修理厂</td>' +
    '<td style="padding: 8px;">' + form.repairShop2 + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">机械师</td>' +
    '<td style="padding: 8px;">' + form.mechanic3 + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">外场机组</td>' +
    '<td style="padding: 8px;">' + form.outField2 + '</td>' +
    '<td style="font-weight: bold; padding: 8px;">机械师</td>' +
    '<td style="padding: 8px;">' + form.mechanic4 + '</td>' +
    '</tr>' +
    '</table>' +
    '</body></html>'

  const blob = new Blob([html], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '飞机随机工具设备交接.doc'
  link.click()
}
</script>

<style scoped>
.handover-page {
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

.notes-section {
  margin: 20px 0;
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