<template>
  <div class="operation-schedule">
    <h3>操作安排</h3>
    <div class="content-area">
      <p>操作安排计划</p>
      <div class="schedule-timeline">
        <div class="timeline-item" v-for="i in 4" :key="i">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-title">操作任务 {{ i }}</div>
            <div class="timeline-desc">任务描述信息</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件不需要 props
</script>

<style scoped>
.operation-schedule {
  height: 100%;
}

.operation-schedule h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.schedule-timeline {
  margin-top: 20px;
  position: relative;
  padding-left: 30px;
}

.schedule-timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.timeline-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 14px;
  color: #6b7280;
}
</style>

