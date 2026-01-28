import { ref, watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import { useDragContext } from './useDragContext';
import { useDockStore } from './useDockStore';

interface Position {
    x: number;
    y: number;
}

interface UseDragOptions {
    /** 元素 ID */
    id: string;
    /** 元素类型 */
    type?: 'panel' | 'panelGroup' | 'tab';
    /** 元素数据 */
    data?: any;
    /** 是否启用拖拽，默认为 true */
    enabled?: Ref<boolean> | boolean;
    /** 检查事件目标，如果返回 false 则不触发拖拽 */
    shouldDrag?: (e: MouseEvent) => boolean;
    /** 拖拽开始回调 */
    onDragStart?: (position: Position) => void;
    /** 拖拽中回调 */
    onDragging?: (position: Position) => void;
    /** 拖拽结束回调 */
    onDragEnd?: (position: Position) => void;
}

export function useDrag(targetRef: Ref<HTMLElement | null>, options: UseDragOptions) {
    const {
        id,
        type = 'panel',
        data,
        enabled = true,
        shouldDrag,
        onDragStart,
        onDragging,
        onDragEnd
    } = options;

    const dragContext = useDragContext();

    // 当前位置（用于显示，只在需要时更新）
    const position = ref<Position>({ x: 0, y: 0 });
    // 是否正在拖拽
    const isDragging = ref(false);
    
    // 使用普通变量存储实时位置（不触发响应式）
    let currentX = 0;
    let currentY = 0;
    let startMouseX = 0;
    let startMouseY = 0;
    // 鼠标点击位置相对于元素的偏移量
    let offsetX = 0;
    let offsetY = 0;
    // 是否真正开始了拖拽（移动超过阈值）
    let hasStartedDrag = false;
    // 拖拽阈值（像素），超过这个距离才认为是拖拽
    const DRAG_THRESHOLD = 5;

    /**
     * 鼠标按下事件处理
     */
    const handleMouseDown = (e: MouseEvent) => {
        // 检查是否启用拖拽
        const isEnabled = typeof enabled === 'boolean' ? enabled : enabled.value;
        if (!isEnabled || !targetRef.value) return;

        // 检查 shouldDrag 回调，如果返回 false 则不触发拖拽
        if (shouldDrag && !shouldDrag(e)) {
            return;
        }

        e.preventDefault(); // 阻止默认行为（如页面滚动）
        e.stopPropagation(); // 阻止事件冒泡

        isDragging.value = false; // 初始为 false，只有移动超过阈值才设为 true
        hasStartedDrag = false; // 是否真正开始了拖拽（移动超过阈值）
        
        // 记录鼠标按下时的位置
        startMouseX = e.clientX;
        startMouseY = e.clientY;

        // 计算鼠标点击位置相对于元素的偏移量
        if (targetRef.value) {
            const rect = targetRef.value.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        }

        // 添加全局监听
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * 鼠标移动事件处理
     */
    const handleMouseMove = (e: MouseEvent) => {
        if (!targetRef.value) return;

        // 计算移动距离
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 如果移动距离超过阈值，才开始拖拽
        if (!hasStartedDrag && distance > DRAG_THRESHOLD) {
            // 全局已有拖拽时不再重复进入，避免同一 mousemove 被多个 useDrag 处理导致第二次用错上下文（例如 tab 拖拽时 header 的 useDrag 也触发）
            if (dragContext.getCurrentDrag().value) return;

            hasStartedDrag = true;
            isDragging.value = true;

            const baseData = typeof data === 'object' && data !== null ? data : {};
            let dragPayload: Record<string, unknown> = { ...baseData, dragOffset: { x: offsetX, y: offsetY } };
            const store = useDockStore();
            // “整窗跟随”的 rect：取所在 panel 的视口位置（.panel 为 Panel 根），无则用当前元素
            const windowRect = targetRef.value?.closest?.('.panel')?.getBoundingClientRect?.() ?? targetRef.value?.getBoundingClientRect?.();
            // tab 拖拽时：记录鼠标在 tab 标签内的偏移 (offsetInTab)，新浮窗内该 tab 在 (0,0)，故 dragOffset = offsetInTab 可使光标始终在 tab 的同一相对位置
            const tabRect = type === 'tab' ? targetRef.value?.getBoundingClientRect?.() : undefined;
            const offsetInTab = tabRect
                ? { x: startMouseX - tabRect.left, y: startMouseY - tabRect.top }
                : null;
            // 整窗跟随时统一结构：{ ...baseData, floatGroupId, dragOffset }，便于 attachFloatMoveHandlers / useDragDrop 等统一处理
            if (type === 'panel') {
                const loc = store.findPanelLocation(id);
                if (loc?.type === 'float') {
                    const fg = store.floatPanelGroups.find((f: { id: string }) => f.id === loc.floatGroupId) as { x: number; y: number } | undefined;
                    if (fg) {
                        store.bringFloatToFront(loc.floatGroupId);
                        dragPayload = {
                            ...baseData,
                            floatGroupId: loc.floatGroupId,
                            dragOffset: { x: startMouseX - fg.x, y: startMouseY - fg.y },
                        };
                    }
                } else if (loc?.type === 'container' && windowRect) {
                    const floatGroupId = store.createFloatWindow(id, windowRect.left, windowRect.top);
                    if (floatGroupId) {
                        const w = Math.max(1, windowRect.width);
                        dragPayload = {
                            ...baseData,
                            floatGroupId,
                            dragOffset: { x: startMouseX - windowRect.left, y: startMouseY - windowRect.top },
                            dragOffsetPercentX: (startMouseX - windowRect.left) / w,
                        };
                    }
                }
            } else if (type === 'tab') {
                const panelId = (baseData as { panelId?: string }).panelId;
                const panelLoc = panelId ? store.findPanelLocation(panelId) : null;
                if (!panelLoc) {
                    hasStartedDrag = false;
                    isDragging.value = false;
                    return;
                }
                // 当前拖拽所在面板的完整数据（含 id/name/width/height/tabs 等），拖拽的 tab 在 panel.tabs 中
                const panel = (panelLoc as { panel?: Record<string, unknown> }).panel
                    ?? (panelLoc.type === 'float'
                        ? store.floatPanelGroups.find((f: { id: string }) => f.id === panelLoc.floatGroupId)?.groups?.find((g: { id: string }) => g.id === panelLoc.groupId)?.panels?.[panelLoc.panelIndex]
                        : (() => {
                            const c = store.dockContainers[panelLoc.containerKey as string];
                            const g = c?.groups?.find((gr: { id: string }) => gr.id === panelLoc.groupId);
                            return g?.panels?.[panelLoc.panelIndex];
                        })());
                if (!panel || typeof panel !== 'object') {
                    hasStartedDrag = false;
                    isDragging.value = false;
                    return;
                }
                // tabs 中只放被拖拽出的 tab 本身，语义等同「把该 tab 单独放在一个只有它的面板里操作」，与拖拽仅有一个 tab 的面板一致
                const allTabs = (panel as { tabs?: unknown[] }).tabs ?? [];
                const draggedTab = allTabs.find((t: unknown) => (t as { id?: string })?.id === id);
                const panelData = {
                    ...panel,
                    panelId: (panel as { id?: string }).id,
                    tabs: draggedTab ? [draggedTab] : [],
                } as Record<string, unknown>;

                if (panelLoc.type === 'float') {
                    const fg = store.floatPanelGroups.find((f: { id: string }) => f.id === panelLoc.floatGroupId) as { x: number; y: number; groups?: Array<{ id: string; panels: Array<{ tabs?: unknown[] }> }> } | undefined;
                    const grp = fg?.groups?.find((g: { id: string }) => g.id === panelLoc.groupId);
                    const tabCount = grp?.panels?.[panelLoc.panelIndex]?.tabs?.length ?? 0;
                    if (tabCount === 1 && fg) {
                        store.bringFloatToFront(panelLoc.floatGroupId);
                        dragPayload = {
                            ...panelData,
                            floatGroupId: panelLoc.floatGroupId,
                            dragOffset: { x: startMouseX - fg.x, y: startMouseY - fg.y },
                        };
                    } else if (tabCount > 1 && windowRect) {
                        const floatGroupId = store.createFloatWindowFromTab(id, baseData, windowRect.left, windowRect.top);
                        if (floatGroupId) {
                            // 新浮窗内该 tab 在 (0,0)，抓住点 = 鼠标在 tab 内的偏移，保持光标在 tab 的同一相对位置
                            const offset = offsetInTab ?? { x: startMouseX - windowRect.left, y: startMouseY - windowRect.top };
                            dragPayload = {
                                ...panelData,
                                floatGroupId,
                                dragOffset: offset,
                            };
                        }
                    }
                } else if (panelLoc.type === 'container' && windowRect) {
                    const floatGroupId = store.createFloatWindowFromTab(id, baseData, windowRect.left, windowRect.top);
                    if (floatGroupId) {
                        // 新浮窗内该 tab 在 (0,0)，抓住点 = 鼠标在 tab 内的偏移
                        const offset = offsetInTab ?? { x: startMouseX - windowRect.left, y: startMouseY - windowRect.top };
                        dragPayload = {
                            ...panelData,
                            floatGroupId,
                            dragOffset: offset,
                        };
                    }
                }
            }

            const isMovingFloat = !!(dragPayload as { floatGroupId?: string }).floatGroupId;

            dragContext.startDrag({ id, type, data: dragPayload });
            onDragStart?.({ x: currentX, y: currentY });

            // 整窗跟随时（含 dock 内临时转浮窗）：把 mousemove/mouseup 交给全局，避免源组件卸载后丢失焦点
            if (isMovingFloat) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                const d = dragPayload as {
                    floatGroupId: string;
                    dragOffset: { x: number; y: number };
                    dragOffsetPercentX?: number;
                };
                dragContext.attachFloatMoveHandlers(d.floatGroupId, {
                    dragOffset: d.dragOffset,
                    dragOffsetPercentX: d.dragOffsetPercentX,
                });
            }
        }


        if (!hasStartedDrag) return;

        e.preventDefault();

        // panel/tab 整窗跟随（含浮窗内拖、dock 内拖起即转浮窗）：直接更新浮窗位置
        const current = dragContext.getCurrentDrag().value;
        const fid = (current?.data as { floatGroupId?: string })?.floatGroupId;
        if (fid && (current?.type === 'panel' || current?.type === 'tab')) {
            const store = useDockStore();
            const d = current.data as { floatGroupId: string; dragOffset: { x: number; y: number } };
            store.moveFloatWindow(d.floatGroupId, e.clientX - d.dragOffset.x, e.clientY - d.dragOffset.y);
            return;
        }

        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        currentX = newX;
        currentY = newY;
        position.value.x = currentX;
        position.value.y = currentY;
        onDragging?.({ x: currentX, y: currentY });
    };

    /**
     * 鼠标松开事件处理
     */
    const handleMouseUp = () => {
        // 移除全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 只有开始过拖拽才处理结束逻辑
        if (hasStartedDrag) {
            isDragging.value = false;

            // 通知全局拖拽上下文结束（只有真正拖拽过才调用）
            dragContext.endDrag();

            // 重置位置变量
            currentX = 0;
            currentY = 0;
            position.value = { x: 0, y: 0 };
            offsetX = 0;
            offsetY = 0;

            // 触发拖拽结束回调
            onDragEnd?.({ x: 0, y: 0 });
        }

        // 重置拖拽状态
        hasStartedDrag = false;
    };

    /**
     * 设置位置
     */
    const setPosition = (newPos: Position) => {
        currentX = newPos.x;
        currentY = newPos.y;
        position.value = { ...newPos };
        
        if (targetRef.value) {
            targetRef.value.style.transform = `translate3d(${newPos.x}px, ${newPos.y}px, 0)`;
        }
    };

    /**
     * 重置位置
     */
    const resetPosition = () => {
        setPosition({ x: 0, y: 0 });
    };

    // 当前绑定事件的元素引用
    let currentElement: HTMLElement | null = null;

    // 绑定事件监听器的函数
    const bindEventListener = (element: HTMLElement) => {
        if (!element) return;
        
        // 如果已经绑定到同一个元素，不需要重复绑定
        if (currentElement === element) return;
        
        // 如果之前绑定了其他元素，先解绑
        if (currentElement) {
            currentElement.removeEventListener('mousedown', handleMouseDown);
        }
        
        // 绑定新元素
        element.addEventListener('mousedown', handleMouseDown, { passive: false });
        currentElement = element;
    };

    // 解绑事件监听器的函数
    const unbindEventListener = (element: HTMLElement | null) => {
        if (element && currentElement === element) {
            element.removeEventListener('mousedown', handleMouseDown);
            currentElement = null;
        } else if (!element && currentElement) {
            // 如果没有指定元素，解绑当前元素
            currentElement.removeEventListener('mousedown', handleMouseDown);
            currentElement = null;
        }
    };

    // 清理函数
    const cleanup = () => {
        unbindEventListener(currentElement);
        // 清理全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        currentElement = null;
    };

    // 监听 targetRef 的变化，动态绑定/解绑事件
    const stopWatch = watch(targetRef, (newVal, oldVal) => {
        // 如果新值存在，绑定事件
        if (newVal) {
            bindEventListener(newVal);
        } else if (oldVal) {
            // 如果新值为 null，解绑旧元素
            unbindEventListener(oldVal);
        }
    }, { immediate: true });
    
    // 确保首次绑定成功：如果 ref 已经有值但事件可能没有绑定，使用 nextTick 确保绑定
    if (targetRef.value) {
        nextTick(() => {
            if (targetRef.value && currentElement !== targetRef.value) {
                bindEventListener(targetRef.value);
            }
        });
    }

    return {
        position,
        isDragging,
        setPosition,
        resetPosition,
        cleanup, // 返回清理函数，让调用者可以手动清理
        stopWatch // 返回停止监听的函数
    };
}
