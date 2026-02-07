import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './GeometricContentContainer.module.scss';

interface GeometricContentContainerProps {
  geometricBackgroundRef?: React.RefObject<{
    calculateLargestInscribedRectangle: () => {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  }>;
  children?: React.ReactNode;
}

interface InscribedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GeometricContentContainer: React.FC<GeometricContentContainerProps> = ({
  geometricBackgroundRef,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inscribedRect, setInscribedRect] = useState<InscribedRect | null>(null);

  // Convert rectangle to clip-path
  const rectangleToClipPath = (rect: InscribedRect, containerWidth: number, containerHeight: number): string => {
    const xPercent = (rect.x / containerWidth) * 100;
    const yPercent = (rect.y / containerHeight) * 100;
    const widthPercent = (rect.width / containerWidth) * 100;
    const heightPercent = (rect.height / containerHeight) * 100;

    return `inset(${yPercent}% 0 0 ${xPercent}%)`;
  };

  // Calculate container style
  const containerStyle = useMemo(() => {
    if (!inscribedRect || !containerRef.current) {
      return {};
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width || window.innerWidth;
    const containerHeight = containerRect.height || window.innerHeight;

    const clipPath = rectangleToClipPath(inscribedRect, containerWidth, containerHeight);

    return {
      clipPath,
      boxSizing: 'border-box' as const,
    };
  }, [inscribedRect]);

  // Update inscribed rectangle
  const updateInscribedRect = () => {
    const bgRef = geometricBackgroundRef?.current;
    if (bgRef?.calculateLargestInscribedRectangle) {
      const rect = bgRef.calculateLargestInscribedRectangle();
      if (rect) {
        setInscribedRect(rect);
      }
    }
  };

  useEffect(() => {
    updateInscribedRect();

    let resizeObserver: ResizeObserver | null = null;

    // Listen for container size changes
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateInscribedRect();
      });
      resizeObserver.observe(containerRef.current);
    }

    // Listen for window resize
    const handleResize = () => {
      updateInscribedRect();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [geometricBackgroundRef]);

  return (
    <div
      className={styles.geometricContentContainer}
      ref={containerRef}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default GeometricContentContainer;
