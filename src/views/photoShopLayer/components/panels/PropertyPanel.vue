<template>
  <div class="property-panel">
    <!-- 属性组 -->
    <div class="property-group">
      <div class="property-label">不透明度</div>
      <div class="property-control">
        <input
          type="range"
          v-model="opacity"
          min="0"
          max="100"
          class="property-slider"
        >
        <input
          type="number"
          v-model="opacity"
          min="0"
          max="100"
          class="property-input-small"
        >
        <span class="property-unit">%</span>
      </div>
    </div>

    <div class="property-group">
      <div class="property-label">填充</div>
      <div class="property-control">
        <input
          type="range"
          v-model="fill"
          min="0"
          max="100"
          class="property-slider"
        >
        <input
          type="number"
          v-model="fill"
          min="0"
          max="100"
          class="property-input-small"
        >
        <span class="property-unit">%</span>
      </div>
    </div>

    <div class="property-group">
      <div class="property-label">混合模式</div>
      <div class="property-control">
        <select v-model="blendMode" class="property-select">
          <option value="normal">正常</option>
          <option value="multiply">正片叠底</option>
          <option value="screen">滤色</option>
          <option value="overlay">叠加</option>
          <option value="soft-light">柔光</option>
          <option value="hard-light">强光</option>
          <option value="color-dodge">颜色减淡</option>
          <option value="color-burn">颜色加深</option>
          <option value="darken">变暗</option>
          <option value="lighten">变亮</option>
        </select>
      </div>
    </div>

    <!-- 变换属性 -->
    <div class="property-section">
      <div class="property-section-title">变换</div>
      
      <div class="property-group">
        <div class="property-label">位置 X</div>
        <div class="property-control">
          <input type="number" v-model="transformX" class="property-input">
          <span class="property-unit">px</span>
        </div>
      </div>

      <div class="property-group">
        <div class="property-label">位置 Y</div>
        <div class="property-control">
          <input type="number" v-model="transformY" class="property-input">
          <span class="property-unit">px</span>
        </div>
      </div>

      <div class="property-group">
        <div class="property-label">旋转</div>
        <div class="property-control">
          <input type="number" v-model="rotation" class="property-input">
          <span class="property-unit">°</span>
        </div>
      </div>
    </div>

    <!-- 效果 -->
    <div class="property-section">
      <div class="property-section-title">效果</div>
      
      <div class="property-group">
        <div class="property-control">
          <button class="property-effect-btn">
            <span>✨</span>
            <span>投影</span>
          </button>
          <button class="property-effect-btn">
            <span>🌟</span>
            <span>外发光</span>
          </button>
        </div>
      </div>

      <div class="property-group">
        <div class="property-control">
          <button class="property-effect-btn">
            <span>💫</span>
            <span>内发光</span>
          </button>
          <button class="property-effect-btn">
            <span>🎨</span>
            <span>描边</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const opacity = ref(100);
const fill = ref(100);
const blendMode = ref('normal');
const transformX = ref(0);
const transformY = ref(0);
const rotation = ref(0);
</script>

<style scoped>
.property-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-section {
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.property-section:first-child {
  padding-top: 0;
  border-top: none;
}

.property-section-title {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.property-group {
  margin-bottom: 12px;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-label {
  font-size: 12px;
  color: #999999;
  margin-bottom: 6px;
}

.property-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
}

.property-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
}

.property-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.property-input,
.property-input-small {
  padding: 6px 8px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  text-align: center;
}

.property-input {
  width: 80px;
}

.property-input-small {
  width: 50px;
}

.property-input:focus,
.property-input-small:focus {
  outline: none;
  border-color: #4a90e2;
}

.property-select {
  flex: 1;
  padding: 6px 8px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  cursor: pointer;
}

.property-select:focus {
  outline: none;
  border-color: #4a90e2;
}

.property-unit {
  font-size: 11px;
  color: #999999;
  width: 20px;
}

/* 效果按钮 */
.property-effect-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.property-effect-btn:hover {
  background: #404040;
  border-color: #4a90e2;
}

.property-effect-btn span:first-child {
  font-size: 16px;
}
</style>
