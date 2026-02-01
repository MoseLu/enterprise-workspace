<template>
  <div class="video-player-container" ref="containerRef">
    <video
      ref="videoRef"
      class="video-player"
      :class="{ playing: isPlaying }"
      :src="src"
      :poster="poster"
      :muted="isMuted"
      :loop="loop"
      :autoplay="autoplay"
      playsinline
      webkit-playsinline
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onError"
      @canplay="onCanPlay"
      @waiting="onWaiting"
      @stalled="onStalled"
      @progress="onProgress"
      preload="auto"
    ></video>

    <!-- 右上角控制按钮（QQ风格） -->
    <div class="video-controls-top-right">
      <!-- 播放/暂停按钮 -->
      <div class="control-icon video-play" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </div>

      <!-- 全屏按钮 -->
      <div class="control-icon video-fullscreen" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
        <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      </div>

      <!-- 音量按钮 -->
      <div class="control-icon video-voice" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
        <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.88zm-4.64-2.29l-1.55-1.55v-2.04h-1.11l-2.83-2.83-.09-.09c-.39-.39-1.02-.39-1.41 0l-3.68 3.68 3.68 3.68c.39.39 1.02.39 1.41 0l2.83-2.83H12v-1.11zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
        <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({
  name: 'VideoPlayer',
});

const props = defineProps<{
  src: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(props.muted ? 0 : 1);
const isMuted = ref(props.muted ?? true); // 默认静音，无感播放
const isFullscreen = ref(false);

const togglePlay = async () => {
  if (!videoRef.value) return;

  if (isPlaying.value || !videoRef.value.paused) {
    videoRef.value.pause();
  } else {
    try {
      await videoRef.value.play();
      // 确保状态同步
      isPlaying.value = !videoRef.value.paused;
    } catch (error) {
      // 如果播放失败，尝试静音后播放
      if (videoRef.value) {
        videoRef.value.muted = true;
        isMuted.value = true;
        try {
          await videoRef.value.play();
          isPlaying.value = !videoRef.value.paused;
        } catch (e) {
          // 静音播放也失败，静默处理
        }
      }
    }
  }
};

const toggleMute = () => {
  if (!videoRef.value) return;
  isMuted.value = !isMuted.value;
  videoRef.value.muted = isMuted.value;
  if (!isMuted.value && volume.value === 0) {
    volume.value = 1;
    videoRef.value.volume = 1;
  }
};

const toggleFullscreen = () => {
  if (!containerRef.value) return;
  if (!isFullscreen.value) {
    if (containerRef.value.requestFullscreen) {
      containerRef.value.requestFullscreen();
    } else if ((containerRef.value as any).webkitRequestFullscreen) {
      (containerRef.value as any).webkitRequestFullscreen();
    } else if ((containerRef.value as any).mozRequestFullScreen) {
      (containerRef.value as any).mozRequestFullScreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    }
  }
};

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
    if (props.autoplay !== false) {
      videoRef.value.play().catch(() => {
        // 自动播放失败时静音播放
        if (videoRef.value) {
          videoRef.value.muted = true;
          isMuted.value = true;
          videoRef.value.play();
        }
      });
    }
  }
};

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime;
  }
};

const onPlay = () => {
  isPlaying.value = true;
  if (videoRef.value && videoRef.value.paused) {
    // 确保视频真正开始播放
    videoRef.value.play().catch(() => {
      // 重新播放失败，静默处理
    });
  }
};

const onPause = () => {
  isPlaying.value = false;
};

const onEnded = () => {
  isPlaying.value = false;
  if (props.loop && videoRef.value) {
    videoRef.value.play();
  }
};

const onError = () => {
  // 视频加载错误，静默处理（视频始终使用 CDN，不需要降级）
  // 视频加载错误，静默处理
};

const onCanPlay = () => {
  // 视频可以播放
};

const onWaiting = () => {
  // 视频等待缓冲
};

const onStalled = () => {
  // 视频加载停滞
};

const onProgress = () => {
  // 视频加载进度更新
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement
  );
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  if (props.muted && videoRef.value) {
    videoRef.value.muted = true;
    isMuted.value = true;
  }

});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
});
</script>

<style scoped lang="scss">
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000000;
  overflow: hidden;

  .video-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
    // 在宽屏上优先显示底部内容，避免底部被裁切
    object-position: center bottom;
    display: block;
    position: relative;
    z-index: 1;
    background: #000000;

    // 窄屏上居中显示
    @media (max-width: 1024px) {
      object-position: center;
    }

    // 播放时确保视频可见，隐藏 poster
    &.playing {
      z-index: 2;

      // 播放时移除 poster 显示
      &::before {
        display: none;
      }
    }
  }

  // 右上角控制按钮（QQ风格）
  .video-controls-top-right {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    z-index: 10;
    align-items: center;

    @media (max-width: 768px) {
      top: 12px;
      right: 12px;
      gap: 6px;
    }

    @media (max-width: 480px) {
      top: 8px;
      right: 8px;
      gap: 4px;
    }
  }

  .control-icon {
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: #ffffff;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    touch-action: manipulation; // 优化移动端触摸

    @media (max-width: 768px) {
      width: 36px;
      height: 36px;
    }

    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
    }

    // 内部光晕效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    svg {
      width: 16px;
      height: 16px;
      transition: all 0.2s ease;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));

      @media (max-width: 768px) {
        width: 18px;
        height: 18px;
      }

      @media (max-width: 480px) {
        width: 20px;
        height: 20px;
      }
    }

    &:hover {
      background: rgba(0, 0, 0, 0.55);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);

      &::before {
        opacity: 1;
      }

      svg {
        transform: scale(1.15);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(0, 0, 0, 0.2);
      background: rgba(0, 0, 0, 0.65);

      svg {
        transform: scale(1.05);
      }
    }
  }
}
</style>
