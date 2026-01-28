<!-- Tabs 组件 - 管理多个 Tab 的切换 -->
<template>
    <div class="tabs-container">
        <!-- Tab 标题栏 - 支持拖拽整个 panel -->
        <div 
            ref="tabsHeaderRef"
            class="tabs-header"
            :class="{ 'is-dragging': isDraggingPanel }"
        >
            <!-- 第一个 Tab 前的热区 -->
            <div
                v-show="shouldShowTabDropZone && (tabs?.length || 0) > 0"
                class="tab-drop-zone"
                :class="{ 
                    'active': activePosition === 'before-0',
                    'is-first': true
                }"
                :data-drop-zone="'before-0'"
            ></div>

            <template v-for="(tab, index) in (tabs || [])" :key="tab.id">
                <!-- Tab 项 -->
                <div
                    :ref="el => setTabItemRef(el, tab.id)"
                    class="tab-header-item"
                    :class="{ 
                        'is-active': activeTabId === tab.id,
                        'is-dragging': isDraggingTab === tab.id
                    }"
                    @click="setActiveTab(tab.id)"
                >
                    <span class="tab-title">{{ tab.title }}</span>
                    <span 
                        v-if="closable && (tabs?.length || 0) > 1"
                        class="tab-close"
                        @click.stop="closeTab(tab.id)"
                    >
                        ×
                    </span>
                </div>

                <!-- 每个 Tab 后的热区（也是下一个 Tab 之间的热区）-->
                <div
                    v-show="shouldShowTabDropZone"
                    class="tab-drop-zone"
                    :class="{ 
                        'active': activePosition === `after-${index}`,
                        'is-last': index === (tabs?.length || 0) - 1
                    }"
                    :data-drop-zone="`after-${index}`"
                ></div>
            </template>
        </div>

        <!-- Tab 内容区域 -->
        <div class="tabs-content">
            <Tab
                v-for="tab in tabs"
                :key="tab.id"
                :id="tab.id"
                :title="tab.title"
                :component="tab.component"
                :active="activeTabId === tab.id"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useDrag } from '../useDrag';
import { useDropZone } from '../useDropZone';
import { useDragDrop } from '../useDragDrop';
import { useDragContext } from '../useDragContext';
import Tab from './Tab.vue';

export interface TabItem {
    id: string;
    title: string;
    component: string;
    closable?: boolean;
}

const props = defineProps<{
    tabs: TabItem[];
    defaultActiveId?: string;
    closable?: boolean; // 是否可关闭
    panelId?: string; // Panel ID，用于拖拽
    panelData?: any; // Panel 数据，用于拖拽
}>();

const emit = defineEmits<{
    (e: 'tab-change', tabId: string): void;
    (e: 'tab-close', tabId: string): void;
}>();

// Tab 标题栏引用（用于拖拽整个 panel）
const tabsHeaderRef = ref<HTMLElement | null>(null);
// Tab 项引用 Map（用于拖拽单个 tab）
const tabItemRefs = new Map<string, HTMLElement | null>();

// 使用拖拽处理 hooks
const dragDrop = useDragDrop();
const dragContext = useDragContext();

// 当前激活的 Tab ID
const activeTabId = ref<string>(props.defaultActiveId || (props.tabs?.length > 0 ? props.tabs[0].id : ''));

// 拖拽状态
const isDraggingPanel = ref(false);
const isDraggingTab = ref<string | null>(null);

// 动态生成允许的热区位置
const allowedPositions = computed(() => {
    const positions: string[] = [];
    if (props.tabs && props.tabs.length > 0) {
        // 添加第一个 tab 前面的热区
        positions.push('before-0');
        // 添加每个 tab 后面的热区
        for (let i = 0; i < props.tabs.length; i++) {
            positions.push(`after-${i}`);
        }
    }
    return positions;
});

// 添加热区支持，允许拖拽 tab 到 tabs 之间
const dropZone = useDropZone(tabsHeaderRef, {
    type: 'panelGroup', // 使用 panelGroup 类型，因为逻辑类似
    id: props.panelId || 'tabs-container',
    data: {
        panelId: props.panelId,
        panelData: props.panelData,
        tabs: props.tabs
    },
    allowedPositions: allowedPositions as any,
    dropZoneClass: 'tab-drop-zone',
    onEnter: (position) => {
        const currentDrag = dragContext.getCurrentDrag().value;
        // 支持 tab 和 panel 类型的拖拽
        if (currentDrag && (currentDrag.type === 'tab' || currentDrag.type === 'panel')) {
            dragDrop.registerDropZone({
                scenario: 'tabs',
                position,
                targetId: props.panelId || 'tabs-container',
                targetData: {
                    panelId: props.panelId,
                    panelData: props.panelData,
                    tabs: props.tabs
                },
            });
        }
    },
    onLeave: () => {
        // 只有在拖拽未结束时才清除，避免在释放时清除
        if (dragContext.getCurrentDrag().value) {
            dragDrop.clearDropZone();
        }
    },
});

const { shouldShowDropZone, activePosition } = dropZone;

// 计算是否应该显示热区（拖拽 tab 或 panel 时显示）
const shouldShowTabDropZone = computed(() => {
    if (!shouldShowDropZone.value) return false;
    const currentDrag = dragContext.getCurrentDrag().value;
    return currentDrag && (currentDrag.type === 'tab' || currentDrag.type === 'panel');
});

// 为每个 tab-item 创建拖拽实例
const tabDragInstances = new Map<string, ReturnType<typeof useDrag>>();

// 初始化单个 tab 的拖拽功能
const initSingleTabDrag = (tabId: string, tabItemRef: HTMLElement) => {
    // 如果已经存在拖拽实例，先清理旧的
    if (tabDragInstances.has(tabId)) {
        const oldInstance = tabDragInstances.get(tabId);
        oldInstance?.cleanup?.();
        oldInstance?.stopWatch?.();
        tabDragInstances.delete(tabId);
    }

    const tab = props.tabs?.find(t => t.id === tabId);
    if (!tab) {
        return;
    }

    // 创建 ref，值已经设置，useDrag 会通过 watch 自动绑定事件
    const tabItemRefWrapper = ref<HTMLElement | null>(tabItemRef);
    
    const dragInstance = useDrag(tabItemRefWrapper, {
        id: tab.id,
        type: 'tab',
        data: {
            ...tab,
            panelId: props.panelId,
            panelData: props.panelData
        },
        onDragStart: () => {
            isDraggingTab.value = tab.id;
            console.log('拖拽单个 tab 开始', tab.title);
        },
        onDragging: () => {
            // 可以在这里处理拖拽中的逻辑
        },
        onDragEnd: () => {
            isDraggingTab.value = null;
            console.log('拖拽单个 tab 结束', tab.title);
        }
    });
    
    tabDragInstances.set(tab.id, dragInstance);
    
    // 监听拖拽状态
    watch(dragInstance.isDragging, (val) => {
        if (val) {
            isDraggingTab.value = tab.id;
        } else if (isDraggingTab.value === tab.id) {
            isDraggingTab.value = null;
        }
    });
};

// 设置 Tab 项引用
const setTabItemRef = (el: any, tabId: string) => {
    // 检查 el 是否为有效的 HTMLElement
    // 使用 nodeType === 1 来检查是否为元素节点，避免 instanceof 在 SSR 环境中的问题
    if (el && typeof el === 'object' && el.nodeType === 1 && typeof el.tagName === 'string') {
        const htmlEl = el as HTMLElement;
        tabItemRefs.set(tabId, htmlEl);
        // 当 ref 被设置时，立即初始化该 tab 的拖拽功能
        // 使用 nextTick 确保在 setup 阶段之后执行，避免生命周期钩子警告
        nextTick(() => {
            initSingleTabDrag(tabId, htmlEl);
        });
    } else {
        tabItemRefs.delete(tabId);
        // 清理拖拽实例
        if (tabDragInstances.has(tabId)) {
            const instance = tabDragInstances.get(tabId);
            instance?.cleanup?.();
            instance?.stopWatch?.();
            tabDragInstances.delete(tabId);
        }
    }
};

// 设置激活的 Tab
const setActiveTab = (tabId: string) => {
    if (activeTabId.value !== tabId) {
        activeTabId.value = tabId;
        emit('tab-change', tabId);
    }
};

// 关闭 Tab
const closeTab = (tabId: string) => {
    emit('tab-close', tabId);
};

// 初始化 tab-item 的拖拽功能（保留用于批量初始化）
const initTabDrags = () => {
    props.tabs?.forEach((tab) => {
        const tabItemRef = tabItemRefs.get(tab.id);
        if (tabItemRef) {
            initSingleTabDrag(tab.id, tabItemRef);
        }
    });
};

// 使用拖拽 hooks - 绑定到标题栏区域（拖拽整个 panel）
// 注意：只在标题栏空白区域触发，tab-item 的拖拽会阻止冒泡
const { isDragging: isDraggingPanelState } = useDrag(tabsHeaderRef, {
    id: props.panelId || props.tabs?.[0]?.id || '',
    type: 'panel',
    data: props.panelData || props.tabs,
    shouldDrag: (e: MouseEvent) => {
        // 检查事件目标，如果是 tab-header-item 或其子元素，则不触发拖拽
        const target = e.target as HTMLElement;
        if (target.closest('.tab-header-item')) {
            return false;
        }
        return true;
    },
    onDragStart: () => {
        isDraggingPanel.value = true;
        console.log('拖拽整个 panel 开始', props.panelData?.name || props.tabs?.[0]?.title);
    },
    onDragging: () => {
        // 可以在这里处理拖拽中的逻辑
    },
    onDragEnd: () => {
        isDraggingPanel.value = false;
        console.log('拖拽整个 panel 结束', props.panelData?.name || props.tabs?.[0]?.title);
    }
});

// 监听拖拽状态
watch(isDraggingPanelState, (val) => {
    isDraggingPanel.value = val;
});

// 监听 tabs 变化，重新初始化热区和拖拽
watch(() => props.tabs, () => {
    nextTick(() => {
        initTabDrags();
        // 重新初始化热区（无论是否在拖拽状态）
        if (dropZone) {
            dropZone.initDropZones();
        }
    });
}, { deep: true });

// 监听拖拽状态，当开始拖拽时重新初始化热区
watch(() => dragContext.getCurrentDrag().value, (currentDrag) => {
    if (currentDrag && (currentDrag.type === 'tab' || currentDrag.type === 'panel')) {
        // 当开始拖拽tab或panel时，重新初始化热区以确保热区正确显示
        nextTick(() => {
            if (dropZone) {
                dropZone.initDropZones();
            }
        });
    }
});

// 组件挂载后初始化
onMounted(() => {
    nextTick(() => {
        initTabDrags();
    });
});

// 组件卸载时清理所有拖拽实例
onUnmounted(() => {
    tabDragInstances.forEach((instance) => {
        instance?.cleanup?.();
        instance?.stopWatch?.();
    });
    tabDragInstances.clear();
});
</script>

<style scoped>
.tabs-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 300; /* 确保 Tabs 容器优先级最高 */
}

/* 热区：active 与 非 active 使用相同 flex/margin/transform，仅视觉变化，避免拖拽时布局偏移 */
.tab-drop-zone {
    flex: 0 0 12px;
    height: 100%;
    margin: 0 -6px;
    min-width: 0;
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
    pointer-events: auto;
    transition: background 0.15s, box-shadow 0.15s;
    position: relative;
    z-index: 302;
}

.tab-drop-zone.active {
    background: rgba(245, 3, 3, 0.5);
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
    z-index: 3002;
}

.tab-drop-zone.is-first {
    flex: 0 0 12px;
    margin: 0 -6px;
    transform: translateX(6px);
}

.tab-drop-zone.is-first.active {
    flex: 0 0 12px;
    margin: 0 -6px;
    transform: translateX(6px);
}

/* 最后一个热区占满剩余空间；tab-header-item 已 flex:0 0 auto，不会被挤变宽 */
.tab-drop-zone.is-last {
    flex: 1;
    margin: 0;
    min-width: 0;
}

.tab-drop-zone.is-last.active {
    flex: 1;
    margin: 0;
    min-width: 0;
}

.tabs-header {
    display: flex;
    flex-direction: row;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    flex-shrink: 0;
    position: relative;
    z-index: 301; /* 确保 Tabs 标题栏优先级最高 */
    overflow: hidden;
}

.tabs-header.is-dragging {
    opacity: 0.8;
    /* cursor: move; */
}

/* flex: 0 0 auto 保持按内容宽度，拖拽时热区出现/消失不会导致 item 被重新分配宽度 */
.tab-header-item {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    padding: 8px 8px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: background-color 0.2s;
    position: relative;
    min-width: 20px;
}

.tab-header-item:hover {
    background-color: #e8e8e8;
}

.tab-header-item.is-active {
    background-color: #fff;
    color: #409eff;
    border-bottom: 2px solid #409eff;
}

.tab-header-item.is-dragging {
    opacity: 0.8;
    /* cursor: move; */
    background-color: #e0f0ff;
}

.tab-title {
    flex: 1;
    font-size: 14px;
    min-width: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.tab-close {
    margin-left: 4px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1;
    color: #999;
    transition: all 0.2s;
}

.tab-close:hover {
    background-color: #ddd;
    color: #333;
}

.tabs-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}
</style>
