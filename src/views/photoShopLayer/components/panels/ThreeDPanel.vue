<template>
  <div class="threed-panel">
    <!-- 3D 模式选择 -->
    <div class="threed-mode">
      <div class="threed-mode-label">3D 模式</div>
      <div class="threed-mode-buttons">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="threed-mode-btn"
          :class="{ 'is-active': mode.id === activeMode }"
          @click="selectMode(mode.id)"
          :title="mode.name"
        >
          {{ mode.icon }}
        </button>
      </div>
    </div>

    <!-- 3D 对象列表 -->
    <div class="threed-objects">
      <div class="threed-objects-header">
        <span class="threed-objects-title">3D 图层</span>
        <button class="threed-objects-btn" title="新建 3D 图层">➕</button>
      </div>
      <div class="threed-objects-list">
        <div
          v-for="object in objects"
          :key="object.id"
          class="threed-object-item"
          :class="{ 'is-active': object.id === activeObjectId }"
          @click="selectObject(object.id)"
        >
          <div class="threed-object-icon">{{ object.icon }}</div>
          <div class="threed-object-name">{{ object.name }}</div>
          <div class="threed-object-type">{{ object.type }}</div>
        </div>
      </div>
    </div>

    <!-- 变换控制 -->
    <div class="threed-transform">
      <div class="threed-transform-title">变换</div>
      
      <div class="threed-transform-group">
        <div class="threed-transform-label">位置 X</div>
        <input type="number" v-model="position.x" class="threed-input">
      </div>
      
      <div class="threed-transform-group">
        <div class="threed-transform-label">位置 Y</div>
        <input type="number" v-model="position.y" class="threed-input">
      </div>
      
      <div class="threed-transform-group">
        <div class="threed-transform-label">位置 Z</div>
        <input type="number" v-model="position.z" class="threed-input">
      </div>

      <div class="threed-transform-group">
        <div class="threed-transform-label">旋转 X</div>
        <input type="number" v-model="rotation.x" class="threed-input">
      </div>
      
      <div class="threed-transform-group">
        <div class="threed-transform-label">旋转 Y</div>
        <input type="number" v-model="rotation.y" class="threed-input">
      </div>
      
      <div class="threed-transform-group">
        <div class="threed-transform-label">旋转 Z</div>
        <input type="number" v-model="rotation.z" class="threed-input">
      </div>
    </div>

    <!-- 渲染设置 -->
    <div class="threed-render">
      <div class="threed-render-title">渲染设置</div>
      
      <div class="threed-render-group">
        <div class="threed-render-label">质量</div>
        <select v-model="renderQuality" class="threed-select">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="ultra">超高</option>
        </select>
      </div>

      <div class="threed-render-group">
        <div class="threed-render-label">光照</div>
        <div class="threed-render-control">
          <input
            type="range"
            v-model="lighting"
            min="0"
            max="100"
            class="threed-slider"
          >
          <span class="threed-value">{{ lighting }}%</span>
        </div>
      </div>

      <div class="threed-render-group">
        <div class="threed-render-label">阴影</div>
        <div class="threed-render-control">
          <input
            type="range"
            v-model="shadow"
            min="0"
            max="100"
            class="threed-slider"
          >
          <span class="threed-value">{{ shadow }}%</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="threed-actions">
      <button class="threed-action-btn">渲染预览</button>
      <button class="threed-action-btn">导出 3D</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const modes = ref([
  { id: 'view', name: '查看模式', icon: '👁️' },
  { id: 'move', name: '移动', icon: '✋' },
  { id: 'rotate', name: '旋转', icon: '🔄' },
  { id: 'scale', name: '缩放', icon: '↔️' }
]);

const activeMode = ref('view');

const objects = ref([
  { id: '1', name: '立方体', type: '网格', icon: '⬛' },
  { id: '2', name: '球体', type: '网格', icon: '⚪' },
  { id: '3', name: '光源', type: '灯光', icon: '💡' }
]);

const activeObjectId = ref('1');

const position = ref({ x: 0, y: 0, z: 0 });
const rotation = ref({ x: 0, y: 0, z: 0 });
const renderQuality = ref('medium');
const lighting = ref(80);
const shadow = ref(60);

const selectMode = (modeId: string) => {
  activeMode.value = modeId;
};

const selectObject = (objectId: string) => {
  activeObjectId.value = objectId;
};
</script>

<style scoped>
.threed-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 3D 模式 */
.threed-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.threed-mode-label {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  font-weight: 600;
}

.threed-mode-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.threed-mode-btn {
  padding: 10px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.threed-mode-btn:hover {
  background: #404040;
}

.threed-mode-btn.is-active {
  background: #4a90e2;
  border-color: #6ab0f3;
}

/* 3D 对象列表 */
.threed-objects {
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.threed-objects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.threed-objects-title {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  font-weight: 600;
}

.threed-objects-btn {
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

.threed-objects-btn:hover {
  background: #404040;
  color: #ffffff;
}

.threed-objects-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.threed-object-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #383838;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.threed-object-item:hover {
  background: #404040;
}

.threed-object-item.is-active {
  background: #4a90e2;
  border-color: #6ab0f3;
}

.threed-object-icon {
  font-size: 18px;
}

.threed-object-name {
  flex: 1;
  font-size: 13px;
}

.threed-object-type {
  font-size: 11px;
  color: #999999;
}

/* 变换控制 */
.threed-transform {
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.threed-transform-title {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.threed-transform-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.threed-transform-label {
  font-size: 12px;
  color: #999999;
}

.threed-input {
  width: 100px;
  padding: 6px 8px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  text-align: center;
}

.threed-input:focus {
  outline: none;
  border-color: #4a90e2;
}

/* 渲染设置 */
.threed-render {
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.threed-render-title {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.threed-render-group {
  margin-bottom: 12px;
}

.threed-render-label {
  font-size: 12px;
  color: #999999;
  margin-bottom: 6px;
}

.threed-select {
  width: 100%;
  padding: 6px 8px;
  background: #383838;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  cursor: pointer;
}

.threed-select:focus {
  outline: none;
  border-color: #4a90e2;
}

.threed-render-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.threed-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  outline: none;
}

.threed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
}

.threed-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.threed-value {
  font-size: 11px;
  color: #999999;
  min-width: 40px;
  text-align: right;
}

/* 快捷操作 */
.threed-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.threed-action-btn {
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

.threed-action-btn:hover {
  background: #4a90e2;
  border-color: #4a90e2;
  transform: translateY(-1px);
}

.threed-action-btn:active {
  transform: translateY(0);
}
</style>
