<template>
  <div 
    class="tab-item" 
    :class="{ 'active': isActive }"
    @click="handleClick"
    @mousedown="handleMouseDown"
  >
    <div class="tab-content">
      <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-title">{{ tab.title }}</span>
    </div>
    <button 
      v-if="tab.closable" 
      class="tab-close"
      @click.stop="handleClose"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TabItem } from './types';

interface Props {
  tab: TabItem;
  isActive: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [tabId: string];
  close: [tabId: string];
  dragStart: [tabId: string, event: MouseEvent];
}>();

const handleClick = () => {
  emit('click', props.tab.id);
};

const handleClose = () => {
  emit('close', props.tab.id);
};

const handleMouseDown = (event: MouseEvent) => {
  emit('dragStart', props.tab.id, event);
};
</script>

<style scoped>
.tab-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  min-width: 120px;
  max-width: 200px;
  font-size: 13px;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #005CE6;
}

.tab-item.active {
  border-bottom: 2px solid #4A90E2;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.tab-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: #666;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}
</style>
