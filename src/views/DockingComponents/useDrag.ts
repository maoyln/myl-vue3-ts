import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { useDragContext } from './useDragContext';
import type { DragInfo } from './useDragContext';

interface Position {
    x: number;
    y: number;
}

interface UseDragOptions {
    /** 元素 ID */
    id: string;
    /** 元素类型 */
    type?: 'panel' | 'panelGroup';
    /** 元素数据 */
    data?: any;
    /** 是否启用拖拽，默认为 true */
    enabled?: Ref<boolean> | boolean;
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
    let startElementX = 0;
    let startElementY = 0;
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

        e.preventDefault();
        e.stopPropagation();

        isDragging.value = false; // 初始为 false，只有移动超过阈值才设为 true
        hasStartedDrag = false;
        
        // 记录鼠标按下时的位置
        startMouseX = e.clientX;
        startMouseY = e.clientY;

        // 记录元素当前位置
        startElementX = currentX;
        startElementY = currentY;
        
        // 添加 will-change 优化
        if (targetRef.value) {
            targetRef.value.style.willChange = 'transform';
        }

        // 不在这里调用 startDrag，等移动超过阈值后再调用

        // 添加全局监听
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * 鼠标移动事件处理（高性能版本）
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

            // 通知全局拖拽上下文（只有真正拖拽时才调用）
            dragContext.startDrag({ id, type, data });

            // 触发拖拽开始回调
            onDragStart?.({ x: currentX, y: currentY });
        }

        // 只有真正开始拖拽后才处理移动
        if (!hasStartedDrag) return;

        e.preventDefault();

        // 计算新位置（直接使用普通变量，不触发响应式）
        currentX = startElementX + deltaX;
        currentY = startElementY + deltaY;

        // 直接操作 DOM，最高性能
        targetRef.value.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

        // 只在需要时更新响应式数据（用于显示）
        position.value.x = currentX;
        position.value.y = currentY;

        // 触发拖拽中回调（可选）
        onDragging?.({ x: currentX, y: currentY });
    };

    /**
     * 鼠标松开事件处理
     */
    const handleMouseUp = () => {
        // 移除全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 只有真正开始过拖拽才处理结束逻辑
        if (hasStartedDrag) {
            isDragging.value = false;

            // 移除 will-change
            if (targetRef.value) {
                targetRef.value.style.willChange = 'auto';
            }

            // 通知全局拖拽上下文结束（只有真正拖拽过才调用）
            dragContext.endDrag();

            // 重置 transform，让元素回到原位置（数据更新后会重新渲染）
            if (targetRef.value) {
                targetRef.value.style.transform = 'translate3d(0px, 0px, 0)';
            }

            // 重置位置变量
            currentX = 0;
            currentY = 0;
            position.value = { x: 0, y: 0 };

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

    onMounted(() => {
        if (targetRef.value) {
            targetRef.value.addEventListener('mousedown', handleMouseDown);
        }
    });

    onUnmounted(() => {
        if (targetRef.value) {
            targetRef.value.removeEventListener('mousedown', handleMouseDown);
        }
        // 清理全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
        position,
        isDragging,
        setPosition,
        resetPosition
    };
}
