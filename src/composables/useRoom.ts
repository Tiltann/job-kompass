import { reactive, ref } from 'vue'
import Peer, { type DataConnection } from 'peerjs'
import { flatQuestions, type FlatQuestion } from '../data/questions'

// Prefix keeps our peer ids from clashing with other apps on the public broker.
const ID_PREFIX = 'jobkompass-'

export type Answers = Record<string, number | string | boolean>

export type Submission = {
  id: string
  name: string
  answers: Answers
  ts: number
}

export type Participant = {
  id: string
  name: string
  submitted: boolean
}

type Msg =
  | { type: 'questions'; questions: FlatQuestion[] }
  | { type: 'hello'; name: string }
  | { type: 'submission'; name: string; answers: Answers; ts: number }
  | { type: 'closed' }

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// Shared reactive state so any component can read the same room.
const role = ref<'none' | 'tutor' | 'participant'>('none')
const code = ref('')
const status = ref<'idle' | 'connecting' | 'ready' | 'error'>('idle')
const errorMessage = ref('')
const participants = reactive<Participant[]>([])
const submissions = reactive<Submission[]>([])
// The set everyone fills in: defaults plus whatever the tutor added.
const activeQuestions = ref<FlatQuestion[]>([...flatQuestions])

let peer: Peer | null = null
const tutorConnections = new Set<DataConnection>()
let participantConn: DataConnection | null = null
let tutorPassword = ''

function reset() {
  peer?.destroy()
  peer = null
  tutorConnections.clear()
  participantConn = null
  participants.splice(0, participants.length)
  submissions.splice(0, submissions.length)
  activeQuestions.value = [...flatQuestions]
  role.value = 'none'
  code.value = ''
  status.value = 'idle'
  errorMessage.value = ''
  tutorPassword = ''
}

export function useRoom() {
  function createRoom(password: string, wantedCode?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const roomCode = (wantedCode || randomCode()).toUpperCase()
      tutorPassword = password
      role.value = 'tutor'
      code.value = roomCode
      status.value = 'connecting'

      peer = new Peer(ID_PREFIX + roomCode)

      peer.on('open', () => {
        status.value = 'ready'
        resolve(roomCode)
      })

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          tutorConnections.add(conn)
          conn.send({ type: 'questions', questions: activeQuestions.value } satisfies Msg)
        })
        conn.on('data', (raw) => {
          const msg = raw as Msg
          if (msg.type === 'hello') {
            const existing = participants.find((p) => p.id === conn.peer)
            if (existing) existing.name = msg.name
            else participants.push({ id: conn.peer, name: msg.name, submitted: false })
          } else if (msg.type === 'submission') {
            submissions.push({ id: conn.peer, name: msg.name, answers: msg.answers, ts: msg.ts })
            const p = participants.find((x) => x.id === conn.peer)
            if (p) p.submitted = true
          }
        })
        conn.on('close', () => {
          tutorConnections.delete(conn)
          const i = participants.findIndex((p) => p.id === conn.peer)
          // keep people who already submitted, drop the ones who just left
          if (i !== -1 && !participants[i].submitted) participants.splice(i, 1)
        })
      })

      peer.on('error', (err) => {
        status.value = 'error'
        errorMessage.value =
          err.type === 'unavailable-id'
            ? 'Dieser Raumcode ist gerade belegt. Bitte einen anderen wählen.'
            : 'Verbindung fehlgeschlagen. Bitte erneut versuchen.'
        reject(err)
      })
    })
  }

  // Participant side. Resolves once connected to the tutor.
  function joinRoom(roomCode: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const target = ID_PREFIX + roomCode.trim().toUpperCase()
      role.value = 'participant'
      code.value = roomCode.trim().toUpperCase()
      status.value = 'connecting'

      peer = new Peer()

      peer.on('open', () => {
        const conn = peer!.connect(target, { reliable: true })
        participantConn = conn

        const timeout = setTimeout(() => {
          status.value = 'error'
          errorMessage.value = 'Kein Raum mit diesem Code gefunden.'
          reject(new Error('timeout'))
        }, 12000)

        conn.on('open', () => {
          clearTimeout(timeout)
          status.value = 'ready'
          conn.send({ type: 'hello', name } satisfies Msg)
          resolve()
        })
        conn.on('data', (raw) => {
          const msg = raw as Msg
          if (msg.type === 'questions') {
            activeQuestions.value = msg.questions
          } else if (msg.type === 'closed') {
            status.value = 'idle'
          }
        })
        conn.on('error', () => {
          clearTimeout(timeout)
          status.value = 'error'
          errorMessage.value = 'Verbindung zum Raum nicht möglich.'
          reject(new Error('conn-error'))
        })
      })

      peer.on('error', (err) => {
        status.value = 'error'
        errorMessage.value =
          err.type === 'peer-unavailable'
            ? 'Kein Raum mit diesem Code gefunden.'
            : 'Verbindung fehlgeschlagen. Bitte erneut versuchen.'
        reject(err)
      })
    })
  }

  function submit(name: string, answers: Answers) {
    participantConn?.send({ type: 'submission', name, answers, ts: Date.now() } satisfies Msg)
  }

  function checkPassword(input: string): boolean {
    return input === tutorPassword
  }

  // Tutor sets the final list (defaults + custom) before sharing the code.
  function setActiveQuestions(list: FlatQuestion[]) {
    activeQuestions.value = list
  }

  function endSession() {
    for (const conn of tutorConnections) {
      try {
        conn.send({ type: 'closed' } satisfies Msg)
      } catch {
        // ignore connections that already dropped
      }
    }
    reset()
  }

  return {
    role,
    code,
    status,
    errorMessage,
    participants,
    submissions,
    activeQuestions,
    connectedCount: () => participants.length,
    createRoom,
    joinRoom,
    submit,
    checkPassword,
    setActiveQuestions,
    endSession,
    reset,
  }
}
