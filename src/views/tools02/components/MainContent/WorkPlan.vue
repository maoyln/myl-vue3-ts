<template>
  <div class="work-plan">
    <h3>作业计划</h3>
    <div class="content-area">
      <p>作业计划安排</p>
      <div class="plan-calendar">
        <div class="calendar-header">
          <span>今日计划</span>
          <span class="date">{{ currentDate }}</span>
        </div>
        <div class="plan-items">
          <div class="plan-item" v-for="i in 3" :key="i">
            <div class="plan-time">0{{ i + 7 }}:00</div>
            <div class="plan-content">作业计划 {{ i }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tabKey?: string
}

defineProps<Props>()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.work-plan {
  height: 100%;
}

.work-plan h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.plan-calendar {
  margin-top: 20px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.calendar-header span {
  font-weight: 600;
  color: #1f2937;
}

.date {
  color: #6b7280;
  font-size: 14px;
}

.plan-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.plan-time {
  font-weight: 600;
  color: #667eea;
  min-width: 60px;
}

.plan-content {
  flex: 1;
  color: #4b5563;
}
</style>

