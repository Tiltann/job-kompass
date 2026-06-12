<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from './composables/useTheme'
import { useRoom } from './composables/useRoom'
import StartView from './components/StartView.vue'
import QuestionSetup from './components/QuestionSetup.vue'
import TutorDashboard from './components/TutorDashboard.vue'
import ParticipantForm from './components/ParticipantForm.vue'

const theme = useTheme()
const room = useRoom()
const view = ref<'start' | 'setup' | 'tutor' | 'participant'>('start')

onMounted(() => theme.init())

function onStarted() {
  view.value = room.role.value === 'tutor' ? 'setup' : 'participant'
}

function onEnded() {
  view.value = 'start'
}
</script>

<template>
  <div class="min-h-screen">
    <button
      class="fixed right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-white dark:bg-zinc-800 px-3 py-2 text-base font-semibold shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 sm:right-4 sm:top-4 sm:px-4 sm:py-2.5"
      @click="theme.toggle"
    >
      <Sun v-if="theme.isDark.value" class="h-5 w-5" />
      <Moon v-else class="h-5 w-5" />
      <span class="hidden sm:inline">{{ theme.isDark.value ? 'Hell' : 'Dunkel' }}</span>
    </button>

    <main class="px-4 pb-12 pt-20 sm:py-12">
      <StartView v-if="view === 'start'" @started="onStarted" />
      <QuestionSetup v-else-if="view === 'setup'" @ready="view = 'tutor'" />
      <TutorDashboard v-else-if="view === 'tutor'" @ended="onEnded" />
      <ParticipantForm v-else />
    </main>

    <footer class="px-4 pb-10 pt-4 text-center text-sm text-zinc-400 dark:text-zinc-600">
      <p>
        Erstellt von
        <a href="https://tiltann.dev" target="_blank" rel="noopener" class="font-medium underline hover:text-teal-600">Tiltann.dev</a>
      </p>
      <p class="mt-1">
        Privates Projekt. Wird von keiner Einrichtung oder Organisation unterstützt, geprüft oder empfohlen.
      </p>
    </footer>
  </div>
</template>
