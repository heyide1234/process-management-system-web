/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vform3-builds' {
  import { Component, Plugin } from 'vue'
  
  export const VFormDesigner: Component
  export const VFormRender: Component
  
  const vform: Plugin
  export default vform
}

declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnModeler {
    constructor(options: {
      container: HTMLElement
      propertiesPanel?: { parent: HTMLElement }
      moddleExtensions?: Record<string, unknown>
      additionalModules?: unknown[]
      keyboard?: { bindTo: HTMLElement | Document }
    })
    importXML(xml: string): Promise<{ warnings: string[] }>
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>
    saveSVG(): Promise<{ svg: string }>
    createDiagram(): Promise<void>
    destroy(): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
    get(module: string): unknown
  }
}

declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: Record<string, unknown>
  export const BpmnPropertiesProviderModule: Record<string, unknown>
  export const CamundaPlatformPropertiesProviderModule: Record<string, unknown>
  export const CamundaPlatformTooltipProvider: Record<string, unknown>
}

declare module 'camunda-bpmn-moddle/resources/camunda' {
  const descriptor: Record<string, unknown>
  export default descriptor
}

declare module 'camunda-bpmn-js-behaviors/lib/camunda-platform' {
  const module: Record<string, unknown>
  export default module
}