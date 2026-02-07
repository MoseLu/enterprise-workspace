/**
 * Home 首页
 *
 * 包含：视频/轮播、品牌理念、核心理念、产品展示
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './index.module.scss';

// 组件类型
interface Product {
  name: string;
  desc: string;
  image: string;
  fallback?: string;
}

// 组件导入
import { VideoPlayer } from '../../components/VideoPlayer';
import { GeometricBackground } from '../../components/GeometricBackground';

// 模拟产品数据（后续可从 API 获取）
const products: Product[] = [
  { name: 'BNF', desc: 'BNF 产品系列', image: '/assets/bellis_model/BNF.webp', fallback: '/assets/bellis_model/BNF.png' },
  { name: 'NV11 SPECTRAL', desc: 'NV11 光谱系列', image: '/assets/bellis_model/NV11_SPECTRAL.webp', fallback: '/assets/bellis_model/NV11_SPECTRAL.png' },
  { name: 'NV200 SPECTRAL', desc: 'NV200 光谱系列', image: '/assets/bellis_model/NV200_SPECTRAL.webp', fallback: '/assets/bellis_model/NV200_SPECTRAL.png' },
  { name: 'NV22 SPECTRAL', desc: 'NV22 光谱系列', image: '/assets/bellis_model/NV22_SPECTRAL.webp', fallback: '/assets/bellis_model/NV22_SPECTRAL.png' },
  { name: 'NV4000', desc: 'NV4000 产品系列', image: '/assets/bellis_model/NV4000.webp', fallback: '/assets/bellis_model/NV4000.png' },
  { name: 'NV9 SPECTRAL', desc: 'NV9 光谱系列', image: '/assets/bellis_model/NV9_SPECTRAL.webp', fallback: '/assets/bellis_model/NV9_SPECTRAL.png' },
  { name: 'SAFE INTERFACE', desc: '安全接口系统', image: '/assets/bellis_model/SAFE_INTERFACE.webp', fallback: '/assets/bellis_model/SAFE_INTERFACE.png' },
  { name: 'SMART COIN SYSTEM', desc: '智能硬币系统', image: '/assets/bellis_model/SMART_COIN_SYSTEM.webp', fallback: '/assets/bellis_model/SMART_COIN_SYSTEM.png' },
  { name: 'SMART HOPPER', desc: '智能储币器', image: '/assets/bellis_model/SMART_HOPPER.webp', fallback: '/assets/bellis_model/SMART_HOPPER.png' },
  { name: 'SPECTRAL PAYOUT', desc: '光谱支付系统', image: '/assets/bellis_model/SPECTRAL_PAYOUT.webp', fallback: '/assets/bellis_model/SPECTRAL_PAYOUT.png' },
  { name: 'TWIN SMART COIN SYSTEM', desc: '双智能硬币系统', image: '/assets/bellis_model/TWIN_SMART_COIN_SYSTEM.webp', fallback: '/assets/bellis_model/TWIN_SMART_COIN_SYSTEM.png' },
];

// 动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const productCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

const HomePage: React.FC = () => {
  // 状态
  const [videoPoster, setVideoPoster] = useState<string>('');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [productsSectionVisible, setProductsSectionVisible] = useState(false);

  // Refs
  const productsRef = useRef<HTMLDivElement>(null);

  // 滚动检测
  const { scrollYProgress } = useScroll({
    target: productsRef,
    offset: ['start end', 'end start']
  });

  // 滚动变换
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const cardScale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);

  // 检测 WebP 支持
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    };

    const supportsWebP = checkWebPSupport();
    const cdnBase = 'https://all.bellis.com.cn';
    const isProduction = import.meta.env.PROD;

    // 设置封面图
    if (isProduction) {
      setVideoPoster(supportsWebP ? `${cdnBase}/images/webp/22.webp` : `${cdnBase}/images/22.png`);
    } else {
      setVideoPoster('/assets/images/22.png');
    }
  }, []);

  // 图片加载错误处理
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, product: Product) => {
    const img = e.currentTarget;
    if (product.fallback && img.src !== product.fallback) {
      img.src = product.fallback;
    }
  }, []);

  // 质量目标数据
  const qualityGoals = [
    { text: '成品合格率≥98%', english: 'Finish goods pass yield≥98%' },
    { text: '交货准时率≥98%', english: 'Delivery on time rate≥98%' },
    { text: '顾客满意度≥118分', english: 'Customer satisfaction≥118 points' },
  ];

  // 团队文化数据
  const cultureCards = [
    { title: '团结', english: 'Teamwork' },
    { title: '成长', english: 'Grow Up' },
    { title: '创新', english: 'Innovative' },
    { title: "We're Established", english: '' },
    { title: "We're Trusted", english: '' },
    { title: "We're Innovative", english: '' },
  ];

  return (
    <div className={styles.page}>
      {/* 首屏视频/轮播图 */}
      <section className={styles.heroSection}>
        <div className={styles.heroVideo}>
          <VideoPlayer
            src="/assets/video/automation_area_web.mp4"
            poster={videoPoster}
            autoplay={false}
            loop
            muted
          />
        </div>
      </section>

      {/* 品牌理念标语区 */}
      <motion.section
        className={styles.brandSlogan}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className={styles.container}>
          <div className={styles.sloganContent}>
            <motion.span
              className={styles.sloganChinese}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              拜里斯
            </motion.span>
            <motion.span
              className={styles.sloganRed}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              因为有你 所以精彩
            </motion.span>
          </div>
          <motion.p
            className={styles.sloganEnglish}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Because you are so wonderful
          </motion.p>
        </div>
      </motion.section>

      {/* 核心理念网格区 */}
      <section className={styles.coreValues}>
        <div className={styles.container}>
          <motion.div
            className={styles.valuesGrid}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* 左列：质量管理板块 */}
            <div className={`${styles.valuesColumn} ${styles.qualityManagement}`}>
              <motion.div className={styles.sectionBlock} variants={fadeInUp}>
                <div className={styles.redTitleBar}>质量方针 / Quality Policy</div>
                <div className={styles.redOutlineText}>
                  以最高性价比生产满足顾客期望的可靠产品。
                </div>
                <div className={styles.redOutlineText}>
                  Assembly functional and reliable products that satisfy and anticipate the customer request with the best ratio quality/price.
                </div>
              </motion.div>

              <motion.div className={styles.sectionBlock} variants={fadeInUp}>
                <div className={styles.redTitleBar}>质量目标 / Quality Objective</div>
                <ul className={styles.qualityGoals}>
                  {qualityGoals.map((goal, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <span className={styles.goalText}>{goal.text}</span>
                      <span className={styles.goalEnglish}>{goal.english}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* 右列：团队文化板块 */}
            <div className={`${styles.valuesColumn} ${styles.teamCulture}`}>
              <motion.div
                className={`${styles.sectionBlock} ${styles.cultureSection}`}
                variants={fadeInUp}
              >
                <div className={styles.redTitleBar}>团队理念</div>
                <div className={styles.cultureCardsGrid}>
                  {cultureCards.map((card, index) => (
                    <motion.div
                      key={index}
                      className={styles.cultureCard}
                      variants={productCardVariants}
                      custom={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      <p className={styles.cardEnglish}>{card.english}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 产品展示区（使用 Framer Motion 动画） */}
      <motion.section
        id="products-showcase"
        className={styles.productsShowcase}
        ref={productsRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        onViewportEnter={() => setProductsSectionVisible(true)}
      >
        <div className={styles.container}>
          <motion.h2
            className={styles.productsTitle}
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            产品中心
          </motion.h2>
          <motion.p
            className={styles.productsSubtitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Product Center
          </motion.p>

          <motion.div
            className={styles.productsScene}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                className={styles.subScene}
                data-index={index}
                style={{
                  animationDelay: `${-Math.random() * 1}s`,
                  opacity: cardOpacity,
                  scale: cardScale,
                }}
                variants={productCardVariants}
                custom={index}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              >
                <motion.div
                  className={styles.productCard}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                >
                  <div className={styles.productImage}>
                    <picture>
                      <source srcSet={product.image} type="image/webp" />
                      <img
                        src={product.fallback || product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => handleImageError(e, product)}
                      />
                    </picture>
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDesc}>{product.desc}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
