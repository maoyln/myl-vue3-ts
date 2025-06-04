<template>
  <span>{{props.msg}}</span>
</template>

<script setup lang="ts">
const props = defineProps({
  msg: {
    type: String,
    required: true,
  }
})

</script>