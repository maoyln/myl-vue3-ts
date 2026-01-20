<template>
  <div 
    class="panel-group"
    :class="{ 'is-docked': !isFloating }"
  >
    <!-- 标签页头部 -->
    <div class="panel-header">
      <div class="tabs-container">
        <TabItemComponent
          v-for="tab in tabs"
          :key="tab.id"
          :tab="tab"
          :is-active="tab.id === activeTabId"
          @click="handleTabClick"
          @close="handleTabClose"
          @drag-start="handleTabDragStart"
        />
      </div>
      <div class="header-actions">
        <button class="action-btn" title="更多选项">⋮</button>
      </div>
    </div>

    <!-- 面板内容区域 -->
    <div class="panel-body">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        v-show="tab.id === activeTabId"
        class="panel-content"
      >
        <div class="demo-content">
          <h3>{{ tab.title }}</h3>
          <p>{{ tab.id }} - 面板内容区域</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TabItem } from './types';
import TabItemComponent from './TabItemComponent.vue';

interface Props {
  tabs: TabItem[];
  activeTabId: string;
  isFloating?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isFloating: false
});

const emit = defineEmits<{
  'update:activeTabId': [tabId: string];
  'tab-close': [tabId: string];
  'tab-drag-start': [tabId: string, event: MouseEvent];
}>();

const handleTabClick = (tabId: string) => {
  emit('update:activeTabId', tabId);
};

const handleTabClose = (tabId: string) => {
  emit('tab-close', tabId);
};

const handleTabDragStart = (tabId: string, event: MouseEvent) => {
  emit('tab-drag-start', tabId, event);
};
</script>

<style scoped>
.panel-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #E5E6EB;
  overflow: hidden;
}

.panel-group.is-docked {
  border-radius: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #E5E6EB;
  border-bottom: 1px solid #555;
  flex-shrink: 0;
  user-select: none;
  min-height: 36px;
}

.tabs-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
  padding: 0 4px;
}

.tabs-container::-webkit-scrollbar {
  height: 3px;
}

.tabs-container::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}

.header-actions {
  display: flex;
  align-items: center;
  padding: 0 4px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.action-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.panel-body {
  flex: 1;
  overflow: auto;
  position: relative;
  background: #ffffff;
}

.panel-content {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.demo-content {
  color: #000000;
}

.demo-content h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.demo-content p {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
