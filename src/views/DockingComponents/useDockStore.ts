import { defineStore } from 'pinia';
import { mockData } from './mock';

// 类型定义
export interface Panel {
  id: string;
  name: string;
  tabs?: any[];
  /** 当前宽度 */
  width?: number;
  /** 当前高度 */
  height?: number;
  /** 原始宽度（初始值） */
  originalWidth?: number;
  /** 原始高度（初始值） */
  originalHeight?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  [key: string]: any;
}

export interface PanelGroup {
  id: string;
  direction: 'row' | 'column';
  width?: number;
  height?: number;
  panels: Panel[];
}

export interface Container {
  id: string;
  position: string;
  groups: PanelGroup[];
}

export interface FloatPanelGroup {
  id: string;
  position: 'float';
  x: number;
  y: number;
  groups: PanelGroup[];
}

export const useDockStore = defineStore('dock', {
  state: () => ({
    dockContainers: mockData.containers as Record<string, Container>,
    floatPanelGroups: mockData.floatPanelGroups as FloatPanelGroup[],
  }),
  
  getters: {
    /**
     * 根据 panelId 查找 panel 所在的位置信息
     */
    findPanelLocation: (state) => (panelId: string) => {
      // 在固定容器中查找
      for (const [containerKey, container] of Object.entries(state.dockContainers)) {
        for (const group of container.groups) {
          const panelIndex = group.panels.findIndex(p => p.id === panelId);
          if (panelIndex !== -1) {
            return {
              type: 'container' as const,
              containerKey,
              containerId: container.id,
              groupId: group.id,
              panelIndex,
              panel: group.panels[panelIndex],
            };
          }
        }
      }
      
      // 在浮动窗体中查找
      for (const floatGroup of state.floatPanelGroups) {
        for (const group of floatGroup.groups) {
          const panelIndex = group.panels.findIndex(p => p.id === panelId);
          if (panelIndex !== -1) {
            return {
              type: 'float' as const,
              floatGroupId: floatGroup.id,
              groupId: group.id,
              panelIndex,
              panel: group.panels[panelIndex],
            };
          }
        }
      }
      
      return null;
    },
  },
  
  actions: {
    /**
     * 移动 panel 到指定 panelGroup 的指定位置
     */
    movePanelToGroup(
      panelId: string,
      targetGroupId: string,
      targetIndex: number
    ) {
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return;
      }
      
      // 查找目标 group
      let targetGroup: PanelGroup | null = null;
      let targetContainer: Container | null = null;
      let targetFloatGroup: FloatPanelGroup | null = null;
      
      // 在固定容器中查找
      for (const container of Object.values(this.dockContainers)) {
        targetGroup = container.groups.find(g => g.id === targetGroupId) || null;
        if (targetGroup) {
          targetContainer = container;
          break;
        }
      }
      
      // 在浮动窗体中查找
      if (!targetGroup) {
        for (const floatGroup of this.floatPanelGroups) {
          targetGroup = floatGroup.groups.find(g => g.id === targetGroupId) || null;
          if (targetGroup) {
            targetFloatGroup = floatGroup;
            break;
          }
        }
      }
      
      if (!targetGroup) {
        console.error('未找到目标 group:', targetGroupId);
        return;
      }
      
      // 判断是否是同一组内移动
      const isSameGroup = location.groupId === targetGroupId;
      
      if (isSameGroup) {
        // 同一组内移动：直接调整数组元素位置
        const sourceIndex = location.panelIndex;
        
        // 如果目标位置和源位置相同，不需要移动
        if (sourceIndex === targetIndex) {
          return;
        }
        
        // 获取源 group
        let sourceGroup: PanelGroup | null = null;
        if (location.type === 'container') {
          const container = this.dockContainers[location.containerKey];
          sourceGroup = container.groups.find(g => g.id === location.groupId) || null;
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
          sourceGroup = floatGroup?.groups.find(g => g.id === location.groupId) || null;
        }
        
        if (sourceGroup) {
          // 移除源位置的元素
          const [panel] = sourceGroup.panels.splice(sourceIndex, 1);
          
          // 计算插入位置：如果目标位置在原位置之后，需要减1（因为已经移除了一个元素）
          const insertIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
          
          // 插入到目标位置
          sourceGroup.panels.splice(insertIndex, 0, panel);
        }
      } else {
        // 跨组移动：从源组移除，插入到目标组
        let panel: Panel;
        
        // 从源位置移除
        if (location.type === 'container') {
          const container = this.dockContainers[location.containerKey];
          const group = container.groups.find(g => g.id === location.groupId);
          if (group) {
            // 移除源位置的 panel
            panel = group.panels.splice(location.panelIndex, 1)[0];
            
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = container.groups.findIndex(g => g.id === location.groupId);
              if (groupIndex !== -1) {
                container.groups.splice(groupIndex, 1);
              }
            }
          } else {
            return;
          }
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === location.groupId);
          if (group) {
            panel = group.panels.splice(location.panelIndex, 1)[0];
            
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = floatGroup!.groups.findIndex(g => g.id === location.groupId);
              if (groupIndex !== -1) {
                floatGroup!.groups.splice(groupIndex, 1);
              }
              
              // 如果浮动窗体没有 group 了，删除整个浮动窗体
              if (floatGroup!.groups.length === 0) {
                const floatIndex = this.floatPanelGroups.findIndex(f => f.id === location.floatGroupId);
                if (floatIndex !== -1) {
                  this.floatPanelGroups.splice(floatIndex, 1);
                }
              }
            }
          } else {
            return;
          }
        }
        
        // 插入到目标组
        targetGroup.panels.splice(targetIndex, 0, panel);
      }
    },
    
    /**
     * 在指定 container 中创建新的 group，并将 panel 放入
     */
    createGroupInContainer(
      panelId: string,
      containerKey: string,
      groupIndex: number,
      direction: 'row' | 'column' = 'column'
    ) {
      // 1. 查找并移除原位置的 panel
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return;
      }
      
      let panel: Panel;
      
      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        const group = container.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];
          
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const gIndex = container.groups.findIndex(g => g.id === location.groupId);
            if (gIndex !== -1) {
              container.groups.splice(gIndex, 1);
            }
          }
        } else {
          return;
        }
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];
          
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const gIndex = floatGroup!.groups.findIndex(g => g.id === location.groupId);
            if (gIndex !== -1) {
              floatGroup!.groups.splice(gIndex, 1);
            }
            
            // 如果浮动窗体没有 group 了，删除整个浮动窗体
            if (floatGroup!.groups.length === 0) {
              const floatIndex = this.floatPanelGroups.findIndex(f => f.id === location.floatGroupId);
              if (floatIndex !== -1) {
                this.floatPanelGroups.splice(floatIndex, 1);
              }
            }
          }
        } else {
          return;
        }
      }
      
      // 2. 创建新的 group
      const newGroup: PanelGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        direction,
        width: 200,
        height: 200,
        panels: [panel],
      };
      
      // 3. 插入到目标 container
      const targetContainer = this.dockContainers[containerKey];
      if (targetContainer) {
        targetContainer.groups.splice(groupIndex, 0, newGroup);
      } else {
        console.error('未找到目标 container:', containerKey);
      }
    },
    
    /**
     * 创建新的浮动窗体
     */
    createFloatWindow(
      panelId: string,
      x: number,
      y: number,
      width: number = 300,
      height: number = 400
    ) {
      // 1. 查找并移除原位置的 panel
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return;
      }
      
      let panel: Panel;
      
      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        const group = container.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];
          
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const groupIndex = container.groups.findIndex(g => g.id === location.groupId);
            if (groupIndex !== -1) {
              container.groups.splice(groupIndex, 1);
            }
          }
        } else {
          return;
        }
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];
          
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const gIndex = floatGroup!.groups.findIndex(g => g.id === location.groupId);
            if (gIndex !== -1) {
              floatGroup!.groups.splice(gIndex, 1);
            }
            
            // 如果浮动窗体没有 group 了，删除整个浮动窗体
            if (floatGroup!.groups.length === 0) {
              const floatIndex = this.floatPanelGroups.findIndex(f => f.id === location.floatGroupId);
              if (floatIndex !== -1) {
                this.floatPanelGroups.splice(floatIndex, 1);
              }
            }
          }
        } else {
          return;
        }
      }
      
      // 2. 创建新的浮动窗体
      const newFloatGroup: FloatPanelGroup = {
        id: `float_panel_group_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        position: 'float',
        x,
        y,
        groups: [
          {
            id: `group_float_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
            direction: 'column',
            width,
            height,
            panels: [panel],
          },
        ],
      };
      
      this.floatPanelGroups.push(newFloatGroup);
    },

    /**
     * 调整 PanelGroup 的大小
     */
    resizePanelGroup(groupId: string, width: number, height: number) {
      // 在固定容器中查找
      for (const container of Object.values(this.dockContainers)) {
        const group = container.groups.find(g => g.id === groupId);
        if (group) {
          group.width = width;
          group.height = height;
          return;
        }
      }

      // 在浮动窗体中查找
      for (const floatGroup of this.floatPanelGroups) {
        const group = floatGroup.groups.find(g => g.id === groupId);
        if (group) {
          group.width = width;
          group.height = height;
          return;
        }
      }
    },


    /**
     * 获取相邻 panel 的约束信息（用于在调整前检查边界）
     * @param panelId 当前 panel ID
     * @param direction 布局方向
     * @returns 相邻 panel 的约束信息，如果不存在则返回 null
     */
    getAdjacentPanelConstraints(
      panelId: string,
      direction: 'row' | 'column'
    ): { min: number; max: number; current: number } | null {
      const location = this.findPanelLocation(panelId);
      if (!location) {
        return null;
      }

      let group: PanelGroup | null = null;

      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        group = container.groups.find(g => g.id === location.groupId) || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        group = floatGroup?.groups.find(g => g.id === location.groupId) || null;
      }

      if (!group) {
        return null;
      }

      // 只获取紧邻的下一个 panel（不处理最后一个 panel，因为它使用 flex: 1 填满剩余空间）
      const nextPanelIndex = location.panelIndex + 1;
      const nextPanel = nextPanelIndex < group.panels.length - 1 
        ? group.panels[nextPanelIndex] 
        : null;

      if (!nextPanel) {
        return null;
      }

      if (direction === 'row') {
        // row 布局：返回高度的约束
        const currentHeight = nextPanel.height || nextPanel.originalHeight || 150;
        return {
          min: nextPanel.minHeight || 50,
          max: nextPanel.maxHeight || Infinity,
          current: currentHeight
        };
      } else {
        // column 布局：返回宽度的约束
        const currentWidth = nextPanel.width || nextPanel.originalWidth || 200;
        return {
          min: nextPanel.minWidth || 50,
          max: nextPanel.maxWidth || Infinity,
          current: currentWidth
        };
      }
    },

    /**
     * 调整 Panel 的大小，只影响被拖拽的 panel 和其后一个 panel
     * 两个 panel 重新分配它们原来所占的宽度或高度
     * @param panelId 要调整的 panel ID
     * @param width 新宽度（仅用于 column 布局）
     * @param height 新高度（仅用于 row 布局）
     * @param direction 布局方向
     */
    resizePanelWithAdjacent(
      panelId: string,
      width: number,
      height: number,
      direction: 'row' | 'column'
    ) {
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return;
      }

      let group: PanelGroup | null = null;

      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        group = container.groups.find(g => g.id === location.groupId) || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        group = floatGroup?.groups.find(g => g.id === location.groupId) || null;
      }

      if (!group) {
        return;
      }

      const panel = group.panels[location.panelIndex];
      if (!panel) {
        return;
      }

      // 只获取紧邻的下一个 panel（不处理最后一个 panel，因为它使用 flex: 1 填满剩余空间）
      const nextPanelIndex = location.panelIndex + 1;
      const nextPanel = nextPanelIndex < group.panels.length - 1 
        ? group.panels[nextPanelIndex] 
        : null;

      // 根据布局方向调整尺寸
      if (direction === 'row') {
        // row 布局：调整高度，只影响当前 panel 和下一个 panel
        const oldHeight = panel.height || panel.originalHeight || 150;
        const nextOldHeight = nextPanel ? (nextPanel.height || nextPanel.originalHeight || 150) : 0;

        // 计算期望的新高度
        const desiredHeight = Math.max(
          panel.minHeight || 50,
          Math.min(panel.maxHeight || Infinity, height)
        );
        const heightDelta = desiredHeight - oldHeight;

        // 如果有下一个 panel，检查它是否能接受这个变化
        if (nextPanel) {
          const nextNewHeight = nextOldHeight - heightDelta;
          const nextMinHeight = nextPanel.minHeight || 50;
          const nextMaxHeight = nextPanel.maxHeight || Infinity;

          // 检查下一个 panel 是否达到边界
          if (nextNewHeight < nextMinHeight) {
            // 下一个 panel 会小于最小值，限制当前 panel 的调整
            const maxAllowedHeight = oldHeight + (nextOldHeight - nextMinHeight);
            panel.height = Math.min(desiredHeight, maxAllowedHeight);
            nextPanel.height = nextMinHeight;
          } else if (nextNewHeight > nextMaxHeight) {
            // 下一个 panel 会大于最大值，限制当前 panel 的调整
            const minAllowedHeight = oldHeight - (nextMaxHeight - nextOldHeight);
            panel.height = Math.max(desiredHeight, minAllowedHeight);
            nextPanel.height = nextMaxHeight;
          } else {
            // 正常情况：两个 panel 重新分配高度
            panel.height = desiredHeight;
            nextPanel.height = nextNewHeight;
          }
        } else {
          // 没有下一个 panel，只更新当前 panel
          panel.height = desiredHeight;
        }
      } else if (direction === 'column') {
        // column 布局：调整宽度，只影响当前 panel 和下一个 panel
        const oldWidth = panel.width || panel.originalWidth || 200;
        const nextOldWidth = nextPanel ? (nextPanel.width || nextPanel.originalWidth || 200) : 0;

        // 计算期望的新宽度
        const desiredWidth = Math.max(
          panel.minWidth || 50,
          Math.min(panel.maxWidth || Infinity, width)
        );
        const widthDelta = desiredWidth - oldWidth;

        // 如果有下一个 panel，检查它是否能接受这个变化
        if (nextPanel) {
          const nextNewWidth = nextOldWidth - widthDelta;
          const nextMinWidth = nextPanel.minWidth || 50;
          const nextMaxWidth = nextPanel.maxWidth || Infinity;

          // 检查下一个 panel 是否达到边界
          if (nextNewWidth < nextMinWidth) {
            // 下一个 panel 会小于最小值，限制当前 panel 的调整
            const maxAllowedWidth = oldWidth + (nextOldWidth - nextMinWidth);
            panel.width = Math.min(desiredWidth, maxAllowedWidth);
            nextPanel.width = nextMinWidth;
          } else if (nextNewWidth > nextMaxWidth) {
            // 下一个 panel 会大于最大值，限制当前 panel 的调整
            const minAllowedWidth = oldWidth - (nextMaxWidth - nextOldWidth);
            panel.width = Math.max(desiredWidth, minAllowedWidth);
            nextPanel.width = nextMaxWidth;
          } else {
            // 正常情况：两个 panel 重新分配宽度
            panel.width = desiredWidth;
            nextPanel.width = nextNewWidth;
          }
        } else {
          // 没有下一个 panel，只更新当前 panel
          panel.width = desiredWidth;
        }
      }
    },

    /**
     * 调整 Panel 的大小（如果 Panel 有独立尺寸）
     */
    resizePanel(panelId: string, width: number, height: number) {
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return;
      }

      let panel: Panel | undefined;

      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        const group = container.groups.find(g => g.id === location.groupId);
        panel = group?.panels.find(p => p.id === panelId);
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === location.groupId);
        panel = group?.panels.find(p => p.id === panelId);
      }

      if (panel) {
        // 应用最小/最大约束
        if (width !== undefined) {
          panel.width = Math.max(
            panel.minWidth || 50,
            Math.min(panel.maxWidth || Infinity, width)
          );
        }
        if (height !== undefined) {
          panel.height = Math.max(
            panel.minHeight || 50,
            Math.min(panel.maxHeight || Infinity, height)
          );
        }
      }
    },
  },
});
