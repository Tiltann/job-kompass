export type ScaleQuestion = {
  id: string
  type: 'scale'
  text: string
  lowLabel: string
  highLabel: string
}

export type TextQuestion = {
  id: string
  type: 'text'
  text: string
  placeholder?: string
}

export type CheckboxQuestion = {
  id: string
  type: 'checkbox'
  text: string
}

export type Question = ScaleQuestion | TextQuestion | CheckboxQuestion

export type Category = {
  title: string
  icon: string
  questions: Question[]
}

const lowHigh = { lowLabel: 'gar nicht', highLabel: 'voll und ganz' }

export const categories: Category[] = [
  {
    title: 'Selbstvertrauen & Zuversicht',
    icon: 'confidence',
    questions: [
      { id: 'selbstvertrauen', type: 'scale', text: 'Wie sehr vertraust du im Moment auf deine eigenen Fähigkeiten?', ...lowHigh },
      { id: 'zuversicht', type: 'scale', text: 'Wie zuversichtlich blickst du in deine Zukunft?', ...lowHigh },
      { id: 'selbstwert', type: 'scale', text: 'Wie zufrieden bist du gerade mit dir selbst?', ...lowHigh },
    ],
  },
  {
    title: 'Gesundheit & Belastbarkeit',
    icon: 'health',
    questions: [
      { id: 'koerper', type: 'scale', text: 'Wie geht es dir körperlich?', lowLabel: 'sehr schlecht', highLabel: 'sehr gut' },
      { id: 'psyche', type: 'scale', text: 'Wie belastbar fühlst du dich psychisch?', ...lowHigh },
      { id: 'energie', type: 'scale', text: 'Wie viel Energie hast du an einem normalen Tag?', lowLabel: 'sehr wenig', highLabel: 'sehr viel' },
    ],
  },
  {
    title: 'Alltag & Struktur',
    icon: 'routine',
    questions: [
      { id: 'tagesstruktur', type: 'scale', text: 'Wie gut kommst du mit deiner Tagesstruktur zurecht?', lowLabel: 'gar nicht', highLabel: 'sehr gut' },
      { id: 'selbststaendig', type: 'scale', text: 'Wie selbstständig bewältigst du deinen Alltag?', ...lowHigh },
      { id: 'aufgaben', type: 'scale', text: 'Wie gut gelingt es dir, anstehende Aufgaben zu erledigen?', lowLabel: 'gar nicht', highLabel: 'sehr gut' },
    ],
  },
  {
    title: 'Soziale Kontakte & Unterstützung',
    icon: 'social',
    questions: [
      { id: 'umfeld', type: 'scale', text: 'Wie zufrieden bist du mit deinen sozialen Kontakten?', ...lowHigh },
      { id: 'unterstuetzung', type: 'scale', text: 'Wie gut fühlst du dich von anderen unterstützt?', ...lowHigh },
      { id: 'einsamkeit', type: 'scale', text: 'Wie selten fühlst du dich einsam?', lowLabel: 'oft einsam', highLabel: 'nie einsam' },
    ],
  },
  {
    title: 'Arbeit & Beruf',
    icon: 'work',
    questions: [
      { id: 'motivation_beruf', type: 'scale', text: 'Wie motiviert bist du für deinen (Wieder-)Einstieg ins Berufsleben?', ...lowHigh },
      { id: 'zutrauen_beruf', type: 'scale', text: 'Wie sehr traust du dir berufliche Anforderungen zu?', ...lowHigh },
      { id: 'konzentration', type: 'scale', text: 'Wie gut kannst du dich über längere Zeit konzentrieren?', lowLabel: 'gar nicht', highLabel: 'sehr gut' },
    ],
  },
  {
    title: 'Stress & Emotionen',
    icon: 'stress',
    questions: [
      { id: 'stress', type: 'scale', text: 'Wie gut kommst du mit Stress klar?', lowLabel: 'gar nicht', highLabel: 'sehr gut' },
      { id: 'rueckschlaege', type: 'scale', text: 'Wie gut steckst du Rückschläge weg?', lowLabel: 'gar nicht', highLabel: 'sehr gut' },
      { id: 'innere_ruhe', type: 'scale', text: 'Wie ausgeglichen fühlst du dich zurzeit?', lowLabel: 'gar nicht', highLabel: 'sehr ausgeglichen' },
    ],
  },
  {
    title: 'Motivation & Ziele',
    icon: 'goals',
    questions: [
      { id: 'motivation', type: 'scale', text: 'Wie motiviert bist du allgemein, etwas zu verändern?', ...lowHigh },
      { id: 'ziele', type: 'scale', text: 'Wie klar sind dir deine nächsten Ziele?', lowLabel: 'gar nicht klar', highLabel: 'sehr klar' },
    ],
  },
  {
    title: 'Finanzen & Sicherheit',
    icon: 'money',
    questions: [
      { id: 'finanzen', type: 'scale', text: 'Wie sicher fühlst du dich finanziell?', ...lowHigh },
    ],
  },
  {
    title: 'Offene Fragen',
    icon: 'open',
    questions: [
      { id: 'stolz', type: 'text', text: 'Worauf bist du im Moment stolz?', placeholder: 'Schreib so viel oder so wenig du magst ...' },
      { id: 'schwer', type: 'text', text: 'Was fällt dir aktuell am schwersten?' },
      { id: 'naechster_schritt', type: 'text', text: 'Was brauchst du als Nächstes für deinen Weg?' },
    ],
  },
]

export const allQuestions: Question[] = categories.flatMap((c) => c.questions)
export const scaleQuestions = allQuestions.filter((q): q is ScaleQuestion => q.type === 'scale')

export type FlatQuestion = {
  question: Question
  categoryTitle: string
  categoryIcon: string
}

// One flat list so the form can step through questions one by one.
export const flatQuestions: FlatQuestion[] = categories.flatMap((c) =>
  c.questions.map((question) => ({
    question,
    categoryTitle: c.title,
    categoryIcon: c.icon,
  })),
)

export const CUSTOM_CATEGORY = 'Eigene Fragen'

// Wraps a custom question the tutor added into the same flat shape.
export function asCustomFlat(question: Question): FlatQuestion {
  return { question, categoryTitle: CUSTOM_CATEGORY, categoryIcon: 'custom' }
}
