<script setup>
import { useAttrs } from "vue";

const attrs = useAttrs();

console.log(attrs, "attrs");
</script>

<template>
  <div>F12看打印内容</div>
  <div v-bind="$attrs">const attrs = useAttrs()</div>
  <div>
    Proxy(Object){ "class": "red", "style": { "font-size": "20px" }, "id":
    "child01" }
  </div>
</template>

<style></style>
