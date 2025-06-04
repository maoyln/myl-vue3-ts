<template>
  <div>
    <h2>首页 - 已登录</h2>
    <button @click="logout">退出登录</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const auth = useUserStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>
