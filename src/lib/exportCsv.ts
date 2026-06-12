import type { FlatQuestion } from '../data/questions'
import type { Submission } from '../composables/useRoom'

function cell(value: string | number | boolean | undefined): string {
  if (value === undefined) return ''
  const text = String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ')
  return `"${text}"`
}

function answerCell(q: FlatQuestion['question'], value: unknown): string {
  if (value === undefined || value === '') return ''
  if (q.type === 'checkbox') return cell(value ? 'Ja' : 'Nein')
  return cell(value as string | number)
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('de-DE')
}

// One row per participant. Semicolon separated so German Excel opens it cleanly.
export function exportCsv(code: string, submissions: Submission[], questions: FlatQuestion[]) {
  const header = ['Name', 'Zeitpunkt', ...questions.map((q) => q.question.text)]
  const rows = submissions.map((s) => [
    cell(s.name || 'Ohne Namen'),
    cell(formatDate(s.ts)),
    ...questions.map((q) => answerCell(q.question, s.answers[q.question.id])),
  ])

  const lines = [header.map(cell).join(';'), ...rows.map((r) => r.join(';'))]
  // BOM so Excel detects UTF-8 and shows umlauts correctly
  const csv = '﻿' + lines.join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `job-kompass-${code}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
