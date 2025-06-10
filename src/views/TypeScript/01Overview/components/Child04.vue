<template>
  <div>
    <div>
      foo: {{ props.foo }}<br>
      bar: {{ props.bar }}<br>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  foo: string
  bar?: number
}

const props = defineProps<Props>()
</script>