import { ref, computed, onUnmounted, type Ref, type MaybeRef } from 'vue';
import { unref } from 'vue';

/** 调整手柄位置 */
export type ResizeHandlePosition = 
    | 'n'      // 上 north
    | 's'      // 下 south
    | 'e'      // 右 east
    | 'w'      // 左 west
    | 'se';    // 右下 south east

/** 调整大小选项 */
export interface UseResizeOptions {
    /** 元素 ID */
    id: string;
    /** 元素类型 */
    type: 'panel' | 'panelGroup';
    /** 是否启用调整大小，默认为 true */
    enabled?: Ref<boolean> | boolean;
    /** 最小宽度（像素），支持响应式 */
    minWidth?: MaybeRef<number>;
    /** 最小高度（像素），支持响应式 */
    minHeight?: MaybeRef<number>;
    /** 最大宽度（像素），支持响应式 */
    maxWidth?: MaybeRef<number>;
    /** 最大高度（像素），支持响应式 */
    maxHeight?: MaybeRef<number>;
    /** 允许的调整方向（根据布局方向自动计算，支持响应式） */
    allowedHandles?: MaybeRef<ResizeHandlePosition[]>;
    /** 是否允许改变位置（left/top），只有浮动窗体才需要，默认为 false */
    allowPositionChange?: boolean;
    /** 调整开始回调 */
    onResizeStart?: (position: ResizeHandlePosition) => void;
    /** 调整中回调 */
    onResizing?: (width: number, height: number, position: ResizeHandlePosition) => void;
    /** 调整结束回调 */
    onResizeEnd?: (width: number, height: number, position: ResizeHandlePosition) => void;
    /** 更新尺寸的回调（用于更新 store） */
    onSizeChange?: (width: number, height: number) => void;
}

/**
 * 调整大小 Hook
 */
export function useResize(
    targetRef: Ref<HTMLElement | null>,
    options: UseResizeOptions
) {
    const {
        enabled = true,
        minWidth: minWidthOption = 50,
        minHeight: minHeightOption = 50,
        maxWidth: maxWidthOption = Infinity,
        maxHeight: maxHeightOption = Infinity,
        allowedHandles, // 允许的调整方向（根据布局方向自动计算，支持响应式）
        allowPositionChange = false, // 默认不允许改变位置（只有浮动窗体需要）
        onResizeStart,
        onResizing,
        onResizeEnd,
        onSizeChange
    } = options;

    // 将 min/max 转换为响应式值（支持 computed）
    const minWidth = computed(() => unref(minWidthOption));
    const minHeight = computed(() => unref(minHeightOption));
    const maxWidth = computed(() => unref(maxWidthOption));
    const maxHeight = computed(() => unref(maxHeightOption));

    // 是否正在调整大小
    const isResizing = ref(false);
    // 当前调整的手柄位置
    const activeHandle = ref<ResizeHandlePosition | null>(null);
    // 当前尺寸（用于显示）
    const size = ref({ width: 0, height: 0 });

    // 调整状态变量
    let startMouseX = 0;
    let startMouseY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let startLeft = 0;
    let startTop = 0;
    let currentHandle: ResizeHandlePosition | null = null;

    /**
     * 获取手柄的 CSS 类名
     */
    const getHandleClass = (position: ResizeHandlePosition): string => {
        return `resize-handle resize-handle-${position}`;
    };

    /**
     * 获取手柄的鼠标样式
     */
    const getHandleCursor = (position: ResizeHandlePosition): string => {
        const cursorMap: Record<ResizeHandlePosition, string> = {
            'n': 'n-resize',
            's': 's-resize',
            'e': 'e-resize',
            'w': 'w-resize',
            'se': 'se-resize',
        };
        return cursorMap[position];
    };

    /**
     * 根据布局方向获取允许的手柄（支持响应式）
     */
    const getAllowedHandles = (): ResizeHandlePosition[] => {
        if (allowedHandles) {
            return unref(allowedHandles);
        }

        // 默认返回基础手柄（不包含 sw, nw, ne）
        return ['n', 's', 'e', 'w', 'se'];
    };

    /**
     * 鼠标按下事件处理
     */
    const handleMouseDown = (e: MouseEvent, position: ResizeHandlePosition) => {
        // 检查是否启用调整大小
        const isEnabled = typeof enabled === 'boolean' ? enabled : enabled.value;
        if (!isEnabled || !targetRef.value) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = targetRef.value.getBoundingClientRect(); // 获取元素的边界矩形
        startMouseX = e.clientX; // 记录鼠标按下时的 x 坐标
        startMouseY = e.clientY; // 记录鼠标按下时的 y 坐标
        startWidth = rect.width; // 记录元素的宽度
        startHeight = rect.height; // 记录元素的高度
        startLeft = rect.left; // 记录元素的左边界
        startTop = rect.top; // 记录元素的顶部边界
        currentHandle = position; // 记录当前调整的手柄位置

        isResizing.value = true; // 设置正在调整大小
        activeHandle.value = position; // 设置当前调整的手柄位置

        // 添加 will-change 优化
        if (targetRef.value) {
            targetRef.value.style.willChange = 'width, height';
        }

        // 添加全局监听
        document.addEventListener('mousemove', handleMouseMove, { passive: false }); // 添加鼠标移动事件监听
        document.addEventListener('mouseup', handleMouseUp); // 添加鼠标松开事件监听

        // 触发调整开始回调
        onResizeStart?.(position); // 触发调整开始回调
    };

    /**
     * 检查是否达到边界，如果达到则阻止继续调整
     * @param delta 变化量（正数表示增大，负数表示减小）
     * @param currentSize 当前尺寸
     * @param min 最小尺寸（computed ref）
     * @param max 最大尺寸（computed ref）
     * @param isReverse 是否是反向调整（w 和 n 手柄）
     */
    const checkBoundary = (
        delta: number, 
        currentSize: number, 
        min: typeof minWidth,
        max: typeof maxWidth,
        isReverse: boolean = false
    ): number => {
        const minValue = min.value;
        const maxValue = max.value;
        
        if (isReverse) {
            // 反向调整：delta 为正时缩小，delta 为负时放大
            const newSize = currentSize - delta;
            // 如果新尺寸小于最小值，限制 delta（阻止继续缩小）
            if (newSize < minValue) {
                return currentSize - minValue;
            }
            // 如果新尺寸大于最大值，限制 delta（阻止继续放大）
            if (newSize > maxValue) {
                return currentSize - maxValue;
            }
        } else {
            // 正向调整：delta 为正时放大，delta 为负时缩小
            const newSize = currentSize + delta;
            // 如果新尺寸小于最小值，限制 delta（阻止继续缩小）
            if (newSize < minValue) {
                return minValue - currentSize;
            }
            // 如果新尺寸大于最大值，限制 delta（阻止继续放大）
            if (newSize > maxValue) {
                return maxValue - currentSize;
            }
        }
        return delta;
    };

    /**
     * 鼠标移动事件处理
     */
    const handleMouseMove = (e: MouseEvent) => {
        if (!targetRef.value || !currentHandle) return;

        e.preventDefault();

        let deltaX = e.clientX - startMouseX; // 计算鼠标移动的 x 距离
        let deltaY = e.clientY - startMouseY; // 计算鼠标移动的 y 距离

        let newWidth = startWidth; // 记录新的宽度
        let newHeight = startHeight; // 记录新的高度
        let newLeft = startLeft; // 记录新的左边界
        let newTop = startTop; // 记录新的顶部边界

        // 获取当前的 min/max 值（支持响应式）
        const currentMinWidth = minWidth.value; // 获取当前的最小宽度
        const currentMaxWidth = maxWidth.value; // 获取当前的最大宽度
        const currentMinHeight = minHeight.value; // 获取当前的最小高度
        const currentMaxHeight = maxHeight.value; // 获取当前的最大高度

        // 根据手柄位置计算新尺寸，并在达到边界时阻止调整
        switch (currentHandle) {
            case 'e': // 右 - 只调整宽度
                // 检查是否达到边界
                deltaX = checkBoundary(deltaX, startWidth, minWidth, maxWidth); // 检查是否达到边界
                newWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, startWidth + deltaX)); // 计算新的宽度
                newHeight = startHeight; // 计算新的高度
                break;
            case 'w': // 左 - 只调整宽度（反向调整）
                // 检查是否达到边界（w 手柄是反向的）
                deltaX = checkBoundary(deltaX, startWidth, minWidth, maxWidth, true); // 检查是否达到边界
                // 如果允许改变位置（浮动窗体），从左侧调整
                if (allowPositionChange) {
                    newWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, startWidth - deltaX)); // 计算新的宽度
                    newLeft = startLeft + (startWidth - newWidth); // 计算新的左边界
                } else {
                    // 停靠元素：从左侧调整宽度（实际上是向右扩展）
                    newWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, startWidth - deltaX)); // 计算新的宽度
                }
                newHeight = startHeight; // 计算新的高度
                break;
            case 's': // 下 - 只调整高度
                // 检查是否达到边界
                deltaY = checkBoundary(deltaY, startHeight, minHeight, maxHeight); // 检查是否达到边界
                newWidth = startWidth; // 计算新的宽度
                newHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, startHeight + deltaY)); // 计算新的高度
                break;
            case 'n': // 上 - 只调整高度（反向调整）
                // 检查是否达到边界（n 手柄是反向的）
                deltaY = checkBoundary(deltaY, startHeight, minHeight, maxHeight, true); // 检查是否达到边界
                // 如果允许改变位置（浮动窗体），从上侧调整
                if (allowPositionChange) {
                    newHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, startHeight - deltaY)); // 计算新的高度
                    newTop = startTop + (startHeight - newHeight);
                } else {
                    // 停靠元素：从上侧调整高度（实际上是向下扩展）
                    newHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, startHeight - deltaY)); // 计算新的高度
                }
                newWidth = startWidth; // 计算新的宽度
                break;
            case 'se': // 右下 - 可同时调整宽高
                // 检查是否达到边界
                deltaX = checkBoundary(deltaX, startWidth, minWidth, maxWidth); // 检查是否达到边界
                deltaY = checkBoundary(deltaY, startHeight, minHeight, maxHeight); // 检查是否达到边界
                // 表示新的宽度不能小于最小宽度，不能大于最大宽度，并且不能小于当前宽度加上deltaX
                newWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, startWidth + deltaX));
                newHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, startHeight + deltaY));
                break;
        }

        // 确保尺寸在限制范围内（双重检查）
        newWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, newWidth));
        newHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, newHeight));

        // 直接操作 DOM，性能优化
        // 注意：只更新实际改变的尺寸，避免不必要的样式更新
        if (newWidth !== startWidth) {
            targetRef.value.style.width = `${newWidth}px`;
        }
        if (newHeight !== startHeight) {
            targetRef.value.style.height = `${newHeight}px`;
        }
        
        // 只有允许改变位置时（浮动窗体），才更新位置属性
        // 停靠的元素不应该有 left/top 属性，它们应该在 flex 布局中自然定位
        if (allowPositionChange) {
            if (newLeft !== startLeft) {
                targetRef.value.style.left = `${newLeft}px`;
            }
            if (newTop !== startTop) {
                targetRef.value.style.top = `${newTop}px`;
            }
        } else {
            // 停靠元素：清除可能存在的 left/top 属性
            if (targetRef.value.style.left) {
                targetRef.value.style.left = '';
            }
            if (targetRef.value.style.top) {
                targetRef.value.style.top = '';
            }
        }

        // 更新响应式数据（用于显示）
        size.value = { width: newWidth, height: newHeight };

        // 触发调整中回调
        onResizing?.(newWidth, newHeight, currentHandle);
        onSizeChange?.(newWidth, newHeight);
    };

    /**
     * 鼠标松开事件处理
     */
    const handleMouseUp = () => {
        if (!targetRef.value || !currentHandle) return;

        // 移除全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const finalWidth = size.value.width;
        const finalHeight = size.value.height;

        // 移除 will-change
        if (targetRef.value) {
            targetRef.value.style.willChange = 'auto';
        }

        // 触发调整结束回调
        onResizeEnd?.(finalWidth, finalHeight, currentHandle);

        // 触发尺寸变化回调（更新 store）
        onSizeChange?.(finalWidth, finalHeight);

        // 重置状态
        isResizing.value = false;
        activeHandle.value = null;
        currentHandle = null;
    };

    /**
     * 获取所有手柄配置（用于在组件中渲染）
     */
    const getHandles = () => {
        return getAllowedHandles().map(position => ({
            position,
            class: getHandleClass(position),
            cursor: getHandleCursor(position),
            onMouseDown: (e: MouseEvent) => {
                handleMouseDown(e, position);
            }
        }));
    };

    onUnmounted(() => {
        // 清理全局监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
        isResizing,
        activeHandle,
        size,
        getHandles,
        getHandleClass,
        getHandleCursor,
        handleMouseDown
    };
}
