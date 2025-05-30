<!-- BlogPost.vue -->
<script>
export default {
  props: ['title'],
  setup(props) {
    console.log(props, '02')
    console.log(props.title, '02')
  }
}
</script>

<template>
  <h4>{{ title }}</h4>
</template>
