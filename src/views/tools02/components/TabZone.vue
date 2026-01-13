<template>
  <a-layout-content :class="contentClass">
    <div class="content-wrapper">
      <div 
        ref="dropZoneRef"
        class="tabs-drop-zone"
        :class="{ 
          'drag-over': isDragOver
        }"
      >
        <!-- 使用 VueDraggable 组件 -->
        <div ref="tabsContainerRef" class="tabs-container-wrapper">
          <VueDraggable
            v-model="tabs"
            :animation="200"
            :group="{ name: 'tabs', pull: true, put: true }"
            item-key="key"
            class="tabs-container"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
            @start="(e) => onDragStart(e)"
            @end="onDragEnd"
            @add="onAdd($event)"
            @remove="onRemove($event)"
            @update="onUpdate"
            @move="onMove"
          >
            <div
              v-for="(tab, index) in tabs"
              :key="tab.key"
              :ref="(el) => setTabRef(el, index)"
              class="tab-item"
              :class="{ 
                'active': activeTab === tab.key,
                'dragging': draggingTabKey === tab.key,
                'insert-before': insertIndex === index && insertPosition === 'before',
                'insert-after': insertIndex === index && insertPosition === 'after'
              }"
              @click="handleTabClick(tab.key)"
            >
              <span class="tab-title">{{ tab.title }}</span>
              <span class="drag-icon">⋮⋮</span>
            </div>
          </VueDraggable>
        </div>
        
        <!-- 插入位置指示器 -->
        <div 
          v-if="showInsertIndicator"
          class="insert-indicator"
          :style="insertIndicatorStyle"
        ></div>
        
        <div class="tab-content" v-if="activeTab">
          <component 
            :is="getTabComponent(activeTab)"
          />
        </div>
      </div>
    </div>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

// 定义 Tab 类型
export interface TabItem {
  key: string
  title: string
  component: string // 组件名称
}

// Props
interface Props {
  tabs: TabItem[]
  contentClass?: string
  zoneId: string
  componentMap?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  contentClass: 'layout-content',
  componentMap: () => ({})
})

// Emits
const emit = defineEmits<{
  'update:tabs': [tabs: TabItem[]]
  'tab-change': [key: string]
  'drag-start': [key: string, zoneId: string]
  'drag-end': []
  'tab-add': [key: string, zoneId: string]
  'tab-remove': [key: string, zoneId: string]
}>()

// 当前激活的 Tab
const activeTab = ref<string>('')
const tabs = computed({
  get: () => props.tabs,
  set: (value) => emit('update:tabs', value)
})

// 正在拖拽的 Tab key
const draggingTabKey = ref<string | null>(null)
// 是否正在拖拽
const isDragging = ref(false)

// 拖拽吸附相关
const isDragOver = ref(false)
const dropZoneRef = ref<HTMLElement | null>(null)
const tabsContainerRef = ref<HTMLElement | null>(null)
const tabRefs = ref<(HTMLElement | null)[]>([])
let dragMoveHandler: ((e: MouseEvent) => void) | null = null

// 插入位置相关
const insertIndex = ref<number>(-1)
const insertPosition = ref<'before' | 'after' | null>(null)
const showInsertIndicator = ref(false)
const insertIndicatorStyle = ref<Record<string, string>>({})

// 获取 Tab 对应的组件
const getTabComponent = (key: string) => {
  const tab = tabs.value.find(t => t.key === key)
  if (!tab) return null
  
  // 从 props.componentMap 中获取组件
  if (props.componentMap && props.componentMap[tab.component]) {
    return props.componentMap[tab.component]
  }
  
  // 否则返回 null
  return null
}

// Tab 点击
const handleTabClick = (key: string) => {
  // 如果正在拖拽，不触发点击事件
  if (isDragging.value) {
    return
  }
  activeTab.value = key
  emit('tab-change', key)
}

// 设置 tab 引用
const setTabRef = (el: any, index: number) => {
  if (el) {
    tabRefs.value[index] = el as HTMLElement
  }
}

// 更新 tab 引用数组
const updateTabRefs = () => {
  nextTick(() => {
    tabRefs.value = new Array(tabs.value.length).fill(null)
  })
}

// 监听 tabs 变化，更新引用数组
watch(() => tabs.value.length, () => {
  updateTabRefs()
}, { immediate: true })

// 拖拽开始
const onDragStart = (event: any) => {
  isDragging.value = true
  insertIndex.value = -1
  insertPosition.value = null
  showInsertIndicator.value = false
  
  const oldIndex = event.oldIndex
  
  if (oldIndex !== undefined && oldIndex >= 0 && tabs.value[oldIndex]) {
    draggingTabKey.value = tabs.value[oldIndex].key
    emit('drag-start', tabs.value[oldIndex].key, props.zoneId)
  } else {
    const draggedItem = event.item
    if (draggedItem) {
      const tab = draggedItem._underlying_vm_ || 
                  draggedItem.__vueParentComponent?.props?.element ||
                  draggedItem.__vueParentComponent?.props?.value
      
      if (tab?.key) {
        draggingTabKey.value = tab.key
        emit('drag-start', tab.key, props.zoneId)
      }
    }
  }
  
  // 获取 tabs-container 引用
  nextTick(() => {
    if (tabsContainerRef.value) {
      const container = tabsContainerRef.value.querySelector('.tabs-container')
      if (container) {
        tabsContainerRef.value = container as HTMLElement
      }
    }
  })
  
  // 开始监听鼠标移动以实现吸附效果
  startDragMoveListener()
}

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false
  draggingTabKey.value = null
  isDragOver.value = false
  insertIndex.value = -1
  insertPosition.value = null
  showInsertIndicator.value = false
  stopDragMoveListener()
  emit('drag-end')
}

// 拖拽移动（用于检测是否接近目标区域）
const onMove = () => {
  // VueDraggable 的 move 事件用于控制是否允许移动
  // 我们在这里检测插入位置
  checkInsertPosition()
  return true // 允许移动
}

// 检查插入位置（检测鼠标与每个tab的距离）
const checkInsertPosition = () => {
  if (!tabsContainerRef.value || !isDragging.value) {
    showInsertIndicator.value = false
    return
  }
  
  // 获取拖拽元素的位置
  const draggedElement = document.querySelector('.sortable-drag') as HTMLElement
  if (!draggedElement) {
    showInsertIndicator.value = false
    return
  }
  
  const draggedRect = draggedElement.getBoundingClientRect()
  const mouseX = draggedRect.left + draggedRect.width / 2
  const mouseY = draggedRect.top + draggedRect.height / 2
  
  // 检查鼠标是否在容器内
  const containerRect = tabsContainerRef.value.getBoundingClientRect()
  const isInContainer = (
    mouseX >= containerRect.left &&
    mouseX <= containerRect.right &&
    mouseY >= containerRect.top &&
    mouseY <= containerRect.bottom
  )
  
  if (!isInContainer) {
    showInsertIndicator.value = false
    insertIndex.value = -1
    insertPosition.value = null
    return
  }
  
  // 计算与每个tab的距离
  let minDistance = Infinity
  let closestIndex = -1
  let closestPosition: 'before' | 'after' | null = null
  
  tabRefs.value.forEach((tabEl, index) => {
    if (!tabEl) return
    
    const tabRect = tabEl.getBoundingClientRect()
    const tabCenterX = tabRect.left + tabRect.width / 2
    const tabCenterY = tabRect.top + tabRect.height / 2
    
    // 计算距离（使用欧几里得距离）
    const distance = Math.sqrt(
      Math.pow(mouseX - tabCenterX, 2) + Math.pow(mouseY - tabCenterY, 2)
    )
    
    // 判断是在tab前面还是后面
    const isBefore = mouseX < tabCenterX
    
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = index
      closestPosition = isBefore ? 'before' : 'after'
    }
  })
  
  // 如果距离太远，不显示指示器
  const threshold = 100 // 像素阈值
  if (minDistance > threshold) {
    // 检查是否在容器边缘（第一个或最后一个位置）
    if (mouseX < containerRect.left + 50 && tabs.value.length > 0) {
      closestIndex = 0
      closestPosition = 'before'
      minDistance = 0
    } else if (mouseX > containerRect.right - 50 && tabs.value.length > 0) {
      closestIndex = tabs.value.length - 1
      closestPosition = 'after'
      minDistance = 0
    } else {
      showInsertIndicator.value = false
      insertIndex.value = -1
      insertPosition.value = null
      return
    }
  }
  
  // 显示插入指示器
  if (closestIndex >= 0 && closestPosition && minDistance <= threshold) {
    insertIndex.value = closestIndex
    insertPosition.value = closestPosition
    
    const targetTab = tabRefs.value[closestIndex]
    if (targetTab && tabsContainerRef.value) {
      const tabRect = targetTab.getBoundingClientRect()
      const wrapperRect = tabsContainerRef.value.getBoundingClientRect()
      
      if (closestPosition === 'before') {
        insertIndicatorStyle.value = {
          left: `${tabRect.left - wrapperRect.left - 2}px`,
          top: `${tabRect.top - wrapperRect.top}px`,
          width: '2px',
          height: `${tabRect.height}px`
        }
      } else {
        insertIndicatorStyle.value = {
          left: `${tabRect.right - wrapperRect.left + 2}px`,
          top: `${tabRect.top - wrapperRect.top}px`,
          width: '2px',
          height: `${tabRect.height}px`
        }
      }
      
      showInsertIndicator.value = true
      isDragOver.value = true
    }
  } else {
    showInsertIndicator.value = false
  }
}

// 开始监听鼠标移动
const startDragMoveListener = () => {
  if (dragMoveHandler) return
  
  dragMoveHandler = (e: MouseEvent) => {
    if (!isDragging.value) return
    
    // 实时检测插入位置
    checkInsertPosition()
    
    // 检查是否在拖拽区域内
    if (dropZoneRef.value) {
      const rect = dropZoneRef.value.getBoundingClientRect()
      const isInZone = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )
      
      if (isInZone) {
        isDragOver.value = true
      } else {
        // 如果不在区域内，清除指示器
        if (!showInsertIndicator.value) {
          isDragOver.value = false
        }
      }
    }
  }
  
  document.addEventListener('mousemove', dragMoveHandler, { passive: true })
}

// 停止监听鼠标移动
const stopDragMoveListener = () => {
  if (dragMoveHandler) {
    document.removeEventListener('mousemove', dragMoveHandler)
    dragMoveHandler = null
  }
}


onUnmounted(() => {
  // 组件卸载时清理
  stopDragMoveListener()
})

// 跨容器添加（元素被添加到当前区域）
const onAdd = (event: any) => {
  const newIndex = event.newIndex
  if (newIndex !== undefined && newIndex >= 0 && tabs.value[newIndex]) {
    const addedTab = tabs.value[newIndex]
    activeTab.value = addedTab.key
    emit('tab-add', addedTab.key, props.zoneId)
    emit('tab-change', addedTab.key)
  } else if (tabs.value.length > 0) {
    // 备用方案：使用最后一个 tab
    const lastTab = tabs.value[tabs.value.length - 1]
    activeTab.value = lastTab.key
    emit('tab-add', lastTab.key, props.zoneId)
    emit('tab-change', lastTab.key)
  }
}

// 跨容器移除（元素从当前区域移除）
const onRemove = (event: any) => {
  const removedTab = event.item._underlying_vm_ || event.item.__vueParentComponent?.props?.element
  
  if (removedTab?.key) {
    emit('tab-remove', removedTab.key, props.zoneId)
    
    // 如果移除的是当前激活的 tab，切换到其他 tab
    if (activeTab.value === removedTab.key) {
      if (tabs.value.length > 0) {
        activeTab.value = tabs.value[0].key
        emit('tab-change', tabs.value[0].key)
      } else {
        activeTab.value = ''
      }
    }
  }
}

// 同容器内排序更新
const onUpdate = () => {
  // 排序更新时的逻辑（如果需要）
}

// 暴露方法供父组件调用
defineExpose({
  activeTab,
  setActiveTab: (key: string) => {
    activeTab.value = key
  }
})
</script>

<style scoped>
.content-wrapper {
  height: 100%;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
}

.tabs-drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  min-height: 200px;
  transition: all 0.3s ease;
  position: relative;
}

.tabs-drop-zone.drag-over {
  background: #e0e7ff;
  border: 2px dashed #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* .tabs-drop-zone.snap-top::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
  border-radius: 8px 8px 0 0;
  animation: snap-pulse 1s ease-in-out infinite;
  z-index: 10;
} */

/* .tabs-drop-zone.snap-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
  border-radius: 0 0 8px 8px;
  animation: snap-pulse 1s ease-in-out infinite;
  z-index: 10;
} */

@keyframes snap-pulse {
  0%, 100% {
    opacity: 1;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleX(1.05);
  }
}

.tabs-container-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  min-height: 24px;
  position: relative;
  z-index: 1;
}

/* 插入位置指示器 */
.insert-indicator {
  position: absolute;
  background: #3b82f6;
  border-radius: 2px;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  animation: insert-pulse 1s ease-in-out infinite;
}

@keyframes insert-pulse {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(1.1);
  }
}

/* Tab 插入位置样式 */
.tab-item.insert-before::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  z-index: 10;
}

.tab-item.insert-after::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  z-index: 10;
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
  touch-action: none;
  -webkit-user-drag: element;
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
}

/* VueDraggable 拖拽时的样式 */
.tabs-container .sortable-ghost {
  opacity: 0.3;
  background: transparent !important;
  border: 2px dashed #9ca3af !important;
  box-shadow: none !important;
  transition: none !important;
}

.tabs-container .sortable-chosen {
  opacity: 0.8;
  cursor: grabbing !important;
}

.tabs-container .sortable-drag {
  opacity: 0.95 !important;
  border: 2px dashed #3b82f6 !important;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5) !important;
  transform: rotate(2deg) scale(1.05) !important;
  z-index: 99999 !important;
  transition: none !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  cursor: grabbing !important;
}
</style>

