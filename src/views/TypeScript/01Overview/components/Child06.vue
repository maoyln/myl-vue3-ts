<template>
  <div>
    <div>
      名称: {{ props.book.title }}<br />
      作者: {{ props.book.author }}<br />
      年份: {{ props.book.year }}<br />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
interface Book {
  title: string;
  author: string;
  year: number;
}

const props: any = defineProps({
  book: Object as PropType<Book>,
});
</script>
