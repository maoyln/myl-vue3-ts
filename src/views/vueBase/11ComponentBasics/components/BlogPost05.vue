<!-- BlogPost.vue -->
<script>
export default {
  props: ["title"],
  emits: ["enlarge-text", "small-text"],
  setup(props, ctx) {
    const handleEnlarge = () => {
      ctx.emit("enlarge-text");
    };

    const handleSmall = () => {
      ctx.emit("small-text");
    };


    return {
      handleEnlarge,
      handleSmall
    }
  },
};
</script>

<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <div>这是一个参数</div>
    <button @click="handleEnlarge">Enlarge text</button>
    <button @click="handleSmall">small text</button>
  </div>
</template>
