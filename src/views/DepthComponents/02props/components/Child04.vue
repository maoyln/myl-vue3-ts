<template>
  <span>{{ props.title }} - {{ props.likes }}</span>
</template>

<script>
export default {
  props: {
    title: String,
    likes: Number
  },

  setup(props) {
    return {
      props,
    };

  }
}
</script>
