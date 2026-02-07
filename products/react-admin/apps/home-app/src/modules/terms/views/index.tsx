import React from 'react';
import { GeometricBackground } from '@/components';
import styles from './index.module.scss';

const TermsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.mainContent}>
        <GeometricBackground>
          <div className={styles.content}>
            <div className={styles.container}>
              <h2>服务条款</h2>
              <p>这里是服务条款的内容。</p>
              {/* 后续可以添加详细的服务条款内容 */}
            </div>
          </div>
        </GeometricBackground>
      </section>
    </div>
  );
};

export default TermsPage;
