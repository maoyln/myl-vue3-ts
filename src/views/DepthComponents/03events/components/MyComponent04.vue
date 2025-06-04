<template>
  <div>
    <button @click="handleInFocus">聚焦-</button>
    <button @click="handleSubmit">提交</button>
  </div>
</template>

<script>
export default {
  emits: ['inFocus', 'submit'],

  setup(props, ctx) {

    const handleInFocus = () => {
      console.log('点击--inFocus');

      ctx.emit('inFocus', 1)
    }
    const handleSubmit = () => {
      console.log('点击--submit');
      ctx.emit('submit')
    }

    return {
      handleInFocus,
      handleSubmit
    }}
}
</script>