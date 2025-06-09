<script setup>
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <button @click="open = true">Open Modal</button>

  <div v-if="open" class="modal">
    <p>我在当前组织的dom下</p>
    <button @click="open = false">关闭</button>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
  background: greenyellow;
  border: 1px solid blue;
  color: red;
  text-align: center;
}
</style>
