<template>
  <el-menu :router="true" :default-active="$route.path" class="el-menu-vertical-demo">
    <template v-for="item in routes" :key="item.path">
      <el-sub-menu v-if="item.children" :index="item.path">
        <template #title>{{ item.meta?.title }}</template>
        <el-menu-item v-for="child in item.children" :index="`/${item.path}/${child.path}`" :key="child.path">
          {{ child.meta?.title }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="`/${item.path}`">
        {{ item.meta?.title }}
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
defineProps<{ routes: any[] }>();
</script>
