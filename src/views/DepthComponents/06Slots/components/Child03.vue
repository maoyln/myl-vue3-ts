<template>
  <button type="submit" class="fancy-btn">
    <slot>
      插槽默认值
    </slot>
	</button>
</template>

<style>
.fancy-btn {
  color: #fff;
  background: linear-gradient(315deg, #424cd3 25%, #fcff64);
  border: none;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 8px;
  cursor: pointer;
}
</style>