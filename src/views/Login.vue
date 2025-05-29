<template>
  <el-form @submit.prevent="login">
    <el-form-item>
      <el-input v-model="token" placeholder="输入 token 登录" />
    </el-form-item>
    <el-button type="primary" @click="login">登录</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const token = ref('');
const userStore = useUserStore();
const router = useRouter();

function login() {
  if (token.value) {
    userStore.login(token.value);
    router.push('/');
  }
}
</script>
