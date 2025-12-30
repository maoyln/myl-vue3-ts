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
            <div ref="mainDropZone" class="tabs-drop-zone" :class="{ 'drag-over': dragOverZone === 'main' }">
              <!-- 使用 VueDraggable 组件 -->
              <VueDraggable
                ref="mainTabsContainer"
                v-model="mainTabs"
                :animation="200"
                :group="{ name: 'tabs', pull: true, put: true }"
                item-key="key"
                class="tabs-container"
                @start="(e) => onDragStart(e, 'main')"
                @end="onDragEnd"
                @add="onAdd('main', $event)"
                @update="onUpdate('main')"
                @move="onMove"
              >
                <div
                  v-for="(tab, index) in mainTabs"
                  :key="tab.key"
                  :data-key="tab.key"
                  class="tab-item"
                  :class="{ 
                    'active': activeMainTab === tab.key,
                    'dragging': draggingTabKey === tab.key,
                    'insert-before': dropIndicator?.zone === 'main' && dropIndicator?.index === index,
                    'insert-after': dropIndicator?.zone === 'main' && dropIndicator?.index === index + 1 && index === mainTabs.length - 1
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
          <div ref="additionalDropZone" class="tabs-drop-zone" :class="{ 'drag-over': dragOverZone === 'additional' }">
            <!-- 使用 VueDraggable 组件 -->
            <VueDraggable
              ref="additionalTabsContainer"
              v-model="additionalTabs"
              :animation="200"
              :group="{ name: 'tabs', pull: true, put: true }"
              item-key="key"
              class="tabs-container"
              @start="(e) => onDragStart(e, 'additional')"
              @end="onDragEnd"
              @add="onAdd('additional', $event)"
              @update="onUpdate('additional')"
              @move="onMove"
            >
              <div
                v-for="(tab, index) in additionalTabs"
                :key="tab.key"
                :data-key="tab.key"
                class="tab-item"
                :class="{ 
                  'active': activeAdditionalTab === tab.key,
                  'dragging': draggingTabKey === tab.key,
                  'insert-before': dropIndicator?.zone === 'additional' && dropIndicator?.index === index,
                  'insert-after': dropIndicator?.zone === 'additional' && dropIndicator?.index === index + 1 && index === additionalTabs.length - 1
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

// 定义插入指示器类型
interface DropIndicator {
  zone: 'main' | 'additional' | null
  index: number
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
// 拖拽源区域
const sourceZone = ref<'main' | 'additional' | null>(null)
// 拖拽悬停区域
const dragOverZone = ref<'main' | 'additional' | null>(null)
// 插入位置指示器
const dropIndicator: Ref<DropIndicator> = ref({
  zone: null,
  index: -1
})
// 当前鼠标位置（用于吸附功能）
const currentMousePosition = ref<{ x: number; y: number } | null>(null)

// Refs for drag preview elements
const dragPreview = ref<HTMLElement | null>(null)
const previewWrapper = ref<HTMLElement | null>(null)

// Refs for drop zones and containers
const mainDropZone = ref<HTMLElement | null>(null)
const additionalDropZone = ref<HTMLElement | null>(null)
const mainTabsContainer = ref<any>(null)
const additionalTabsContainer = ref<any>(null)

// 获取 Tab 内容
const getTabContent = (tabs: TabItem[], key: string) => {
  const tab = tabs.find((t: TabItem) => t.key === key)
  return tab ? tab.content : ''
}

// 创建拖拽预览快照（包含当前选中的 tab 和当前选中 tab 对应的内容区域）
const createDragPreviewSnapshot = (tab: TabItem, zone: 'main' | 'additional') => {
  if (!previewWrapper.value) return null

  // 使用 ref 获取对应的 drop-zone 元素
  const dropZone = zone === 'main' ? mainDropZone.value : additionalDropZone.value
  if (!dropZone) return null

  // 获取当前激活的 tab key（当前选中的tab）
  const activeTabKey = zone === 'main' ? activeMainTab.value : activeAdditionalTab.value
  
  // 获取当前激活的 tab 数据
  const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
  const activeTab = tabs.find(t => t.key === activeTabKey)
  
  // 如果没有激活的tab，使用被拖拽的tab
  const displayTab = activeTab || tab
  
  // 克隆整个 drop-zone（包含 tab 和 content）
  const snapshot = dropZone.cloneNode(true) as HTMLElement
  
  // 1. 清理 tab：只保留当前选中的 tab（如果存在）
  const allTabs = snapshot.querySelectorAll('[data-key]')
  allTabs.forEach((tabEl) => {
    const tabKey = tabEl.getAttribute('data-key')
    // 保留当前选中的tab，如果没有选中的tab则保留被拖拽的tab
    if (tabKey !== displayTab.key) {
      tabEl.remove()
    }
  })
  
  // 2. 查找内容区域
  let contentArea = Array.from(snapshot.children).find(
    el => el.querySelector('p') !== null
  ) as HTMLElement
  
  // 如果内容区域不存在，创建一个新的
  if (!contentArea) {
    contentArea = document.createElement('div')
    contentArea.className = 'tab-content'
    const pElement = document.createElement('p')
    contentArea.appendChild(pElement)
    snapshot.appendChild(contentArea)
  }
  
  // 3. 更新内容区域为当前选中 tab 的内容
  const pElement = contentArea.querySelector('p')
  if (pElement) {
    pElement.textContent = displayTab.content
  }
  
  // 4. 设置预览样式
  const dropZoneRect = dropZone.getBoundingClientRect()
  Object.assign(snapshot.style, {
    width: `${Math.min(dropZoneRect.width, 500)}px`,
    maxWidth: '500px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'hidden'
  })
  
  console.log('snapshot', snapshot)
  // 5. 清空预览容器并添加快照
  previewWrapper.value.innerHTML = ''
  previewWrapper.value.appendChild(snapshot)
  
  // 6. 显示预览容器
  if (dragPreview.value) {
    Object.assign(dragPreview.value.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      opacity: '1',
      visibility: 'visible',
      display: 'block',
      pointerEvents: 'none',
      zIndex: '9999'
    })
  }
  
  return snapshot
}

// 处理原生 dragstart 事件（用于设置自定义预览图像）
const handleNativeDragStart = (event: DragEvent) => {
  if (!event.dataTransfer || !previewWrapper.value) return
  
  // 检查是否有准备好的预览快照
  const snapshot = previewWrapper.value.firstElementChild as HTMLElement
  if (!snapshot) return
  
  try {
    // 查找 tab 元素（使用 data-key 属性，更可靠）
    const tabElement = snapshot.querySelector('[data-key]') as HTMLElement
    
    if (!tabElement) {
      // 如果没有找到 tab，使用快照本身
      event.dataTransfer.setDragImage(snapshot, event.offsetX || 0, event.offsetY || 0)
      return
    }
    
    // 计算偏移量（让鼠标位置在 tab 上）
    const tabRect = tabElement.getBoundingClientRect()
    const snapshotRect = snapshot.getBoundingClientRect()
    
    // 计算 tab 相对于快照的偏移
    const relativeTop = tabRect.top - snapshotRect.top
    const relativeLeft = tabRect.left - snapshotRect.left
    
    // 计算鼠标在 tab 上的相对位置
    const mouseXInTab = (event.offsetX || 0) - relativeLeft
    const mouseYInTab = (event.offsetY || 0) - relativeTop
    
    // 限制偏移量在 tab 范围内
    const xOffset = Math.max(0, Math.min(mouseXInTab, tabRect.width))
    const yOffset = relativeTop + Math.max(0, Math.min(mouseYInTab, tabRect.height))
    
    event.dataTransfer.setDragImage(snapshot, xOffset, yOffset)
  } catch (e) {
    console.debug('Failed to set custom drag image:', e)
    // 降级处理：使用快照本身
    try {
      event.dataTransfer.setDragImage(snapshot, event.offsetX || 0, event.offsetY || 0)
    } catch (fallbackError) {
      console.debug('Fallback drag image also failed:', fallbackError)
    }
  }
}

// 处理鼠标移动（用于吸附功能）
const handleMouseMove = (event: MouseEvent) => {
  currentMousePosition.value = { x: event.clientX, y: event.clientY }
  
  // 如果正在拖拽，更新吸附指示器
  if (draggingTabKey.value && sourceZone.value) {
    // 检查鼠标在哪个区域
    const mainZoneRect = mainDropZone.value?.getBoundingClientRect()
    const additionalZoneRect = additionalDropZone.value?.getBoundingClientRect()
    
    let targetZone: 'main' | 'additional' | null = null
    if (mainZoneRect && 
        event.clientX >= mainZoneRect.left && 
        event.clientX <= mainZoneRect.right &&
        event.clientY >= mainZoneRect.top && 
        event.clientY <= mainZoneRect.bottom) {
      targetZone = 'main'
    } else if (additionalZoneRect && 
               event.clientX >= additionalZoneRect.left && 
               event.clientX <= additionalZoneRect.right &&
               event.clientY >= additionalZoneRect.top && 
               event.clientY <= additionalZoneRect.bottom) {
      targetZone = 'additional'
    }
    
    if (targetZone) {
      const insertIndex = getClosestTabIndex(event, targetZone)
      dropIndicator.value = { zone: targetZone, index: insertIndex }
      dragOverZone.value = targetZone
    } else {
      dropIndicator.value = { zone: null, index: -1 }
      dragOverZone.value = null
    }
  }
}

// 组件挂载时添加全局事件监听
onMounted(() => {
  document.addEventListener('dragstart', handleNativeDragStart, true)
  document.addEventListener('mousemove', handleMouseMove)
})

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('dragstart', handleNativeDragStart, true)
  document.removeEventListener('mousemove', handleMouseMove)
})

// 计算最近的插入位置（吸附功能）
const getClosestTabIndex = (event: MouseEvent, zone: 'main' | 'additional'): number => {
  const container = zone === 'main' ? mainTabsContainer.value : additionalTabsContainer.value
  if (!container) return -1

  // 获取容器元素（VueDraggable 组件的根元素）
  const containerEl = container.$el || container.el || container
  if (!containerEl) return -1

  const tabElements = Array.from(containerEl.querySelectorAll('[data-key]'))
  if (tabElements.length === 0) return 0

  const mouseX = event.clientX
  const mouseY = event.clientY

  let closestIndex = -1
  let minDistance = Infinity

  tabElements.forEach((element, index) => {
    const rect = (element as HTMLElement).getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // 计算鼠标到tab中心的距离
    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      // 判断应该插入到当前tab的前面还是后面
      if (mouseX < centerX) {
        closestIndex = index
      } else {
        closestIndex = index + 1
      }
    }
  })

  // 如果没有找到合适的位置，插入到末尾
  if (closestIndex === -1) {
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    closestIndex = tabs.length
  }

  return closestIndex
}

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
      sourceZone.value = zone
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
        sourceZone.value = zone
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

// 拖拽移动（用于吸附功能）
const onMove = (event: any) => {
  // 使用当前鼠标位置更新吸附指示器
  if (currentMousePosition.value) {
    const { relatedContext } = event
    const targetZone = relatedContext?.list ? 
      (relatedContext.list === mainTabs.value ? 'main' : 'additional') : null

    if (targetZone) {
      const insertIndex = getClosestTabIndex(
        { clientX: currentMousePosition.value.x, clientY: currentMousePosition.value.y } as MouseEvent,
        targetZone
      )
      dropIndicator.value = { zone: targetZone, index: insertIndex }
      dragOverZone.value = targetZone
    } else {
      dropIndicator.value = { zone: null, index: -1 }
      dragOverZone.value = null
    }
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
  sourceZone.value = null
  dragOverZone.value = null
  dropIndicator.value = { zone: null, index: -1 }
  
  // 清理预览快照
  if (previewWrapper.value) {
    previewWrapper.value.innerHTML = ''
  }
  if (dragPreview.value) {
    Object.assign(dragPreview.value.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      opacity: '0',
      visibility: 'hidden',
      pointerEvents: 'none'
    })
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
  
  // 清除吸附指示器
  dropIndicator.value = { zone: null, index: -1 }
  dragOverZone.value = null
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
  
  // 清除吸附指示器
  dropIndicator.value = { zone: null, index: -1 }
  dragOverZone.value = null
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

/* 插入位置指示器（吸附功能） */
.tab-item.insert-before::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-radius: 2px;
  animation: pulse-indicator 1s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  z-index: 10;
}

.tab-item.insert-after::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-radius: 2px;
  animation: pulse-indicator 1s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  z-index: 10;
}

@keyframes pulse-indicator {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(0.95);
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
.tabs-container :deep(.sortable-ghost) {
  opacity: 0.3;
  background: transparent !important;
  border: 2px dashed #9ca3af !important;
  box-shadow: none !important;
}

.tabs-container :deep(.sortable-drag) {
  opacity: 0.9;
  border: 2px dashed #3b82f6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  transform: rotate(2deg);
  z-index: 9999;
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
  display: block;
}
</style>

