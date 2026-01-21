import { defineStore } from 'pinia';
import { mockData } from './mock';

// 类型定义
export interface Panel {
  id: string;
  name: string;
  tabs?: any[];
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
  },
});
