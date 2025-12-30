<template>
  <div class="berth-overview">
    <h3>泊位概览</h3>
    <div class="content-area">
      <p>泊位概览信息展示区域</p>
      <div class="info-grid">
        <div class="info-card">
          <div class="card-title">总泊位数</div>
          <div class="card-value">12</div>
        </div>
        <div class="info-card">
          <div class="card-title">已占用</div>
          <div class="card-value">8</div>
        </div>
        <div class="info-card">
          <div class="card-title">空闲</div>
          <div class="card-value">4</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tabKey?: string
}

defineProps<Props>()
</script>

<style scoped>
.berth-overview {
  height: 100%;
}

.berth-overview h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
}
</style>

