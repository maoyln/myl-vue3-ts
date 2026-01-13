<template>
  <div class="data-analysis">
    <h3>数据分析</h3>
    <div class="content-area">
      <p>数据分析展示</p>
      <div class="analysis-cards">
        <div class="analysis-card">
          <div class="card-icon">📊</div>
          <div class="card-info">
            <div class="card-title">趋势分析</div>
            <div class="card-desc">查看数据趋势变化</div>
          </div>
        </div>
        <div class="analysis-card">
          <div class="card-icon">📈</div>
          <div class="card-info">
            <div class="card-title">对比分析</div>
            <div class="card-desc">对比不同时间段数据</div>
          </div>
        </div>
        <div class="analysis-card">
          <div class="card-icon">📉</div>
          <div class="card-info">
            <div class="card-title">预测分析</div>
            <div class="card-desc">基于历史数据预测</div>
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
.data-analysis {
  height: 100%;
}

.data-analysis h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.analysis-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.analysis-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-icon {
  font-size: 32px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 14px;
  color: #6b7280;
}
</style>

