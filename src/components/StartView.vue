<script setup lang="ts">
import { ref } from 'vue'
import { Compass, Hand, GraduationCap, Hash, KeyRound, User, ArrowLeft, ArrowRight, Check, Loader2, TriangleAlert } from 'lucide-vue-next'
import { useRoom } from '../composables/useRoom'

const emit = defineEmits<{ started: [] }>()

const room = useRoom()
const mode = ref<'pick' | 'create' | 'join'>('pick')
const busy = ref(false)
const localError = ref('')

// create
const createPassword = ref('')
const wantedCode = ref('')

// join
const joinCode = ref('')
const name = ref('')

async function onCreate() {
  localError.value = ''
  if (createPassword.value.length < 4) {
    localError.value = 'Bitte ein Passwort mit mindestens 4 Zeichen wählen.'
    return
  }
  busy.value = true
  try {
    await room.createRoom(createPassword.value, wantedCode.value || undefined)
    emit('started')
  } catch {
    localError.value = room.errorMessage.value
  } finally {
    busy.value = false
  }
}

async function onJoin() {
  localError.value = ''
  if (!joinCode.value.trim()) {
    localError.value = 'Bitte einen Raumcode eingeben.'
    return
  }
  if (!name.value.trim()) {
    localError.value = 'Bitte einen Namen oder Spitznamen eingeben.'
    return
  }
  busy.value = true
  try {
    sessionStorage.setItem('participantName', name.value.trim())
    await room.joinRoom(joinCode.value, name.value.trim())
    emit('started')
  } catch {
    localError.value = room.errorMessage.value
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <header class="mb-8 text-center">
      <Compass class="mx-auto mb-3 h-14 w-14 text-teal-600" :stroke-width="1.5" />
      <h1 class="text-4xl font-bold tracking-tight">Job Kompass</h1>
      <p class="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
        Ein ehrlicher Blick darauf, wo du gerade stehst.
      </p>
    </header>

    <div v-if="mode === 'pick'" class="space-y-4">
      <button
        class="flex w-full items-center gap-4 rounded-2xl bg-teal-600 px-6 py-6 text-left text-xl font-bold text-white transition hover:bg-teal-700"
        @click="mode = 'join'"
      >
        <Hand class="h-8 w-8 shrink-0" :stroke-width="1.75" />
        <span>
          Mitmachen
          <span class="block text-sm font-normal opacity-90">Einem Raum beitreten</span>
        </span>
      </button>
      <button
        class="flex w-full items-center gap-4 rounded-2xl bg-white dark:bg-zinc-900 px-6 py-6 text-left text-xl font-bold ring-2 ring-zinc-200 dark:ring-zinc-700 transition hover:ring-teal-400"
        @click="mode = 'create'"
      >
        <GraduationCap class="h-8 w-8 shrink-0 text-teal-600" :stroke-width="1.75" />
        <span>
          Raum erstellen
          <span class="block text-sm font-normal text-zinc-500 dark:text-zinc-400">Für die Leitung</span>
        </span>
      </button>
    </div>

    <form v-else-if="mode === 'create'" class="space-y-5" @submit.prevent="onCreate">
      <div>
        <label class="mb-2 flex items-center gap-2 text-lg font-semibold"><Hash class="h-5 w-5 text-teal-600" /> Raumcode (optional)</label>
        <input
          v-model="wantedCode"
          maxlength="6"
          placeholder="wird sonst automatisch erzeugt"
          class="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-4 text-lg uppercase outline-none focus:border-teal-500"
        />
      </div>
      <div>
        <label class="mb-2 flex items-center gap-2 text-lg font-semibold"><KeyRound class="h-5 w-5 text-teal-600" /> Passwort der Leitung</label>
        <input
          v-model="createPassword"
          type="password"
          placeholder="schützt das Beenden und den Export"
          class="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-4 text-lg outline-none focus:border-teal-500"
        />
      </div>
      <p v-if="localError" class="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 p-3 text-base font-medium text-rose-600"><TriangleAlert class="h-5 w-5 shrink-0" /> {{ localError }}</p>
      <button
        type="submit"
        :disabled="busy"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-5 text-xl font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        <Loader2 v-if="busy" class="h-6 w-6 animate-spin" />
        <Check v-else class="h-6 w-6" />
        {{ busy ? 'Raum wird erstellt ...' : 'Raum erstellen' }}
      </button>
      <button type="button" class="flex w-full items-center justify-center gap-1 py-2 text-base text-zinc-500 hover:text-zinc-700" @click="mode = 'pick'">
        <ArrowLeft class="h-4 w-4" /> Zurück
      </button>
    </form>

    <form v-else class="space-y-5" @submit.prevent="onJoin">
      <div>
        <label class="mb-2 flex items-center gap-2 text-lg font-semibold"><Hash class="h-5 w-5 text-teal-600" /> Raumcode</label>
        <input
          v-model="joinCode"
          maxlength="6"
          placeholder="z. B. K7P2QM"
          class="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-4 text-2xl uppercase tracking-widest outline-none focus:border-teal-500"
        />
      </div>
      <div>
        <label class="mb-2 flex items-center gap-2 text-lg font-semibold"><User class="h-5 w-5 text-teal-600" /> Dein Name oder Spitzname</label>
        <input
          v-model="name"
          maxlength="40"
          class="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent p-4 text-lg outline-none focus:border-teal-500"
        />
      </div>
      <p v-if="localError" class="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 p-3 text-base font-medium text-rose-600"><TriangleAlert class="h-5 w-5 shrink-0" /> {{ localError }}</p>
      <button
        type="submit"
        :disabled="busy"
        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-5 text-xl font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        <Loader2 v-if="busy" class="h-6 w-6 animate-spin" />
        <ArrowRight v-else class="h-6 w-6" />
        {{ busy ? 'Verbinde ...' : 'Beitreten' }}
      </button>
      <button type="button" class="flex w-full items-center justify-center gap-1 py-2 text-base text-zinc-500 hover:text-zinc-700" @click="mode = 'pick'">
        <ArrowLeft class="h-4 w-4" /> Zurück
      </button>
    </form>
  </div>
</template>
