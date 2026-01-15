<template>
  <Teleport to="body">
    <!-- 吸附辅助线 -->
    <div v-if="isVisible" class="guide-lines">
      <div
        v-for="(line, index) in snapLines"
        :key="index"
        class="guide-line"
        :class="[`guide-line-${line.type}`]"
        :style="getLineStyle(line)"
      ></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { SnapLine } from './useSnapCalculator';

interface Props {
  snapLines?: SnapLine[];
  isVisible?: boolean;
  color?: string;
  width?: number;
  opacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  snapLines: () => [],
  isVisible: false,
  color: '#4A90E2',
  width: 1,
  opacity: 0.8,
});

/**
 * 获取辅助线样式
 */
function getLineStyle(line: SnapLine) {
  const baseStyle = {
    backgroundColor: props.color,
    opacity: props.opacity,
  };

  if (line.type === 'horizontal') {
    return {
      ...baseStyle,
      position: 'fixed' as const,
      left: `${line.start}px`,
      top: `${line.position}px`,
      width: `${line.end - line.start}px`,
      height: `${props.width}px`,
    };
  } else {
    return {
      ...baseStyle,
      position: 'fixed' as const,
      left: `${line.position}px`,
      top: `${line.start}px`,
      width: `${props.width}px`,
      height: `${line.end - line.start}px`,
    };
  }
}
</script>

<style scoped>
.guide-lines {
  pointer-events: none;
  z-index: 99999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.guide-line {
  position: fixed;
  pointer-events: none;
  transition: opacity 0.15s ease-out;
}

.guide-line-horizontal {
  /* 水平线样式在 JS 中动态设置 */
}

.guide-line-vertical {
  /* 垂直线样式在 JS 中动态设置 */
}
</style>
