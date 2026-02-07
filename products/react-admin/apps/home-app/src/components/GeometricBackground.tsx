import React, { useMemo } from 'react';
import styles from './GeometricBackground.module.scss';

interface GeometricBackgroundProps {
  width?: number;
  height?: number;
  showInscribedRect?: boolean;
  children?: React.ReactNode;
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({
  width: propWidth,
  height: propHeight,
  showInscribedRect = false,
  children,
}) => {
  const [dimensions, setDimensions] = React.useState({ width: 1920, height: 1080 });

  React.useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const viewBoxWidth = propWidth || dimensions.width;
  const viewBoxHeight = propHeight || dimensions.height;

  const vw = viewBoxWidth / 100;
  const vh = viewBoxHeight / 100;

  // Left top layer paths
  const topLeftLayer1Path = useMemo(() => {
    const w = 40 * vw;
    const h = 20 * vh;
    return `M 0 ${h} L 0 0 L ${w} 0 Z`;
  }, [vw, vh]);

  const topLeftLayer2Path = useMemo(() => {
    const w = 40 * vw;
    const h = 17 * vh;
    return `M 0 ${h} L 0 0 L ${w} 0 Z`;
  }, [vw, vh]);

  const topLeftLayer3Path = useMemo(() => {
    const w = 8 * vw;
    const h = 75 * vh;
    return `M 0 0 L ${w} 0 L 0 ${h} Z`;
  }, [vw, vh]);

  // Right top layer paths
  const topRightLayer1Path = useMemo(() => {
    const w = 16 * vw;
    const h = 70 * vh;
    const x = viewBoxWidth - w;
    return `M ${x} 0 L ${viewBoxWidth} 0 L ${viewBoxWidth} ${h} Z`;
  }, [vw, vh, viewBoxWidth]);

  const topRightLayer2Path = useMemo(() => {
    const w = 13 * vw;
    const h = 70 * vh;
    const x = viewBoxWidth - w;
    return `M ${x} 0 L ${viewBoxWidth} 0 L ${viewBoxWidth} ${h} Z`;
  }, [vw, vh, viewBoxWidth]);

  const topRightLayer3Path = useMemo(() => {
    const w = 7 * vw;
    const h = 70 * vh;
    const x = viewBoxWidth - w;
    return `M ${viewBoxWidth} 0 L ${x} 0 L ${viewBoxWidth} ${h} Z`;
  }, [vw, vh, viewBoxWidth]);

  // Right bottom layer paths
  const bottomRightLayer1Path = useMemo(() => {
    const w = 20 * vw;
    const h = 30 * vh;
    const x = viewBoxWidth - w;
    const y = viewBoxHeight - h;
    return `M ${viewBoxWidth} ${viewBoxHeight} L ${viewBoxWidth} ${y} L ${x} ${viewBoxHeight} Z`;
  }, [vw, vh, viewBoxWidth, viewBoxHeight]);

  const bottomRightLayer2Path = useMemo(() => {
    const w = 18 * vw;
    const h = 30 * vh;
    const x = viewBoxWidth - w;
    const y = viewBoxHeight - h;
    return `M ${viewBoxWidth} ${viewBoxHeight} L ${viewBoxWidth} ${y} L ${x} ${viewBoxHeight} Z`;
  }, [vw, vh, viewBoxWidth, viewBoxHeight]);

  // Simplified inscribed rectangle (just a placeholder for content area)
  const inscribedRect = useMemo(() => {
    const x = 10 * vw;
    const y = 25 * vh;
    const w = 60 * vw;
    const h = 50 * vh;
    return { x, y, width: w, height: h };
  }, [vw, vh]);

  // Content area style
  const contentAreaStyle = useMemo(() => {
    const xPercent = (inscribedRect.x / viewBoxWidth) * 100;
    const yPercent = (inscribedRect.y / viewBoxHeight) * 100;
    const widthPercent = (inscribedRect.width / viewBoxWidth) * 100;
    const heightPercent = (inscribedRect.height / viewBoxHeight) * 100;

    return {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
    };
  }, [inscribedRect, viewBoxWidth, viewBoxHeight]);

  // QA logo style
  const queenLogoStyle = useMemo(() => {
    const logoWidth = 160;
    const logoHeight = 160;
    const offsetX = 15;

    return {
      position: 'fixed' as const,
      width: `${logoWidth}px`,
      height: `${logoHeight}px`,
      right: `calc(20vw + ${offsetX}px)`,
      bottom: '60px',
      zIndex: 5,
      pointerEvents: 'none' as const,
    };
  }, []);

  // Expose methods for parent components
  const getAllPaths = () => {
    return document.querySelectorAll('.geometric-background path');
  };

  const calculateLargestInscribedRectangle = () => {
    return inscribedRect;
  };

  return (
    <div className={styles.geometricBackgroundWrapper}>
      <svg
        className={styles.geometricBackground}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left top corner - three layer triangle stack */}
        <g className="top-left">
          <path d={topLeftLayer1Path} fill="#efa19b" className="layer-1" />
          <path d={topLeftLayer2Path} fill="#da291c" className="layer-2" />
          <path d={topLeftLayer3Path} fill="#404040" className="layer-3" />
        </g>

        {/* Right top corner - three layer triangle stack */}
        <g className="top-right">
          <path d={topRightLayer1Path} fill="#e15147" className="layer-1" />
          <path d={topRightLayer2Path} fill="#da291c" className="layer-2" />
          <path d={topRightLayer3Path} fill="#404040" className="layer-3" />
        </g>

        {/* Right bottom corner - two layer triangle stack */}
        <g className="bottom-right">
          <path d={bottomRightLayer1Path} fill="#efa19b" className="layer-1" />
          <path d={bottomRightLayer2Path} fill="#da291c" className="layer-2" />
        </g>

        {/* Inscribed rectangle (optional) */}
        {showInscribedRect && (
          <path
            d={`M ${inscribedRect.x} ${inscribedRect.y} L ${inscribedRect.x + inscribedRect.width} ${inscribedRect.y} L ${inscribedRect.x + inscribedRect.width} ${inscribedRect.y + inscribedRect.height} L ${inscribedRect.x} ${inscribedRect.y + inscribedRect.height} Z`}
            fill="none"
            stroke="#00ff00"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.8"
            className="inscribed-rectangle"
          />
        )}
      </svg>

      {/* Content area */}
      {children && (
        <div className={styles.geometricContentArea} style={contentAreaStyle}>
          {children}
        </div>
      )}

      {/* QA Logo */}
      <div className={styles.queenLogo} style={queenLogoStyle} />
    </div>
  );
};

// Expose methods via ref (simplified version)
export type GeometricBackgroundRef = {
  getAllPaths: () => NodeListOf<Element>;
  calculateLargestInscribedRectangle: () => { x: number; y: number; width: number; height: number } | null;
};

export default GeometricBackground;
