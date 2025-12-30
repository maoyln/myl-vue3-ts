<template>
  <div class="statistics-report">
    <h3>统计报表</h3>
    <div class="content-area">
      <p>统计报表展示</p>
      <div class="report-charts">
        <div class="chart-card">
          <div class="chart-title">月度统计</div>
          <div class="chart-placeholder">图表区域</div>
        </div>
        <div class="chart-card">
          <div class="chart-title">年度统计</div>
          <div class="chart-placeholder">图表区域</div>
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
.statistics-report {
  height: 100%;
}

.statistics-report h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.report-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.chart-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.chart-placeholder {
  height: 200px;
  background: #f9fafb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
</style>

