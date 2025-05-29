import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',

  }),
  actions: {
    login(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = '';
      localStorage.removeItem('token')
    },
  },
});
