<template>
  <div class="berthing-container">
    <a-layout class="berthing-layout">
      <a-layout class="main-layout">
        <!-- 主内容区域 -->
        <TabZone
          :tabs="mainTabs"
          :component-map="componentMap"
          content-class="layout-content"
          zone-id="main"
          @update:tabs="mainTabs = $event"
          @tab-change="handleMainTabChange"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @tab-add="handleTabAdd"
          @tab-remove="handleTabRemove"
          ref="mainTabZoneRef"
        />
      </a-layout>
      
      <!-- 附加功能区域 -->
      <TabZone
        :tabs="additionalTabs"
        :component-map="componentMap"
        content-class="additional-content"
        zone-id="additional"
        @update:tabs="additionalTabs = $event"
        @tab-change="handleAdditionalTabChange"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @tab-add="handleTabAdd"
          @tab-remove="handleTabRemove"
          ref="additionalTabZoneRef"
      />
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import TabZone, { type TabItem } from './components/TabZone.vue'

// 导入主内容区域组件
import BerthOverview from './components/MainContent/BerthOverview.vue'
import BerthManagement from './components/MainContent/BerthManagement.vue'
import VesselInfo from './components/MainContent/VesselInfo.vue'
import WorkPlan from './components/MainContent/WorkPlan.vue'
import StatisticsReport from './components/MainContent/StatisticsReport.vue'

// 导入附加功能区域组件
import GeneralOverview from './components/AdditionalContent/GeneralOverview.vue'
import BerthControl from './components/AdditionalContent/BerthControl.vue'
import VesselData from './components/AdditionalContent/VesselData.vue'
import OperationSchedule from './components/AdditionalContent/OperationSchedule.vue'
import DataAnalysis from './components/AdditionalContent/DataAnalysis.vue'

// 主功能区 Tabs
const mainTabs: Ref<TabItem[]> = ref([
  { key: '1', title: '泊位概览', component: 'BerthOverview' },
  { key: '2', title: '泊位管理', component: 'BerthManagement' },
  { key: '3', title: '船舶信息', component: 'VesselInfo' },
  { key: '4', title: '作业计划', component: 'WorkPlan' },
  { key: '5', title: '统计报表', component: 'StatisticsReport' }
])

// 附属功能区 Tabs
const additionalTabs: Ref<TabItem[]> = ref([
  { key: 'overview', title: '总体概况', component: 'GeneralOverview' },
  { key: 'berth-control', title: '泊位调度', component: 'BerthControl' },
  { key: 'vessel-data', title: '船只资料', component: 'VesselData' },
  { key: 'operation-schedule', title: '操作安排', component: 'OperationSchedule' },
  { key: 'data-analysis', title: '数据分析', component: 'DataAnalysis' }
])

// TabZone 引用
const mainTabZoneRef = ref<InstanceType<typeof TabZone> | null>(null)
const additionalTabZoneRef = ref<InstanceType<typeof TabZone> | null>(null)

// 组件映射
const componentMap: Record<string, any> = {
  // 主内容区域组件
  BerthOverview,
  BerthManagement,
  VesselInfo,
  WorkPlan,
  StatisticsReport,
  // 附加功能区域组件
  GeneralOverview,
  BerthControl,
  VesselData,
  OperationSchedule,
  DataAnalysis
}

// 设置默认激活的 tab
onMounted(() => {
  if (mainTabZoneRef.value) {
    mainTabZoneRef.value.setActiveTab('1')
  }
  if (additionalTabZoneRef.value) {
    additionalTabZoneRef.value.setActiveTab('overview')
  }
})

// Tab 切换处理
const handleMainTabChange = (key: string) => {
  console.log('主内容区域切换到:', key)
}

const handleAdditionalTabChange = (key: string) => {
  console.log('附加功能区域切换到:', key)
}

// 拖拽开始
const handleDragStart = (key: string, zoneId: string) => {
  console.log('拖拽开始:', key, '区域:', zoneId)
}

// 拖拽结束
const handleDragEnd = () => {
  console.log('拖拽结束')
}

// Tab 添加
const handleTabAdd = (key: string, zoneId: string) => {
  console.log('Tab 添加到:', zoneId, 'key:', key)
}

// Tab 移除
const handleTabRemove = (key: string, zoneId: string) => {
  console.log('Tab 从区域移除:', zoneId, 'key:', key)
}
</script>

<style scoped>
.berthing-container {
  height: 100%;
  width: 100%;
}

.berthing-layout {
  height: 100%;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  overflow: visible;
  background: #f0f2f5;
  padding: 16px;
  position: relative;
  z-index: 1;
}

.additional-content {
  flex: 1;
  border-top: 2px solid #e5e7eb;
  padding: 16px;
  background: #f0f2f5;
  overflow: visible;
  position: relative;
  z-index: 1;
}
</style>
