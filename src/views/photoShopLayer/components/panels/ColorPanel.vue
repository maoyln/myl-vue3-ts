<template>
  <div class="color-panel">
    <!-- 颜色选择器 -->
    <div class="color-picker-area">
      <div class="color-gradient">
        <div class="color-gradient-overlay"></div>
      </div>
      <div class="color-hue-bar"></div>
    </div>

    <!-- 当前颜色显示 -->
    <div class="color-display">
      <div class="color-box-wrapper">
        <div class="color-box color-new" :style="{ background: currentColor }"></div>
        <div class="color-box color-old" :style="{ background: oldColor }"></div>
      </div>
      <div class="color-info">
        <span class="color-hex">{{ currentColor }}</span>
      </div>
    </div>

    <!-- RGB 输入 -->
    <div class="color-inputs">
      <div class="color-input-group">
        <label>R</label>
        <input type="number" v-model="rgb.r" min="0" max="255" @input="updateColorFromRGB">
      </div>
      <div class="color-input-group">
        <label>G</label>
        <input type="number" v-model="rgb.g" min="0" max="255" @input="updateColorFromRGB">
      </div>
      <div class="color-input-group">
        <label>B</label>
        <input type="number" v-model="rgb.b" min="0" max="255" @input="updateColorFromRGB">
      </div>
    </div>

    <!-- HSB 输入 -->
    <div class="color-inputs">
      <div class="color-input-group">
        <label>H</label>
        <input type="number" v-model="hsb.h" min="0" max="360">
      </div>
      <div class="color-input-group">
        <label>S</label>
        <input type="number" v-model="hsb.s" min="0" max="100">
      </div>
      <div class="color-input-group">
        <label>B</label>
        <input type="number" v-model="hsb.b" min="0" max="100">
      </div>
    </div>

    <!-- 快速色板 -->
    <div class="color-swatches">
      <div class="swatches-label">色板</div>
      <div class="swatches-grid">
        <div
          v-for="(swatch, index) in swatches"
          :key="index"
          class="swatch-item"
          :style="{ background: swatch }"
          @click="selectSwatch(swatch)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const rgb = ref({ r: 102, g: 126, b: 234 });
const hsb = ref({ h: 225, s: 56, b: 92 });
const oldColor = ref('#667eea');

const currentColor = computed(() => {
  return `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`;
});

const updateColorFromRGB = () => {
  // 简单的颜色更新逻辑
  console.log('Color updated:', currentColor.value);
};

const swatches = ref([
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
  '#0000FF', '#4B0082', '#9400D3', '#FF1493',
  '#000000', '#404040', '#808080', '#C0C0C0',
  '#FFFFFF', '#8B4513', '#00CED1', '#FF6347'
]);

const selectSwatch = (color: string) => {
  oldColor.value = currentColor.value;
  // 更新 RGB 值（这里需要颜色转换逻辑）
  console.log('Selected swatch:', color);
};
</script>

<style scoped>
.color-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 颜色选择器区域 */
.color-picker-area {
  display: flex;
  gap: 8px;
}

.color-gradient {
  width: 100%;
  height: 150px;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0) 0%, 
    rgba(0, 0, 0, 1) 100%
  ),
  linear-gradient(to right, 
    rgba(255, 255, 255, 1) 0%, 
    rgba(255, 0, 0, 1) 100%
  );
  border-radius: 4px;
  position: relative;
  cursor: crosshair;
}

.color-hue-bar {
  width: 20px;
  height: 150px;
  background: linear-gradient(to bottom,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
  border-radius: 4px;
  cursor: pointer;
}

/* 颜色显示 */
.color-display {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-box-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.color-box {
  width: 50px;
  height: 50px;
  border: 2px solid #404040;
  border-radius: 4px;
  position: absolute;
}

.color-new {
  top: 0;
  left: 0;
  z-index: 2;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.color-old {
  bottom: 0;
  right: 0;
  z-index: 1;
}

.color-info {
  flex: 1;
}

.color-hex {
  font-size: 14px;
  font-family: 'Courier New', monospace;
  color: #cccccc;
}

/* 输入框组 */
.color-inputs {
  display: flex;
  gap: 8px;
}

.color-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-input-group label {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
}

.color-input-group input {
  width: 100%;
  padding: 6px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  text-align: center;
}

.color-input-group input:focus {
  outline: none;
  border-color: #4a90e2;
}

/* 色板 */
.color-swatches {
  margin-top: 8px;
}

.swatches-label {
  font-size: 11px;
  color: #999999;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.swatches-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.swatch-item {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #404040;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s;
}

.swatch-item:hover {
  transform: scale(1.1);
  border-color: #4a90e2;
}
</style>
