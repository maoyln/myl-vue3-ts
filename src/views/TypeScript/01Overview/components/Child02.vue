<template>
  <div>
    <div>
      foo: {{ props.foo }}<br>
      bar: {{ props.bar }}<br>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  foo: string
  bar?: number
}>()
</script>