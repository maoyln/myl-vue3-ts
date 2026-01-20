<template>
  <div class="panel" :class="{ 'is-collapsed': panel.collapsed }">
    <!-- 面板头部 -->
    <div class="panel-header" @click="$emit('toggleCollapse')">
      <div class="panel-header-left">
        <button class="panel-expand-btn" :class="{ 'is-collapsed': panel.collapsed }">
          ▼
        </button>
        <span class="panel-title">{{ panel.title }}</span>
      </div>
      <div class="panel-header-right">
        <button
          v-if="panel.closable"
          class="panel-close-btn"
          @click.stop="$emit('close')"
          title="关闭面板"
        >
          ×
        </button>
        <button class="panel-menu-btn" @click.stop title="更多选项">
          ⋯
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div v-show="!panel.collapsed" class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PanelData {
  id: string;
  title: string;
  collapsed: boolean;
  closable: boolean;
  visible: boolean;
  type: string;
}

interface Props {
  panel: PanelData;
}

defineProps<Props>();

defineEmits<{
  toggleCollapse: [];
  close: [];
}>();
</script>

<style scoped>
.panel {
  background: #2c2c2c;
  border-bottom: 1px solid #1a1a1a;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.panel.is-collapsed {
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #323232;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  min-height: 36px;
}

.panel-header:hover {
  background: #383838;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-expand-btn {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: #999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: transform 0.3s;
  padding: 0;
}

.panel-expand-btn.is-collapsed {
  transform: rotate(-90deg);
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #cccccc;
}

.panel-close-btn,
.panel-menu-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999999;
  cursor: pointer;
  border-radius: 2px;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.panel-close-btn:hover,
.panel-menu-btn:hover {
  background: #404040;
  color: #ffffff;
}

.panel-content {
  padding: 12px;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}
</style>
