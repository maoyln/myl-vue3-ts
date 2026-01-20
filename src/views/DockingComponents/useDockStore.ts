import { defineStore } from 'pinia';
import { mockData } from './mock';

export const useDockStore = defineStore('dock', {
  state: () => ({
    dockContainers: mockData.containers,
    floatPanelGroups: mockData.floatPanelGroups,

  }),
  actions: {
    // addDockContainer(container: any) {
    //   this.dockContainers = container;
    // },
    // addFloatPanelGroup(group: any) {
    //   this.floatPanelGroups = group;
    // },
  },
});
