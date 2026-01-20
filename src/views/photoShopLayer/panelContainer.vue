<template>
    <div class="panel-layout-demo">
      <!-- 演示区域 - 显示面板组合效果 -->
      <div class="demo-container">
        <h2>Photoshop 风格面板组合布局</h2>
        
        <!-- 面板容器 - 可以放置多个面板 -->
        <PanelContainer :panels="panels" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import PanelContainer from './components/PanelContainer.vue';
  
  // 定义面板数据
  const panels = ref([
    {
      id: 'color',
      title: '颜色',
      collapsed: false,
      closable: true,
      visible: true,
      type: 'color'
    },
    {
      id: 'layer',
      title: '图层',
      collapsed: false,
      closable: true,
      visible: true,
      type: 'layer'
    },
    {
      id: 'channel',
      title: '通道',
      collapsed: false,
      closable: true,
      visible: true,
      type: 'channel'
    },
    {
      id: 'property',
      title: '属性',
      collapsed: false,
      closable: true,
      visible: true,
      type: 'property'
    },
    {
      id: 'pattern',
      title: '图案',
      collapsed: false,
      closable: true,
      visible: true,
      type: 'pattern'
    },
    {
      id: '3d',
      title: '3D',
      collapsed: false,
      closable: true,
      visible: true,
      type: '3d'
    }
  ]);
  </script>
  
  <style scoped>
  .panel-layout-demo {
    width: 100%;
    height: 100vh;
    background: #1e1e1e;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .demo-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1200px;
    width: 100%;
  }
  
  .demo-container h2 {
    color: #cccccc;
    font-size: 24px;
    margin: 0;
    text-align: center;
  }
  </style>
  