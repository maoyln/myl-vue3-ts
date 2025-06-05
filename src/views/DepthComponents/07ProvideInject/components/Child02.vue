<template>
  <div>{{ message }}</div>
  <div>{{ num }}</div>
  <div>
    myInjectionKey: {{ testKey }}
  </div>
</template>

<script setup>
import { provide, inject } from "vue";
import { myInjectionKey } from './keys.ts'

const message = inject("message");
const num = inject("num");
const testKey = inject(myInjectionKey);

console.log(message, "message");
console.log(num, "num");
console.log(testKey, "testKey");
</script>