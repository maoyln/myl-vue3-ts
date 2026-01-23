<!-- Tabs 组件 - 管理多个 Tab 的切换 -->
<template>
    <div class="tabs-container">
        <!-- Tab 标题栏 -->
        <div class="tabs-header" v-if="tabs.length > 0">
            <div
                v-for="tab in tabs"
                :key="tab.id"
                class="tab-header-item"
                :class="{ 'is-active': activeTabId === tab.id }"
                @click="setActiveTab(tab.id)"
            >
                <span class="tab-title">{{ tab.title }}</span>
                <span 
                    v-if="closable && tabs.length > 1"
                    class="tab-close"
                    @click.stop="closeTab(tab.id)"
                >
                    ×
                </span>
            </div>
        </div>

        <!-- Tab 内容区域 -->
        <div class="tabs-content">
            <Tab
                v-for="tab in tabs"
                :key="tab.id"
                :id="tab.id"
                :title="tab.title"
                :component="tab.component"
                :active="activeTabId === tab.id"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Tab from './Tab.vue';

export interface TabItem {
    id: string;
    title: string;
    component: string;
}

const props = defineProps<{
    tabs: TabItem[];
    defaultActiveId?: string;
    closable?: boolean; // 是否可关闭
}>();

const emit = defineEmits<{
    (e: 'tab-change', tabId: string): void;
    (e: 'tab-close', tabId: string): void;
}>();

// 当前激活的 Tab ID
const activeTabId = ref<string>(props.defaultActiveId || (props.tabs.length > 0 ? props.tabs[0].id : ''));

// 设置激活的 Tab
const setActiveTab = (tabId: string) => {
    if (activeTabId.value !== tabId) {
        activeTabId.value = tabId;
        emit('tab-change', tabId);
    }
};

// 关闭 Tab
const closeTab = (tabId: string) => {
    emit('tab-close', tabId);
};
</script>

<style scoped>
.tabs-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    flex-direction: row;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
}

.tab-header-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: background-color 0.2s;
    position: relative;
    min-width: 20px;
}

.tab-header-item:hover {
    background-color: #e8e8e8;
}

.tab-header-item.is-active {
    background-color: #fff;
    color: #409eff;
    border-bottom: 2px solid #409eff;
}

.tab-title {
    flex: 1;
    font-size: 14px;
}

.tab-close {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1;
    color: #999;
    transition: all 0.2s;
}

.tab-close:hover {
    background-color: #ddd;
    color: #333;
}

.tabs-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}
</style>
