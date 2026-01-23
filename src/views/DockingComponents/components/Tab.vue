<!-- Tab 组件 - 封装单个标签页的功能 -->
<template>
    <div class="tab-container" v-if="isActive">
        <div class="tab-content-wrapper">
            <component :is="componentInstance" v-if="componentInstance" />
            <div v-else class="tab-placeholder">
                <p>组件 "{{ componentName }}" 未注册</p>
                <p class="placeholder-hint">请在应用中注册该组件</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, markRaw, getCurrentInstance } from 'vue';

export interface TabProps {
    id: string;
    title: string;
    component: string; // 组件名称
    active?: boolean; // 是否激活
}

const props = withDefaults(defineProps<TabProps>(), {
    active: true
});

// 获取当前实例，用于访问全局组件注册
const instance = getCurrentInstance();

// 动态加载组件
const componentInstance = computed(() => {
    if (!props.component) return null;
    
    // 尝试从全局组件注册中获取（Vue 3 的全局组件）
    if (instance) {
        const app = instance.appContext.app;
        // 检查全局组件注册
        if (app._context.components[props.component]) {
            return app._context.components[props.component];
        }
    }
    
    // 如果全局组件中没有，尝试从当前实例的组件中获取
    if (instance && instance.parent) {
        const parent = instance.parent;
        if (parent.type && (parent.type as any).components) {
            const components = (parent.type as any).components;
            if (components[props.component]) {
                return components[props.component];
            }
        }
    }
    
    return null;
});

// 是否激活
const isActive = computed(() => props.active);

// 组件名称（用于显示错误信息）
const componentName = computed(() => props.component);
</script>

<style scoped>
.tab-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tab-content-wrapper {
    flex: 1;
    overflow: auto;
    width: 100%;
    height: 100%;
}

.tab-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #999;
    font-size: 14px;
    text-align: center;
}

.tab-placeholder p {
    margin: 4px 0;
}

.placeholder-hint {
    font-size: 12px;
    color: #bbb;
}
</style>
