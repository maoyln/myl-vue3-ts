import { ref } from 'vue';

/** 拖拽信息 */
export interface DragInfo {
    id: string;
    type: 'panel' | 'panelGroup';
    data: any;
}

/** 全局拖拽上下文（轻量级状态共享）*/
class DragContext {
    // 当前正在拖拽的信息
    private currentDrag = ref<DragInfo | null>(null);
    // 所有注册的热区处理器
    private dropHandlers = new Map<string, () => void>();

    /**
     * 开始拖拽
     */
    startDrag(info: DragInfo) {
        this.currentDrag.value = info;
    }

    /**
     * 结束拖拽 - 触发激活的热区放置
     */
    endDrag() {
        // 通知所有热区处理器
        this.dropHandlers.forEach(handler => {
            handler();
        });
        
        this.currentDrag.value = null;
    }

    /**
     * 注册热区放置处理器
     */
    registerDropHandler(id: string, handler: () => void) {
        this.dropHandlers.set(id, handler);
    }

    /**
     * 注销热区放置处理器
     */
    unregisterDropHandler(id: string) {
        this.dropHandlers.delete(id);
    }

    /**
     * 获取当前拖拽信息
     */
    getCurrentDrag() {
        return this.currentDrag;
    }

    /**
     * 是否正在拖拽
     */
    isDragging() {
        return this.currentDrag.value !== null;
    }
}

// 全局单例
const dragContext = new DragContext();

/**
 * 使用拖拽上下文
 */
export function useDragContext() {
    return dragContext;
}
