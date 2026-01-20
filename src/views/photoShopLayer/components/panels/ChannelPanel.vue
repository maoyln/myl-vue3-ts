<template>
  <div class="channel-panel">
    <!-- 通道列表 -->
    <div class="channel-list">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="channel-item"
        :class="{ 'is-active': channel.id === activeChannelId }"
        @click="selectChannel(channel.id)"
      >
        <div class="channel-visibility" @click.stop="toggleVisibility(channel.id)">
          {{ channel.visible ? '👁️' : '⚫' }}
        </div>
        <div class="channel-thumbnail">
          <div class="channel-preview" :style="{ background: channel.color }"></div>
        </div>
        <div class="channel-name">{{ channel.name }}</div>
      </div>
    </div>

    <!-- 通道操作按钮 -->
    <div class="channel-controls">
      <button class="channel-control-btn" title="将通道作为选区载入">
        ⭕
      </button>
      <button class="channel-control-btn" title="新建通道">
        ➕
      </button>
      <button class="channel-control-btn" title="删除通道">
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Channel {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

const channels = ref<Channel[]>([
  { id: 'rgb', name: 'RGB', visible: true, color: 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)' },
  { id: 'red', name: '红', visible: true, color: 'linear-gradient(135deg, #000000, #ff0000)' },
  { id: 'green', name: '绿', visible: true, color: 'linear-gradient(135deg, #000000, #00ff00)' },
  { id: 'blue', name: '蓝', visible: true, color: 'linear-gradient(135deg, #000000, #0000ff)' },
  { id: 'alpha', name: 'Alpha 1', visible: false, color: 'linear-gradient(135deg, #000000, #ffffff)' }
]);

const activeChannelId = ref('rgb');

const selectChannel = (channelId: string) => {
  activeChannelId.value = channelId;
};

const toggleVisibility = (channelId: string) => {
  const channel = channels.value.find(c => c.id === channelId);
  if (channel) {
    channel.visible = !channel.visible;
  }
};
</script>

<style scoped>
.channel-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #383838;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.channel-item:hover {
  background: #404040;
}

.channel-item.is-active {
  background: #4a90e2;
  color: #ffffff;
  border-color: #6ab0f3;
}

.channel-visibility {
  font-size: 14px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background 0.2s;
}

.channel-visibility:hover {
  background: rgba(255, 255, 255, 0.1);
}

.channel-thumbnail {
  width: 50px;
  height: 30px;
  border-radius: 3px;
  border: 1px solid #404040;
  overflow: hidden;
  flex-shrink: 0;
}

.channel-preview {
  width: 100%;
  height: 100%;
}

.channel-name {
  flex: 1;
  font-size: 13px;
}

/* 通道控制按钮 */
.channel-controls {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #404040;
  gap: 4px;
}

.channel-control-btn {
  flex: 1;
  padding: 8px;
  background: #383838;
  border: none;
  border-radius: 4px;
  color: #cccccc;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.channel-control-btn:hover {
  background: #4a90e2;
  transform: translateY(-1px);
}

.channel-control-btn:active {
  transform: translateY(0);
}
</style>
