<template>
  <div class="btc-image-promo">
    <!-- 底部推广卡片 -->
    <div class="promo-card">
      <div class="promo-title">「哲风壁纸软件」 | 新一代桌面 Wallpaper 软件!</div>
      <ul class="promo-features">
        <li><span class="emoji-placeholder">💡</span>“动态”壁纸一键设置 + 强大的定时切换 + 一键导入本地壁纸!</li>
        <li><span class="emoji-placeholder">💥</span>一次付费"终身使用"|同步解锁网页"不限量"下载!</li>
        <li><span class="emoji-placeholder">🖥️</span>跨平台(Windows + macOS) 软件端+网页端(下载权益共享)</li>
      </ul>
      <a href="#" class="promo-cta" @click.prevent="handleClick">点击了解详情</a>
      <div class="promo-logo">Win / Mac</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ImagePromo',
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
.btc-image-promo {
  width: 100%;

  // 底部推广卡片
  .promo-card {
    background: rgba(250, 250, 250, 0.8);
    border-radius: 12px;
    padding: 12px;

    .promo-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .promo-features {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
      padding: 0;
      list-style: none;

      li {
        margin-bottom: 4px;
      }

      .emoji-placeholder {
        display: inline-block;
        width: 16px;
        margin-right: 4px;
      }
    }

    .promo-cta {
      display: inline-block;
      padding: 6px 12px;
      background: #1677ff;
      color: white;
      border-radius: 6px;
      font-size: 13px;
      text-decoration: none;
      margin-bottom: 8px;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #0958d9;
      }
    }

    .promo-logo {
      width: 100%;
      height: 40px;
      background: #333; // logo占位
      border-radius: 8px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }
  }
}
</style>
