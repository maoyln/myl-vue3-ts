<template>
  <span>{{ props.msg }}</span>
</template>

<script>
export default {
  props: ["msg"],
  setup(props) {
    return {
      props,
    };
  },
};
</script>
