<template>
  <p class="baz boo">这是一个模版样式</p>

  <p :class="$attrs.class">Hi!</p>
  <span>This is a child component</span>
</template>

<style>
.baz {
  font-size: 20px;
}

.boo {
  color: red;
}
</style>