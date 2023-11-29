import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const isAdmin = ref(false)

  const login = () => {
    name.value = 'touteiro'
    console.log('Login successful')
  }

  const logout = () => {
    console.log('Logging out')
    name.value = ''
  }

  return { name, isAdmin, login, logout }
})
