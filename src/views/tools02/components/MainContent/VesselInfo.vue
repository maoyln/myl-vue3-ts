<template>
  <div class="vessel-info">
    <h3>船舶信息</h3>
    <div class="content-area">
      <p>船舶信息管理</p>
      <div class="vessel-list">
        <div class="vessel-item" v-for="i in 5" :key="i">
          <div class="vessel-name">船舶 {{ i }}</div>
          <div class="vessel-status">在港</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件不需要 props
</script>

<style scoped>
.vessel-info {
  height: 100%;
}

.vessel-info h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.vessel-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vessel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.vessel-name {
  font-weight: 500;
  color: #1f2937;
}

.vessel-status {
  padding: 4px 12px;
  background: #10b981;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}
</style>

