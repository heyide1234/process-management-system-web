<template>
  <div class="form-renderer">
    <div v-if="loading" class="form-renderer-loading">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="!template" class="form-renderer-empty">
      <el-empty description="表单模板未加载" />
    </div>

    <template v-else>
      <div v-if="template.type === 'vform'" class="form-renderer-vform">
        <v-form-render
          :form-json="template.vformJson"
          :form-data="formDataProxy"
          :option-data="optionDataProxy"
          :disabled="disabled"
          ref="vFormRef"
        />
      </div>

      <div v-else-if="template.type === 'html'" class="form-renderer-html">
        <iframe
          ref="htmlFrameRef"
          class="html-form-frame"
          :srcdoc="htmlDocument"
          title="HTML 表单"
          frameborder="0"
          @load="handleHtmlFrameLoad"
        />
      </div>

      <div v-else class="form-renderer-unknown">
        <el-empty :description="`未知表单类型: ${(template as any).type}`" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormTemplate } from '../api/deployment'
import { stripVisibleHtmlFormApiScripts, wrapHtmlFormDocument } from '../utils/htmlFormRuntime'

type MaybePromise<T> = T | Promise<T>
type FormFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLElement

interface HtmlFormApi {
  getData?: () => MaybePromise<Record<string, any>>
  setData?: (data: Record<string, any>) => void
  validate?: () => MaybePromise<boolean>
  reset?: () => void
  setDisabled?: (disabled: boolean) => void
}

interface HtmlFormWindow extends Window {
  htmlFormApi?: HtmlFormApi
  getFormData?: HtmlFormApi['getData']
  setFormData?: HtmlFormApi['setData']
  validateForm?: HtmlFormApi['validate']
  resetForm?: HtmlFormApi['reset']
  setFormDisabled?: HtmlFormApi['setDisabled']
}

const props = withDefaults(defineProps<{
  template: FormTemplate | null
  formData?: Record<string, any>
  optionData?: Record<string, any>
  disabled?: boolean
  loading?: boolean
}>(), {
  template: null,
  formData: () => ({}),
  optionData: () => ({}),
  disabled: false,
  loading: false
})

const vFormRef = ref<any>(null)
const htmlFrameRef = ref<HTMLIFrameElement>()
const formDataProxy = reactive<Record<string, any>>({})
const optionDataProxy = reactive<Record<string, any>>({})

const htmlDocument = computed(() => {
  if (!props.template || props.template.type !== 'html') return ''
  return wrapHtmlFormDocument(props.template.htmlContent || '')
})

watch(() => props.formData, (val) => {
  Object.keys(formDataProxy).forEach((key) => delete formDataProxy[key])
  if (val) Object.assign(formDataProxy, val)
  nextTick(() => {
    applyFormData()
  })
}, { deep: true, immediate: true })

watch(() => props.optionData, (val) => {
  Object.keys(optionDataProxy).forEach((key) => delete optionDataProxy[key])
  if (val) Object.assign(optionDataProxy, val)
}, { deep: true, immediate: true })

watch(() => props.disabled, () => {
  nextTick(() => {
    applyDisabled()
  })
})

function getHtmlDocument(): Document | null {
  return htmlFrameRef.value?.contentDocument || htmlFrameRef.value?.contentWindow?.document || null
}

function getHtmlWindow(): HtmlFormWindow | null {
  return (htmlFrameRef.value?.contentWindow as HtmlFormWindow | null) || null
}

function getRuntimeApi(): HtmlFormApi | null {
  const win = getHtmlWindow()
  if (!win) return null

  if (win.htmlFormApi) {
    return win.htmlFormApi
  }

  if (win.getFormData || win.setFormData || win.validateForm || win.resetForm || win.setFormDisabled) {
    return {
      getData: win.getFormData?.bind(win),
      setData: win.setFormData?.bind(win),
      validate: win.validateForm?.bind(win),
      reset: win.resetForm?.bind(win),
      setDisabled: win.setFormDisabled?.bind(win)
    }
  }

  return null
}

function handleHtmlFrameLoad() {
  removeVisibleHtmlFormApiText()
  expandHtmlFormLayout()
  applyFormData()
  applyDisabled()
  bindFrameResizeTriggers()
  adjustHtmlFrameHeight()
  scheduleHtmlFormCleanup()
}

function bindFrameResizeTriggers() {
  const doc = getHtmlDocument()
  if (!doc) return

  doc.addEventListener('input', adjustHtmlFrameHeight, true)
  doc.addEventListener('change', adjustHtmlFrameHeight, true)
  doc.querySelectorAll('img').forEach((img) => {
    img.addEventListener('load', adjustHtmlFrameHeight, { once: true })
  })
}

function scheduleHtmlFormCleanup() {
  const cleanup = () => {
    removeVisibleHtmlFormApiText()
    expandHtmlFormLayout()
    adjustHtmlFrameHeight()
  }

  requestAnimationFrame(cleanup)
  window.setTimeout(cleanup, 100)
  window.setTimeout(cleanup, 500)
}

function adjustHtmlFrameHeight() {
  const frame = htmlFrameRef.value
  const doc = getHtmlDocument()
  if (!frame || !doc) return

  requestAnimationFrame(() => {
    const bodyHeight = doc.body?.scrollHeight || 0
    const documentHeight = doc.documentElement?.scrollHeight || 0
    frame.style.height = Math.max(320, bodyHeight, documentHeight) + 2 + 'px'
  })
}

function setImportantStyle(el: HTMLElement, property: string, value: string) {
  el.style.setProperty(property, value, 'important')
}

function isNonVisualElement(el: Element) {
  return ['script', 'style', 'template', 'meta', 'link', 'title'].includes(el.tagName.toLowerCase())
}

function isVisibleHtmlFormApiText(text: string) {
  const normalized = text.replace(/\s+/g, ' ')
  return normalized.length > 120 &&
    (normalized.includes('window.htmlFormApi') || normalized.includes('htmlFormApi')) &&
    normalized.includes('function') &&
    normalized.includes('getData')
}

function removeVisibleHtmlFormApiText() {
  const doc = getHtmlDocument()
  if (!doc?.body) return

  const cleanedBodyHtml = stripVisibleHtmlFormApiScripts(doc.body.innerHTML)
  if (cleanedBodyHtml !== doc.body.innerHTML) {
    doc.body.innerHTML = cleanedBodyHtml
    return
  }

  doc
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('textarea, input')
    .forEach((el) => {
      if (isVisibleHtmlFormApiText(el.value || '')) {
        el.remove()
      }
    })

  Array.from(doc.body.querySelectorAll<HTMLElement>('pre, code, p, div, section, article, aside'))
    .reverse()
    .forEach((el) => {
      const tagName = el.tagName.toLowerCase()
      if (tagName === 'script' || tagName === 'style' || tagName === 'template') return
      if (!isVisibleHtmlFormApiText(el.textContent || '')) return

      const hasFields = Boolean(
        el.querySelector('input, select, textarea, button, [contenteditable], [data-field], [data-name], [data-key]')
      )
      if (!hasFields) {
        el.remove()
      }
    })

  const nodes: Text[] = []
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const parent = node.parentElement
    if (!parent) continue

    const tagName = parent.tagName.toLowerCase()
    if (tagName === 'script' || tagName === 'style') continue
    if (isVisibleHtmlFormApiText(node.nodeValue || '')) {
      nodes.push(node)
    }
  }

  nodes.forEach((node) => {
    const parent = node.parentElement
    node.remove()
    if (
      parent &&
      parent.tagName.toLowerCase() !== 'body' &&
      !parent.textContent?.trim() &&
      parent.children.length === 0
    ) {
      parent.remove()
    }
  })
}

function expandHtmlFormLayout() {
  const doc = getHtmlDocument()
  if (!doc) return

  const root = doc.documentElement
  const body = doc.body
  ;[root, body].filter(Boolean).forEach((el) => {
    setImportantStyle(el, 'display', 'block')
    setImportantStyle(el, 'width', '100%')
    setImportantStyle(el, 'max-width', 'none')
    setImportantStyle(el, 'box-sizing', 'border-box')
  })

  if (body) {
    setImportantStyle(body, 'justify-content', 'normal')
    setImportantStyle(body, 'align-items', 'stretch')
    setImportantStyle(body, 'overflow-x', 'auto')
  }

  doc
    .querySelectorAll<HTMLElement>(
      [
        'body > *',
        'form',
        'main',
        'section',
        '.container',
        '.wrapper',
        '.content',
        '.main',
        '.page',
        '.sheet',
        '.paper',
        '.card',
        '.form-card',
        '.form-container',
        '.form-wrapper',
        '.form-content',
        '.table-container',
        '.table-wrapper',
        '.table-scroll',
        '.scroll-container'
      ].join(', ')
    )
    .forEach((el) => {
      if (isNonVisualElement(el)) {
        setImportantStyle(el, 'display', 'none')
        return
      }
      if (el.tagName.toLowerCase() !== 'table') {
        setImportantStyle(el, 'display', 'block')
      }
      setImportantStyle(el, 'width', '100%')
      setImportantStyle(el, 'max-width', 'none')
      setImportantStyle(el, 'margin-left', '0')
      setImportantStyle(el, 'margin-right', '0')
      setImportantStyle(el, 'box-sizing', 'border-box')
    })

  doc
    .querySelectorAll<HTMLElement>('.table-container, .table-wrapper, .table-scroll, .scroll-container')
    .forEach((el) => {
      setImportantStyle(el, 'max-height', 'none')
      setImportantStyle(el, 'overflow-x', 'visible')
    })

  doc
    .querySelectorAll<HTMLElement>('div, main, section, article, form')
    .forEach((el) => {
      if (!el.querySelector('table, form, input, select, textarea')) return
      setImportantStyle(el, 'width', '100%')
      setImportantStyle(el, 'max-width', 'none')
      setImportantStyle(el, 'margin-left', '0')
      setImportantStyle(el, 'margin-right', '0')
      setImportantStyle(el, 'box-sizing', 'border-box')
    })

  doc.querySelectorAll<HTMLTableElement>('table').forEach((table) => {
    table.style.removeProperty('max-width')
    table.style.removeProperty('min-width')
    table.style.removeProperty('table-layout')
    setImportantStyle(table, 'min-width', '100%')
    setImportantStyle(table, 'table-layout', 'auto')
  })

  doc.querySelectorAll<HTMLElement>('input, select, textarea').forEach((el) => {
    setImportantStyle(el, 'max-width', '100%')
  })

  doc.querySelectorAll<HTMLElement>('script, style, template').forEach((el) => {
    setImportantStyle(el, 'display', 'none')
  })
}

function applyFormData() {
  if (props.template?.type !== 'html') return

  expandHtmlFormLayout()
  const data = expandObjectValues({ ...formDataProxy })
  const api = getRuntimeApi()
  if (api?.setData) {
    api.setData(data)
    adjustHtmlFrameHeight()
    return
  }

  const doc = getHtmlDocument()
  if (!doc) return

  queryFormFields(doc).forEach((el) => {
    const key = getFieldKey(el)
    if (!key || !(key in data)) return
    setNativeFieldValue(el, data[key])
  })
  adjustHtmlFrameHeight()
}

function setNativeFieldValue(el: FormFieldElement, value: any) {
  const tagName = el.tagName.toLowerCase()
  const inputType = getInputType(el)

  if (tagName === 'input' && inputType === 'checkbox') {
    const input = el as HTMLInputElement
    if (Array.isArray(value)) {
      input.checked = value.map(String).includes(input.value)
    } else if (typeof value === 'boolean') {
      input.checked = value
    } else {
      input.checked = String(value) === input.value
    }
    return
  }

  if (tagName === 'input' && inputType === 'radio') {
    const input = el as HTMLInputElement
    input.checked = String(value) === input.value
    return
  }

  if (tagName === 'select' && (el as HTMLSelectElement).multiple && Array.isArray(value)) {
    const select = el as HTMLSelectElement
    Array.from(select.options).forEach((option) => {
      option.selected = value.map(String).includes(option.value)
    })
    return
  }

  if (isContentEditableField(el)) {
    el.textContent = value != null ? String(value) : ''
    return
  }

  if ('value' in el) {
    ;(el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value =
      value != null ? String(value) : ''
  } else {
    el.textContent = value != null ? String(value) : ''
  }
}

function applyDisabled() {
  if (props.template?.type !== 'html') return

  const api = getRuntimeApi()
  if (api?.setDisabled) {
    api.setDisabled(props.disabled)
    return
  }

  const doc = getHtmlDocument()
  if (!doc) return

  doc.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>(
    'input, select, textarea, button'
  ).forEach((el) => {
    el.disabled = props.disabled
  })
}

async function getFormData(): Promise<Record<string, any>> {
  if (!props.template) return {}

  if (props.template.type === 'vform' && vFormRef.value) {
    try {
      return await vFormRef.value.getFormData()
    } catch {
      return { ...formDataProxy }
    }
  }

  if (props.template.type === 'html') {
    const api = getRuntimeApi()
    if (api?.validate) {
      const valid = await api.validate()
      if (!valid) {
        throw new Error('表单校验未通过')
      }
    }

    const nativeData = collectNativeFormData()
    if (api?.getData) {
      const apiData = await api.getData()
      if (apiData && typeof apiData === 'object') {
        return { ...nativeData, ...apiData }
      }
      return nativeData
    }
    return nativeData
  }

  return {}
}

function collectNativeFormData(): Record<string, any> {
  const doc = getHtmlDocument()
  if (!doc) return {}

  const data: Record<string, any> = {}
  const fields = queryFormFields(doc)
  const checkboxGroups = new Map<string, HTMLInputElement[]>()

  fields.forEach((el) => {
    const key = getFieldKey(el)
    if (!key) return

    const tagName = el.tagName.toLowerCase()
    const inputType = getInputType(el)

    if (tagName === 'input' && inputType === 'checkbox') {
      const group = checkboxGroups.get(key) || []
      group.push(el as HTMLInputElement)
      checkboxGroups.set(key, group)
      return
    }

    if (tagName === 'input' && inputType === 'radio') {
      const input = el as HTMLInputElement
      if (input.checked) {
        data[key] = input.value
      } else if (!(key in data)) {
        data[key] = ''
      }
      return
    }

    if (tagName === 'select' && (el as HTMLSelectElement).multiple) {
      data[key] = Array.from((el as HTMLSelectElement).selectedOptions).map((option) => option.value)
      return
    }

    if (isContentEditableField(el)) {
      data[key] = el.textContent?.trim() || ''
      return
    }

    data[key] = getFieldValue(el)
  })

  checkboxGroups.forEach((group, name) => {
    if (group.length === 1) {
      const checkbox = group[0]
      data[name] = checkbox.checked
      return
    }
    data[name] = group.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value)
  })

  return data
}

function queryFormFields(doc: Document) {
  return Array.from(doc.querySelectorAll<FormFieldElement>(
    [
      'input:not([type="button"]):not([type="submit"]):not([type="reset"])',
      'select',
      'textarea',
      '[contenteditable]:not([contenteditable="false"])',
      '[role="textbox"]',
      '[data-field]',
      '[data-name]',
      '[data-key]'
    ].join(', ')
  )).filter((el) => isCollectableField(el))
}

function getFieldKey(el: FormFieldElement): string {
  const configuredKey = getConfiguredFieldKey(el)
  if (configuredKey) return configuredKey

  const labelKey = findFieldLabel(el)
  if (labelKey) return labelKey

  return normalizeFieldKey(
    el.getAttribute('placeholder') ||
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    ''
  )
}

function getInputType(el: FormFieldElement): string {
  return (el.getAttribute('type') || '').toLowerCase()
}

function getFieldValue(el: FormFieldElement): any {
  const tagName = el.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
    return (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value
  }
  return el.textContent?.trim() || ''
}

function isContentEditableField(el: FormFieldElement): boolean {
  const attr = el.getAttribute('contenteditable')
  return (el as HTMLElement).isContentEditable || (attr !== null && attr.toLowerCase() !== 'false')
}

function findFieldLabel(el: FormFieldElement): string {
  const doc = getHtmlDocument()
  const id = el.getAttribute('id')
  if (doc && id) {
    const explicitLabel = doc.querySelector(`label[for="${escapeCssSelector(id)}"]`)
    const text = normalizeFieldKey(explicitLabel?.textContent || '')
    if (text) return text
  }

  const wrappingLabel = el.closest('label')
  const wrappingText = normalizeFieldKey(wrappingLabel?.textContent || '')
  if (wrappingText) return wrappingText

  const formGroupLabel = el
    .closest('.form-group, .form-row, .form-item, .field-row, .field-item, .el-form-item, tr, p')
    ?.querySelector('label, .label, .form-label, .field-label, .item-label, .title')
  const groupText = normalizeFieldKey(formGroupLabel?.textContent || '')
  if (groupText) return groupText

  const nearbyText = findNearbyTextLabel(el)
  if (nearbyText) return nearbyText

  let sibling = el.previousElementSibling
  while (sibling) {
    const text = normalizeFieldKey(sibling.textContent || '')
    if (text) return text
    sibling = sibling.previousElementSibling
  }

  return ''
}

function getConfiguredFieldKey(el: FormFieldElement): string {
  const directKey =
    el.getAttribute('name') ||
    el.getAttribute('data-field') ||
    el.getAttribute('data-name') ||
    el.getAttribute('data-key') ||
    el.getAttribute('field') ||
    el.getAttribute('v-model')

  if (directKey) return normalizeFieldKey(directKey)

  const id = el.getAttribute('id')
  return isMeaningfulElementId(id) ? normalizeFieldKey(id || '') : ''
}

function isMeaningfulElementId(id: string | null): boolean {
  if (!id) return false
  return !/^(input|select|textarea|field|el-id|v-\d+)[-_]?\d*$/i.test(id.trim())
}

function isCollectableField(el: FormFieldElement): boolean {
  const tagName = el.tagName.toLowerCase()
  if (tagName === 'input') {
    const inputType = getInputType(el)
    return !['hidden', 'button', 'submit', 'reset', 'image', 'file'].includes(inputType)
  }
  if (tagName === 'select' || tagName === 'textarea') return true
  if (isContentEditableField(el)) return true
  if (el.getAttribute('role') === 'textbox') return true
  return Boolean(getConfiguredFieldKey(el))
}

function findNearbyTextLabel(el: FormFieldElement): string {
  let current: Element | null = el.parentElement
  let depth = 0

  while (current && current.tagName.toLowerCase() !== 'body' && depth < 4) {
    const textBefore = extractTrailingFieldLabel(getTextBeforeElement(current, el))
    if (textBefore) return textBefore

    const previousText = extractTrailingFieldLabel(getPreviousSiblingText(current, el))
    if (previousText) return previousText

    current = current.parentElement
    depth += 1
  }

  return ''
}

function getTextBeforeElement(container: Element, target: Element): string {
  const parts: string[] = []
  collectTextBeforeTarget(container, target, parts)
  return parts.join('')
}

function collectTextBeforeTarget(node: Node, target: Element, parts: string[]): boolean {
  if (node === target) return true

  if (node.nodeType === Node.TEXT_NODE) {
    parts.push(node.textContent || '')
    return false
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false
  }

  const element = node as Element
  if (isIgnoredTextParent(element) && !element.contains(target)) {
    return false
  }

  for (const child of Array.from(node.childNodes)) {
    if (collectTextBeforeTarget(child, target, parts)) {
      return true
    }
  }

  return false
}

function getPreviousSiblingText(container: Element, target: Element): string {
  const parts: string[] = []
  let node = target.previousSibling

  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.unshift(node.textContent || '')
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      if (!isIgnoredTextParent(element)) {
        parts.unshift(element.textContent || '')
      }
    }
    node = node.previousSibling
  }

  if (!parts.join('').trim() && container !== target.parentElement) {
    return getTextBeforeElement(container, target)
  }

  return parts.join('')
}

function isIgnoredTextParent(el: Element): boolean {
  const tagName = el.tagName.toLowerCase()
  return ['script', 'style', 'input', 'select', 'textarea', 'button', 'option'].includes(tagName)
}

function extractTrailingFieldLabel(text: string): string {
  const normalized = normalizeFieldKey(text)
  if (!isLikelyFieldLabel(normalized)) return ''

  const labelMatch = normalized.match(/[\u4e00-\u9fa5\uFF08\uFF09()A-Za-z0-9_]+$/)
  return normalizeFieldKey(labelMatch?.[0] || normalized)
}

function isLikelyFieldLabel(text: string): boolean {
  if (!text) return false
  if (/^(yyyy|mm|dd|yyyy-mm-dd)$/i.test(text)) return false
  return text.length <= 24
}

function normalizeFieldKey(text: string): string {
  return text
    .replace(/[\s\u00a0\u3000]+/g, '')
    .replace(/[:：*＊]+$/g, '')
    .replace(/^[:：*＊]+/g, '')
    .trim()
}

function escapeCssSelector(value: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value)
  }
  return value.replace(/["\\]/g, '\\$&')
}

function expandObjectValues(data: Record<string, any>): Record<string, any> {
  const expanded: Record<string, any> = { ...data }

  Object.values(data).forEach((value) => {
    const parsed = parseMaybeObject(value)
    if (!parsed || Array.isArray(parsed)) return

    Object.entries(parsed).forEach(([key, fieldValue]) => {
      if (!(key in expanded)) {
        expanded[key] = fieldValue
      }
    })
  })

  return expanded
}

function parseMaybeObject(value: any): Record<string, any> | null {
  if (value && typeof value === 'object') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()
  if (!text.startsWith('{') || !text.endsWith('}')) {
    return null
  }

  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function resetForm(): void {
  if (props.template?.type === 'vform' && vFormRef.value) {
    vFormRef.value.resetForm()
  } else if (props.template?.type === 'html') {
    const api = getRuntimeApi()
    if (api?.reset) {
      api.reset()
    } else {
      const doc = getHtmlDocument()
      doc?.querySelectorAll('form').forEach((form) => form.reset())
      applyFormData()
    }
    adjustHtmlFrameHeight()
  }
}

function setFormData(data: Record<string, any>): void {
  Object.keys(formDataProxy).forEach((key) => delete formDataProxy[key])
  Object.assign(formDataProxy, data)
  if (props.template?.type === 'html') {
    applyFormData()
  }
}

defineExpose({
  getFormData,
  resetForm,
  setFormData,
  vFormRef
})
</script>

<style scoped>
.form-renderer {
  width: 100%;
}

.form-renderer-loading,
.form-renderer-empty,
.form-renderer-unknown {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.form-renderer-vform {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.form-renderer-html {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.html-form-frame {
  display: block;
  width: 100%;
  min-height: 320px;
  border: 0;
  background: #fff;
}
</style>
