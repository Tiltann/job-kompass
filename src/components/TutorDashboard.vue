<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link, TriangleAlert, FileText, FileSpreadsheet, ClipboardCheck, Users, CircleCheck, CircleDashed, Trash2, BarChart3, Eye, X } from 'lucide-vue-next'
import { useRoom, type Submission } from '../composables/useRoom'
import type { FlatQuestion } from '../data/questions'
import { categoryIcons } from '../lib/icons'
import { exportAllPdf, exportSubmissionPdf } from '../lib/exportPdf'
import { exportCsv } from '../lib/exportCsv'

const emit = defineEmits<{ ended: [] }>()

const room = useRoom()
const showEndConfirm = ref(false)
const password = ref('')
const passwordError = ref('')
const viewing = ref<Submission | null>(null)

const averages = computed(() =>
  room.activeQuestions.value
    .filter((q) => q.question.type === 'scale')
    .map((q) => {
      const values = room.submissions
        .map((s) => s.answers[q.question.id])
        .filter((v): v is number => typeof v === 'number')
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
      return { text: q.question.text, avg }
    }),
)

// active questions grouped by their category, for the detail view
const grouped = computed(() => {
  const out: { title: string; icon: string; questions: FlatQuestion[] }[] = []
  for (const fq of room.activeQuestions.value) {
    let g = out.find((x) => x.title === fq.categoryTitle)
    if (!g) {
      g = { title: fq.categoryTitle, icon: fq.categoryIcon, questions: [] }
      out.push(g)
    }
    g.questions.push(fq)
  }
  return out
})

function answerLabel(q: FlatQuestion['question'], value: unknown): string {
  if (value === undefined || value === '') return ''
  if (q.type === 'scale') return `${value} / 10`
  if (q.type === 'checkbox') return value ? 'Ja' : 'Nein'
  return String(value)
}

function submissionFor(id: string): Submission | undefined {
  return room.submissions.find((s) => s.id === id)
}

function openDetail(id: string) {
  const s = submissionFor(id)
  if (s) viewing.value = s
}

function tryEnd() {
  passwordError.value = ''
  if (!room.checkPassword(password.value)) {
    passwordError.value = 'Falsches Passwort.'
    return
  }
  room.endSession()
  emit('ended')
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <header class="mb-6 rounded-2xl bg-teal-600 p-6 text-white">
      <p class="flex items-center gap-2 text-base opacity-90"><Link class="h-5 w-5" /> Raumcode zum Teilen</p>
      <p class="text-5xl font-bold tracking-widest">{{ room.code.value }}</p>
      <p class="mt-3 flex items-start gap-2 text-base opacity-90">
        <TriangleAlert class="h-5 w-5 shrink-0" />
        <span>Lass dieses Fenster offen, solange der Raum laufen soll. Beim Schließen ist alles weg.</span>
      </p>
    </header>

    <div class="mb-6 grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div class="flex items-center gap-2">
          <ClipboardCheck class="h-7 w-7 text-teal-600" />
          <p class="text-4xl font-bold">{{ room.submissions.length }}</p>
        </div>
        <p class="mt-1 text-base text-zinc-500">Abgaben</p>
      </div>
      <div class="rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div class="flex items-center gap-2">
          <Users class="h-7 w-7 text-teal-600" />
          <p class="text-4xl font-bold">{{ room.connectedCount() }}</p>
        </div>
        <p class="mt-1 text-base text-zinc-500">Im Raum</p>
      </div>
    </div>

    <section class="mb-8">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-bold"><Users class="h-5 w-5 text-teal-600" /> Teilnehmende</h2>
      <ul v-if="room.participants.length" class="space-y-2">
        <li
          v-for="p in room.participants"
          :key="p.id"
          class="flex items-center gap-3 rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 text-lg ring-1 ring-zinc-200 dark:ring-zinc-700"
        >
          <CircleCheck v-if="p.submitted" class="h-6 w-6 shrink-0 text-teal-600" />
          <CircleDashed v-else class="h-6 w-6 shrink-0 text-zinc-400" />
          <span class="flex-1">{{ p.name || 'Ohne Namen' }}</span>
          <template v-if="p.submitted">
            <button
              class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-200 dark:text-teal-300 dark:ring-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950"
              @click="openDetail(p.id)"
            >
              <Eye class="h-4 w-4" /> Ansehen
            </button>
            <button
              class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200 dark:text-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              @click="exportSubmissionPdf(room.code.value, submissionFor(p.id)!, room.activeQuestions.value)"
            >
              <FileText class="h-4 w-4" /> PDF
            </button>
          </template>
          <span v-else class="text-sm text-zinc-400">füllt aus ...</span>
        </li>
      </ul>
      <p v-else class="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-base text-zinc-500">
        Noch niemand da. Teile den Raumcode oben.
      </p>
    </section>

    <section v-if="room.submissions.length" class="mb-8">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-bold"><BarChart3 class="h-5 w-5 text-teal-600" /> Durchschnitt</h2>
      <div class="space-y-2 rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div v-for="a in averages" :key="a.text" class="flex items-center gap-3 text-sm">
          <span class="flex-1 text-zinc-600 dark:text-zinc-300">{{ a.text }}</span>
          <div class="h-2 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div class="h-full bg-teal-500" :style="{ width: ((a.avg ?? 0) / 10) * 100 + '%' }"></div>
          </div>
          <span class="w-10 text-right font-semibold">{{ a.avg !== null ? a.avg.toFixed(1) : '-' }}</span>
        </div>
      </div>
    </section>

    <div class="space-y-3">
      <div class="grid gap-3 sm:grid-cols-2">
        <button
          :disabled="!room.submissions.length"
          class="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-5 text-lg font-bold text-white transition hover:bg-teal-700 disabled:opacity-40"
          @click="exportAllPdf(room.code.value, room.submissions, room.activeQuestions.value)"
        >
          <FileText class="h-6 w-6" /> Alle als PDF
        </button>
        <button
          :disabled="!room.submissions.length"
          class="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-zinc-900 px-5 py-5 text-lg font-bold text-teal-700 dark:text-teal-300 ring-2 ring-teal-200 dark:ring-teal-800 transition hover:bg-teal-50 dark:hover:bg-teal-950 disabled:opacity-40"
          @click="exportCsv(room.code.value, room.submissions, room.activeQuestions.value)"
        >
          <FileSpreadsheet class="h-6 w-6" /> Alle als CSV
        </button>
      </div>

      <button
        v-if="!showEndConfirm"
        class="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold text-rose-500 ring-2 ring-rose-200 dark:ring-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950"
        @click="showEndConfirm = true"
      >
        <Trash2 class="h-5 w-5" /> Sitzung beenden und Daten löschen
      </button>

      <div
        v-else
        class="space-y-3 rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-2 ring-rose-200 dark:ring-rose-900"
      >
        <p class="text-base">
          Zum Beenden bitte das Passwort der Leitung eingeben. Danach sind alle Antworten
          unwiderruflich gelöscht. Exportiere vorher, was du behalten möchtest.
        </p>
        <input
          v-model="password"
          type="password"
          placeholder="Passwort"
          class="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-3 text-lg outline-none focus:border-rose-400"
          @keyup.enter="tryEnd"
        />
        <p v-if="passwordError" class="flex items-center gap-2 text-base text-rose-500"><TriangleAlert class="h-5 w-5" /> {{ passwordError }}</p>
        <div class="flex gap-3">
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-lg font-semibold text-white hover:bg-rose-600"
            @click="tryEnd"
          >
            <Trash2 class="h-5 w-5" /> Endgültig beenden
          </button>
          <button
            class="rounded-xl px-4 py-3 text-base text-zinc-400 hover:text-zinc-600"
            @click="showEndConfirm = false; password = ''; passwordError = ''"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- detail view of one participant -->
  <div
    v-if="viewing"
    class="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    @click.self="viewing = null"
  >
    <div class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-zinc-50 dark:bg-zinc-950 p-6 sm:rounded-3xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">{{ viewing.name || 'Ohne Namen' }}</h2>
        <button class="rounded-full p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800" @click="viewing = null">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="space-y-6">
        <section v-for="cat in grouped" :key="cat.title">
          <h3 class="mb-2 flex items-center gap-2 text-base font-bold text-teal-600">
            <component :is="categoryIcons[cat.icon]" class="h-5 w-5" :stroke-width="1.75" />
            {{ cat.title }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="fq in cat.questions"
              :key="fq.question.id"
              class="rounded-xl bg-white dark:bg-zinc-900 p-3 ring-1 ring-zinc-200 dark:ring-zinc-800"
            >
              <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ fq.question.text }}</p>
              <p class="mt-0.5 text-lg font-semibold">
                <span v-if="!answerLabel(fq.question, viewing.answers[fq.question.id])" class="text-zinc-400">keine Angabe</span>
                <span v-else>{{ answerLabel(fq.question, viewing.answers[fq.question.id]) }}</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <button
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-lg font-bold text-white hover:bg-teal-700"
        @click="exportSubmissionPdf(room.code.value, viewing, room.activeQuestions.value)"
      >
        <FileText class="h-6 w-6" /> Diese Antworten als PDF
      </button>
    </div>
  </div>
</template>
