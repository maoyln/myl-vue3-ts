<template>
  <span>{{ foo }}</span>
</template>

<script setup lang="ts">
import { watch } from 'vue'
const { foo = 11 } = defineProps<{ foo?: number }>()

watch(() => foo, () => {
  console.log(foo, 'watch');
})

</script>

