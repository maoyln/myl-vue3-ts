import { useDockStore } from './useDockStore';
import { useDragContext } from './useDragContext';
import type { DropPosition } from './useDropZone';

export type DropScenario = 'panelGroup' | 'panelContainer' | 'tabs' | 'emptySpace';

export interface DropInfo {
  scenario: DropScenario;
  position: DropPosition;
  targetId: string;
  targetData?: any;
}

/**
 * 拖拽放置处理类（单例模式）
 */
class DragDropHandler {
  private store = useDockStore();
  private dragContext = useDragContext();
  
  // 当前激活的热区信息
  private activeDropZone: DropInfo | null = null;
  // 鼠标释放位置（用于创建浮动窗口）
  private dropPosition: { x: number; y: number } | null = null;
  // 是否已处理过放置（防止重复执行）
  private dropHandled = false;

  /**
   * 解析位置字符串，获取插入索引
   */
  private parsePosition(position: string) {
    const match = position.match(/(before|after)-(\d+)/);
    if (!match) return { insertIndex: 0 };
    
    const type = match[1] as 'before' | 'after';
    const index = parseInt(match[2], 10);
    const insertIndex = type === 'before' ? index : index + 1;
    
    return { insertIndex };
  }

  /**
   * 统一处理拖拽放置
   */
  private handleDrop(prevDrag: { id: string; type: string; data?: any }) {
    // 防止重复执行
    if (this.dropHandled) {
      this.reset();
      return;
    }

    this.dropHandled = true;

    // 处理 tab 类型的拖拽
    if (prevDrag.type === 'tab') {
      const tabId = prevDrag.id;
      const tabData = prevDrag.data; // tab 数据

      // 有激活的热区，执行热区放置
      if (this.activeDropZone) {
        const { scenario, position, targetId, targetData } = this.activeDropZone;

        if (scenario === 'panelGroup') {
          // 在 PanelGroup 中创建新 Panel（包含这个 tab）
          const { insertIndex } = this.parsePosition(position as string);
          this.store.createPanelFromTab(tabId, tabData, targetId, insertIndex);
        } else if (scenario === 'panelContainer') {
          // 在 Container 中创建新 Group 和 Panel（包含这个 tab）
          const containerKey = targetData?.containerKey || 'left';
          const direction = targetData?.direction || 'column';
          const { insertIndex } = this.parsePosition(position as string);
          this.store.createGroupFromTab(tabId, tabData, containerKey, insertIndex, direction);
        } else if (scenario === 'tabs') {
          // 将 tab 插入到指定 Panel 的 tabs 数组的指定位置
          const targetPanelId = targetData?.panelId;
          const { insertIndex } = this.parsePosition(position as string);
          if (targetPanelId) {
            this.store.insertTabToPanel(tabId, tabData, targetPanelId, insertIndex);
          }
        }
      } 
      // 没有激活的热区：若已是整窗跟随（floatGroupId）则只移动该浮窗；否则创建新浮动窗口。落点 = 鼠标释放位置 - 按下时相对偏移，使“抓住的那点”仍在鼠标下
      else if (this.dropPosition) {
        const off = prevDrag.data?.dragOffset;
        const x = off ? this.dropPosition.x - off.x : this.dropPosition.x;
        const y = off ? this.dropPosition.y - off.y : this.dropPosition.y;
        const floatGroupId = prevDrag.data?.floatGroupId;
        if (floatGroupId) {
          this.store.moveFloatWindow(floatGroupId, x, y);
        } else {
          this.store.createFloatWindowFromTab(tabId, tabData, x, y);
        }
      }
    }
    // 处理 panel 类型的拖拽
    else if (prevDrag.type === 'panel') {
      const panelId = prevDrag.id;

      // 有激活的热区，执行热区放置
      if (this.activeDropZone) {
        const { scenario, position, targetId, targetData } = this.activeDropZone;

        if (scenario === 'panelGroup') {
          // 移动到 PanelGroup 的指定位置
          const { insertIndex } = this.parsePosition(position as string);
          this.store.movePanelToGroup(panelId, targetId, insertIndex);
        } else if (scenario === 'panelContainer') {
          // 在 Container 中创建新 Group
          const containerKey = targetData?.containerKey || 'left';
          const direction = targetData?.direction || 'column';
          const { insertIndex } = this.parsePosition(position as string);
          this.store.createGroupInContainer(panelId, containerKey, insertIndex, direction);
        } else if (scenario === 'tabs') {
          // 将 panel 的所有 tabs 合并到目标 Panel
          const targetPanelId = targetData?.panelId;
          const { insertIndex } = this.parsePosition(position as string);
          if (targetPanelId && panelId !== targetPanelId) {
            this.store.mergePanelTabsToPanel(panelId, targetPanelId, insertIndex);
          }
        }
      } 
      // 没有激活的热区：若来自浮窗内则只移动该浮窗；否则创建新浮动窗口。落点 = 鼠标释放位置 - 按下时相对偏移，使“抓住的那点”仍在鼠标下
      else if (this.dropPosition) {
        const off = prevDrag.data?.dragOffset;
        const x = off ? this.dropPosition.x - off.x : this.dropPosition.x;
        const y = off ? this.dropPosition.y - off.y : this.dropPosition.y;
        const floatGroupId = prevDrag.data?.floatGroupId;
        if (floatGroupId) {
          this.store.moveFloatWindow(floatGroupId, x, y);
        } else {
          this.store.createFloatWindow(panelId, x, y);
        }
      }
    }

    // 使用双重 requestAnimationFrame 确保 DOM 更新完成后再重置
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.reset();
      });
    });
  }

  /**
   * 重置状态
   */
  private reset() {
    this.activeDropZone = null;
    this.dropPosition = null;
    this.dropHandled = false;
  }

  /**
   * 注册热区激活（由 PanelGroup 和 PanelContainer 调用）
   */
  registerDropZone(dropInfo: DropInfo) {
    this.activeDropZone = dropInfo;
  }

  /**
   * 清除热区激活
   */
  clearDropZone() {
    this.activeDropZone = null;
  }

  /**
   * 记录鼠标释放位置（用于创建浮动窗口）
   */
  recordDropPosition(x: number, y: number) {
    this.dropPosition = { x, y };
  }

  /**
   * 初始化监听器（只执行一次）
   */
  init() {
    // 注册拖拽开始回调（清除之前的状态）
    this.dragContext.onDragStart(() => {
      this.reset();
    });

    // 注册拖拽结束回调（在 endDrag 中调用，确保只执行一次）
    this.dragContext.onDragEnd((prevDrag) => {
      // 使用双重 requestAnimationFrame 确保在热区的 onDrop 回调执行后再处理
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.handleDrop({ id: prevDrag.id, type: prevDrag.type, data: prevDrag.data });
        });
      });
    });

    // 全局 mouseup 事件处理（记录鼠标位置）
    const handleGlobalMouseUp = (e: MouseEvent) => {
      const currentDrag = this.dragContext.getCurrentDrag().value;
      if (currentDrag) {
        this.recordDropPosition(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
  }
}

// 全局单例
const dragDropHandler = new DragDropHandler();

// 初始化（只执行一次）
if (typeof window !== 'undefined') {
  dragDropHandler.init();
}

/**
 * 拖拽放置处理 Hook
 * 统一处理三种互斥的拖拽场景：
 * 1. 移动到 PanelGroup 的指定位置
 * 2. 在 Container 中创建新 Group
 * 3. 创建浮动窗口
 */
export function useDragDrop() {
  return {
    registerDropZone: (dropInfo: DropInfo) => dragDropHandler.registerDropZone(dropInfo),
    clearDropZone: () => dragDropHandler.clearDropZone(),
  };
}
