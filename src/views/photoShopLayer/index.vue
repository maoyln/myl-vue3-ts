<template>
    <div class="ps-layout">
      <!-- 顶部菜单栏 -->
      <header class="ps-header">
        <div class="ps-header-left">
          <div class="ps-logo">PS Layout</div>
          <nav class="ps-menu">
            <div class="ps-menu-item">文件</div>
            <div class="ps-menu-item">编辑</div>
            <div class="ps-menu-item">图像</div>
            <div class="ps-menu-item">图层</div>
            <div class="ps-menu-item">选择</div>
            <div class="ps-menu-item">滤镜</div>
            <div class="ps-menu-item">视图</div>
            <div class="ps-menu-item">窗口</div>
            <div class="ps-menu-item">帮助</div>
          </nav>
        </div>
        <div class="ps-header-right">
          <button class="ps-icon-btn" title="搜索">🔍</button>
          <button class="ps-icon-btn" title="云同步">☁️</button>
          <button class="ps-icon-btn" title="设置">⚙️</button>
        </div>
      </header>
  
      <!-- 工具栏 -->
      <div class="ps-toolbar">
        <div class="ps-toolbar-section">
          <button class="ps-tool-btn active" title="移动工具">⬛</button>
          <button class="ps-tool-btn" title="选择工具">⬜</button>
          <button class="ps-tool-btn" title="套索工具">⭕</button>
          <button class="ps-tool-btn" title="魔棒工具">🪄</button>
        </div>
        <div class="ps-toolbar-section">
          <button class="ps-tool-btn" title="裁剪工具">✂️</button>
          <button class="ps-tool-btn" title="吸管工具">💧</button>
          <button class="ps-tool-btn" title="修复工具">🩹</button>
        </div>
        <div class="ps-toolbar-section">
          <button class="ps-tool-btn" title="画笔工具">🖌️</button>
          <button class="ps-tool-btn" title="橡皮擦">🧹</button>
          <button class="ps-tool-btn" title="渐变工具">🎨</button>
        </div>
        <div class="ps-toolbar-section">
          <button class="ps-tool-btn" title="文字工具">T</button>
          <button class="ps-tool-btn" title="形状工具">▭</button>
          <button class="ps-tool-btn" title="路径工具">📍</button>
        </div>
        <div class="ps-toolbar-section" style="margin-top: auto;">
          <div class="ps-color-picker">
            <div class="ps-color-main" style="background: #000;"></div>
            <div class="ps-color-sub" style="background: #fff;"></div>
          </div>
        </div>
      </div>
  
      <!-- 主内容区域 -->
      <div class="ps-main">
        <!-- 左侧工具面板（可选） -->
        <aside class="ps-sidebar ps-sidebar-left" v-if="showLeftPanel">
          <div class="ps-panel">
            <div class="ps-panel-header">
              <span class="ps-panel-title">工具预设</span>
              <button class="ps-panel-collapse" @click="showLeftPanel = false">×</button>
            </div>
            <div class="ps-panel-content">
              <div class="ps-preset-item">预设 1</div>
              <div class="ps-preset-item">预设 2</div>
              <div class="ps-preset-item">预设 3</div>
            </div>
          </div>
        </aside>
  
        <!-- 中央工作区 -->
        <main class="ps-workspace">
          <div class="ps-workspace-tabs">
            <div class="ps-tab active">
              <span>文档1.psd</span>
              <button class="ps-tab-close">×</button>
            </div>
            <div class="ps-tab">
              <span>文档2.psd</span>
              <button class="ps-tab-close">×</button>
            </div>
          </div>
          <div class="ps-canvas-container">
            <div class="ps-canvas">
              <div class="ps-canvas-content">
                <!-- 画布内容区域 -->
                <div class="ps-placeholder">
                  <p>工作区域</p>
                  <p class="ps-placeholder-tip">在这里显示您的内容</p>
                </div>
              </div>
            </div>
          </div>
          <div class="ps-workspace-footer">
            <span class="ps-zoom-info">100%</span>
            <input type="range" class="ps-zoom-slider" min="10" max="200" value="100">
          </div>
        </main>
  
        <!-- 右侧面板区 -->
        <aside class="ps-sidebar ps-sidebar-right">
          <!-- 颜色面板 -->
          <div class="ps-panel">
            <div class="ps-panel-header">
              <span class="ps-panel-title">颜色</span>
              <div class="ps-panel-actions">
                <button class="ps-panel-btn" title="折叠">−</button>
                <button class="ps-panel-btn" title="更多">⋯</button>
              </div>
            </div>
            <div class="ps-panel-content">
              <div class="ps-color-display">
                <div class="ps-color-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
              </div>
              <div class="ps-color-values">
                <div class="ps-color-input">
                  <label>R</label>
                  <input type="number" value="102">
                </div>
                <div class="ps-color-input">
                  <label>G</label>
                  <input type="number" value="126">
                </div>
                <div class="ps-color-input">
                  <label>B</label>
                  <input type="number" value="234">
                </div>
              </div>
            </div>
          </div>
  
          <!-- 图层面板 -->
          <div class="ps-panel">
            <div class="ps-panel-header">
              <span class="ps-panel-title">图层</span>
              <div class="ps-panel-actions">
                <button class="ps-panel-btn" title="新建图层">+</button>
                <button class="ps-panel-btn" title="删除">🗑️</button>
              </div>
            </div>
            <div class="ps-panel-content">
              <div class="ps-layer-list">
                <div class="ps-layer-item active">
                  <div class="ps-layer-visibility">👁️</div>
                  <div class="ps-layer-thumbnail"></div>
                  <div class="ps-layer-name">图层 1</div>
                </div>
                <div class="ps-layer-item">
                  <div class="ps-layer-visibility">👁️</div>
                  <div class="ps-layer-thumbnail"></div>
                  <div class="ps-layer-name">背景</div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 属性面板 -->
          <div class="ps-panel">
            <div class="ps-panel-header">
              <span class="ps-panel-title">属性</span>
              <div class="ps-panel-actions">
                <button class="ps-panel-btn" title="折叠">−</button>
              </div>
            </div>
            <div class="ps-panel-content">
              <div class="ps-property-group">
                <div class="ps-property-label">不透明度</div>
                <div class="ps-property-control">
                  <input type="range" min="0" max="100" value="100">
                  <span>100%</span>
                </div>
              </div>
              <div class="ps-property-group">
                <div class="ps-property-label">混合模式</div>
                <div class="ps-property-control">
                  <select>
                    <option>正常</option>
                    <option>正片叠底</option>
                    <option>滤色</option>
                    <option>叠加</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  // 控制面板显示
  const showLeftPanel = ref(true);
  </script>
  
  <style scoped>
  /* ===== 整体布局 ===== */
  .ps-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: #2c2c2c;
    color: #cccccc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    overflow: hidden;
  }
  
  /* ===== 顶部菜单栏 ===== */
  .ps-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    background: #323232;
    border-bottom: 1px solid #1a1a1a;
    padding: 0 12px;
    flex-shrink: 0;
  }
  
  .ps-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .ps-logo {
    font-weight: 600;
    font-size: 14px;
    color: #4a90e2;
  }
  
  .ps-menu {
    display: flex;
    gap: 4px;
  }
  
  .ps-menu-item {
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }
  
  .ps-menu-item:hover {
    background: #404040;
  }
  
  .ps-header-right {
    display: flex;
    gap: 8px;
  }
  
  .ps-icon-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #cccccc;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    font-size: 14px;
  }
  
  .ps-icon-btn:hover {
    background: #404040;
  }
  
  /* ===== 工具栏 ===== */
  .ps-toolbar {
    display: flex;
    flex-direction: column;
    width: 52px;
    background: #2c2c2c;
    border-right: 1px solid #1a1a1a;
    padding: 8px 4px;
    gap: 8px;
    flex-shrink: 0;
  }
  
  .ps-toolbar-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid #404040;
  }
  
  .ps-toolbar-section:last-child {
    border-bottom: none;
  }
  
  .ps-tool-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    color: #cccccc;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ps-tool-btn:hover {
    background: #404040;
  }
  
  .ps-tool-btn.active {
    background: #4a90e2;
    color: #ffffff;
  }
  
  .ps-color-picker {
    position: relative;
    width: 36px;
    height: 36px;
    margin: 0 auto;
  }
  
  .ps-color-main {
    width: 28px;
    height: 28px;
    border: 2px solid #ffffff;
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }
  
  .ps-color-sub {
    width: 28px;
    height: 28px;
    border: 2px solid #ffffff;
    border-radius: 2px;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
  }
  
  /* ===== 主内容区 ===== */
  .ps-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  /* ===== 侧边栏 ===== */
  .ps-sidebar {
    background: #262626;
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow-y: auto;
    flex-shrink: 0;
  }
  
  .ps-sidebar-left {
    width: 260px;
    border-right: 1px solid #1a1a1a;
  }
  
  .ps-sidebar-right {
    width: 280px;
    border-left: 1px solid #1a1a1a;
  }
  
  /* ===== 面板 ===== */
  .ps-panel {
    background: #2c2c2c;
    border-bottom: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
  }
  
  .ps-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #323232;
    border-bottom: 1px solid #1a1a1a;
    cursor: pointer;
    user-select: none;
  }
  
  .ps-panel-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .ps-panel-actions {
    display: flex;
    gap: 4px;
  }
  
  .ps-panel-btn {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #999999;
    cursor: pointer;
    border-radius: 2px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .ps-panel-btn:hover {
    background: #404040;
    color: #ffffff;
  }
  
  .ps-panel-collapse {
    background: transparent;
    border: none;
    color: #999999;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ps-panel-content {
    padding: 12px;
  }
  
  /* ===== 预设项 ===== */
  .ps-preset-item {
    padding: 8px;
    background: #383838;
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .ps-preset-item:hover {
    background: #404040;
  }
  
  /* ===== 工作区 ===== */
  .ps-workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
    overflow: hidden;
  }
  
  .ps-workspace-tabs {
    display: flex;
    gap: 2px;
    background: #252525;
    border-bottom: 1px solid #1a1a1a;
    padding: 0 4px;
    overflow-x: auto;
    flex-shrink: 0;
  }
  
  .ps-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #2c2c2c;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
  }
  
  .ps-tab:hover {
    background: #323232;
  }
  
  .ps-tab.active {
    background: #1e1e1e;
    color: #ffffff;
  }
  
  .ps-tab-close {
    background: transparent;
    border: none;
    color: #999999;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: all 0.2s;
  }
  
  .ps-tab-close:hover {
    background: #404040;
    color: #ffffff;
  }
  
  .ps-canvas-container {
    flex: 1;
    overflow: auto;
    background: #1e1e1e;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .ps-canvas {
    background: #2c2c2c;
    border: 1px solid #404040;
    border-radius: 4px;
    min-width: 600px;
    min-height: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .ps-canvas-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ps-placeholder {
    text-align: center;
    color: #666666;
  }
  
  .ps-placeholder p {
    margin: 8px 0;
    font-size: 14px;
  }
  
  .ps-placeholder-tip {
    font-size: 12px;
    color: #555555;
  }
  
  .ps-workspace-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #252525;
    border-top: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  
  .ps-zoom-info {
    font-size: 12px;
    min-width: 50px;
  }
  
  .ps-zoom-slider {
    flex: 1;
    max-width: 200px;
  }
  
  /* ===== 颜色面板 ===== */
  .ps-color-display {
    margin-bottom: 12px;
  }
  
  .ps-color-box {
    width: 100%;
    height: 80px;
    border-radius: 4px;
    border: 1px solid #404040;
  }
  
  .ps-color-values {
    display: flex;
    gap: 8px;
  }
  
  .ps-color-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .ps-color-input label {
    font-size: 11px;
    color: #999999;
    text-transform: uppercase;
  }
  
  .ps-color-input input {
    width: 100%;
    padding: 6px;
    background: #383838;
    border: 1px solid #404040;
    border-radius: 4px;
    color: #cccccc;
    font-size: 12px;
  }
  
  /* ===== 图层面板 ===== */
  .ps-layer-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .ps-layer-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #383838;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .ps-layer-item:hover {
    background: #404040;
  }
  
  .ps-layer-item.active {
    background: #4a90e2;
    color: #ffffff;
  }
  
  .ps-layer-visibility {
    font-size: 14px;
    cursor: pointer;
  }
  
  .ps-layer-thumbnail {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
    border: 1px solid #404040;
    flex-shrink: 0;
  }
  
  .ps-layer-name {
    flex: 1;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* ===== 属性面板 ===== */
  .ps-property-group {
    margin-bottom: 16px;
  }
  
  .ps-property-group:last-child {
    margin-bottom: 0;
  }
  
  .ps-property-label {
    font-size: 12px;
    color: #999999;
    margin-bottom: 6px;
  }
  
  .ps-property-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .ps-property-control input[type="range"] {
    flex: 1;
  }
  
  .ps-property-control span {
    font-size: 12px;
    min-width: 40px;
    text-align: right;
  }
  
  .ps-property-control select {
    flex: 1;
    padding: 6px;
    background: #383838;
    border: 1px solid #404040;
    border-radius: 4px;
    color: #cccccc;
    font-size: 12px;
  }
  
  /* ===== 滚动条样式 ===== */
  .ps-sidebar::-webkit-scrollbar,
  .ps-canvas-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .ps-sidebar::-webkit-scrollbar-track,
  .ps-canvas-container::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  .ps-sidebar::-webkit-scrollbar-thumb,
  .ps-canvas-container::-webkit-scrollbar-thumb {
    background: #404040;
    border-radius: 4px;
  }
  
  .ps-sidebar::-webkit-scrollbar-thumb:hover,
  .ps-canvas-container::-webkit-scrollbar-thumb:hover {
    background: #4a4a4a;
  }
  
  /* ===== 输入框通用样式 ===== */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: #404040;
    height: 4px;
    border-radius: 2px;
    outline: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #4a90e2;
    border-radius: 50%;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #4a90e2;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  </style>
  