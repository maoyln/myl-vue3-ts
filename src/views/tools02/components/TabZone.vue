<template>
  <a-layout-content :class="contentClass">
    <div class="content-wrapper">
      <div 
        ref="dropZoneRef"
        class="tabs-drop-zone"
        :class="{ 
          'drag-over': isDragOver,
          'snap-top': snapPosition === 'top',
          'snap-bottom': snapPosition === 'bottom'
        }"
      >
        <!-- 使用 VueDraggable 组件 -->
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
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ 
              'active': activeTab === tab.key,
              'dragging': draggingTabKey === tab.key
            }"
            @click="handleTabClick(tab.key)"
          >
            <span class="tab-title">{{ tab.title }}</span>
            <span class="drag-icon">⋮⋮</span>
          </div>
        </VueDraggable>
        
        <div class="tab-content" v-if="activeTab">
          <component 
            :is="getTabComponent(activeTab)" 
            :tab-key="activeTab"
          />
        </div>
      </div>
    </div>
  </a-layout-content>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const snapPosition = ref<'top' | 'bottom' | null>(null)
const dropZoneRef = ref<HTMLElement | null>(null)
let dragMoveHandler: ((e: MouseEvent) => void) | null = null

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

// 拖拽开始
const onDragStart = (event: any) => {
  isDragging.value = true
  const oldIndex = event.oldIndex
  
  if (oldIndex !== undefined && oldIndex >= 0) {
    if (tabs.value[oldIndex]) {
      draggingTabKey.value = tabs.value[oldIndex].key
      emit('drag-start', tabs.value[oldIndex].key, props.zoneId)
    }
  } else {
    const draggedItem = event.item
    if (draggedItem) {
      const tab = draggedItem._underlying_vm_ || 
                  draggedItem.__vueParentComponent?.props?.element ||
                  draggedItem.__vueParentComponent?.props?.value
      
      if (tab && tab.key) {
        draggingTabKey.value = tab.key
        emit('drag-start', tab.key, props.zoneId)
      }
    }
  }
  
  // 开始监听鼠标移动以实现吸附效果
  startDragMoveListener()
}

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false
  draggingTabKey.value = null
  isDragOver.value = false
  snapPosition.value = null
  stopDragMoveListener()
  emit('drag-end')
}

// 拖拽移动（用于检测是否接近目标区域）
const onMove = (event: any) => {
  checkSnapPosition(event)
}

// 检查吸附位置
const checkSnapPosition = (event?: any) => {
  if (!dropZoneRef.value) return
  
  const rect = dropZoneRef.value.getBoundingClientRect()
  const threshold = 80 // 吸附阈值（像素）
  
  // 获取鼠标位置（从全局事件或事件对象）
  let mouseY = 0
  if (event && event.dragged) {
    const draggedRect = event.dragged.getBoundingClientRect()
    mouseY = draggedRect.top + draggedRect.height / 2
  } else if (dragMoveHandler) {
    // 从全局鼠标事件获取
    return // 会在 handleDragMove 中处理
  }
  
  // 检测是否接近顶部或底部
  const distanceToTop = mouseY - rect.top
  const distanceToBottom = rect.bottom - mouseY
  
  if (distanceToTop < threshold && distanceToTop > 0) {
    snapPosition.value = 'top'
    isDragOver.value = true
  } else if (distanceToBottom < threshold && distanceToBottom > 0) {
    snapPosition.value = 'bottom'
    isDragOver.value = true
  } else {
    snapPosition.value = null
    isDragOver.value = false
  }
}

// 开始监听鼠标移动
const startDragMoveListener = () => {
  if (dragMoveHandler) return
  
  dragMoveHandler = (e: MouseEvent) => {
    if (!dropZoneRef.value) return
    
    const rect = dropZoneRef.value.getBoundingClientRect()
    const threshold = 80 // 吸附阈值
    
    // 检查鼠标是否在区域附近
    const isNearZone = (
      e.clientX >= rect.left - threshold &&
      e.clientX <= rect.right + threshold &&
      e.clientY >= rect.top - threshold &&
      e.clientY <= rect.bottom + threshold
    )
    
    if (isNearZone) {
      const distanceToTop = e.clientY - rect.top
      const distanceToBottom = rect.bottom - e.clientY
      
      if (distanceToTop < threshold && distanceToTop > -threshold) {
        snapPosition.value = 'top'
        isDragOver.value = true
      } else if (distanceToBottom < threshold && distanceToBottom > -threshold) {
        snapPosition.value = 'bottom'
        isDragOver.value = true
      } else {
        snapPosition.value = null
        isDragOver.value = true // 在区域内但不在边缘
      }
    } else {
      snapPosition.value = null
      isDragOver.value = false
    }
  }
  
  document.addEventListener('mousemove', dragMoveHandler)
}

// 停止监听鼠标移动
const stopDragMoveListener = () => {
  if (dragMoveHandler) {
    document.removeEventListener('mousemove', dragMoveHandler)
    dragMoveHandler = null
  }
}

onMounted(() => {
  // 组件挂载时的初始化
})

onUnmounted(() => {
  // 组件卸载时清理
  stopDragMoveListener()
})

// 跨容器添加（元素被添加到当前区域）
const onAdd = (event: any) => {
  // 获取被拖拽的 tab 数据
  const newIndex = event.newIndex
  if (newIndex !== undefined && newIndex >= 0 && tabs.value[newIndex]) {
    const addedTab = tabs.value[newIndex]
    activeTab.value = addedTab.key
    emit('tab-add', addedTab.key, props.zoneId)
    emit('tab-change', addedTab.key)
  } else {
    // 备用方案：从事件对象获取
    const draggedTab = event.item._underlying_vm_ || event.item.__vueParentComponent?.props?.element
    if (draggedTab && draggedTab.key) {
      activeTab.value = draggedTab.key
      emit('tab-add', draggedTab.key, props.zoneId)
      emit('tab-change', draggedTab.key)
    } else if (tabs.value.length > 0) {
      // 如果无法获取，使用最后一个 tab
      const lastTab = tabs.value[tabs.value.length - 1]
      activeTab.value = lastTab.key
      emit('tab-add', lastTab.key, props.zoneId)
      emit('tab-change', lastTab.key)
    }
  }
}

// 跨容器移除（元素从当前区域移除）
const onRemove = (event: any) => {
  const oldIndex = event.oldIndex
  if (oldIndex !== undefined && oldIndex >= 0) {
    // 获取被移除的 tab（从事件中获取，因为此时 tabs.value 已经更新）
    const removedTab = event.item._underlying_vm_ || event.item.__vueParentComponent?.props?.element
    
    if (removedTab && removedTab.key) {
      emit('tab-remove', removedTab.key, props.zoneId)
      
      // 如果移除的是当前激活的 tab，切换到其他 tab
      if (activeTab.value === removedTab.key) {
        if (tabs.value.length > 0) {
          // 切换到第一个 tab
          activeTab.value = tabs.value[0].key
          emit('tab-change', tabs.value[0].key)
        } else {
          activeTab.value = ''
        }
      }
    }
  }
}

// 同容器内排序更新
const onUpdate = () => {
  // 可以在这里添加排序更新时的逻辑
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

.tabs-drop-zone.snap-top::before {
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
}

.tabs-drop-zone.snap-bottom::after {
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
}

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

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  min-height: 24px;
  position: relative;
  z-index: 1;
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

