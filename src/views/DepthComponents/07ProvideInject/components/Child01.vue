<template>
  <div>{{ message }}</div>
  <div>{{ num }}</div>
</template>

<script setup>
import { provide, inject } from "vue";

const message = inject("message");
const num = inject("num");

console.log(message, "message");
console.log(num, "num");
</script>