import { jsPDF } from 'jspdf'
import type { FlatQuestion } from '../data/questions'
import type { Submission } from '../composables/useRoom'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function answerText(q: FlatQuestion['question'], value: unknown): string {
  if (q.type === 'scale') return `${value} / 10`
  if (q.type === 'checkbox') return value ? 'Ja' : 'Nein'
  return String(value)
}

// Small helper around jsPDF so we can flow text and page-break automatically.
function makeWriter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  const maxWidth = pageWidth - margin * 2
  let y = margin

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  function line(text: string, size: number, opts: { bold?: boolean; gap?: number; color?: number } = {}) {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(opts.color ?? 20)
    const wrapped = doc.splitTextToSize(text, maxWidth) as string[]
    ensureSpace(wrapped.length * (size + 4))
    doc.text(wrapped, margin, y)
    y += wrapped.length * (size + 4) + (opts.gap ?? 0)
  }

  function gap(n: number) {
    y += n
  }

  return { line, gap }
}

function writeSubmission(w: ReturnType<typeof makeWriter>, s: Submission, questions: FlatQuestion[]) {
  w.line(s.name || 'Ohne Namen', 15, { bold: true, gap: 2 })
  w.line(`Abgegeben am ${formatDate(s.ts)}`, 9, { color: 130, gap: 8 })

  for (const { question } of questions) {
    const a = s.answers[question.id]
    if (a === undefined || a === '') continue
    w.line(question.text, 10, { bold: true, gap: 1 })
    w.line(answerText(question, a), 11, { gap: 6 })
  }
}

// One participant only. Used by the tutor for a single person and by participants for themselves.
export function exportSubmissionPdf(code: string, s: Submission, questions: FlatQuestion[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const w = makeWriter(doc)
  w.line('Job Kompass', 22, { bold: true, gap: 6 })
  w.line(`Raumcode: ${code}`, 11, { color: 130, gap: 16 })
  writeSubmission(w, s, questions)
  doc.save(`job-kompass-${(s.name || 'antworten').toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// All participants in one document, with averages on the cover.
export function exportAllPdf(code: string, submissions: Submission[], questions: FlatQuestion[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const w = makeWriter(doc)

  w.line('Job Kompass', 22, { bold: true, gap: 6 })
  w.line(`Raumcode: ${code}`, 12)
  w.line(`Erstellt am: ${formatDate(Date.now())}`, 12)
  w.line(`Teilnehmende: ${submissions.length}`, 12, { gap: 16 })

  w.line('Durchschnittswerte (1 bis 10)', 14, { bold: true, gap: 8 })
  for (const { question } of questions) {
    if (question.type !== 'scale') continue
    const values = submissions
      .map((s) => s.answers[question.id])
      .filter((v): v is number => typeof v === 'number')
    if (values.length === 0) continue
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    w.line(`${question.text}  =  ${avg.toFixed(1)} / 10`, 11, { gap: 2 })
  }
  w.gap(12)

  submissions.forEach((s, idx) => {
    if (idx > 0) w.gap(8)
    writeSubmission(w, s, questions)
  })

  doc.save(`job-kompass-${code}-alle.pdf`)
}
