<template>
  <div class="general-overview">
    <h3>总体概况</h3>
    <div class="content-area">
      <p>总体概况信息展示区域</p>
      <div class="overview-stats">
        <div class="stat-item">
          <div class="stat-label">总吞吐量</div>
          <div class="stat-value">1,234,567</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">今日作业</div>
          <div class="stat-value">89</div>
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
.general-overview {
  height: 100%;
}

.general-overview h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}
</style>

