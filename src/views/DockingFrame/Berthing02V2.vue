<template>
  <div class="berthing-02-v2">
    <div class="header">
      <h1>三级面板结构 - V2 架构</h1>
      <div class="controls">
        <button @click="addFloatContainer">添加悬浮容器</button>
        <button @click="resetLayout">重置布局</button>
        <button @click="showDebug = !showDebug">{{ showDebug ? '隐藏' : '显示' }}调试信息</button>
      </div>
    </div>

    <div ref="mainContainerRef" class="main-content">
      <!-- 三级面板结构管理器 -->
      <DockManagerV2
        :config="layoutConfig"
        @config-change="handleConfigChange"
        @panel-dock="handlePanelDock"
        @panel-undock="handlePanelUndock"
      />

      <!-- 调试信息 -->
      <div v-if="showDebug" class="debug-panel">
        <h3>调试信息</h3>
        <div class="debug-info">
          <p><strong>容器数量:</strong> {{ layoutConfig.containers.length }}</p>
          <p><strong>总面板数:</strong> {{ getTotalPanels() }}</p>
          <details open>
            <summary>左侧容器结构</summary>
            <div v-if="layoutConfig.containers[0]">
              <p><strong>位置:</strong> {{ layoutConfig.containers[0].position }}</p>
              <p><strong>尺寸:</strong> {{ layoutConfig.containers[0].width }}×{{ layoutConfig.containers[0].height }}</p>
              <p><strong>分组数:</strong> {{ layoutConfig.containers[0].groups.length }}</p>
              <div v-for="(group, i) in layoutConfig.containers[0].groups" :key="group.id" style="margin-left: 20px; border-left: 2px solid #4A90E2; padding-left: 10px;">
                <p><strong>分组{{ i+1 }}:</strong> {{ group.id }}</p>
                <p>占比: {{ (group.groupRatio * 100).toFixed(1) }}%</p>
                <p>方向: {{ group.direction }}</p>
                <p>面板数: {{ group.panels.length }}</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { DockLayoutConfig, DockLayoutContainer, PanelGroupV2 } from './docking/typesV2';
import DockManagerV2 from './docking/DockManagerV2.vue';
import { useDockManager } from './docking/useDockManager';

// ========== 状态 ==========

const showDebug = ref(false);
const mainContainerRef = ref<HTMLElement | null>(null);

// ========== 初始化 DockManager（提供 provide/inject 上下文）==========

const dockManager = useDockManager({
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150
});

onMounted(() => {
  if (mainContainerRef.value) {
    dockManager.registerContainer(mainContainerRef.value);
  }
});

// ========== 初始布局配置 ==========

const layoutConfig = reactive<DockLayoutConfig>({
  config: {
    hotZoneSize: 80,
    minPanelWidth: 200,
    minPanelHeight: 150,
    minGroupRatio: 0.1,
    minPanelRatio: 0.1,
    snapThreshold: 20
  },
  containers: [
    // 左侧停靠容器
    {
      id: 'container_left',
      position: 'left',
      width: 300,
      height: 600,
      resizable: true,
      minWidth: 200,
      minHeight: 150,
      groups: [
        {
          id: 'group_left_1',
          groupRatio: 0.6,
          direction: 'vertical',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_explorer',
              tabs: [
                { id: 'tab_explorer', title: '资源管理器', icon: '📁', closable: false },
                { id: 'tab_explorer1', title: '资源管理器1', icon: '📁', closable: false }
              ],
              activeTabId: 'tab_explorer',
              width: 300,
              height: 360,
              originalWidth: 300,
              originalHeight: 360,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'left',
              resizable: true,
              panelRatio: 0.5
            },
            {
              id: 'panel_search',
              tabs: [
                { id: 'tab_search', title: '搜索', icon: '🔍', closable: true }
              ],
              activeTabId: 'tab_search',
              width: 300,
              height: 360,
              originalWidth: 300,
              originalHeight: 360,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'left',
              resizable: true,
              panelRatio: 0.5
            }
          ]
        },
        {
          id: 'group_left_2',
          groupRatio: 0.4,
          direction: 'vertical',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_git',
              tabs: [
                { id: 'tab_git', title: 'Git', icon: '🌿', closable: true },
                { id: 'tab_timeline', title: '时间线', icon: '⏱️', closable: true }
              ],
              activeTabId: 'tab_git',
              width: 300,
              height: 240,
              originalWidth: 300,
              originalHeight: 240,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'left',
              resizable: true,
              panelRatio: 1
            }
          ]
        }
      ]
    },
    // 右侧停靠容器
    {
      id: 'container_right',
      position: 'right',
      width: 320,
      height: 600,
      resizable: true,
      minWidth: 200,
      minHeight: 150,
      groups: [
        {
          id: 'group_right_1',
          groupRatio: 0.5,
          direction: 'vertical',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_outline',
              tabs: [
                { id: 'tab_outline', title: '大纲', icon: '📋', closable: true }
              ],
              activeTabId: 'tab_outline',
              width: 320,
              height: 300,
              originalWidth: 320,
              originalHeight: 300,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'right',
              resizable: true,
              panelRatio: 1
            }
          ]
        },
        {
          id: 'group_right_2',
          groupRatio: 0.5,
          direction: 'horizontal',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_layers',
              tabs: [
                { id: 'tab_layers', title: '图层', icon: '🗂️', closable: true }
              ],
              activeTabId: 'tab_layers',
              width: 160,
              height: 300,
              originalWidth: 160,
              originalHeight: 300,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'right',
              resizable: true,
              panelRatio: 0.5
            },
            {
              id: 'panel_properties',
              tabs: [
                { id: 'tab_properties', title: '属性', icon: '⚙️', closable: true }
              ],
              activeTabId: 'tab_properties',
              width: 160,
              height: 300,
              originalWidth: 160,
              originalHeight: 300,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'right',
              resizable: true,
              panelRatio: 0.5
            }
          ]
        }
      ]
    },
    // 底部停靠容器
    {
      id: 'container_bottom',
      position: 'bottom',
      width: 800,
      height: 200,
      resizable: true,
      minWidth: 200,
      minHeight: 150,
      groups: [
        {
          id: 'group_bottom_1',
          groupRatio: 1,
          direction: 'horizontal',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_terminal',
              tabs: [
                { id: 'tab_terminal', title: '终端', icon: '💻', closable: false },
                { id: 'tab_problems', title: '问题', icon: '⚠️', closable: true },
                { id: 'tab_output', title: '输出', icon: '📤', closable: true }
              ],
              activeTabId: 'tab_terminal',
              width: 800,
              height: 200,
              originalWidth: 800,
              originalHeight: 200,
              x: 0,
              y: 0,
              zIndex: 1000,
              state: 'docked',
              position: 'bottom',
              resizable: true,
              panelRatio: 1
            }
          ]
        }
      ]
    },
    // 悬浮容器
    {
      id: 'container_float_1',
      position: 'float',
      width: 400,
      height: 300,
      x: 600,
      y: 200,
      zIndex: 1001,
      resizable: true,
      minWidth: 200,
      minHeight: 150,
      groups: [
        {
          id: 'group_float_1',
          groupRatio: 1,
          direction: 'vertical',
          resizable: true,
          minRatio: 0.1,
          panels: [
            {
              id: 'panel_colors',
              tabs: [
                { id: 'tab_colors', title: '颜色', icon: '🎨', closable: true },
                { id: 'tab_swatches', title: '色板', icon: '🎭', closable: true }
              ],
              activeTabId: 'tab_colors',
              width: 400,
              height: 300,
              originalWidth: 400,
              originalHeight: 300,
              x: 600,
              y: 200,
              zIndex: 1001,
              state: 'floating',
              position: 'float',
              resizable: true,
              panelRatio: 1
            }
          ]
        }
      ]
    }
  ]
});

// ========== 辅助函数 ==========

function getTotalPanels(): number {
  return layoutConfig.containers.reduce((total, container) => {
    return total + container.groups.reduce((groupTotal, group) => {
      return groupTotal + group.panels.length;
    }, 0);
  }, 0);
}

// ========== 事件处理 ==========

function handleConfigChange(newConfig: DockLayoutConfig) {
  console.log('配置已更新', newConfig);
}

function handlePanelDock(panelId: string, targetId: string) {
  console.log('面板停靠', panelId, targetId);
}

function handlePanelUndock(panelId: string) {
  console.log('面板取消停靠', panelId);
}

// ========== 操作 ==========

function addFloatContainer() {
  const newContainer: DockLayoutContainer = {
    id: `container_float_${Date.now()}`,
    position: 'float',
    width: 350,
    height: 250,
    x: 400 + Math.random() * 200,
    y: 150 + Math.random() * 200,
    zIndex: 1000 + layoutConfig.containers.length,
    resizable: true,
    minWidth: 200,
    minHeight: 150,
    groups: [
      {
        id: `group_float_${Date.now()}`,
        groupRatio: 1,
        direction: 'vertical',
        resizable: true,
        minRatio: 0.1,
        panels: [
          {
            id: `panel_new_${Date.now()}`,
            tabs: [
              { id: `tab_new_${Date.now()}`, title: '新面板', icon: '📄', closable: true }
            ],
            activeTabId: `tab_new_${Date.now()}`,
            width: 350,
            height: 250,
            originalWidth: 350,
            originalHeight: 250,
            x: 0,
            y: 0,
            zIndex: 1000,
            state: 'floating',
            position: 'float',
            resizable: true,
            panelRatio: 1
          } as PanelGroupV2,
        ]
      }
    ]
  };

  layoutConfig.containers.push(newContainer);
}

function resetLayout() {
  // 重置为初始布局
  location.reload();
}
</script>

<style scoped>
.berthing-02-v2 {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #cccccc;
  overflow: hidden;
}

.header {
  height: 60px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.header h1 {
  font-size: 18px;
  color: #4A90E2;
  margin: 0;
}

.controls {
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  background: #0e639c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.controls button:hover {
  background: #1177bb;
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* ========== 调试面板 ========== */

.debug-panel {
  position: fixed;
  top: 70px;
  right: 10px;
  width: 300px;
  max-height: 500px;
  background: rgba(45, 45, 48, 0.95);
  border: 1px solid #4A90E2;
  border-radius: 4px;
  padding: 12px;
  z-index: 10001;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4A90E2;
}

.debug-info p {
  margin: 6px 0;
  font-size: 12px;
}

.debug-info strong {
  color: #cccccc;
}

.debug-info details {
  margin-top: 12px;
}

.debug-info summary {
  cursor: pointer;
  padding: 4px 8px;
  background: #3e3e42;
  border-radius: 3px;
  margin-bottom: 8px;
}

.debug-info pre {
  font-size: 10px;
  background: #1e1e1e;
  padding: 8px;
  border-radius: 3px;
  overflow-x: auto;
  max-height: 300px;
}
</style>
