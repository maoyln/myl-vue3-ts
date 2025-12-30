<template>
  <div class="berthing-container">
    <!-- 拖拽预览容器（隐藏，用于存放快照） -->
    <div ref="dragPreview" class="drag-preview-container">
      <div ref="previewWrapper" class="drag-preview-wrapper">
        <!-- 快照将通过 JavaScript 动态创建 -->
      </div>
    </div>

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
                  :data-key="tab.key"
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
                :data-key="tab.key"
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
import { ref, type Ref, nextTick, onMounted, onUnmounted } from 'vue'
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
// 保存被拖拽的 tab 信息（用于拖拽结束后保持激活状态）
const draggedTabInfo = ref<{ key: string; zone: 'main' | 'additional' } | null>(null)

// Refs for drag preview elements
const dragPreview = ref<HTMLElement | null>(null)
const previewWrapper = ref<HTMLElement | null>(null)

// 获取 Tab 内容
const getTabContent = (tabs: TabItem[], key: string) => {
  const tab = tabs.find((t: TabItem) => t.key === key)
  return tab ? tab.content : ''
}

// 创建拖拽预览快照（包含拖拽的 tab 和当前激活的内容区域）
const createDragPreviewSnapshot = (tab: TabItem, zone: 'main' | 'additional') => {
  if (!previewWrapper.value) return null

  // 找到对应的 drop-zone 元素
  const dropZone = zone === 'main' 
    ? document.querySelector('.tabs-drop-zone:first-of-type') as HTMLElement
    : document.querySelectorAll('.tabs-drop-zone')[1] as HTMLElement
  
  if (!dropZone) return null

  // 克隆整个 drop-zone（包含 tab 和 content）
  const snapshot = dropZone.cloneNode(true) as HTMLElement
  
  // 获取当前激活的 tab key
  const activeTabKey = zone === 'main' ? activeMainTab.value : activeAdditionalTab.value
  
  // 清理克隆元素中不需要的内容
  const tabsContainer = snapshot.querySelector('.tabs-container')
  const contentArea = snapshot.querySelector('.tab-content')
  
  if (tabsContainer) {
    // 移除所有 tab，只保留当前拖拽的
    const allTabs = tabsContainer.querySelectorAll('.tab-item')
    allTabs.forEach((tabEl) => {
      const tabKey = tabEl.getAttribute('data-key')
      if (tabKey !== tab.key) {
        tabEl.remove()
      }
    })
  }
  
  // 只保留当前拖拽 tab 对应的内容区域（如果该 tab 是激活状态）
  if (contentArea) {
    if (tab.key !== activeTabKey) {
      // 如果拖拽的不是激活的 tab，移除内容区域
      contentArea.remove()
    }
    // 如果拖拽的是激活的 tab，内容区域已经存在，保持不变
  }
  
  // 设置预览样式
  snapshot.style.width = `${Math.min(dropZone.getBoundingClientRect().width, 500)}px`
  snapshot.style.maxWidth = '500px'
  snapshot.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)'
  snapshot.style.borderRadius = '8px'
  snapshot.style.overflow = 'hidden'
  
  // 清空预览容器并添加快照
  previewWrapper.value.innerHTML = ''
  previewWrapper.value.appendChild(snapshot)
  
  // 显示预览容器
  if (dragPreview.value) {
    dragPreview.value.style.cssText = 'position: fixed; top: -9999px; left: -9999px; opacity: 1; visibility: visible; display: block; pointer-events: none; z-index: 9999;'
  }
  
  return snapshot
}

// 处理原生 dragstart 事件（用于设置自定义预览图像）
const handleNativeDragStart = (event: DragEvent) => {
  if (!event.dataTransfer || !previewWrapper.value) return
  
  // 检查是否有准备好的预览快照
  const snapshot = previewWrapper.value.firstElementChild as HTMLElement
  if (snapshot) {
    try {
      // 计算偏移量（让鼠标位置在 tab 上）
      const tabsContainer = snapshot.querySelector('.tabs-container')
      const tab = tabsContainer?.querySelector('.tab-item') as HTMLElement
      
      let yOffset = 0
      if (tab) {
        const tabRect = tab.getBoundingClientRect()
        const snapshotRect = snapshot.getBoundingClientRect()
        yOffset = tabRect.top - snapshotRect.top + Math.min(event.offsetY || 0, tabRect.height || 50)
      }
      
      event.dataTransfer.setDragImage(
        snapshot,
        event.offsetX || 0,
        yOffset
      )
    } catch (e) {
      console.debug('Failed to set custom drag image:', e)
    }
  }
}

// 组件挂载时添加全局 dragstart 监听
onMounted(() => {
  document.addEventListener('dragstart', handleNativeDragStart, true)
})

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('dragstart', handleNativeDragStart, true)
})

// 拖拽开始
const onDragStart = async (event: any, zone: 'main' | 'additional') => {
  // 获取被拖拽的 tab 的 key
  const oldIndex = event.oldIndex
  let draggedTab: TabItem | null = null
  
  if (oldIndex !== undefined && oldIndex >= 0) {
    // 根据区域和索引获取对应的 tab
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    if (tabs[oldIndex]) {
      draggedTab = tabs[oldIndex]
      draggingTabKey.value = draggedTab.key
      // 保存被拖拽的 tab 信息
      draggedTabInfo.value = { key: draggedTab.key, zone }
    }
  } else {
    // 如果无法从索引获取，尝试从事件对象获取
    const draggedItem = event.item
    if (draggedItem) {
      const tab = draggedItem._underlying_vm_ || 
                  draggedItem.__vueParentComponent?.props?.element ||
                  draggedItem.__vueParentComponent?.props?.value
      
      if (tab && tab.key) {
        draggedTab = tab
        draggingTabKey.value = tab.key
        // 保存被拖拽的 tab 信息
        draggedTabInfo.value = { key: tab.key, zone }
      }
    }
  }
  
  // 创建预览快照
  if (draggedTab) {
    await nextTick() // 确保 DOM 已更新
    createDragPreviewSnapshot(draggedTab, zone)
  }
}

// 拖拽结束
const onDragEnd = () => {
  // 保持被拖拽的 tab 处于激活状态
  if (draggedTabInfo.value) {
    const { key, zone } = draggedTabInfo.value
    
    // 检查 tab 是否还在对应的区域中
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    const tabExists = tabs.some(t => t.key === key)
    
    if (tabExists) {
      // 如果 tab 还在原区域，保持激活状态
      if (zone === 'main') {
        activeMainTab.value = key
      } else {
        activeAdditionalTab.value = key
      }
    } else {
      // 如果 tab 不在原区域了（跨容器拖拽），在目标区域中查找
      const targetTabs = zone === 'main' ? additionalTabs.value : mainTabs.value
      const tabInTarget = targetTabs.some(t => t.key === key)
      
      if (tabInTarget) {
        // 在目标区域中激活
        if (zone === 'main') {
          activeAdditionalTab.value = key
        } else {
          activeMainTab.value = key
        }
      }
    }
  }
  
  // 清除拖拽状态
  draggingTabKey.value = null
  draggedTabInfo.value = null
  
  // 清理预览快照
  if (previewWrapper.value) {
    previewWrapper.value.innerHTML = ''
  }
  if (dragPreview.value) {
    dragPreview.value.style.cssText = 'position: fixed; top: -9999px; left: -9999px; opacity: 0; visibility: hidden; pointer-events: none;'
  }
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
const onUpdate = (zone: 'main' | 'additional') => {
  // 同容器内排序时，保持被拖拽的 tab 处于激活状态
  if (draggedTabInfo.value && draggedTabInfo.value.zone === zone) {
    const { key } = draggedTabInfo.value
    if (zone === 'main') {
      activeMainTab.value = key
    } else {
      activeAdditionalTab.value = key
    }
  }
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

/* 拖拽预览容器样式 */
.drag-preview-container {
  position: fixed;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  z-index: 9999;
}

.drag-preview-wrapper {
  /* 快照会直接克隆原始元素，包含所有样式 */
  display: block;
}
</style>

