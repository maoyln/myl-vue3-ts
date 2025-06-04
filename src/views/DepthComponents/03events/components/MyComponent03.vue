<template>
  <div>
    <button @click="emit('inFocus', 1)">聚焦--{{props.msg}}</button>
    <button @click="emit('submit')">提交</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['inFocus', 'submit'])
const props = defineProps({
  msg: {
    type: String,
    required: true,
  }

})
</script>