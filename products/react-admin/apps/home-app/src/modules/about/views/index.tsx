import React from 'react';
import { GeometricBackground } from '@/components';
import styles from './index.module.scss';

const AboutPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.mainContent}>
        <GeometricBackground showInscribedRect={false}>
          <div className={styles.contentWrapper}>
            {/* 左侧：中文介绍区 */}
            <div className={styles.contentLeft}>
              <div className={styles.contentCard}>
                <div className={styles.brandBanner}>
                  <h1 className={styles.companyNameEn}>Bellis Technology</h1>
                  <p className={styles.companySlogan}>INTELLIGENCE IN VALIDATION</p>
                  <p className={styles.companyNameCn}>拜里斯科技（深圳）有限公司</p>
                </div>
                <div className={`${styles.textBlock} ${styles.textCn}`}>
                  <p>
                    拜里斯科技 (深圳) 有限公司是英国 Innovative Technology Ltd
                    的全资子公司和全球现金处理设备的生产基地，公司位于深圳坪山综合保税区内。
                  </p>
                  <p>
                    Innovative Technology Ltd 作为现金处理技术全球领先的供应商，我们使世界各地的企业能够更有效地处理纸币、硬币和票据，降低与现金相关的安全风险并改善客户体验。作为一家以创新为主导的全球科技公司，我们为游戏、娱乐、自动售卖机、零售和售货亭市场研发了一系列纸币硬币的现金处理产品。
                  </p>
                  <p>
                    凭借超过 30 年的经验，我们已成长为世界领先的现金处理技术供应商之一，为一些世界领先的公司制造每天处理数百万笔交易的现金识别、现金找零、现金兑换和票据处理的产品。
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧：英文介绍区 */}
            <div className={styles.contentRight}>
              <div className={styles.contentCard}>
                <div className={styles.brandBanner}>
                  <h1 className={styles.companyNameEn}>Bellis Technology</h1>
                  <p className={styles.companySlogan}>INTELLIGENCE IN VALIDATION</p>
                </div>
                <div className={`${styles.textBlock} ${styles.textEn}`}>
                  <p>
                    Bellis Technology Ltd is a wholly-owned subsidiary and world&apos;s
                    largest production base of Innovative Technology Ltd. The company is
                    located in Shenzhen Pingshan Comprehensive Bonded Zone. Innovative
                    Technology Ltd is a leading provider of cash handling technology, we
                    enable businesses across the world to handle coins, notes and tickets
                    more efficiently, reducing cash related security risks and improving
                    their customer&apos;s experience.
                  </p>
                  <p>
                    As an innovation-led global technology company, we research and develop a broad range of state-of-the-art
                    cash handling products for the gaming, amusement, vending, retail and
                    kiosk markets.
                  </p>
                  <p>
                    With over 30 years&apos; experience, we have grown to
                    become one of the leading providers of cash handling technology in
                    the world, manufacturing banknote validators, banknote recyclers,
                    multi-coin hoppers and ticketing products that handle millions of
                    transactions every day for some of the world&apos;s leading companies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GeometricBackground>
      </section>
    </div>
  );
};

export default AboutPage;
