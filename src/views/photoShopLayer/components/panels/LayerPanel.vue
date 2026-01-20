<template>
  <div class="layer-panel">
    <!-- 图层列表 -->
    <div class="layer-list">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="layer-item"
        :class="{ 'is-active': layer.id === activeLayerId }"
        @click="selectLayer(layer.id)"
      >
        <div class="layer-visibility" @click.stop="toggleVisibility(layer.id)">
          {{ layer.visible ? '👁️' : '⚫' }}
        </div>
        <div class="layer-thumbnail" :style="{ background: layer.color }"></div>
        <div class="layer-info">
          <div class="layer-name">{{ layer.name }}</div>
          <div class="layer-opacity">{{ layer.opacity }}%</div>
        </div>
        <div class="layer-lock" v-if="layer.locked">🔒</div>
      </div>
    </div>

    <!-- 图层控制按钮 -->
    <div class="layer-controls">
      <button class="layer-control-btn" @click="addLayer" title="新建图层">
        ➕
      </button>
      <button class="layer-control-btn" @click="deleteLayer" title="删除图层">
        🗑️
      </button>
      <button class="layer-control-btn" title="新建组">
        📁
      </button>
      <button class="layer-control-btn" title="添加蒙版">
        🎭
      </button>
      <button class="layer-control-btn" title="调整图层">
        🎨
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  color: string;
}

const layers = ref<Layer[]>([
  { id: '1', name: '图层 3', visible: true, locked: false, opacity: 100, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: '2', name: '图层 2', visible: true, locked: false, opacity: 80, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '3', name: '图层 1', visible: false, locked: true, opacity: 100, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: '4', name: '背景', visible: true, locked: true, opacity: 100, color: '#ffffff' }
]);

const activeLayerId = ref('1');

const selectLayer = (layerId: string) => {
  activeLayerId.value = layerId;
};

const toggleVisibility = (layerId: string) => {
  const layer = layers.value.find(l => l.id === layerId);
  if (layer) {
    layer.visible = !layer.visible;
  }
};

const addLayer = () => {
  const newId = (layers.value.length + 1).toString();
  layers.value.unshift({
    id: newId,
    name: `图层 ${newId}`,
    visible: true,
    locked: false,
    opacity: 100,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  });
};

const deleteLayer = () => {
  if (layers.value.length > 1) {
    const index = layers.value.findIndex(l => l.id === activeLayerId.value);
    if (index !== -1) {
      layers.value.splice(index, 1);
      activeLayerId.value = layers.value[0]?.id || '';
    }
  }
};
</script>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
}

.layer-item {
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

.layer-item:hover {
  background: #404040;
}

.layer-item.is-active {
  background: #4a90e2;
  color: #ffffff;
  border-color: #6ab0f3;
}

.layer-visibility {
  font-size: 16px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.layer-visibility:hover {
  background: rgba(255, 255, 255, 0.1);
}

.layer-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #404040;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.layer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.layer-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-opacity {
  font-size: 11px;
  opacity: 0.7;
}

.layer-lock {
  font-size: 14px;
  opacity: 0.6;
}

/* 图层控制按钮 */
.layer-controls {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #404040;
}

.layer-control-btn {
  flex: 1;
  padding: 8px;
  background: #383838;
  border: none;
  border-radius: 4px;
  color: #cccccc;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin: 0 2px;
}

.layer-control-btn:hover {
  background: #4a90e2;
  transform: translateY(-1px);
}

.layer-control-btn:active {
  transform: translateY(0);
}

/* 滚动条 */
.layer-list::-webkit-scrollbar {
  width: 6px;
}

.layer-list::-webkit-scrollbar-track {
  background: #2c2c2c;
}

.layer-list::-webkit-scrollbar-thumb {
  background: #555555;
  border-radius: 3px;
}
</style>
