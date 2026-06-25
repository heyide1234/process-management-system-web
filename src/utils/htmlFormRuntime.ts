const BASE_CSS = [
  'html, body {',
  '  min-height: 100%;',
  '}',
  'body {',
  '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
  '  padding: 20px;',
  '  margin: 0;',
  '  display: block;',
  '  width: 100%;',
  '  max-width: none;',
  '  color: #333;',
  '  line-height: 1.6;',
  '  background: #fff;',
  '  box-sizing: border-box;',
  '  overflow-x: auto;',
  '}',
  'script, style, template { display: none !important; }',
  '*, *::before, *::after { box-sizing: border-box; }',
  'img, svg, canvas, video { max-width: 100%; }',
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
  '  width: 100%;',
  '  max-width: 100%;',
  '  min-width: 0;',
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
  'table { border-collapse: collapse; min-width: 100%; table-layout: auto; }',
  'table td, table th {',
  '  border: 1px solid #dcdfe6;',
  '  padding: 8px 12px;',
  '  text-align: left;',
  '}',
  'table th { background: #f5f7fa; font-weight: 500; }',
  'hr { border: none; border-top: 1px solid #e4e7ed; margin: 16px 0; }',
  '.container, .wrapper, .content, .main, .page, .sheet, .paper,',
  '.card, .form-card, .form-container, .form-wrapper, .form-content,',
  '.table-container, .table-wrapper, .table-scroll, .scroll-container {',
  '  width: 100% !important;',
  '  max-width: none !important;',
  '  margin-left: 0 !important;',
  '  margin-right: 0 !important;',
  '  box-sizing: border-box !important;',
  '}',
  '.table-container, .table-wrapper, .table-scroll, .scroll-container {',
  '  max-height: none !important;',
  '  overflow-x: visible !important;',
  '}'
].join('\n')

const STYLE_TAG = '<style data-process-form-runtime>\n' + BASE_CSS + '\n</style>'
const META_CHARSET = '<meta charset="UTF-8">'

export function wrapHtmlFormDocument(content: string): string {
  const html = stripVisibleHtmlFormApiScripts(content || '')
  const hasDocumentShell = /<!doctype\s+html/i.test(html) || /<html[\s>]/i.test(html)

  if (hasDocumentShell) {
    return ensureRuntimeHead(html)
  }

  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    META_CHARSET,
    STYLE_TAG,
    '</head>',
    '<body>',
    html,
    '</body>',
    '</html>'
  ].join('\n')
}

export function stripVisibleHtmlFormApiScripts(content: string): string {
  const html = content || ''
  const scripts: string[] = []
  const protectedHtml = html.replace(/<script\b[\s\S]*?<\/script>/gi, (match) => {
    const index = scripts.push(match) - 1
    return `%%PROCESS_FORM_SCRIPT_${index}%%`
  })

  const cleanedHtml = protectedHtml
    .replace(/&lt;\s*script\b[\s\S]*?window\.htmlFormApi[\s\S]*?&lt;\s*\/\s*script\s*&gt;?/gi, '')
    .replace(/&amp;lt;\s*script\b[\s\S]*?window\.htmlFormApi[\s\S]*?&amp;lt;\s*\/\s*script\s*&amp;gt;?/gi, '')
    .replace(/;?\s*\(function\s*\([^)]*\)\s*\{[\s\S]*?window\.htmlFormApi[\s\S]*?\}\)\s*\(\s*\)\s*;?/gi, '')

  return cleanedHtml.replace(/%%PROCESS_FORM_SCRIPT_(\d+)%%/g, (_, index) => scripts[Number(index)] || '')
}

function ensureRuntimeHead(html: string): string {
  let withHead = ensureMetaCharset(html)

  if (/<style[^>]+data-process-form-runtime/i.test(withHead)) {
    return withHead
  }

  if (/<\/head>/i.test(withHead)) {
    return withHead.replace(/<\/head>/i, STYLE_TAG + '\n</head>')
  }

  return withHead.replace(/<html([^>]*)>/i, '<html$1>\n<head>\n' + META_CHARSET + '\n' + STYLE_TAG + '\n</head>')
}

function ensureMetaCharset(html: string): string {
  if (/<meta[^>]+charset\s*=/i.test(html)) return html

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, '<head$1>\n' + META_CHARSET)
  }

  return html.replace(/<html([^>]*)>/i, '<html$1>\n<head>\n' + META_CHARSET + '\n</head>')
}
