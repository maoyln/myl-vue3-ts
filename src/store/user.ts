import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
  }),
  actions: {
    login(token: string) {
      this.token = token;
    },
    logout() {
      this.token = '';
    },
  },
});
