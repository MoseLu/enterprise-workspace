import React, { useState, useEffect, useCallback } from 'react';
import styles from './Carousel.module.scss';

export interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoplay?: boolean;
  interval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoplay = true,
  interval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [autoplayTimer, setAutoplayTimer] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const pauseCarousel = useCallback(() => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      setAutoplayTimer(null);
    }
    setShowArrows(true);
  }, [autoplayTimer]);

  const resumeCarousel = useCallback(() => {
    if (autoplay !== false) {
      startAutoplay();
    }
    setShowArrows(false);
  }, [autoplay]);

  const startAutoplay = useCallback(() => {
    if (autoplay !== false) {
      const timer = window.setInterval(() => {
        nextSlide();
      }, interval);
      setAutoplayTimer(timer);
    }
  }, [autoplay, interval, nextSlide]);

  useEffect(() => {
    startAutoplay();

    return () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
      }
    };
  }, [startAutoplay, autoplayTimer]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.carouselContainer}
      onMouseEnter={pauseCarousel}
      onMouseLeave={resumeCarousel}
    >
      <div
        className={styles.carouselWrapper}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={styles.carouselSlide}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={styles.slideOverlay} />
            <div className={styles.slideContent}>
              <h2
                className={styles.slideTitle}
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <p className={styles.slideSubtitle}>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {showArrows && (
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
          onClick={prevSlide}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {showArrows && (
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
          onClick={nextSlide}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Indicators */}
      <div className={styles.carouselIndicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${currentIndex === index ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
