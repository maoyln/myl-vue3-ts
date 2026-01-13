<template>
  <div class="berthing-frame-page">
    <DockContainer ref="dockContainerRef" :config="dockConfig">
      <!-- 主内容区 -->
      <div class="main-content">
        <div class="welcome-card">
          <h1>🎨 停泊吸附系统演示</h1>
          <p class="subtitle">类似 Photoshop 的面板停泊功能</p>
          
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <div class="feature-text">
                <strong>智能吸附</strong>
                <p>拖拽面板到容器边缘或其他面板附近时自动吸附</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔄</span>
              <div class="feature-text">
                <strong>灵活切换</strong>
                <p>面板可以在停靠和浮动状态之间自由切换</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔗</span>
              <div class="feature-text">
                <strong>面板组合</strong>
                <p>多个面板可以相互吸附组成组合面板</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📏</span>
              <div class="feature-text">
                <strong>自由调整</strong>
                <p>浮动面板支持拖拽调整大小</p>
              </div>
            </div>
          </div>

          <div class="control-panel">
            <h3>控制面板</h3>
            <div class="button-group">
              <button @click="addToolPanel" class="btn btn-primary">
                ➕ 添加工具面板
              </button>
              <button @click="addPropertiesPanel" class="btn btn-primary">
                ➕ 添加属性面板
              </button>
              <button @click="addLayersPanel" class="btn btn-primary">
                ➕ 添加图层面板
              </button>
              <button @click="addHistoryPanel" class="btn btn-secondary">
                ➕ 添加历史面板
              </button>
              <button @click="resetAll" class="btn btn-danger">
                🔄 重置所有面板
              </button>
            </div>

            <div class="info-box">
              <h4>使用说明：</h4>
              <ol>
                <li>点击按钮添加面板</li>
                <li>拖拽面板标题栏移动面板</li>
                <li>将面板拖到<strong>容器边缘</strong>或<strong>其他面板附近</strong>时会显示蓝色提示区域</li>
                <li>释放鼠标即可完成吸附</li>
                <li>点击"分离"按钮可将停靠的面板转为浮动状态</li>
                <li>浮动面板可通过右下角调整大小</li>
              </ol>
            </div>

            <div class="stats">
              <p>当前面板数量: <strong>{{ panelCount }}</strong></p>
              <p>拖拽状态: <strong>{{ isDragging ? '拖拽中' : '未拖拽' }}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </DockContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DockContainer } from '@/components/docking';
import type { DockManagerConfig } from '@/components/docking';

// Dock 容器引用
const dockContainerRef = ref<InstanceType<typeof DockContainer>>();

// Dock 配置
const dockConfig: DockManagerConfig = {
  snapThreshold: 30,
  hotZoneSize: 50,
  minPanelWidth: 200,
  minPanelHeight: 150,
};

// 面板计数器
let panelIdCounter = 0;

// 获取管理器
const getManager = () => dockContainerRef.value?.manager;

// 计算属性
const panelCount = computed(() => {
  const manager = getManager();
  return manager?.panelList.value.length ?? 0;
});

const isDragging = computed(() => {
  const manager = getManager();
  return manager?.dragInfo.value !== null;
});

// 添加工具面板
function addToolPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `tools-${++panelIdCounter}`,
    title: `工具箱 ${panelIdCounter}`,
    width: 250,
    height: 400,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 添加属性面板
function addPropertiesPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `properties-${++panelIdCounter}`,
    title: `属性 ${panelIdCounter}`,
    width: 300,
    height: 350,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 添加图层面板
function addLayersPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `layers-${++panelIdCounter}`,
    title: `图层 ${panelIdCounter}`,
    width: 280,
    height: 450,
    defaultPosition: 'right',
    closable: true,
    resizable: true,
  });
}

// 添加历史面板
function addHistoryPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `history-${++panelIdCounter}`,
    title: `历史记录 ${panelIdCounter}`,
    width: 250,
    height: 300,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 重置所有面板
function resetAll() {
  const manager = getManager();
  if (!manager) return;

  // 移除所有面板
  const panels = manager.panelList.value;
  panels.forEach(panel => {
    manager.removePanel(panel.id);
  });

  // 重置计数器
  panelIdCounter = 0;
}
</script>

<style scoped>
.berthing-frame-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.welcome-card {
  max-width: 900px;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.welcome-card h1 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 30px 0;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-text strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.feature-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
  line-height: 1.5;
}

.control-panel {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.control-panel h3 {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
}

.control-panel h4 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background-color: #fff;
  color: #667eea;
}

.btn-primary:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.info-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-box ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
  line-height: 1.8;
}

.info-box li {
  margin-bottom: 8px;
}

.stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stats p {
  margin: 0;
  font-size: 1.1rem;
}

.stats strong {
  color: #ffd700;
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-card {
    padding: 24px;
  }

  .welcome-card h1 {
    font-size: 1.8rem;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
