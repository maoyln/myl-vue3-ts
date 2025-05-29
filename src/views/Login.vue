<template>
  <div>
    <h2>登录</h2>
    <input v-model="token" placeholder="输入 token" />
    <button @click="handleLogin">登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const token = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleLogin = () => {
  if (token.value) {
    auth.login(token.value)
    router.push('/')
  }
}
</script>
