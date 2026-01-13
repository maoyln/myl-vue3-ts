<template>
  <div class="berth-management">
    <h3>泊位管理</h3>
    <div class="content-area">
      <p>泊位管理相关功能</p>
      <div class="management-tools">
        <button class="btn-primary">添加泊位</button>
        <button class="btn-secondary">编辑泊位</button>
        <button class="btn-secondary">删除泊位</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件不需要 props
</script>

<style scoped>
.berth-management {
  height: 100%;
}

.berth-management h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
  font-size: 18px;
}

.content-area {
  color: #4b5563;
}

.management-tools {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>

