<template>
  <div class="berthing-container">
    <a-layout class="berthing-layout">
      <a-layout class="main-layout">
        <!-- 主内容区域 -->
        <a-layout-content class="layout-content">
          <div class="content-wrapper">
            <div class="tabs-drop-zone">
              <!-- 使用 VueDraggable 组件 -->
              <VueDraggable
                v-model="mainTabs"
                :animation="200"
                :group="{ name: 'tabs', pull: true, put: true }"
                item-key="key"
                class="tabs-container"
                @start="(e) => onDragStart(e, 'main')"
                @end="onDragEnd"
                @add="onAdd('main', $event)"
                @update="onUpdate('main')"
              >
                <div
                  v-for="tab in mainTabs"
                  :key="tab.key"
                  class="tab-item"
                  :class="{ 
                    'active': activeMainTab === tab.key,
                    'dragging': draggingTabKey === tab.key
                  }"
                  @click="activeMainTab = tab.key"
                >
                  <span class="tab-title">{{ tab.title }}</span>
                  <span class="drag-icon">⋮⋮</span>
                </div>
              </VueDraggable>
              
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
          <div class="tabs-drop-zone">
            <!-- 使用 VueDraggable 组件 -->
            <VueDraggable
              v-model="additionalTabs"
              :animation="200"
              :group="{ name: 'tabs', pull: true, put: true }"
              item-key="key"
              class="tabs-container"
              @start="(e) => onDragStart(e, 'additional')"
              @end="onDragEnd"
              @add="onAdd('additional', $event)"
              @update="onUpdate('additional')"
            >
              <div
                v-for="tab in additionalTabs"
                :key="tab.key"
                class="tab-item"
                :class="{ 
                  'active': activeAdditionalTab === tab.key,
                  'dragging': draggingTabKey === tab.key
                }"
                @click="activeAdditionalTab = tab.key"
              >
                <span class="tab-title">{{ tab.title }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </VueDraggable>
            
            <div class="tab-content" v-if="activeAdditionalTab">
              <p>{{ getTabContent(additionalTabs, activeAdditionalTab) }}</p>
            </div>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

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

// 正在拖拽的 Tab key
const draggingTabKey = ref<string | null>(null)

// 获取 Tab 内容
const getTabContent = (tabs: TabItem[], key: string) => {
  const tab = tabs.find((t: TabItem) => t.key === key)
  return tab ? tab.content : ''
}

// 拖拽开始
const onDragStart = (event: any, zone: 'main' | 'additional') => {
  // 获取被拖拽的 tab 的 key
  const oldIndex = event.oldIndex
  
  if (oldIndex !== undefined && oldIndex >= 0) {
    // 根据区域和索引获取对应的 tab
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    if (tabs[oldIndex]) {
      draggingTabKey.value = tabs[oldIndex].key
    }
  } else {
    // 如果无法从索引获取，尝试从事件对象获取
    const draggedItem = event.item
    if (draggedItem) {
      const tab = draggedItem._underlying_vm_ || 
                  draggedItem.__vueParentComponent?.props?.element ||
                  draggedItem.__vueParentComponent?.props?.value
      
      if (tab && tab.key) {
        draggingTabKey.value = tab.key
      }
    }
  }
}

// 拖拽结束
const onDragEnd = () => {
  // 清除拖拽状态
  draggingTabKey.value = null
}

// 跨容器添加
const onAdd = (zone: 'main' | 'additional', event: any) => {
  // 获取被拖拽的 tab 数据
  const draggedTab = event.item._underlying_vm_ || event.item.__vueParentComponent?.props?.element
  if (draggedTab) {
    if (zone === 'main') {
      activeMainTab.value = draggedTab.key
    } else {
      activeAdditionalTab.value = draggedTab.key
    }
  } else {
    // 如果无法从事件中获取，从数组中获取最后一个（刚添加的）
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    if (tabs.length > 0) {
      const lastTab = tabs[tabs.length - 1]
      if (zone === 'main') {
        activeMainTab.value = lastTab.key
      } else {
        activeAdditionalTab.value = lastTab.key
      }
    }
  }
}

// 同容器内排序更新
const onUpdate = (_zone: 'main' | 'additional') => {
  // 可以在这里添加排序更新时的逻辑
  // zone 参数保留用于未来扩展
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

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

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

.tabs-drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  min-height: 200px;
}

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

/* 原始位置的元素（拖拽时显示虚线边框） */
.tab-item.dragging {
  border: 2px dashed #3b82f6 !important;
  opacity: 0.5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
  animation: drag-pulse 1.5s ease-in-out infinite;
}

@keyframes drag-pulse {
  0%, 100% {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  50% {
    border-color: #60a5fa;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  }
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

.tab-content {
  flex: 1;
  padding: 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  overflow: auto;
  background-color: rgb(114, 165, 134);
}

.tab-content p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

/* VueDraggable 拖拽时的样式 */
/* 占位符（原始位置的占位元素） */
.tabs-container .sortable-ghost {
  opacity: 0.3;
  background: transparent !important;
  border: 2px dashed #9ca3af !important;
  box-shadow: none !important;
}

/* 被拖拽的元素（跟随鼠标的元素） */
.tabs-container .sortable-drag {
  opacity: 0.9;
  border: 2px dashed #3b82f6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  transform: rotate(2deg);
  z-index: 9999;
}

/* 原始位置的元素（拖拽时显示虚线边框） */
.tab-item.dragging {
  border: 2px dashed #3b82f6;
  opacity: 0.5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>

