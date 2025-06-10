<template>
  <div>
    <div>
      msg: {{ msg }}<br>
      labels: {{ labels }}<br>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
</script>