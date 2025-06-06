<script setup>
import { ref } from 'vue';

const count = ref(0);

setInterval(() => {
  count.value++;
}, 1000);
</script>

<template>
  <div class="wrapper">
  <Transition>
    <span :key="count">{{ count }}</span>
  </Transition>
  </div>
</template>

<style scoped>
span{
  font-size: 4rem;
}
.wrapper{
  position:relative;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
  position: absolute;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
