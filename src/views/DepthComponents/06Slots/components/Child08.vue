<template>
  <div class="container">
    <header>
      <slot name="header" headerProps="这是一个头部"></slot>
    </header>
    <main>
      <slot :defaultProps="'这是默认值'"></slot>
    </main>
    <footer>
      <slot name="footer" footerProps="这是一个尾部"></slot>
    </footer>
    <main>
      <slot :defaultProps="'这是默认值'"></slot>
    </main>
  </div>
</template>

<style>

</style>