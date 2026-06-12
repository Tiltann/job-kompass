<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowLeft, ArrowRight, Check, PartyPopper, FileText } from 'lucide-vue-next'
import { categoryIcons } from '../lib/icons'
import { exportSubmissionPdf } from '../lib/exportPdf'
import { useRoom, type Answers, type Submission } from '../composables/useRoom'
import QuestionField from './QuestionField.vue'

const room = useRoom()
const name = sessionStorage.getItem('participantName') || ''
const submitted = ref(false)
const mySubmission = ref<Submission | null>(null)

const answers = reactive<Answers>({})
const step = ref(0)
const questions = room.activeQuestions
const total = computed(() => questions.value.length)

const current = computed(() => questions.value[step.value])
const isLast = computed(() => step.value === total.value - 1)
const progress = computed(() => Math.round(((step.value + 1) / total.value) * 100))

// scale and yes/no questions need an answer before moving on, text is optional
const canAdvance = computed(() => {
  const q = current.value.question
  if (q.type === 'text') return true
  if (q.type === 'checkbox') return typeof answers[q.id] === 'boolean'
  return typeof answers[q.id] === 'number'
})

function next() {
  if (!canAdvance.value) return
  if (isLast.value) {
    const payload = { ...answers }
    room.submit(name, payload)
    mySubmission.value = { id: 'self', name, answers: payload, ts: Date.now() }
    submitted.value = true
    return
  }
  step.value++
}

function back() {
  if (step.value > 0) step.value--
}
</script>

<template>
  <div v-if="!submitted" class="mx-auto flex min-h-[80vh] max-w-xl flex-col">
    <header class="mb-6">
      <div class="mb-2 flex items-center justify-between text-base text-zinc-500 dark:text-zinc-400">
        <span>Frage {{ step + 1 }} von {{ total }}</span>
        <span>{{ name }}</span>
      </div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div class="h-full rounded-full bg-teal-500 transition-all duration-300" :style="{ width: progress + '%' }"></div>
      </div>
    </header>

    <div class="flex flex-1 flex-col justify-center py-4">
      <div class="mb-5 flex items-center gap-3 text-teal-600">
        <component :is="categoryIcons[current.categoryIcon]" class="h-7 w-7" :stroke-width="1.75" />
        <span class="text-lg font-semibold">{{ current.categoryTitle }}</span>
      </div>

      <h1 class="mb-8 text-2xl font-bold leading-snug sm:text-3xl">{{ current.question.text }}</h1>

      <QuestionField :question="current.question" v-model="answers[current.question.id]" />
    </div>

    <div class="mt-6 flex items-center gap-3">
      <button
        v-if="step > 0"
        type="button"
        class="flex items-center justify-center gap-1 rounded-2xl px-5 py-4 text-lg font-semibold text-zinc-600 ring-2 ring-zinc-200 dark:text-zinc-300 dark:ring-zinc-700 hover:ring-teal-400"
        @click="back"
      >
        <ArrowLeft class="h-5 w-5" /> Zurück
      </button>
      <button
        type="button"
        :disabled="!canAdvance"
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="next"
      >
        <template v-if="isLast">
          <Check class="h-6 w-6" /> Absenden
        </template>
        <template v-else>
          Weiter <ArrowRight class="h-6 w-6" />
        </template>
      </button>
    </div>
    <p v-if="!canAdvance" class="mt-3 text-center text-base text-zinc-400">
      Bitte tippe auf eine Zahl, um weiterzugehen.
    </p>
  </div>

  <div v-else class="mx-auto max-w-md py-20 text-center">
    <PartyPopper class="mx-auto mb-4 h-16 w-16 text-teal-600" :stroke-width="1.5" />
    <h1 class="text-3xl font-bold">Danke, {{ name }}!</h1>
    <p class="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
      Deine Antworten wurden übermittelt. Du kannst dieses Fenster jetzt schließen.
    </p>
    <button
      v-if="mySubmission"
      class="mx-auto mt-6 flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 text-lg font-bold text-white hover:bg-teal-700"
      @click="exportSubmissionPdf(room.code.value, mySubmission, questions)"
    >
      <FileText class="h-6 w-6" /> Meine Antworten als PDF speichern
    </button>
  </div>
</template>
