<template>
  <div class="berth-control">
    <h3>泊位调度</h3>
    <div class="content-area">
      <p>泊位调度相关功能</p>
      <div class="control-panel">
        <div class="control-item">
          <label>调度模式</label>
          <select class="control-select">
            <option>自动调度</option>
            <option>手动调度</option>
          </select>
        </div>
        <div class="control-item">
          <label>优先级</label>
          <input type="range" min="1" max="10" value="5" class="control-range" />
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
.berth-control {
  height: 100%;
}

.berth-control h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.control-panel {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-weight: 500;
  color: #1f2937;
}

.control-select {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.control-range {
  width: 100%;
}
</style>

