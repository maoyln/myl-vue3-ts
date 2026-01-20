<template>
  <div class="docking-panel-demo">
    <!-- 配置切换控制栏 -->
    <div class="control-bar">
      <div class="control-left">
        <h1 class="demo-title">📐 PhotoShow 面板组合布局演示</h1>
        <p class="demo-subtitle">支持停靠（Dock）和悬浮（Float）两种布局模式</p>
      </div>
      <div class="control-right">
        <div class="config-selector">
          <label>布局方案：</label>
          <select v-model="currentConfigId" @change="handleConfigChange">
            <option 
              v-for="item in configList" 
              :key="item.id" 
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
        <button 
          class="toggle-btn"
          @click="toggleDebugInfo"
        >
          {{ showDebugInfo ? '隐藏' : '显示' }} 调试信息
        </button>
      </div>
    </div>

    <!-- 配置说明卡片 -->
    <div class="config-info">
      <div class="info-content">
        <h3>{{ currentConfigInfo?.name }}</h3>
        <p>{{ currentConfigInfo?.description }}</p>
      </div>
      <div class="info-stats">
        <div class="stat-item">
          <span class="stat-label">停靠位置</span>
          <span class="stat-value">{{ dockPosition }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">悬浮面板</span>
          <span class="stat-value">{{ floatPanelCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总面板数</span>
          <span class="stat-value">{{ totalPanelCount }}</span>
        </div>
      </div>
    </div>

    <!-- 布局管理器容器 -->
    <div class="layout-container">
      <LayoutManagerComponent
        v-if="currentConfig"
        :key="currentConfigId"
        :config="currentConfig.layoutManagerConfig"
        :show-debug-info="showDebugInfo"
        @config-change="handleLayoutConfigChange"
        @tab-change="handleTabChange"
        @tab-close="handleTabClose"
      />
      
      <!-- 中心内容区域（模拟工作区） -->
      <div class="workspace">
        <div class="workspace-content">
          <h2>🎨 工作区域</h2>
          <p>这里是主工作区域，周围是停靠和悬浮的面板</p>
          <div class="workspace-info">
            <p>当前布局方案：<strong>{{ currentConfigInfo?.name }}</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LayoutManagerComponent from './LayoutManagerComponent.vue';
import { configList } from './configs';
import type { LayoutConfig, LayoutManagerConfig } from './types';

// 当前配置
const currentConfigId = ref('config1');
const currentConfig = ref<LayoutConfig | null>(null);
const showDebugInfo = ref(false);

// 计算属性
const currentConfigInfo = computed(() => {
  return configList.find(item => item.id === currentConfigId.value);
});

const dockPosition = computed(() => {
  return currentConfig.value?.layoutManagerConfig.dockContainerConfig?.dockPosition || 'N/A';
});

const floatPanelCount = computed(() => {
  return currentConfig.value?.layoutManagerConfig.floatPanelGroupList?.length || 0;
});

const totalPanelCount = computed(() => {
  const dockPanels = currentConfig.value?.layoutManagerConfig.dockContainerConfig?.groupList
    .reduce((sum, group) => sum + group.panelList.length, 0) || 0;
  return dockPanels + floatPanelCount.value;
});

// 配置切换
const handleConfigChange = () => {
  const configInfo = configList.find(item => item.id === currentConfigId.value);
  if (configInfo) {
    // 使用深拷贝创建新的配置对象，避免直接修改原始配置
    currentConfig.value = JSON.parse(JSON.stringify(configInfo.config));
  }
};

// 布局配置变化
const handleLayoutConfigChange = (config: LayoutManagerConfig) => {
  if (currentConfig.value) {
    currentConfig.value.layoutManagerConfig = config;
  }
};

// 标签页切换
const handleTabChange = (_groupId: string, _tabId: string) => {
  // 可以在这里添加其他逻辑
};

// 标签页关闭
const handleTabClose = (_groupId: string, _tabId: string) => {
  // 可以在这里添加其他逻辑
};

// 切换调试信息
const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value;
};

// 初始化
onMounted(() => {
  handleConfigChange();
});
</script>

<style scoped>
.docking-panel-demo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  color: #000000;
  overflow: hidden;
}

/* 控制栏 */
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #E5E6EB;
  border-bottom: 2px solid #4A90E2;
  flex-shrink: 0;
}

.control-left {
  flex: 1;
}

.demo-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #000000;
}

.demo-subtitle {
  margin: 0;
  font-size: 12px;
  color: #666666;
}

.control-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.config-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-selector label {
  font-size: 13px;
  color: #000000;
}

.config-selector select {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  color: #000000;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.config-selector select:hover {
  background: #f5f5f5;
  border-color: #4A90E2;
}

.config-selector select:focus {
  outline: none;
  border-color: #4A90E2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.toggle-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.toggle-btn:active {
  transform: translateY(1px);
}

/* 配置信息卡片 */
.config-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #E5E6EB;
  flex-shrink: 0;
}

.info-content h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #000000;
}

.info-content p {
  margin: 0;
  font-size: 13px;
  color: #666666;
}

.info-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666666;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #4A90E2;
}

/* 布局容器 */
.layout-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #ffffff;
}

/* 工作区 */
.workspace {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  padding: 40px;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 2px dashed #E5E6EB;
  border-radius: 8px;
  text-align: center;
  z-index: 0;
}

.workspace-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #000000;
}

.workspace-content > p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666666;
}

.workspace-info {
  padding: 16px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 4px;
  text-align: left;
}

.workspace-info p {
  margin: 8px 0;
  font-size: 13px;
  color: #000000;
}

.workspace-info strong {
  color: #4A90E2;
}
</style>
  