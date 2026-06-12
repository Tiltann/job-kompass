<script setup lang="ts">
import { ref } from 'vue'
import { Star, Plus, Trash2, Play, Sliders, ToggleLeft, Type } from 'lucide-vue-next'
import { asCustomFlat, flatQuestions, type Question } from '../data/questions'
import { useRoom } from '../composables/useRoom'

const emit = defineEmits<{ ready: [] }>()

const room = useRoom()
const custom = ref<Question[]>([])
const newType = ref<'scale' | 'checkbox' | 'text'>('scale')
const newText = ref('')
let counter = 0

const typeOptions = [
  { value: 'scale', label: 'Skala 1-10', icon: Sliders },
  { value: 'checkbox', label: 'Ja / Nein', icon: ToggleLeft },
  { value: 'text', label: 'Freitext', icon: Type },
] as const

function add() {
  const text = newText.value.trim()
  if (!text) return
  const id = `custom-${counter++}`
  if (newType.value === 'scale') {
    custom.value.push({ id, type: 'scale', text, lowLabel: 'niedrig', highLabel: 'hoch' })
  } else if (newType.value === 'checkbox') {
    custom.value.push({ id, type: 'checkbox', text })
  } else {
    custom.value.push({ id, type: 'text', text })
  }
  newText.value = ''
}

function remove(id: string) {
  custom.value = custom.value.filter((q) => q.id !== id)
}

function start() {
  room.setActiveQuestions([...flatQuestions, ...custom.value.map(asCustomFlat)])
  emit('ready')
}

const typeLabel: Record<string, string> = {
  scale: 'Skala 1-10',
  checkbox: 'Ja / Nein',
  text: 'Freitext',
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <header class="mb-6">
      <h1 class="text-3xl font-bold">Fragen vorbereiten</h1>
      <p class="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
        Die {{ flatQuestions.length }} Standardfragen sind schon dabei. Hier kannst du eigene Fragen
        ergänzen, bevor du den Raumcode teilst.
      </p>
    </header>

    <div class="mb-6 rounded-2xl bg-white dark:bg-zinc-900 p-5 ring-1 ring-zinc-200 dark:ring-zinc-700">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-bold"><Star class="h-5 w-5 text-teal-600" /> Eigene Frage hinzufügen</h2>

      <div class="mb-3 grid grid-cols-3 gap-2">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          @click="newType = opt.value"
          class="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-sm font-semibold transition"
          :class="newType === opt.value ? 'bg-teal-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
        >
          <component :is="opt.icon" class="h-6 w-6" />
          {{ opt.label }}
        </button>
      </div>

      <div class="flex gap-2">
        <input
          v-model="newText"
          placeholder="Deine Frage ..."
          class="flex-1 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-3 text-lg outline-none focus:border-teal-500"
          @keyup.enter="add"
        />
        <button
          type="button"
          class="flex items-center gap-1 rounded-xl bg-teal-600 px-4 text-lg font-bold text-white hover:bg-teal-700"
          @click="add"
        >
          <Plus class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-if="custom.length" class="mb-6 space-y-2">
      <h2 class="text-lg font-bold">Eigene Fragen ({{ custom.length }})</h2>
      <div
        v-for="q in custom"
        :key="q.id"
        class="flex items-center gap-3 rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 ring-1 ring-zinc-200 dark:ring-zinc-700"
      >
        <span class="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">{{ typeLabel[q.type] }}</span>
        <span class="flex-1 text-lg">{{ q.text }}</span>
        <button class="rounded-full p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" @click="remove(q.id)">
          <Trash2 class="h-5 w-5" />
        </button>
      </div>
    </div>

    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-5 text-xl font-bold text-white transition hover:bg-teal-700"
      @click="start"
    >
      <Play class="h-6 w-6" /> Raum starten
    </button>
  </div>
</template>
