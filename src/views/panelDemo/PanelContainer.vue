<template>
  <div class="panel-container">
    <PanelGroupComponent
      :tabs="tabs"
      :active-tab-id="activeTabId"
      :is-floating="false"
      @update:active-tab-id="handleTabChange"
      @tab-close="handleTabClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TabItem } from './types';
import PanelGroupComponent from './PanelGroupComponent.vue';

interface Props {
  tabs: TabItem[];
  activeTabId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeTabId: ''
});

const emit = defineEmits<{
  'update:active-tab-id': [tabId: string];
  'tab-close': [tabId: string];
}>();

const activeTabId = ref(props.activeTabId || (props.tabs[0]?.id ?? ''));

watch(() => props.activeTabId, (newVal) => {
  if (newVal) {
    activeTabId.value = newVal;
  }
});

watch(() => props.tabs, (newTabs) => {
  if (newTabs.length > 0 && !newTabs.find(t => t.id === activeTabId.value)) {
    activeTabId.value = newTabs[0].id;
  }
});

const handleTabChange = (tabId: string) => {
  activeTabId.value = tabId;
  emit('update:active-tab-id', tabId);
};

const handleTabClose = (tabId: string) => {
  emit('tab-close', tabId);
};
</script>

<style scoped>
.panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
