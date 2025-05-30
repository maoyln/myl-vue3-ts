<!-- AlertBox.vue -->
<template>
  <div class="alert-box">
    <strong>这是演示用途的错误</strong>
    <br/>
    <slot />
  </div>
</template>

<style scoped>
.alert-box {
  color: #666;
  border: 1px solid red;
  border-radius: 4px;
  padding: 20px;
  background-color: #f8f8f8;
}
  
strong {
	color: red;    
}
</style>