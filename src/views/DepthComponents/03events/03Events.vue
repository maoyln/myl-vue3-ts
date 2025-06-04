<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/components/props.html" target="_blank"
        >Props
      </a>
    </h1>

    <div>
      <h2>触发与监听事件</h2>
      <MyComponent @some-event="callback" />
    </div>
  </div>


</template>

<script setup lang="ts">

const callback = () => {
  console.log(111);
}
</script>