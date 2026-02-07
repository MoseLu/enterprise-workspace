import React, { ReactNode } from 'react';
import styles from './index.module.scss';

interface LoginFormLayoutProps {
  children?: ReactNode;
}

/**
 * 登录表单布局组件
 *
 * 提供登录表单的标准布局结构，包含表单区域和底部区域
 */
export const LoginFormLayout: React.FC<LoginFormLayoutProps> = ({
  children
}) => {
  return (
    <div className={styles.loginFormLayout}>
      {/* 表单区域 */}
      <div className={styles.formContainer}>
        <slot name="form">{children}</slot>
      </div>

      {/* 按钮和忘记密码区域（使用 gap 控制它们之间的间距） */}
      <div className={styles.bottomSection}>
        {/* 按钮区域 */}
        <div className={styles.buttonContainer}>
          <slot name="button" />
        </div>

        {/* 额外内容（如忘记密码链接） */}
        {/* 始终存在，确保按钮位置固定，即使没有内容也占位 */}
        <div className={styles.extraContainer}>
          <slot name="extra" />
        </div>
      </div>
    </div>
  );
};

export default LoginFormLayout;
