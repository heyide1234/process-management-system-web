<template>
  <div class="html-form-editor">
    <el-tabs v-model="activeTab" type="border-card" class="html-editor-tabs">
      <el-tab-pane label="代码编辑" name="code">
        <div class="code-editor-layout">
          <div class="editor-toolbar">
            <el-dropdown @command="insertSnippet">
              <el-button size="small">
                <el-icon><Plus /></el-icon>
                插入模板片段
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="text">
                    <el-icon><Edit /></el-icon>
                    文本输入
                  </el-dropdown-item>
                  <el-dropdown-item command="number">
                    <el-icon><Edit /></el-icon>
                    数字输入
                  </el-dropdown-item>
                  <el-dropdown-item command="date">
                    <el-icon><Calendar /></el-icon>
                    日期选择
                  </el-dropdown-item>
                  <el-dropdown-item command="select">
                    <el-icon><List /></el-icon>
                    下拉选择
                  </el-dropdown-item>
                  <el-dropdown-item command="textarea">
                    <el-icon><Document /></el-icon>
                    多行文本
                  </el-dropdown-item>
                  <el-dropdown-item command="checkbox">
                    <el-icon><Select /></el-icon>
                    复选框
                  </el-dropdown-item>
                  <el-dropdown-item command="radio">
                    <el-icon><Select /></el-icon>
                    单选框
                  </el-dropdown-item>
                  <el-dropdown-item command="form-group">
                    <el-icon><Grid /></el-icon>
                    表单分组
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" @click="formatHtml">
              <el-icon><Operation /></el-icon>
              格式化
            </el-button>
          </div>
          <textarea
            ref="editorRef"
            class="html-editor-textarea"
            :value="modelValue"
            @input="handleInput"
            @keydown="handleKeydown"
            spellcheck="false"
            placeholder="在此编写 HTML 表单代码..."
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="实时预览" name="preview">
        <div class="preview-container">
          <iframe
            v-if="previewReady"
            ref="previewIframe"
            :srcdoc="previewHtml"
            class="preview-iframe"
            frameborder="0"
            @load="onPreviewLoad"
          />
          <el-empty v-else description="暂无内容" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Plus,
  ArrowDown,
  Edit,
  Calendar,
  List,
  Document,
  Select,
  Grid,
  Operation
} from '@element-plus/icons-vue'
import { stripVisibleHtmlFormApiScripts } from '../utils/htmlFormRuntime'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const activeTab = ref('code')
const editorRef = ref<HTMLTextAreaElement>()
const previewIframe = ref<HTMLIFrameElement>()
const previewReady = ref(false)

const snippets: Record<string, string> = {
  text: `<div class="form-group">
  <label>文本字段:</label>
  <input type="text" name="fieldName" placeholder="请输入" style="width: 100%; max-width: 400px;">
</div>`,
  number: `<div class="form-group">
  <label>数字字段:</label>
  <input type="number" name="fieldName" placeholder="请输入数字" style="width: 100%; max-width: 200px;">
</div>`,
  date: `<div class="form-group">
  <label>日期字段:</label>
  <input type="date" name="fieldName" style="width: 100%; max-width: 200px;">
</div>`,
  select: `<div class="form-group">
  <label>下拉选择:</label>
  <select name="fieldName" style="width: 100%; max-width: 400px;">
    <option value="">请选择</option>
    <option value="option1">选项一</option>
    <option value="option2">选项二</option>
  </select>
</div>`,
  textarea: `<div class="form-group">
  <label>多行文本:</label>
  <textarea name="fieldName" rows="4" placeholder="请输入内容" style="width: 100%; max-width: 400px;"></textarea>
</div>`,
  checkbox: `<div class="form-group">
  <label>多选:</label>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <label style="display: flex; align-items: center; gap: 4px;">
      <input type="checkbox" name="fieldName" value="option1"> 选项一
    </label>
    <label style="display: flex; align-items: center; gap: 4px;">
      <input type="checkbox" name="fieldName" value="option2"> 选项二
    </label>
  </div>
</div>`,
  radio: `<div class="form-group">
  <label>单选:</label>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <label style="display: flex; align-items: center; gap: 4px;">
      <input type="radio" name="fieldName" value="option1"> 选项一
    </label>
    <label style="display: flex; align-items: center; gap: 4px;">
      <input type="radio" name="fieldName" value="option2"> 选项二
    </label>
  </div>
</div>`,
  'form-group': `<div class="form-group">
  <label>分组标题:</label>
  <div style="padding: 12px; border: 1px solid #e4e7ed; border-radius: 6px; background: #fafafa;">
  </div>
</div>`
}

const previewHtml = computed(() => {
  const content = stripVisibleHtmlFormApiScripts(props.modelValue || '')
  return wrapPreview(content)
})

function wrapPreview(content: string): string {
  const css = [
    'body {',
    '  font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;',
    '  padding: 20px;',
    '  margin: 0;',
    '  color: #333;',
    '  line-height: 1.6;',
    '}',
    '.form-group { margin-bottom: 16px; }',
    '.form-group > label {',
    '  display: block;',
    '  margin-bottom: 6px;',
    '  font-weight: 500;',
    '  color: #606266;',
    '  font-size: 14px;',
    '}',
    'input, select, textarea, button { font-family: inherit; }',
    'input[type="text"], input[type="number"], input[type="email"],',
    'input[type="date"], input[type="password"], input[type="tel"],',
    'select, textarea {',
    '  padding: 8px 12px;',
    '  border: 1px solid #dcdfe6;',
    '  border-radius: 4px;',
    '  font-size: 14px;',
    '  outline: none;',
    '  transition: border-color 0.2s;',
    '  box-sizing: border-box;',
    '  width: 100%;',
    '  max-width: 400px;',
    '}',
    'input:focus, select:focus, textarea:focus { border-color: #409eff; }',
    'input:disabled, select:disabled, textarea:disabled {',
    '  background: #f5f7fa;',
    '  color: #909399;',
    '  cursor: not-allowed;',
    '}',
    'button {',
    '  padding: 8px 20px;',
    '  border: none;',
    '  border-radius: 4px;',
    '  cursor: pointer;',
    '  font-size: 14px;',
    '}',
    '.btn-primary { background: #409eff; color: #fff; }',
    '.btn-default {',
    '  background: #f5f7fa;',
    '  color: #606266;',
    '  border: 1px solid #dcdfe6;',
    '}',
    'label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 14px; }',
    'table { border-collapse: collapse; width: 100%; }',
    'table td, table th {',
    '  border: 1px solid #dcdfe6;',
    '  padding: 8px 12px;',
    '  text-align: left;',
    '}',
    'table th { background: #f5f7fa; font-weight: 500; }',
    'hr { border: none; border-top: 1px solid #e4e7ed; margin: 16px 0; }'
  ].join('\n  ')
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>\n  ' + css + '\n</style>\n</head>\n<body>\n' + content + '\n</body>\n</html>'
}

function handleInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const el = e.target as HTMLTextAreaElement
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    const newValue = value.substring(0, start) + '  ' + value.substring(end)
    emit('update:modelValue', newValue)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2
    })
  }
}

function insertSnippet(command: string) {
  const snippet = snippets[command]
  if (!snippet || !editorRef.value) return

  const el = editorRef.value
  const start = el.selectionStart
  const end = el.selectionEnd
  const value = el.value
  const newValue = value.substring(0, start) + snippet + value.substring(end)
  emit('update:modelValue', newValue)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + snippet.length
    el.focus()
  })
}

function formatHtml() {
  const value = props.modelValue
  if (!value.trim()) return

  let formatted = value
    .replace(/>\s+</g, '>\n<')
    .replace(/<(\/?)div/g, '\n<$1div')
    .replace(/<(\/?)div/g, '\n<$1div')

  formatted = formatted
    .split('\n')
    .filter(line => line.trim())
    .join('\n')

  emit('update:modelValue', formatted)
}

function onPreviewLoad() {
  previewReady.value = true
}

watch(() => props.modelValue, () => {
  previewReady.value = false
})

watch(activeTab, (val) => {
  if (val === 'preview') {
    previewReady.value = !!props.modelValue.trim()
  }
})
</script>

<style scoped>
.html-form-editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.html-editor-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.html-editor-tabs :deep(.el-tabs__header) {
  flex-shrink: 0;
}

.html-editor-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.html-editor-tabs :deep(.el-tab-pane) {
  height: 100%;
  min-height: 0;
}

.code-editor-layout {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.html-editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  tab-size: 2;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
  overflow: auto;
}

.html-editor-textarea::placeholder {
  color: #c0c4cc;
}

.preview-container {
  height: 100%;
  min-height: 0;
  padding: 0;
}

.preview-container :deep(.el-empty) {
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: none;
  display: block;
}
</style>
