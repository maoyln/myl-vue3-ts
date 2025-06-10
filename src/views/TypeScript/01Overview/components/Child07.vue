<template>
  <div>
    <div>
      名称: {{ props.book.title }}<br>
      作者: {{ props.book.author }}<br>
      年份: {{ props.book.year }}<br>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Book {
  title: string
  author: string
  year: number
}



</script>