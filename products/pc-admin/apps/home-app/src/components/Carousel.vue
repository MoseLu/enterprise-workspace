<template>
  <div class="carousel-container" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">
    <div class="carousel-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="carousel-slide"
        :style="{ backgroundImage: `url(${slide.image})` }"
      >
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <h2 class="slide-title" v-html="slide.title"></h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- 左右箭头 -->
    <button
      class="carousel-arrow carousel-arrow-left"
      @click="prevSlide"
      v-show="showArrows"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    <button
      class="carousel-arrow carousel-arrow-right"
      @click="nextSlide"
      v-show="showArrows"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>

    <!-- 指示器 -->
    <div class="carousel-indicators">
      <button
        v-for="(slide, index) in slides"
        :key="index"
        class="indicator"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({
  name: 'Carousel',
});

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

const props = defineProps<{
  slides: Slide[];
  autoplay?: boolean;
  interval?: number;
}>();

const currentIndex = ref(0);
const showArrows = ref(false);
let autoplayTimer: number | null = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.slides.length;
};

const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 ? props.slides.length - 1 : currentIndex.value - 1;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const pauseCarousel = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  showArrows.value = true;
};

const resumeCarousel = () => {
  if (props.autoplay !== false) {
    startAutoplay();
  }
  showArrows.value = false;
};

const startAutoplay = () => {
  if (props.autoplay !== false) {
    autoplayTimer = window.setInterval(() => {
      nextSlide();
    }, props.interval || 3000);
  }
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
});
</script>

<style scoped lang="scss">
.carousel-container {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;

  .carousel-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease-in-out;
  }

  .carousel-slide {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .slide-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: #ffffff;
      padding: 0 40px;

      .slide-title {
        font-family: 'Source Han Sans CN', '思源黑体', sans-serif;
        font-weight: bold;
        font-size: 48px;
        line-height: 1.4;
        margin-bottom: 20px;
        color: #ffffff;
      }

      .slide-subtitle {
        font-family: 'Roboto', sans-serif;
        font-size: 20px;
        color: #cccccc;
        margin: 0;
      }
    }
  }

  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(199, 0, 0, 0.8);
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
      background: rgba(199, 0, 0, 1);
      transform: translateY(-50%) scale(1.1);
    }

    svg {
      width: 24px;
      height: 24px;
    }

    &.carousel-arrow-left {
      left: 20px;
    }

    &.carousel-arrow-right {
      right: 20px;
    }
  }

  .carousel-indicators {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 2;

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #c70000;
        width: 30px;
        border-radius: 5px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
</style>

