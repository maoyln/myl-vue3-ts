<template>
  <div>
    <button @click="submitForm">提交表单</button>
  </div>
</template>

<script setup>
const emit = defineEmits({
  // 没有校验
  click: null,

  // 校验 submitForm 事件
  submitForm: ({ email, password }) => {
    if (email && password) {
      return true
    } else {
      console.warn('Invalid submitForm event payload!')
      return false
    }
  }
})

function submitForm(email, password) {
  emit('submitForm', { email, password })
}
</script>