import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const isAdmin = ref(false)
  const points = ref(0)

  const login = () => {
    username.value = 'mvenanci'
	points.value = -1000
    console.log('Login successful')
  }

  const logout = () => {
    console.log('Logging out')
    username.value = ''
  }

  return { username, isAdmin, points, login, logout }
})
