<template>
  <div class="panel-container">
    <!-- 面板列表 -->
    <Panel
      v-for="panel in visiblePanels"
      :key="panel.id"
      :panel="panel"
      @toggle-collapse="toggleCollapse(panel.id)"
      @close="closePanel(panel.id)"
    >
      <!-- 根据面板类型插入不同的内容 -->
      <template v-if="panel.type === 'color'">
        <ColorPanel />
      </template>
      <template v-else-if="panel.type === 'layer'">
        <LayerPanel />
      </template>
      <template v-else-if="panel.type === 'channel'">
        <ChannelPanel />
      </template>
      <template v-else-if="panel.type === 'property'">
        <PropertyPanel />
      </template>
      <template v-else-if="panel.type === 'pattern'">
        <PatternPanel />
      </template>
      <template v-else-if="panel.type === '3d'">
        <ThreeDPanel />
      </template>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Panel from './Panel.vue';
import ColorPanel from './panels/ColorPanel.vue';
import LayerPanel from './panels/LayerPanel.vue';
import ChannelPanel from './panels/ChannelPanel.vue';
import PropertyPanel from './panels/PropertyPanel.vue';
import PatternPanel from './panels/PatternPanel.vue';
import ThreeDPanel from './panels/ThreeDPanel.vue';

interface PanelData {
  id: string;
  title: string;
  collapsed: boolean;
  closable: boolean;
  visible: boolean;
  type: string;
}

interface Props {
  panels: PanelData[];
}

const props = defineProps<Props>();

// 只显示可见的面板
const visiblePanels = computed(() => {
  return props.panels.filter(panel => panel.visible);
});

// 切换折叠状态
const toggleCollapse = (panelId: string) => {
  const panel = props.panels.find(p => p.id === panelId);
  if (panel) {
    panel.collapsed = !panel.collapsed;
  }
};

// 关闭面板
const closePanel = (panelId: string) => {
  const panel = props.panels.find(p => p.id === panelId);
  if (panel) {
    panel.visible = false;
  }
};
</script>

<style scoped>
.panel-container {
  width: 320px;
  height: 100%;
  background: #262626;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 滚动条样式 */
.panel-container::-webkit-scrollbar {
  width: 8px;
}

.panel-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.panel-container::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}

.panel-container::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a;
}
</style>
