<template>
  <el-container style="height: 100vh">
    <el-aside width="200px">
      <Menu :routes="routes" />
    </el-aside>
    <el-container>
      <el-header>顶部区域</el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Menu from '@/components/Menu.vue';
import { asyncRoutes } from '@/router/routes';
const routes = asyncRoutes[0].children || [];
</script>
