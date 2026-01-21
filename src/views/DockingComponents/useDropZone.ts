import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import { useDragContext } from './useDragContext';

/** 热区位置类型 */
export type DropPosition = 'before' | 'after' | 'center' | 'top' | 'right' | 'bottom' | 'left';

/** 热区配置 */
export interface DropZoneOptions {
    /** 热区类型 */
    type: 'panel' | 'panelGroup' | 'panelContainer';
    /** 元素 ID */
    id: string;
    /** 元素数据 */
    data?: any;
    /** 允许的热区位置 */
    allowedPositions?: DropPosition[];
    /** 热区 CSS class 名称（用于精确查找） */
    dropZoneClass?: string;
    /** 进入热区回调 */
    onEnter?: (position: DropPosition, dragInfo: any) => void;
    /** 离开热区回调 */
    onLeave?: (position: DropPosition) => void;
    /** 放置回调 */
    onDrop?: (position: DropPosition, dragInfo: any) => void;
}

/**
 * 热区管理 Hook
 */
export function useDropZone(
    containerRef: Ref<HTMLElement | null>,
    options: DropZoneOptions
) {
    const {
        type,
        id,
        data,
        allowedPositions = ['before', 'after'],
        dropZoneClass = 'drop-zone',
        onEnter,
        onLeave,
        onDrop
    } = options;

    const dragContext = useDragContext();
    
    // 当前激活的热区位置
    const activePosition = ref<DropPosition | null>(null);
    
    // 是否应该显示热区
    const shouldShowDropZone = computed(() => {
        const currentDrag = dragContext.getCurrentDrag().value;
        return currentDrag !== null && currentDrag.id !== id;
    });

    // 热区元素引用映射
    const dropZoneElements = new Map<DropPosition, HTMLElement>();
    const eventHandlers = new Map<DropPosition, {
        enter: (e: MouseEvent) => void;
        leave: (e: MouseEvent) => void;
    }>();

    /**
     * 热区进入事件处理
     */
    const handleZoneEnter = (position: DropPosition) => {
        console.log('handleZoneEnter', position);
        const currentDrag = dragContext.getCurrentDrag().value;
        if (!currentDrag || currentDrag.id === id) return;

        if (activePosition.value !== position) {
            if (activePosition.value) {
                onLeave?.(activePosition.value);
            }
            activePosition.value = position;
            onEnter?.(position, currentDrag);
            
            console.log(`进入热区 [${type}:${id}] 位置: ${position}`);
        }
    };

    /**
     * 热区离开事件处理
     */
    const handleZoneLeave = (position: DropPosition) => {
        console.log('handleZoneLeave', position);

        if (activePosition.value === position) {
            onLeave?.(position);
            activePosition.value = null;
            
            console.log(`离开热区 [${type}:${id}] 位置: ${position}`);
        }
    };

    /**
     * 注册热区 DOM 元素
     */
    const registerDropZone = (position: DropPosition, element: HTMLElement) => {
        dropZoneElements.set(position, element);

        const enterHandler = (e: MouseEvent) => {
            e.stopPropagation(); // 防止事件冒泡到父级热区
            handleZoneEnter(position);
        };
        
        const leaveHandler = (e: MouseEvent) => {
            e.stopPropagation();
            handleZoneLeave(position);
        };

        eventHandlers.set(position, {
            enter: enterHandler,
            leave: leaveHandler
        });

        element.addEventListener('mouseenter', enterHandler);
        element.addEventListener('mouseleave', leaveHandler);
    };

    /**
     * 注销热区 DOM 元素
     */
    const unregisterDropZone = (position: DropPosition) => {
        const element = dropZoneElements.get(position);
        const handlers = eventHandlers.get(position);

        if (element && handlers) {
            element.removeEventListener('mouseenter', handlers.enter);
            element.removeEventListener('mouseleave', handlers.leave);
            dropZoneElements.delete(position);
            eventHandlers.delete(position);
        }
    };

    /**
     * 初始化热区（自动查找并注册）
     */
    const initDropZones = () => {
        if (!containerRef.value) return;
        
        console.log(`[${type}:${id}]  初始化热区`, allowedPositions);
        
        // 先清理已注册的热区，避免重复注册
        dropZoneElements.forEach((_, position) => {
            unregisterDropZone(position);
        });
        
        // 使用 class + data-drop-zone 精确查找，避免查找到嵌套组件的热区
        allowedPositions.forEach(position => {
            // 查找所有匹配的热区元素
            const allElements = containerRef.value?.querySelectorAll(
                `.${dropZoneClass}[data-drop-zone="${position}"]`
            ) as NodeListOf<HTMLElement>;
            
            if (!allElements || allElements.length === 0) {
                console.warn(`[${type}:${id}] 未找到热区: ${position}`);
                return;
            }
            
            // 找到最近的（DOM 层级最浅的）热区元素
            let closestElement: HTMLElement | null = null;
            let minDepth = Infinity;
            
            allElements.forEach(el => {
                // 计算元素相对于 containerRef 的深度
                let depth = 0;
                let current: HTMLElement | null = el;
                while (current && current !== containerRef.value) {
                    depth++;
                    current = current.parentElement;
                }
                
                // 选择深度最小的元素（最接近 containerRef 的）
                if (depth < minDepth) {
                    minDepth = depth;
                    closestElement = el;
                }
            });
            
            if (closestElement) {
                console.log(`[${type}:${id}]  注册热区: ${position}，深度: ${minDepth}`);
                registerDropZone(position, closestElement);
            }
        });
        
        console.log(`[${type}:${id}]  已注册热区数量: ${dropZoneElements.size}`);
    };

    /**
     * 处理放置
     */
    const handleDrop = () => {
        if (activePosition.value) {
            const currentDrag = dragContext.getCurrentDrag().value;
            if (currentDrag) {
                onDrop?.(activePosition.value, currentDrag);
                console.log(`放置到 [${type}:${id}] 位置: ${activePosition.value}`, currentDrag);
            }
            activePosition.value = null;
        }
    };

    /**
     * 重置状态
     */
    const reset = () => {
        if (activePosition.value) {
            onLeave?.(activePosition.value);
            activePosition.value = null;
        }
    };

    // 组件挂载时初始化
    onMounted(() => {
        // 延迟初始化，确保 DOM 已渲染
        setTimeout(initDropZones, 0);
        
        // 注册放置处理器到全局上下文
        dragContext.registerDropHandler(id, handleDrop);
    });

    // 监听拖拽状态，动态初始化热区
    watch(() => dragContext.getCurrentDrag().value, (drag) => {
        if (drag && drag.id !== id) {
            // 拖拽开始且不是自己被拖拽，等待 DOM 更新后初始化热区
            nextTick(() => {
                console.log(`[${type}:${id}] 拖拽开始，重新初始化热区`);
                initDropZones();
            });
        } else if (!drag) {
            // 拖拽结束，清理热区
            console.log(`[${type}:${id}] 拖拽结束，清理热区`);
            dropZoneElements.forEach((_, position) => {
                unregisterDropZone(position);
            });
            // 重置状态
            reset();
        }
    });

    // 组件卸载时清理
    onUnmounted(() => {
        dropZoneElements.forEach((_, position) => {
            unregisterDropZone(position);
        });
        
        // 注销放置处理器
        dragContext.unregisterDropHandler(id);
    });

    return {
        shouldShowDropZone,
        activePosition,
        handleDrop,
        reset,
        initDropZones // 手动重新初始化（如果需要）
    };
}
