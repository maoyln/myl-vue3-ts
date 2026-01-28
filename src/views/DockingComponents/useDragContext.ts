import { ref } from 'vue';
import { useDockStore } from './useDockStore';

/** 拖拽信息 */
export interface DragInfo {
    id: string;
    type: 'panel' | 'panelGroup' | 'tab';
    data: any;
}

/** 整窗跟随时由全局接管的 mousemove/mouseup 监听（避免源组件卸载后丢失焦点） */
interface FloatMoveListeners {
    move: (e: MouseEvent) => void;
    up: () => void;
}

/** 全局拖拽上下文（轻量级状态共享）*/
class DragContext {
    // 当前正在拖拽的信息
    private currentDrag = ref<DragInfo | null>(null);
    // 所有注册的热区处理器
    private dropHandlers = new Map<string, () => void>();
    // 拖拽结束回调（用于统一处理放置逻辑）
    private dragEndCallback: ((prevDrag: DragInfo) => void) | null = null;

    /**
     * 开始拖拽回调
     */
    private dragStartCallback: (() => void) | null = null;

    /** 整窗跟随时由 context 接管的 document 监听，源组件卸载后仍可继续移动/结束 */
    private floatMoveListeners: FloatMoveListeners | null = null;

    /**
     * 开始拖拽
     */
    startDrag(info: DragInfo) {
        this.currentDrag.value = info;
        // 调用拖拽开始回调
        if (this.dragStartCallback) {
            this.dragStartCallback();
        }
    }

    /**
     * 注册拖拽开始回调
     */
    onDragStart(callback: () => void) {
        this.dragStartCallback = callback;
    }

    /**
     * 结束拖拽 - 触发激活的热区放置
     */
    endDrag() {
        const prevDrag = this.currentDrag.value;
        
        // 通知所有热区处理器
        this.dropHandlers.forEach(handler => {
            handler();
        });
        
        // 调用拖拽结束回调（统一处理放置逻辑）
        if (prevDrag && this.dragEndCallback) {
            this.dragEndCallback(prevDrag);
        }
        
        this.currentDrag.value = null;
    }

    /**
     * 注册拖拽结束回调
     */
    onDragEnd(callback: (prevDrag: DragInfo) => void) {
        this.dragEndCallback = callback;
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

    /**
     * 移除整窗跟随时由 context 接管的 document 监听
     */
    removeFloatMoveListeners() {
        if (this.floatMoveListeners) {
            document.removeEventListener('mousemove', this.floatMoveListeners.move);
            document.removeEventListener('mouseup', this.floatMoveListeners.up);
            this.floatMoveListeners = null;
        }
    }

    /**
     * 整窗跟随时将 mousemove/mouseup 交给全局接管，避免源组件（dock 内 panel/tab）卸载后丢失焦点
     * 由 useDrag 在“刚转为整窗跟随”时调用，之后由 context 负责移动浮窗与 endDrag
     */
    attachFloatMoveHandlers(floatGroupId: string, dragOffset: { x: number; y: number }) {
        this.removeFloatMoveListeners();
        const store = useDockStore();
        const move = (e: MouseEvent) => {
            store.moveFloatWindow(floatGroupId, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
            e.preventDefault();
        };
        const up = () => {
            this.removeFloatMoveListeners();
            this.endDrag();
        };
        this.floatMoveListeners = { move, up };
        document.addEventListener('mousemove', move, { passive: false });
        document.addEventListener('mouseup', up);
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
