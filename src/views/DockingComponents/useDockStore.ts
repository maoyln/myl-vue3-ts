import { defineStore } from 'pinia';
import { mockData, dockConfig } from './mock';

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
      console.log('findPanelLocation---111', state.dockContainers);
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
      
      console.log('findPanelLocation---222', state.floatPanelGroups);

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

    /**
     * 根据 tabId 查找 tab 当前所在位置（dock 或浮窗），用于拖拽过程中 tab 已从原 panel 移走时的回退查找
     */
    findTabLocation: (state) => (tabId: string) => {
      for (const [containerKey, container] of Object.entries(state.dockContainers)) {
        for (const group of container.groups) {
          for (let panelIndex = 0; panelIndex < group.panels.length; panelIndex++) {
            const panel = group.panels[panelIndex];
            const tabIndex = panel.tabs?.findIndex((t: any) => t.id === tabId) ?? -1;
            if (tabIndex !== -1) {
              return {
                type: 'container' as const,
                containerKey,
                containerId: container.id,
                groupId: group.id,
                panelIndex,
                panel,
                tabIndex,
              };
            }
          }
        }
      }
      for (const floatGroup of state.floatPanelGroups) {
        for (const group of floatGroup.groups) {
          for (let panelIndex = 0; panelIndex < group.panels.length; panelIndex++) {
            const panel = group.panels[panelIndex];
            const tabIndex = panel.tabs?.findIndex((t: any) => t.id === tabId) ?? -1;
            if (tabIndex !== -1) {
              return {
                type: 'float' as const,
                floatGroupId: floatGroup.id,
                groupId: group.id,
                panelIndex,
                panel,
                tabIndex,
              };
            }
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
      
      // 在固定容器中查找
      for (const container of Object.values(this.dockContainers)) {
        targetGroup = container.groups.find(g => g.id === targetGroupId) || null;
        if (targetGroup) {
          break;
        }
      }
      
      // 在浮动窗体中查找
      if (!targetGroup) {
        for (const floatGroup of this.floatPanelGroups) {
          targetGroup = floatGroup.groups.find(g => g.id === targetGroupId) || null;
          if (targetGroup) {
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
     * 若原来在浮窗内（仅移动位置），保留原浮窗宽高；若从非浮窗拖出，使用 dockConfig 默认宽高
     * @returns 新浮窗的 floatGroupId，失败时返回 undefined
     */
    createFloatWindow(panelId: string, x: number, y: number): string | undefined {
      const location = this.findPanelLocation(panelId);
      if (!location) {
        console.error('未找到 panel:', panelId);
        return undefined;
      }

      // 先确定新浮窗宽高：原浮窗则沿用原 group 宽高，否则用配置默认值
      let width = dockConfig.defaultFloatWindowWidth;
      let height = dockConfig.defaultFloatWindowHeight;
      if (location.type === 'float') {
        const fg = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        const grp = fg?.groups.find(g => g.id === location.groupId);
        if (grp && (grp.width != null || grp.height != null)) {
          width = grp.width ?? width;
          height = grp.height ?? height;
        }
      }

      let panel: Panel;

      if (location.type === 'container') {
        const container = this.dockContainers[location.containerKey];
        const group = container.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];

          if (group.panels.length === 0) {
            const groupIndex = container.groups.findIndex(g => g.id === location.groupId);
            if (groupIndex !== -1) {
              container.groups.splice(groupIndex, 1);
            }
          }
        } else {
          return undefined;
        }
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === location.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === location.groupId);
        if (group) {
          panel = group.panels.splice(location.panelIndex, 1)[0];

          if (group.panels.length === 0) {
            const gIndex = floatGroup!.groups.findIndex(g => g.id === location.groupId);
            if (gIndex !== -1) {
              floatGroup!.groups.splice(gIndex, 1);
            }
            if (floatGroup!.groups.length === 0) {
              const floatIndex = this.floatPanelGroups.findIndex(f => f.id === location.floatGroupId);
              if (floatIndex !== -1) {
                this.floatPanelGroups.splice(floatIndex, 1);
              }
            }
          }
        } else {
          return undefined;
        }
      }

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
      return newFloatGroup.id;
    },

    /**
     * 移动浮动窗体位置（整窗跟随鼠标，用于浮窗内拖 panel 时整体移动）
     */
    moveFloatWindow(floatGroupId: string, x: number, y: number) {
      const fg = this.floatPanelGroups.find(f => f.id === floatGroupId);
      if (fg) {
        fg.x = x;
        fg.y = y;
      }
    },

    /**
     * 将指定浮窗置于最前（不被其他浮窗盖住），最后操作的浮窗保持在最上层
     */
    bringFloatToFront(floatGroupId: string) {
      const index = this.floatPanelGroups.findIndex(f => f.id === floatGroupId);
      if (index === -1 || index === this.floatPanelGroups.length - 1) return;
      const [fg] = this.floatPanelGroups.splice(index, 1);
      this.floatPanelGroups.push(fg);
    },

    /**
     * 从 tab 创建新的 panel，并添加到指定的 PanelGroup
     */
    createPanelFromTab(
      tabId: string,
      tabData: any,
      targetGroupId: string,
      targetIndex: number
    ) {
      // 1. 先按 tabData.panelId 查找；若无此 tab 则按 tabId 回退查找（拖拽时可能已移入浮窗）
      let panelLocation = this.findPanelLocation(tabData.panelId);
      let sourcePanel: Panel | null = null;
      let tabIndex = -1;

      if (panelLocation) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find((g: PanelGroup) => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation!.floatGroupId);
          const group = floatGroup?.groups.find((g: PanelGroup) => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        }
        if (sourcePanel?.tabs) {
          tabIndex = sourcePanel.tabs.findIndex((t: any) => t.id === tabId);
        }
      }

      if (tabIndex === -1) {
        const tabLocation = this.findTabLocation(tabId);
        if (!tabLocation) {
          console.error('未找到 tab:', tabId);
          return;
        }
        panelLocation = tabLocation.type === 'container'
          ? {
              type: 'container' as const,
              containerKey: tabLocation.containerKey,
              containerId: tabLocation.containerId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            }
          : {
              type: 'float' as const,
              floatGroupId: tabLocation.floatGroupId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            };
        sourcePanel = tabLocation.panel;
        tabIndex = tabLocation.tabIndex;
      }

      if (!sourcePanel || !sourcePanel.tabs || !panelLocation) {
        console.error('未找到源 panel 或 panel 没有 tabs');
        return;
      }

      // 2. 从源 panel 中移除这个 tab
      const tab = sourcePanel.tabs.splice(tabIndex, 1)[0];

      // 如果移除后 panel 没有 tabs 了，删除该 panel
      if (sourcePanel.tabs.length === 0) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = container.groups.findIndex(g => g.id === panelLocation.groupId);
              if (groupIndex !== -1) {
                container.groups.splice(groupIndex, 1);
              }
            }
          }
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const gIndex = floatGroup!.groups.findIndex(g => g.id === panelLocation.groupId);
              if (gIndex !== -1) {
                floatGroup!.groups.splice(gIndex, 1);
              }
              // 如果浮动窗体没有 group 了，删除整个浮动窗体
              if (floatGroup!.groups.length === 0) {
                const floatIndex = this.floatPanelGroups.findIndex(f => f.id === panelLocation.floatGroupId);
                if (floatIndex !== -1) {
                  this.floatPanelGroups.splice(floatIndex, 1);
                }
              }
            }
          }
        }
      }

      // 3. 创建新的 panel（只包含这个 tab）
      const newPanel: Panel = {
        id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: tabData.title || '新面板',
        width: sourcePanel.width || 200,
        height: sourcePanel.height || 150,
        originalWidth: sourcePanel.originalWidth || 200,
        originalHeight: sourcePanel.originalHeight || 150,
        minWidth: sourcePanel.minWidth || 100,
        minHeight: sourcePanel.minHeight || 80,
        maxWidth: sourcePanel.maxWidth || 800,
        maxHeight: sourcePanel.maxHeight || 400,
        tabs: [tab]
      };

      // 4. 查找目标 group 并插入 panel
      let targetGroup: PanelGroup | null = null;
      
      // 在固定容器中查找
      for (const container of Object.values(this.dockContainers)) {
        targetGroup = container.groups.find(g => g.id === targetGroupId) || null;
        if (targetGroup) {
          targetGroup.panels.splice(targetIndex, 0, newPanel);
          return;
        }
      }
      
      // 在浮动窗体中查找
      for (const floatGroup of this.floatPanelGroups) {
        targetGroup = floatGroup.groups.find(g => g.id === targetGroupId) || null;
        if (targetGroup) {
          targetGroup.panels.splice(targetIndex, 0, newPanel);
          return;
        }
      }

      console.error('未找到目标 group:', targetGroupId);
    },

    /**
     * 从 tab 创建新的 group 和 panel，并添加到指定的 Container
     */
    createGroupFromTab(
      tabId: string,
      tabData: any,
      containerKey: string,
      groupIndex: number,
      direction: 'row' | 'column' = 'column'
    ) {
      // 1. 先按 tabData.panelId 查找；若该 panel 中已无此 tab（拖拽时已移入浮窗），则按 tabId 回退查找
      let panelLocation: ReturnType<typeof this.findPanelLocation> = this.findPanelLocation(tabData.panelId);
      let sourcePanel: Panel | null = null;
      let tabIndex = -1;

      if (panelLocation) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find(g => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation!.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        }
        if (sourcePanel?.tabs) {
          tabIndex = sourcePanel.tabs.findIndex((t: any) => t.id === tabId);
        }
      }

      if (tabIndex === -1) {
        const tabLocation = this.findTabLocation(tabId);
        if (!tabLocation) {
          console.error('未找到 tab:', tabId);
          return;
        }
        panelLocation = tabLocation.type === 'container'
          ? {
              type: 'container' as const,
              containerKey: tabLocation.containerKey,
              containerId: tabLocation.containerId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            }
          : {
              type: 'float' as const,
              floatGroupId: tabLocation.floatGroupId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            };
        sourcePanel = tabLocation.panel;
        tabIndex = tabLocation.tabIndex;
      }

      if (!sourcePanel || !sourcePanel.tabs || !panelLocation) {
        console.error('未找到源 panel 或 panel 没有 tabs');
        return;
      }

      // 2. 从源 panel 中移除这个 tab
      const tab = sourcePanel.tabs.splice(tabIndex, 1)[0];

      // 如果移除后 panel 没有 tabs 了，删除该 panel
      if (sourcePanel.tabs.length === 0) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find((g: PanelGroup) => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = container.groups.findIndex((g: PanelGroup) => g.id === panelLocation.groupId);
              if (groupIndex !== -1) {
                container.groups.splice(groupIndex, 1);
              }
            }
          }
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const gIndex = floatGroup!.groups.findIndex(g => g.id === panelLocation.groupId);
              if (gIndex !== -1) {
                floatGroup!.groups.splice(gIndex, 1);
              }
              // 如果浮动窗体没有 group 了，删除整个浮动窗体
              if (floatGroup!.groups.length === 0) {
                const floatIndex = this.floatPanelGroups.findIndex(f => f.id === panelLocation.floatGroupId);
                if (floatIndex !== -1) {
                  this.floatPanelGroups.splice(floatIndex, 1);
                }
              }
            }
          }
        }
      }

      // 3. 创建新的 panel（只包含这个 tab）
      const newPanel: Panel = {
        id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: tabData.title || '新面板',
        width: sourcePanel.width || 200,
        height: sourcePanel.height || 150,
        originalWidth: sourcePanel.originalWidth || 200,
        originalHeight: sourcePanel.originalHeight || 150,
        minWidth: sourcePanel.minWidth || 100,
        minHeight: sourcePanel.minHeight || 80,
        maxWidth: sourcePanel.maxWidth || 800,
        maxHeight: sourcePanel.maxHeight || 400,
        tabs: [tab]
      };

      // 4. 创建新的 group
      const newGroup: PanelGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        direction,
        width: 200,
        height: 200,
        panels: [newPanel],
      };
      
      // 5. 插入到目标 container
      const targetContainer = this.dockContainers[containerKey];
      if (targetContainer) {
        targetContainer.groups.splice(groupIndex, 0, newGroup);
      } else {
        console.error('未找到目标 container:', containerKey);
      }
    },

    /**
     * 从 tab 创建新的浮动窗口
     * 若原来在浮窗内（仅移动位置），保留原浮窗宽高；若从非浮窗拖出，使用 dockConfig 默认宽高
     * @returns 新浮动窗体 id，供拖拽落点与热区放置时使用（tab 已在新 panel 中），失败时返回 undefined
     */
    createFloatWindowFromTab(tabId: string, tabData: any, x: number, y: number): string | undefined {
      const panelLocation = this.findPanelLocation(tabData.panelId);
      console.log(panelLocation, 'panelLocation1111')
      if (!panelLocation) {
        console.error('未找到 tab 所在的 panel:', tabData.panelId);
        return undefined;
      }
      const _ = 0; // 占位，避免与其它 early return 冲突

      // 先确定新浮窗宽高：原浮窗则沿用原 group 宽高，否则用配置默认值
      let width = dockConfig.defaultFloatWindowWidth;
      let height = dockConfig.defaultFloatWindowHeight;
      if (panelLocation.type === 'float') {
        const fg = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
        const grp = fg?.groups.find(g => g.id === panelLocation.groupId);
        if (grp && (grp.width != null || grp.height != null)) {
          width = grp.width ?? width;
          height = grp.height ?? height;
        }
      }

      let sourcePanel: Panel | null = null;
      if (panelLocation.type === 'container') {
        const container = this.dockContainers[panelLocation.containerKey];
        const group = container.groups.find(g => g.id === panelLocation.groupId);
        sourcePanel = group?.panels[panelLocation.panelIndex] || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === panelLocation.groupId);
        sourcePanel = group?.panels[panelLocation.panelIndex] || null;
      }

      if (!sourcePanel || !sourcePanel.tabs) {
        console.error('未找到源 panel 或 panel 没有 tabs');
        return;
      }

      // 2. 从源 panel 中移除这个 tab
      const tabIndex = sourcePanel.tabs.findIndex((t: any) => t.id === tabId);
      if (tabIndex === -1) {
        console.error('未找到 tab:', tabId);
        return;
      }

      const tab = sourcePanel.tabs.splice(tabIndex, 1)[0];

      // 如果移除后 panel 没有 tabs 了，删除该 panel
      if (sourcePanel.tabs.length === 0) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = container.groups.findIndex(g => g.id === panelLocation.groupId);
              if (groupIndex !== -1) {
                container.groups.splice(groupIndex, 1);
              }
            }
          }
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const gIndex = floatGroup!.groups.findIndex(g => g.id === panelLocation.groupId);
              if (gIndex !== -1) {
                floatGroup!.groups.splice(gIndex, 1);
              }
              // 如果浮动窗体没有 group 了，删除整个浮动窗体
              if (floatGroup!.groups.length === 0) {
                const floatIndex = this.floatPanelGroups.findIndex(f => f.id === panelLocation.floatGroupId);
                if (floatIndex !== -1) {
                  this.floatPanelGroups.splice(floatIndex, 1);
                }
              }
            }
          }
        }
      }

      // 3. 创建新的 panel（只包含这个 tab）
      const newPanel: Panel = {
        id: `panel_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: tabData.title || '新面板',
        width: width,
        height: height,
        originalWidth: width,
        originalHeight: height,
        minWidth: sourcePanel.minWidth || 100,
        minHeight: sourcePanel.minHeight || 80,
        maxWidth: sourcePanel.maxWidth || 800,
        maxHeight: sourcePanel.maxHeight || 400,
        tabs: [tab]
      };

      // 4. 创建新的 group
      const newGroup: PanelGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        direction: 'column',
        width: width,
        height: height,
        panels: [newPanel],
      };

      // 5. 创建新的浮动窗体
      const newFloatGroup: FloatPanelGroup = {
        id: `float_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        position: 'float',
        x,
        y,
        groups: [newGroup],
      };
      
      this.floatPanelGroups.push(newFloatGroup);
      return newFloatGroup.id;
    },

    /**
     * 将 tab 插入到指定 Panel 的 tabs 数组的指定位置
     */
    insertTabToPanel(
      tabId: string,
      tabData: any,
      targetPanelId: string,
      insertIndex: number
    ) {
      // 1. 先按 tabData.panelId 查找；若无此 tab 则按 tabId 回退查找（拖拽时可能已移入浮窗）
      let panelLocation = this.findPanelLocation(tabData.panelId);
      let sourcePanel: Panel | null = null;
      let tabIndex = -1;

      if (panelLocation) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find((g: PanelGroup) => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation!.floatGroupId);
          const group = floatGroup?.groups.find((g: PanelGroup) => g.id === panelLocation!.groupId);
          sourcePanel = group?.panels[panelLocation.panelIndex] ?? null;
        }
        if (sourcePanel?.tabs) {
          tabIndex = sourcePanel.tabs.findIndex((t: any) => t.id === tabId);
        }
      }

      if (tabIndex === -1) {
        const tabLocation = this.findTabLocation(tabId);
        if (!tabLocation) {
          console.error('未找到 tab:', tabId);
          return;
        }
        panelLocation = tabLocation.type === 'container'
          ? {
              type: 'container' as const,
              containerKey: tabLocation.containerKey,
              containerId: tabLocation.containerId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            }
          : {
              type: 'float' as const,
              floatGroupId: tabLocation.floatGroupId,
              groupId: tabLocation.groupId,
              panelIndex: tabLocation.panelIndex,
              panel: tabLocation.panel,
            };
        sourcePanel = tabLocation.panel;
        tabIndex = tabLocation.tabIndex;
      }

      if (!sourcePanel || !sourcePanel.tabs || !panelLocation) {
        console.error('未找到源 panel 或 panel 没有 tabs');
        return;
      }

      // 2. 从源 panel 中移除这个 tab
      const tab = sourcePanel.tabs.splice(tabIndex, 1)[0];

      // 如果移除后 panel 没有 tabs 了，删除该 panel
      if (sourcePanel.tabs.length === 0) {
        if (panelLocation.type === 'container') {
          const container = this.dockContainers[panelLocation.containerKey];
          const group = container.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const groupIndex = container.groups.findIndex(g => g.id === panelLocation.groupId);
              if (groupIndex !== -1) {
                container.groups.splice(groupIndex, 1);
              }
            }
          }
        } else {
          const floatGroup = this.floatPanelGroups.find(f => f.id === panelLocation.floatGroupId);
          const group = floatGroup?.groups.find(g => g.id === panelLocation.groupId);
          if (group) {
            group.panels.splice(panelLocation.panelIndex, 1);
            // 如果移除后 group 为空，删除该 group
            if (group.panels.length === 0) {
              const gIndex = floatGroup!.groups.findIndex(g => g.id === panelLocation.groupId);
              if (gIndex !== -1) {
                floatGroup!.groups.splice(gIndex, 1);
              }
              // 如果浮动窗体没有 group 了，删除整个浮动窗体
              if (floatGroup!.groups.length === 0) {
                const floatIndex = this.floatPanelGroups.findIndex(f => f.id === panelLocation.floatGroupId);
                if (floatIndex !== -1) {
                  this.floatPanelGroups.splice(floatIndex, 1);
                }
              }
            }
          }
        }
      }

      // 3. 查找目标 panel
      const targetLocation = this.findPanelLocation(targetPanelId);
      if (!targetLocation) {
        console.error('未找到目标 panel:', targetPanelId);
        return;
      }

      let targetPanel: Panel | null = null;
      if (targetLocation.type === 'container') {
        const container = this.dockContainers[targetLocation.containerKey];
        const group = container.groups.find(g => g.id === targetLocation.groupId);
        targetPanel = group?.panels[targetLocation.panelIndex] || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === targetLocation.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === targetLocation.groupId);
        targetPanel = group?.panels[targetLocation.panelIndex] || null;
      }

      if (!targetPanel) {
        console.error('未找到目标 panel:', targetPanelId);
        return;
      }

      // 4. 如果目标 panel 没有 tabs 数组，创建一个
      if (!targetPanel.tabs) {
        targetPanel.tabs = [];
      }

      // 5. 将 tab 插入到指定位置
      // 如果插入位置超出范围，插入到末尾
      const safeInsertIndex = Math.min(insertIndex, targetPanel.tabs.length);
      targetPanel.tabs.splice(safeInsertIndex, 0, tab);
    },

    /**
     * 将源 Panel 的所有 tabs 合并到目标 Panel
     */
    mergePanelTabsToPanel(
      sourcePanelId: string,
      targetPanelId: string,
      insertIndex: number
    ) {
      // 1. 查找源 panel
      const sourceLocation = this.findPanelLocation(sourcePanelId);
      if (!sourceLocation) {
        console.error('未找到源 panel:', sourcePanelId);
        return;
      }

      let sourcePanel: Panel | null = null;
      if (sourceLocation.type === 'container') {
        const container = this.dockContainers[sourceLocation.containerKey];
        const group = container.groups.find(g => g.id === sourceLocation.groupId);
        sourcePanel = group?.panels[sourceLocation.panelIndex] || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === sourceLocation.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === sourceLocation.groupId);
        sourcePanel = group?.panels[sourceLocation.panelIndex] || null;
      }

      if (!sourcePanel || !sourcePanel.tabs || sourcePanel.tabs.length === 0) {
        console.error('源 panel 不存在或没有 tabs');
        return;
      }

      // 2. 查找目标 panel
      const targetLocation = this.findPanelLocation(targetPanelId);
      if (!targetLocation) {
        console.error('未找到目标 panel:', targetPanelId);
        return;
      }

      let targetPanel: Panel | null = null;
      if (targetLocation.type === 'container') {
        const container = this.dockContainers[targetLocation.containerKey];
        const group = container.groups.find(g => g.id === targetLocation.groupId);
        targetPanel = group?.panels[targetLocation.panelIndex] || null;
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === targetLocation.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === targetLocation.groupId);
        targetPanel = group?.panels[targetLocation.panelIndex] || null;
      }

      if (!targetPanel) {
        console.error('未找到目标 panel:', targetPanelId);
        return;
      }

      // 3. 如果目标 panel 没有 tabs 数组，创建一个
      if (!targetPanel.tabs) {
        targetPanel.tabs = [];
      }

      // 4. 将所有 tabs 插入到目标 panel
      const tabsToMove = [...sourcePanel.tabs];
      const safeInsertIndex = Math.min(insertIndex, targetPanel.tabs.length);
      targetPanel.tabs.splice(safeInsertIndex, 0, ...tabsToMove);

      // 5. 删除源 panel（因为所有 tabs 已移走）
      sourcePanel.tabs = [];
      if (sourceLocation.type === 'container') {
        const container = this.dockContainers[sourceLocation.containerKey];
        const group = container.groups.find(g => g.id === sourceLocation.groupId);
        if (group) {
          group.panels.splice(sourceLocation.panelIndex, 1);
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const groupIndex = container.groups.findIndex(g => g.id === sourceLocation.groupId);
            if (groupIndex !== -1) {
              container.groups.splice(groupIndex, 1);
            }
          }
        }
      } else {
        const floatGroup = this.floatPanelGroups.find(f => f.id === sourceLocation.floatGroupId);
        const group = floatGroup?.groups.find(g => g.id === sourceLocation.groupId);
        if (group) {
          group.panels.splice(sourceLocation.panelIndex, 1);
          // 如果移除后 group 为空，删除该 group
          if (group.panels.length === 0) {
            const gIndex = floatGroup!.groups.findIndex(g => g.id === sourceLocation.groupId);
            if (gIndex !== -1) {
              floatGroup!.groups.splice(gIndex, 1);
            }
            // 如果浮动窗体没有 group 了，删除整个浮动窗体
            if (floatGroup!.groups.length === 0) {
              const floatIndex = this.floatPanelGroups.findIndex(f => f.id === sourceLocation.floatGroupId);
              if (floatIndex !== -1) {
                this.floatPanelGroups.splice(floatIndex, 1);
              }
            }
          }
        }
      }
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
