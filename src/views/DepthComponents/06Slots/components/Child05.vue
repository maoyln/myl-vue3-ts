<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
  .card {
    border: 1px solid black;
    padding: 0;
  }

  .card-header {
    background-color: skyblue;
    padding: 4px;
  }

  .card-content {
    padding: 4px;
  }

  .card-footer {
    background-color: lightgray;
    padding: 4px;
  }


</style>