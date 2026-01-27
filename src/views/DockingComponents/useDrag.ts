import { ref, watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import { useDragContext } from './useDragContext';

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
    // 拖拽预览元素（ghost element）
    let ghostElement: HTMLElement | null = null;
    // 原元素的原始透明度
    let originalOpacity: string = '';

    /**
     * 创建拖拽预览元素
     */
    const createGhostElement = (sourceElement: HTMLElement, x: number, y: number): HTMLElement => {
        const rect = sourceElement.getBoundingClientRect();
        const ghost = sourceElement.cloneNode(true) as HTMLElement;
        const computed = window.getComputedStyle(sourceElement);
        const s = ghost.style;
        
        // 复制所有计算后的样式
        for (let i = 0; i < computed.length; i++) {
            s.setProperty(computed[i], computed.getPropertyValue(computed[i]));
        }
        
        // 覆盖定位样式
        Object.assign(s, {
            position: 'fixed',
            top: `${y}px`,
            left: `${x}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: '0',
            zIndex: '10000',
            pointerEvents: 'none',
            opacity: '0.8',
            transform: 'none',
            transition: 'none'
        });
        
        document.body.appendChild(ghost);
        return ghost;
    };

    /**
     * 移除拖拽预览元素
     */
    const removeGhostElement = () => {
        ghostElement?.remove();
        ghostElement = null;
    };

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
            hasStartedDrag = true;
            isDragging.value = true;

            // 创建拖拽预览元素
            if (targetRef.value) {
                // 计算预览元素的初始位置（考虑鼠标偏移）
                const ghostX = e.clientX - offsetX;
                const ghostY = e.clientY - offsetY;
                
                // 创建预览元素（直接传入位置）
                ghostElement = createGhostElement(targetRef.value, ghostX, ghostY);
                
                // 设置原元素半透明（但不移动它）
                originalOpacity = targetRef.value.style.opacity || '';
                targetRef.value.style.opacity = '0.5';
                targetRef.value.style.pointerEvents = 'none';
                
                currentX = ghostX;
                currentY = ghostY;
            }

            // 通知全局拖拽上下文（只有真正拖拽时才调用）
            dragContext.startDrag({ id, type, data });

            // 触发拖拽开始回调
            onDragStart?.({ x: currentX, y: currentY });
        }

        // 只有真正开始拖拽后才处理移动
        if (!hasStartedDrag) return;

        e.preventDefault();

        // 计算预览元素的新位置（考虑鼠标偏移）
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        currentX = newX;
        currentY = newY;

        // 更新预览元素位置
        if (ghostElement) {
            ghostElement.style.left = `${newX}px`;
            ghostElement.style.top = `${newY}px`;
        }

        // 只在需要时更新响应式数据（用于显示）
        position.value.x = currentX;
        position.value.y = currentY;

        // 触发拖拽中回调
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

            // 移除拖拽预览元素
            removeGhostElement();

            // 恢复原元素样式
            if (targetRef.value) {
                targetRef.value.style.opacity = originalOpacity;
                targetRef.value.style.pointerEvents = '';
                targetRef.value.style.willChange = 'auto';
            }

            // 通知全局拖拽上下文结束（只有真正拖拽过才调用）
            dragContext.endDrag();

            // 重置位置变量
            currentX = 0;
            currentY = 0;
            position.value = { x: 0, y: 0 };
            offsetX = 0;
            offsetY = 0;
            originalOpacity = '';

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
        
        // 如果还在拖拽，清理预览元素和恢复原元素样式
        if (hasStartedDrag) {
            removeGhostElement();
            
            if (targetRef.value) {
                targetRef.value.style.opacity = originalOpacity;
                targetRef.value.style.pointerEvents = '';
                targetRef.value.style.willChange = 'auto';
            }
        }
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
