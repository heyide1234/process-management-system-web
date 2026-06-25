import type { FormType } from './deployment'

const VFORM_PREFIX = 'vform:'
const HTML_PREFIX = 'html:'
const FORMKEY_STORAGE_KEY = 'form_designer_pending_formkey'
export const FORM_SNAPSHOT_VARIABLE_PREFIX = '__pm_form_snapshot__'
export const FORM_KEY_VARIABLE = '__pm_form_key'
export const FORM_TYPE_VARIABLE = '__pm_form_type'
export const FORM_TASK_DEFINITION_KEY_VARIABLE = '__pm_task_definition_key'

export interface FormKeyInfo {
  type: FormType
  templateId: string
}

export interface FormMeta {
  formKey?: string
  formType: FormType
  createdAt?: string
  processDefinitionKey?: string
  taskDefinitionKey?: string
}

export interface FormSubmissionMeta {
  formKey?: string
  formType?: FormType
  taskDefinitionKey?: string
  taskId?: string
  processDefinitionKey?: string
  source?: 'start' | 'task' | string
}

export const META_FILENAME = 'meta.json'

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function generateFormKey(type: FormType): string {
  return buildFormKey(type, generateId())
}

export function buildFormKey(type: FormType, templateId: string): string {
  const prefix = type === 'vform' ? VFORM_PREFIX : HTML_PREFIX
  return `${prefix}${templateId}`
}

export function parseFormKey(formKey: string | null | undefined): FormKeyInfo | null {
  if (!formKey) return null

  if (formKey.startsWith(VFORM_PREFIX)) {
    return {
      type: 'vform',
      templateId: formKey.slice(VFORM_PREFIX.length)
    }
  }

  if (formKey.startsWith(HTML_PREFIX)) {
    return {
      type: 'html',
      templateId: formKey.slice(HTML_PREFIX.length)
    }
  }

  return null
}

export function savePendingFormKey(formKey: string) {
  localStorage.setItem(FORMKEY_STORAGE_KEY, formKey)
}

export function popPendingFormKey(): string | null {
  const key = localStorage.getItem(FORMKEY_STORAGE_KEY)
  if (key) {
    localStorage.removeItem(FORMKEY_STORAGE_KEY)
    return key
  }
  return null
}

export function getFormTypeSource(type: FormType): string {
  return type === 'vform' ? 'form-designer-vform' : 'form-designer-html'
}

export function buildFormSubmissionData(
  data: Record<string, any>,
  meta: FormSubmissionMeta = {}
): Record<string, any> {
  const cleanedData = cleanSubmissionData(data)
  const snapshotScope =
    [meta.taskDefinitionKey, meta.taskId].filter(Boolean).join('_') ||
    meta.processDefinitionKey ||
    meta.source ||
    'start'
  const snapshotKey = `${FORM_SNAPSHOT_VARIABLE_PREFIX}${normalizeVariableName(snapshotScope)}`

  return {
    ...cleanedData,
    [FORM_KEY_VARIABLE]: meta.formKey || '',
    [FORM_TYPE_VARIABLE]: meta.formType || '',
    [FORM_TASK_DEFINITION_KEY_VARIABLE]: meta.taskDefinitionKey || '',
    [snapshotKey]: cleanedData
  }
}

export function hasFormSubmissionData(data: Record<string, any>): boolean {
  return Object.keys(cleanSubmissionData(data)).length > 0
}

function cleanSubmissionData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const key in data || {}) {
    const value = data[key]
    if (!key || value === undefined || typeof value === 'function') continue
    cleaned[key] = value
  }
  return cleaned
}

function normalizeVariableName(value: string): string {
  const normalized = String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || 'form'
}

export function convertToCamundaVariables(data: Record<string, any>): Record<string, { value: any; type?: string }> {
  const variables: Record<string, { value: any; type?: string }> = {}
  for (const key in data) {
    const value = data[key]
    let type: string | undefined

    if (value === undefined || typeof value === 'function') {
      continue
    }

    if (value === null) {
      variables[key] = { value: null }
      continue
    }

    if (typeof value === 'string') {
      type = 'String'
    } else if (typeof value === 'number') {
      type = Number.isInteger(value)
        ? (value >= -2147483648 && value <= 2147483647 ? 'Integer' : 'Long')
        : 'Double'
    } else if (typeof value === 'boolean') {
      type = 'Boolean'
    } else if (value instanceof Date) {
      type = 'Date'
    } else if (Array.isArray(value) || typeof value === 'object') {
      variables[key] = { value: JSON.stringify(value), type: 'String' }
      continue
    }

    variables[key] = { value, type }
  }
  return variables
}

const CAMUNDA_FORM_KEY_NS = 'http://camunda.org/schema/1.0/bpmn'
const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'

export function extractFormKeyFromBpmnXml(xml: string, taskDefinitionKey: string): FormKeyInfo | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const userTask = doc.querySelector(`userTask[id="${taskDefinitionKey}"]`)
    if (!userTask) return null

    const formKey = userTask.getAttributeNS(CAMUNDA_FORM_KEY_NS, 'formKey')
    if (formKey) return parseFormKey(formKey)

    const extElements = userTask.getElementsByTagNameNS(BPMN_NS, 'extensionElements')
    if (extElements.length > 0) {
      const extEl = extElements[0]
      const formDataEls = findElementsByLocalName(extEl, ['formData', 'FormData'])
      for (let i = 0; i < formDataEls.length; i++) {
        const key = formDataEls[i].getAttribute('formKey')
        if (key) return parseFormKey(key)
      }
      const formRefs = findElementsByLocalName(extEl, ['formRef'])
      for (let i = 0; i < formRefs.length; i++) {
        const key = formRefs[i].getAttribute('key')
        if (key) return parseFormKey(key)
      }
      const formKeys = findElementsByLocalName(extEl, ['formKey'])
      for (let i = 0; i < formKeys.length; i++) {
        const key = formKeys[i].textContent?.trim()
        if (key) return parseFormKey(key)
      }
    }

    return null
  } catch {
    return null
  }
}

function findElementsByLocalName(root: Element, names: string[]) {
  return Array.from(root.getElementsByTagName('*')).filter((el) => names.includes(el.localName))
}

export function extractStartFormKeyFromBpmnXml(xml: string): FormKeyInfo | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const startEvents = doc.getElementsByTagNameNS(BPMN_NS, 'startEvent')

    for (let i = 0; i < startEvents.length; i++) {
      const startEvent = startEvents[i]
      const formKey = startEvent.getAttributeNS(CAMUNDA_FORM_KEY_NS, 'formKey')
      if (formKey) return parseFormKey(formKey)
    }

    return null
  } catch {
    return null
  }
}
