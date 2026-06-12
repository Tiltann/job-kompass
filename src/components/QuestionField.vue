<script setup lang="ts">
import { ThumbsDown, ThumbsUp, Check, X } from 'lucide-vue-next'
import type { Question } from '../data/questions'

defineProps<{
  question: Question
  modelValue: number | string | boolean | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | string | boolean]
}>()

const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 1 = red, 10 = green
function hue(n: number): number {
  return Math.round(((n - 1) / 9) * 125)
}

function onText(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div>
    <template v-if="question.type === 'scale'">
      <div class="grid grid-cols-5 gap-3 sm:grid-cols-10">
        <button
          v-for="n in scale"
          :key="n"
          type="button"
          @click="emit('update:modelValue', n)"
          class="aspect-square rounded-2xl text-2xl font-bold transition select-none"
          :class="modelValue === n ? 'text-white scale-105 shadow-lg ring-4' : 'hover:brightness-95'"
          :style="
            modelValue === n
              ? { backgroundColor: `hsl(${hue(n)} 65% 42%)`, '--tw-ring-color': `hsl(${hue(n)} 70% 80%)` }
              : { backgroundColor: `hsl(${hue(n)} 60% 50% / 0.15)`, color: `hsl(${hue(n)} 55% 35%)` }
          "
        >
          {{ n }}
        </button>
      </div>
      <div class="mt-4 flex items-center justify-between text-base text-zinc-500 dark:text-zinc-400">
        <span class="flex items-center gap-1.5"><ThumbsDown class="h-5 w-5" /> {{ question.lowLabel }}</span>
        <span class="flex items-center gap-1.5">{{ question.highLabel }} <ThumbsUp class="h-5 w-5" /></span>
      </div>
    </template>

    <template v-else-if="question.type === 'checkbox'">
      <div class="grid grid-cols-2 gap-4">
        <button
          type="button"
          @click="emit('update:modelValue', true)"
          class="flex items-center justify-center gap-2 rounded-2xl py-6 text-2xl font-bold transition"
          :class="modelValue === true ? 'bg-teal-600 text-white ring-4 ring-teal-300 dark:ring-teal-800' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
        >
          <Check class="h-7 w-7" /> Ja
        </button>
        <button
          type="button"
          @click="emit('update:modelValue', false)"
          class="flex items-center justify-center gap-2 rounded-2xl py-6 text-2xl font-bold transition"
          :class="modelValue === false ? 'bg-rose-500 text-white ring-4 ring-rose-200 dark:ring-rose-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
        >
          <X class="h-7 w-7" /> Nein
        </button>
      </div>
    </template>

    <template v-else>
      <textarea
        rows="5"
        :placeholder="question.placeholder || 'Hier kannst du schreiben (oder leer lassen) ...'"
        :value="typeof modelValue === 'string' ? modelValue : ''"
        @input="onText"
        class="w-full resize-y rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-4 text-lg outline-none focus:border-teal-500"
      ></textarea>
    </template>
  </div>
</template>
