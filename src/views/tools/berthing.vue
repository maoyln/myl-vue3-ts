<template>
  <div class="berthing-container">
    <a-layout class="berthing-layout">
      <a-layout class="main-layout">
        <!-- 主内容区域 -->
        <a-layout-content class="layout-content">
          <div class="content-wrapper">
            <h3 class="area-title">主功能区</h3>
            <div 
              class="tabs-drop-zone"
              :class="{ 'drag-over': dragOverZone === 'main' }"
              @dragover.prevent="handleDragOver($event, 'main')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'main')"
            >
              <div class="tabs-container">
                <div
                  v-for="tab in mainTabs"
                  :key="tab.key"
                  class="tab-item"
                  :class="{ 'active': activeMainTab === tab.key, 'dragging': draggingTab?.key === tab.key }"
                  draggable="true"
                  @dragstart="handleDragStart($event, tab, 'main')"
                  @dragend="handleDragEnd"
                  @click="activeMainTab = tab.key"
                >
                  <span class="tab-title">{{ tab.title }}</span>
                  <span class="drag-icon">⋮⋮</span>
                </div>
              </div>
              <div class="tab-content" v-if="activeMainTab">
                <p>{{ getTabContent(mainTabs, activeMainTab) }}</p>
              </div>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
      
      <!-- 附加功能区域 -->
      <a-layout-content class="additional-content">
        <div class="content-wrapper">
          <h3 class="area-title">附属功能区</h3>
          <div 
            class="tabs-drop-zone"
            :class="{ 'drag-over': dragOverZone === 'additional' }"
            @dragover.prevent="handleDragOver($event, 'additional')"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, 'additional')"
          >
            <div class="tabs-container">
              <div
                v-for="tab in additionalTabs"
                :key="tab.key"
                class="tab-item"
                :class="{ 'active': activeAdditionalTab === tab.key, 'dragging': draggingTab?.key === tab.key }"
                draggable="true"
                @dragstart="handleDragStart($event, tab, 'additional')"
                @dragend="handleDragEnd"
                @click="activeAdditionalTab = tab.key"
              >
                <span class="tab-title">{{ tab.title }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </div>
            <div class="tab-content" v-if="activeAdditionalTab">
              <p>{{ getTabContent(additionalTabs, activeAdditionalTab) }}</p>
            </div>
          </div>
        </div>
      </a-layout-content>

      <!-- 页面底部 -->
      <a-layout-footer class="layout-footer">
        <div class="footer-content">
          泊靠管理系统 © 2025 All Rights Reserved
        </div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

// 定义 Tab 类型
interface TabItem {
  key: string
  title: string
  content: string
}

// 主功能区 Tabs
const mainTabs: Ref<TabItem[]> = ref([
  { key: '1', title: '泊位概览', content: '泊位概览信息展示区域' },
  { key: '2', title: '泊位管理', content: '泊位管理相关功能' },
  { key: '3', title: '船舶信息', content: '船舶信息管理' },
  { key: '4', title: '作业计划', content: '作业计划安排' },
  { key: '5', title: '统计报表', content: '统计报表展示' }
])

// 附属功能区 Tabs
const additionalTabs: Ref<TabItem[]> = ref([
  { key: 'overview', title: '总体概况', content: '总体概况信息展示区域' },
  { key: 'berth-control', title: '泊位调度', content: '泊位调度相关功能' },
  { key: 'vessel-data', title: '船只资料', content: '船只资料管理' },
  { key: 'operation-schedule', title: '操作安排', content: '操作安排计划' },
  { key: 'data-analysis', title: '数据分析', content: '数据分析展示' }
])

// 当前激活的 Tab
const activeMainTab = ref('1')
const activeAdditionalTab = ref('overview')

// 拖拽状态
const draggingTab: Ref<TabItem | null> = ref(null)
const sourceZone: Ref<'main' | 'additional' | null> = ref(null)
const dragOverZone: Ref<'main' | 'additional' | null> = ref(null)

// 获取 Tab 内容
const getTabContent = (tabs: TabItem[], key: string) => {
  const tab = tabs.find((t: TabItem) => t.key === key)
  return tab ? tab.content : ''
}

// 开始拖拽
const handleDragStart = (event: DragEvent, tab: TabItem, zone: 'main' | 'additional') => {
  draggingTab.value = tab
  sourceZone.value = zone
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', tab.key)
  }
}

// 拖拽结束
const handleDragEnd = () => {
  draggingTab.value = null
  sourceZone.value = null
  dragOverZone.value = null
}

// 拖拽经过
const handleDragOver = (event: DragEvent, zone: 'main' | 'additional') => {
  event.preventDefault()
  // 只有当拖拽源和目标不同时才显示高亮
  if (sourceZone.value && sourceZone.value !== zone) {
    dragOverZone.value = zone
  }
}

// 离开拖拽区域
const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // 只有当真正离开拖放区时才清除高亮
  if (!target.contains(relatedTarget)) {
    dragOverZone.value = null
  }
}

// 放下
const handleDrop = (event: DragEvent, targetZone: 'main' | 'additional') => {
  event.preventDefault()
  
  if (!draggingTab.value || !sourceZone.value || sourceZone.value === targetZone) {
    dragOverZone.value = null
    return
  }

  const tab = draggingTab.value

  // 从源区域移除
  if (sourceZone.value === 'main') {
    const index = mainTabs.value.findIndex((t: TabItem) => t.key === tab.key)
    if (index !== -1) {
      mainTabs.value.splice(index, 1)
    }
    // 如果移除的是当前激活的 tab，切换到第一个
    if (activeMainTab.value === tab.key && mainTabs.value.length > 0) {
      activeMainTab.value = mainTabs.value[0].key
    }
  } else {
    const index = additionalTabs.value.findIndex((t: TabItem) => t.key === tab.key)
    if (index !== -1) {
      additionalTabs.value.splice(index, 1)
    }
    // 如果移除的是当前激活的 tab，切换到第一个
    if (activeAdditionalTab.value === tab.key && additionalTabs.value.length > 0) {
      activeAdditionalTab.value = additionalTabs.value[0].key
    }
  }

  // 添加到目标区域
  if (targetZone === 'main') {
    mainTabs.value.push(tab)
    activeMainTab.value = tab.key
  } else {
    additionalTabs.value.push(tab)
    activeAdditionalTab.value = tab.key
  }

  // 重置拖拽状态
  dragOverZone.value = null
  draggingTab.value = null
  sourceZone.value = null
}
</script>

<style scoped>
.berthing-container {
  height: 100%;
  width: 100%;
}

.berthing-layout {
  height: 100%;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* 主布局样式 */
.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 内容区域样式 */
.layout-content {
  flex: 1;
  overflow: hidden;
  background: #f0f2f5;
  padding: 16px;
}

.additional-content {
  flex: 1;
  border-top: 2px solid #e5e7eb;
}

.content-wrapper {
  height: 100%;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.area-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* 拖放区域样式 */
.tabs-drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px dashed transparent;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 200px;
}

.tabs-drop-zone.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Tab 容器 */
.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  min-height: 24px;
}

/* Tab 项样式 */
.tab-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  cursor: move;
  user-select: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
}

.tab-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.tab-item.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.tab-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.tab-title {
  flex: 1;
}

.drag-icon {
  font-size: 16px;
  opacity: 0.7;
  cursor: grab;
}

.tab-item:active .drag-icon {
  cursor: grabbing;
}

/* Tab 内容区域 */
.tab-content {
  flex: 1;
  padding: 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  overflow: auto;
}

.tab-content p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

/* 底部样式 */
.layout-footer {
  background: #fff;
  padding: 16px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.footer-content {
  text-align: center;
  color: #86909c;
  font-size: 14px;
}

/* 空状态提示 */
.tabs-container:empty::before {
  content: '将标签拖到这里';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-item {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .area-title {
    font-size: 14px;
  }
}
</style>