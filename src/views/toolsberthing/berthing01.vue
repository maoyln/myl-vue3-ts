<template>
  <div class="berthing-container">
    <!-- 拖拽预览元素（隐藏） -->
    <div ref="dragPreview" class="drag-preview-container" style="position: fixed; top: -9999px; left: -9999px; pointer-events: none; opacity: 0; visibility: hidden;">
      <div ref="previewWrapper" class="drag-preview-wrapper">
        <!-- 模拟tabs-container -->
        <div ref="previewTabsContainer" class="tabs-container drag-preview-tabs-container">
          <!-- 所有tab将通过JavaScript动态创建 -->
        </div>
        <!-- 模拟tab-content -->
        <div ref="previewContent" class="tab-content drag-preview-content">
          <p ref="previewContentP"></p>
        </div>
      </div>
    </div>

    <a-layout class="berthing-layout">
      <a-layout class="main-layout">
        <!-- 主内容区域 -->
        <a-layout-content class="layout-content">
          <div class="content-wrapper">
            <div 
              ref="mainDropZone"
              class="tabs-drop-zone"
              :class="{ 'drag-over': dragOverZone === 'main' }"
              @dragover.prevent="handleDragOver($event, 'main')"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, 'main')"
            >
              <div class="tabs-container" ref="mainTabsContainer">
                <div
                  v-for="(tab, index) in mainTabs"
                  :key="tab.key"
                  class="tab-item"
                  :class="{ 
                    'active': activeMainTab === tab.key, 
                    'dragging': draggingTab?.key === tab.key,
                    'insert-before': dropIndicator?.zone === 'main' && dropIndicator?.index === index,
                    'insert-after': dropIndicator?.zone === 'main' && dropIndicator?.index === index + 1 && index === mainTabs.length - 1
                  }"
                  draggable="true"
                  @dragstart="handleDragStart($event, tab, 'main')"
                  @dragend="handleDragEnd"
                  @dragover.prevent="handleTabDragOver($event, 'main', index)"
                  @click="activeMainTab = tab.key"
                >
                  <span class="tab-title">{{ tab.title }}</span>
                  <span class="drag-icon">⋮⋮</span>
                </div>
              </div>
              <div ref="mainContentElement" class="tab-content" v-if="activeMainTab">
                <p>{{ getTabContent(mainTabs, activeMainTab) }}</p>
              </div>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
      
      <!-- 附加功能区域 -->
      <a-layout-content class="additional-content">
        <div class="content-wrapper">
          <div 
            ref="additionalDropZone"
            class="tabs-drop-zone"
            :class="{ 'drag-over': dragOverZone === 'additional' }"
            @dragover.prevent="handleDragOver($event, 'additional')"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, 'additional')"
          >
            <div class="tabs-container" ref="additionalTabsContainer">
              <div
                v-for="(tab, index) in additionalTabs"
                :key="tab.key"
                class="tab-item"
                :class="{ 
                    'active': activeAdditionalTab === tab.key, 
                    'dragging': draggingTab?.key === tab.key,
                    'insert-before': dropIndicator?.zone === 'additional' && dropIndicator?.index === index,
                    'insert-after': dropIndicator?.zone === 'additional' && dropIndicator?.index === index + 1 && index === additionalTabs.length - 1
                  }"
                draggable="true"
                @dragstart="handleDragStart($event, tab, 'additional')"
                @dragend="handleDragEnd"
                @dragover.prevent="handleTabDragOver($event, 'additional', index)"
                @click="activeAdditionalTab = tab.key"
              >
                <span class="tab-title">{{ tab.title }}</span>
                <span class="drag-icon">⋮⋮</span>
              </div>
            </div>
            <div ref="additionalContentElement" class="tab-content" v-if="activeAdditionalTab">
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

// 拖拽状态
const draggingTab: Ref<TabItem | null> = ref(null)
const sourceZone: Ref<'main' | 'additional' | null> = ref(null)
const dragOverZone: Ref<'main' | 'additional' | null> = ref(null)

// 插入位置指示器
const dropIndicator: Ref<DropIndicator> = ref({
  zone: null,
  index: -1
})

// Refs for tab containers
const mainTabsContainer = ref<HTMLElement | null>(null)
const additionalTabsContainer = ref<HTMLElement | null>(null)
const mainDropZone = ref<HTMLElement | null>(null)
const additionalDropZone = ref<HTMLElement | null>(null)
const mainContentElement = ref<HTMLElement | null>(null)
const additionalContentElement = ref<HTMLElement | null>(null)

// Refs for drag preview elements
const dragPreview = ref<HTMLElement | null>(null)
const previewWrapper = ref<HTMLElement | null>(null)
const previewTabsContainer = ref<HTMLElement | null>(null)
const previewContent = ref<HTMLElement | null>(null)
const previewContentP = ref<HTMLElement | null>(null)

// 获取 Tab 内容
const getTabContent = (tabs: TabItem[], key: string) => {
  const tab = tabs.find((t: TabItem) => t.key === key)
  return tab ? tab.content : ''
}

// 工具函数：复制样式属性
const copyStyles = (source: HTMLElement, target: HTMLElement, props: string[]) => {
  const style = window.getComputedStyle(source)
  props.forEach(prop => {
    target.style.setProperty(prop, style.getPropertyValue(prop))
  })
}

// 工具函数：设置元素可见
const setVisible = (el: HTMLElement | null, visible = true) => {
  if (!el) return
  el.style.display = visible ? 'flex' : 'none'
  el.style.visibility = visible ? 'visible' : 'hidden'
  el.style.opacity = visible ? '1' : '0'
}

// 工具函数：获取zone对应的refs
const getZoneRefs = (zone: 'main' | 'additional') => ({
  tabsContainer: zone === 'main' ? mainTabsContainer.value : additionalTabsContainer.value,
  dropZone: zone === 'main' ? mainDropZone.value : additionalDropZone.value,
  contentElement: zone === 'main' ? mainContentElement.value : additionalContentElement.value
})

// 工具函数：创建预览tab
const createPreviewTab = (originalTab: HTMLElement): HTMLElement => {
  const previewTab = originalTab.cloneNode(true) as HTMLElement
  previewTab.classList.add('drag-preview-tab')
  previewTab.classList.remove('dragging', 'insert-before', 'insert-after')
  previewTab.style.display = 'inline-flex'
  previewTab.style.visibility = 'visible'
  previewTab.style.opacity = '1'
  return previewTab
}

// 工具函数：设置拖拽预览
const setupDragPreview = (
  tab: TabItem,
  originalTabElement: HTMLElement,
  zone: 'main' | 'additional'
): HTMLElement | null => {
  const { tabsContainer, dropZone, contentElement } = getZoneRefs(zone)
  
  if (!previewTabsContainer.value || !previewContent.value || !previewContentP.value || !previewWrapper.value) {
    return null
  }
  
  // 清空并准备预览容器
  previewTabsContainer.value.innerHTML = ''
  setVisible(previewTabsContainer.value, true)
  
  // 创建并添加预览tab
  const previewTab = createPreviewTab(originalTabElement)
  previewTabsContainer.value.appendChild(previewTab)
  
  // 复制容器样式
  if (tabsContainer) {
    copyStyles(tabsContainer, previewTabsContainer.value, [
      'flex-wrap', 'gap', 'margin-bottom', 'padding', 'background', 'border-radius', 'min-height'
    ])
    previewTabsContainer.value.style.display = 'flex'
  }
  
  // 复制内容区域样式和内容
  if (contentElement) {
    copyStyles(contentElement, previewContent.value, [
      'flex', 'padding', 'background', 'border-radius', 'border', 'overflow', 'font-size', 'line-height', 'color'
    ])
    previewContentP.value.textContent = tab.content
    const pElement = contentElement.querySelector('p')
    if (pElement && previewContentP.value) {
      copyStyles(pElement, previewContentP.value, ['margin', 'color', 'font-size', 'line-height'])
    }
  } else {
    previewContentP.value.textContent = tab.content
  }
  
  // 复制drop-zone样式到wrapper
  if (dropZone) {
    copyStyles(dropZone, previewWrapper.value, [
      'display', 'flex-direction', 'border-radius', 'padding', 'background'
    ])
    previewWrapper.value.style.width = `${Math.min(dropZone.getBoundingClientRect().width, 500)}px`
  }
  
  return previewTab
}

// 开始拖拽
const handleDragStart = (event: DragEvent, tab: TabItem, zone: 'main' | 'additional') => {
  draggingTab.value = tab
  sourceZone.value = zone
  
  if (!event.dataTransfer) return
  
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', tab.key)
  
  const target = event.target as HTMLElement
  const originalTabElement = target.closest('.tab-item') as HTMLElement
  
  // 验证必要的refs
  if (!originalTabElement || !dragPreview.value || !previewWrapper.value || 
      !previewTabsContainer.value || !previewContent.value || !previewContentP.value) {
    if (originalTabElement) {
      event.dataTransfer.setDragImage(originalTabElement, event.offsetX, event.offsetY)
    }
    return
  }
  
  // 设置预览
  const previewTab = setupDragPreview(tab, originalTabElement, zone)
  if (!previewTab) {
    event.dataTransfer.setDragImage(originalTabElement, event.offsetX, event.offsetY)
    return
  }
  
  // 显示预览容器
  dragPreview.value.style.cssText = 'position: fixed; top: -9999px; left: -9999px; opacity: 1; visibility: visible; display: block; pointer-events: none;'
  setVisible(previewWrapper.value, true)
  
  // 强制重排
  void previewTab.offsetHeight
  
  // 计算偏移量并设置拖拽图像
  const tabRect = previewTab.getBoundingClientRect()
  const containerRect = previewTabsContainer.value.getBoundingClientRect()
  const wrapperRect = previewWrapper.value.getBoundingClientRect()
  
  if (tabRect.width === 0 || tabRect.height === 0) {
    event.dataTransfer.setDragImage(originalTabElement, event.offsetX, event.offsetY)
    return
  }
  
  const yOffset = containerRect.top - wrapperRect.top + Math.min(event.offsetY, tabRect.height || 50)
  
  try {
    event.dataTransfer.setDragImage(previewWrapper.value, event.offsetX, yOffset)
  } catch (e) {
    event.dataTransfer.setDragImage(originalTabElement, event.offsetX, event.offsetY)
  }
}

// 拖拽结束
const handleDragEnd = () => {
  draggingTab.value = null
  sourceZone.value = null
  dragOverZone.value = null
  dropIndicator.value = { zone: null, index: -1 }
  
  // 重置预览元素
  const resetElement = (el: HTMLElement | null) => {
    if (el) {
      el.style.cssText = ''
      if (el.tagName === 'P') el.textContent = ''
    }
  }
  
  if (dragPreview.value) {
    setVisible(dragPreview.value, false)
    previewTabsContainer.value && (previewTabsContainer.value.innerHTML = '')
    resetElement(previewTabsContainer.value)
    resetElement(previewWrapper.value)
    resetElement(previewContent.value)
    resetElement(previewContentP.value)
  }
}

// 计算最近的插入位置
const getClosestTabIndex = (event: DragEvent, zone: 'main' | 'additional'): number => {
  const container = zone === 'main' ? mainTabsContainer.value : additionalTabsContainer.value
  if (!container) return -1

  const tabElements = Array.from(container.querySelectorAll('.tab-item:not(.dragging)'))
  const mouseX = event.clientX
  const mouseY = event.clientY

  let closestIndex = -1
  let minDistance = Infinity

  tabElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect()
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

// 在tab上拖拽
const handleTabDragOver = (event: DragEvent, zone: 'main' | 'additional', index: number) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggingTab.value) return

  // 同一区域内排序
  if (sourceZone.value === zone) {
    const tabs = zone === 'main' ? mainTabs.value : additionalTabs.value
    const dragIndex = tabs.findIndex(t => t.key === draggingTab.value?.key)
    
    // 计算插入位置
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const midPoint = rect.left + rect.width / 2
    
    let insertIndex: number
    if (event.clientX < midPoint) {
      insertIndex = index
    } else {
      insertIndex = index + 1
    }

    // 如果拖拽的是同一个元素，调整插入位置
    if (dragIndex < insertIndex) {
      insertIndex--
    }

    dropIndicator.value = { zone, index: insertIndex }
  } else {
    // 跨区域拖拽
    const insertIndex = getClosestTabIndex(event, zone)
    dropIndicator.value = { zone, index: insertIndex }
    dragOverZone.value = zone
  }
}

// 拖拽经过区域
const handleDragOver = (event: DragEvent, zone: 'main' | 'additional') => {
  event.preventDefault()
  
  if (!draggingTab.value || !sourceZone.value) return

  // 跨区域拖拽时显示高亮
  if (sourceZone.value !== zone) {
    dragOverZone.value = zone
    const insertIndex = getClosestTabIndex(event, zone)
    dropIndicator.value = { zone, index: insertIndex }
  } else {
    // 同区域内，计算插入位置
    const insertIndex = getClosestTabIndex(event, zone)
    dropIndicator.value = { zone, index: insertIndex }
  }
}

// 离开拖拽区域
const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // 只有当真正离开拖放区时才清除高亮
  if (!target.contains(relatedTarget)) {
    dragOverZone.value = null
    dropIndicator.value = { zone: null, index: -1 }
  }
}

// 放下
const handleDrop = (event: DragEvent, targetZone: 'main' | 'additional') => {
  event.preventDefault()
  
  if (!draggingTab.value || !sourceZone.value) {
    dragOverZone.value = null
    dropIndicator.value = { zone: null, index: -1 }
    return
  }

  const tab = draggingTab.value
  let insertIndex = dropIndicator.value.index

  // 如果没有指定插入位置，使用最近的位置
  if (insertIndex === -1) {
    insertIndex = getClosestTabIndex(event, targetZone)
  }

  // 同区域内重新排序
  if (sourceZone.value === targetZone) {
    const tabs = targetZone === 'main' ? mainTabs.value : additionalTabs.value
    const currentIndex = tabs.findIndex((t: TabItem) => t.key === tab.key)
    
    if (currentIndex !== -1 && currentIndex !== insertIndex) {
      // 移除原位置的tab
      tabs.splice(currentIndex, 1)
      
      // 调整插入位置（如果移除的位置在插入位置之前）
      const finalIndex = currentIndex < insertIndex ? insertIndex - 1 : insertIndex
      
      // 插入到新位置
      tabs.splice(finalIndex, 0, tab)
    }
  } else {
    // 跨区域拖拽
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

    // 插入到目标区域的指定位置
    if (targetZone === 'main') {
      const finalIndex = Math.min(insertIndex, mainTabs.value.length)
      mainTabs.value.splice(finalIndex, 0, tab)
      activeMainTab.value = tab.key
    } else {
      const finalIndex = Math.min(insertIndex, additionalTabs.value.length)
      additionalTabs.value.splice(finalIndex, 0, tab)
      activeAdditionalTab.value = tab.key
    }
  }

  // 重置拖拽状态
  dragOverZone.value = null
  draggingTab.value = null
  sourceZone.value = null
  dropIndicator.value = { zone: null, index: -1 }
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

/* 插入位置指示器 */
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

/* Tab 内容区域 */
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

/* 拖拽预览样式 */
.drag-preview-container {
  z-index: 9999;
}

.drag-preview-wrapper {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-width: 300px;
  max-width: 500px;
  /* 样式会被动态覆盖以匹配原始区域 */
}

.drag-preview-tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  min-height: 24px;
  /* 样式会被动态覆盖以匹配原始容器 */
}

.drag-preview-tab {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  /* 确保tab样式继承 */
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: move;
  user-select: none;
  /* 样式会被动态覆盖以匹配原始tab */
}

/* 激活状态的样式会被动态应用 */

.drag-preview-content {
  margin: 0;
  border-radius: 0;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 200px;
  overflow: hidden;
  /* 确保内容区域样式继承 */
  display: flex;
  flex-direction: column;
  /* 样式会被动态覆盖以匹配原始内容 */
}

.drag-preview-content p {
  margin: 0;
  padding: 12px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
  /* 样式会被动态覆盖以匹配原始内容 */
}

</style>