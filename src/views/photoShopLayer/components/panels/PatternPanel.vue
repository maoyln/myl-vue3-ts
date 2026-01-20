<template>
  <div class="pattern-panel">
    <!-- 图案库 -->
    <div class="pattern-library">
      <div class="pattern-header">
        <span class="pattern-header-title">图案预设</span>
        <button class="pattern-header-btn" title="更多">⋯</button>
      </div>
      
      <div class="pattern-grid">
        <div
          v-for="pattern in patterns"
          :key="pattern.id"
          class="pattern-item"
          :class="{ 'is-active': pattern.id === activePatternId }"
          @click="selectPattern(pattern.id)"
          :title="pattern.name"
        >
          <div class="pattern-preview" :style="{ backgroundImage: pattern.style }"></div>
        </div>
      </div>
    </div>

    <!-- 图案设置 -->
    <div class="pattern-settings">
      <div class="pattern-setting-group">
        <div class="pattern-setting-label">缩放</div>
        <div class="pattern-setting-control">
          <input
            type="range"
            v-model="scale"
            min="10"
            max="200"
            class="pattern-slider"
          >
          <input
            type="number"
            v-model="scale"
            min="10"
            max="200"
            class="pattern-input"
          >
          <span class="pattern-unit">%</span>
        </div>
      </div>

      <div class="pattern-setting-group">
        <div class="pattern-setting-label">角度</div>
        <div class="pattern-setting-control">
          <input
            type="range"
            v-model="angle"
            min="0"
            max="360"
            class="pattern-slider"
          >
          <input
            type="number"
            v-model="angle"
            min="0"
            max="360"
            class="pattern-input"
          >
          <span class="pattern-unit">°</span>
        </div>
      </div>
    </div>

    <!-- 图案操作 -->
    <div class="pattern-actions">
      <button class="pattern-action-btn">新建图案</button>
      <button class="pattern-action-btn">载入图案</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Pattern {
  id: string;
  name: string;
  style: string;
}

const patterns = ref<Pattern[]>([
  { id: '1', name: '条纹图案', style: 'repeating-linear-gradient(45deg, #383838, #383838 10px, #2c2c2c 10px, #2c2c2c 20px)' },
  { id: '2', name: '点状图案', style: 'radial-gradient(circle, #4a90e2 20%, transparent 20%)' },
  { id: '3', name: '网格图案', style: 'repeating-linear-gradient(0deg, #383838, #383838 10px, transparent 10px, transparent 20px), repeating-linear-gradient(90deg, #383838, #383838 10px, transparent 10px, transparent 20px)' },
  { id: '4', name: '对角线', style: 'repeating-linear-gradient(135deg, #667eea, #667eea 10px, #764ba2 10px, #764ba2 20px)' },
  { id: '5', name: '波浪', style: 'repeating-radial-gradient(circle at 0 0, transparent 0, #4a90e2 10px, transparent 20px)' },
  { id: '6', name: '棋盘', style: 'repeating-conic-gradient(#383838 0% 25%, #2c2c2c 0% 50%)' },
  { id: '7', name: '渐变1', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: '8', name: '渐变2', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '9', name: '渐变3', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: '10', name: '渐变4', style: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: '11', name: '渐变5', style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: '12', name: '渐变6', style: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
]);

const activePatternId = ref('1');
const scale = ref(100);
const angle = ref(0);

const selectPattern = (patternId: string) => {
  activePatternId.value = patternId;
};
</script>

<style scoped>
.pattern-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 图案库 */
.pattern-library {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pattern-header-title {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  font-weight: 600;
}

.pattern-header-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999999;
  cursor: pointer;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-header-btn:hover {
  background: #404040;
  color: #ffffff;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.pattern-item {
  aspect-ratio: 1;
  border: 2px solid #404040;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.pattern-item:hover {
  border-color: #4a90e2;
  transform: scale(1.05);
}

.pattern-item.is-active {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

.pattern-preview {
  width: 100%;
  height: 100%;
  background-size: 20px 20px;
}

/* 图案设置 */
.pattern-settings {
  padding-top: 12px;
  border-top: 1px solid #404040;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pattern-setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pattern-setting-label {
  font-size: 12px;
  color: #999999;
}

.pattern-setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pattern-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
}

.pattern-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
}

.pattern-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.pattern-input {
  width: 50px;
  padding: 6px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  text-align: center;
}

.pattern-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.pattern-unit {
  font-size: 11px;
  color: #999999;
  width: 20px;
}

/* 图案操作 */
.pattern-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.pattern-action-btn {
  flex: 1;
  padding: 8px 12px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.pattern-action-btn:hover {
  background: #4a90e2;
  border-color: #4a90e2;
  transform: translateY(-1px);
}

.pattern-action-btn:active {
  transform: translateY(0);
}
</style>
