<template>
  <div class="vessel-data">
    <h3>船只资料</h3>
    <div class="content-area">
      <p>船只资料管理</p>
      <div class="data-table">
        <div class="table-header">
          <div class="col">船名</div>
          <div class="col">类型</div>
          <div class="col">状态</div>
        </div>
        <div class="table-row" v-for="i in 5" :key="i">
          <div class="col">船只 {{ i }}</div>
          <div class="col">货船</div>
          <div class="col">
            <span class="status-badge">正常</span>
          </div>
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
.vessel-data {
  height: 100%;
}

.vessel-data h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.data-table {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #f9fafb;
  padding: 12px;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:last-child {
  border-bottom: none;
}

.col {
  padding: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #10b981;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}
</style>

