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

    /**
     * 鼠标按下事件处理
     */
    const handleMouseDown = (e: MouseEvent) => {
        // 检查是否启用拖拽
        const isEnabled = typeof enabled === 'boolean' ? enabled : enabled.value;
        if (!isEnabled || !targetRef.value) return;

        e.preventDefault();
        e.stopPropagation();

        isDragging.value = true;
        
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

        // 通知全局拖拽上下文
        dragContext.startDrag({ id, type, data });

        // 触发拖拽开始回调
        onDragStart?.({ x: currentX, y: currentY });

        // 添加全局监听
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * 鼠标移动事件处理（高性能版本）
     */
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.value || !targetRef.value) return;

        e.preventDefault();

        // 计算新位置（直接使用普通变量，不触发响应式）
        currentX = startElementX + (e.clientX - startMouseX);
        currentY = startElementY + (e.clientY - startMouseY);

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
        if (!isDragging.value) return;

        isDragging.value = false;

        // 移除 will-change
        if (targetRef.value) {
            targetRef.value.style.willChange = 'auto';
        }

        // 移除全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 通知全局拖拽上下文结束
        dragContext.endDrag();

        // 更新最终位置
        position.value = { x: currentX, y: currentY };

        // 触发拖拽结束回调
        onDragEnd?.({ x: currentX, y: currentY });
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
