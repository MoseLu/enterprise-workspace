<template>
  <div class="preload__loading loading-style-flower">
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="-110 -110 220 220">
      <g class="flower-group">
        <!-- J1主体圆：r=75，圆心(0,0)，作为八瓣花外边界（8等分基准） -->
        <circle cx="0" cy="0" r="75" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
        
        <!-- 8个分别经过指定三点的圆（八瓣花） -->
        <!-- 缩小比例：75/90 = 0.833... -->
        <!-- 1. 圆1：经过O(0,0)、P1(75,0)、P3(0,-75) → 圆心(37.5,-37.5)，半径≈53.03 -->
        <!-- 彩虹色顺序：桃色→橙→黄→绿→青→蓝→紫→粉红 -->
        <circle cx="37.5" cy="-37.5" r="53.03" class="petal-circle petal-1" fill="#ff8a80" fill-opacity="0.85" stroke="#ff8a80" stroke-width="2.5"/>
        <!-- 2. 圆2：经过O(0,0)、P2(53.03,-53.03)、P4(-53.03,-53.03) → 圆心(0,-53.03)，半径≈53.03 -->
        <circle cx="0" cy="-53.03" r="53.03" class="petal-circle petal-2" fill="#ff9800" fill-opacity="0.85" stroke="#ff9800" stroke-width="2.5"/>
        <!-- 3. 圆3：经过O(0,0)、P3(0,-75)、P5(-75,0) → 圆心(-37.5,-37.5)，半径≈53.03 -->
        <circle cx="-37.5" cy="-37.5" r="53.03" class="petal-circle petal-3" fill="#ffeb3b" fill-opacity="0.85" stroke="#ffeb3b" stroke-width="2.5"/>
        <!-- 4. 圆4：经过O(0,0)、P4(-53.03,-53.03)、P6(-53.03,53.03) → 圆心(-53.03,0)，半径≈53.03 -->
        <circle cx="-53.03" cy="0" r="53.03" class="petal-circle petal-4" fill="#4caf50" fill-opacity="0.85" stroke="#4caf50" stroke-width="2.5"/>
        <!-- 5. 圆5：经过O(0,0)、P5(-75,0)、P7(0,75) → 圆心(-37.5,37.5)，半径≈53.03 -->
        <circle cx="-37.5" cy="37.5" r="53.03" class="petal-circle petal-5" fill="#00bcd4" fill-opacity="0.85" stroke="#00bcd4" stroke-width="2.5"/>
        <!-- 6. 圆6：经过O(0,0)、P6(-53.03,53.03)、P8(53.03,53.03) → 圆心(0,53.03)，半径≈53.03 -->
        <circle cx="0" cy="53.03" r="53.03" class="petal-circle petal-6" fill="#2196f3" fill-opacity="0.85" stroke="#2196f3" stroke-width="2.5"/>
        <!-- 7. 圆7：经过O(0,0)、P7(0,75)、P1(75,0) → 圆心(37.5,37.5)，半径≈53.03 -->
        <circle cx="37.5" cy="37.5" r="53.03" class="petal-circle petal-7" fill="#9c27b0" fill-opacity="0.85" stroke="#9c27b0" stroke-width="2.5"/>
        <!-- 8. 圆8：经过O(0,0)、P8(53.03,53.03)、P2(53.03,-53.03) → 圆心(53.03,0)，半径≈53.03 -->
        <circle cx="53.03" cy="0" r="53.03" class="petal-circle petal-8" fill="#e91e63" fill-opacity="0.85" stroke="#e91e63" stroke-width="2.5"/>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcRootFlowerSpinner',
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/styles/loading/_animations.scss
// 此处为空，避免样式冲突
</style>
