import { ref } from 'vue'

const STORAGE_KEY = 'theme'
const isDark = ref(false)

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

export function useTheme() {
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
    apply()
  }

  return { isDark, init, toggle }
}
