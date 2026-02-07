import React from 'react';
import { GeometricBackground } from '@/components';
import styles from './index.module.scss';

const HelpPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.mainContent}>
        <GeometricBackground>
          <div className={styles.content}>
            <div className={styles.container}>
              <h2>帮助中心</h2>
              <p>这里将提供帮助文档和常见问题解答。</p>
              {/* 后续可以添加帮助内容 */}
            </div>
          </div>
        </GeometricBackground>
      </section>
    </div>
  );
};

export default HelpPage;
