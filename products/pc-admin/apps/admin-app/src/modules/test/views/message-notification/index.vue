<template>
  <div class="message-notification-test">
    <div class="test-content">
      <!-- BtcMessage 测试 -->
      <div class="test-section">
        <h3>BtcMessage 消息测试</h3>
        <div class="test-description">
          测试基于 Element Plus 的 BtcMessage 组件，支持重复消息徽标计数
        </div>
        <div class="test-buttons">
          <el-button type="success" @click="testBtcMessageSuccess">成功消息</el-button>
          <el-button type="danger" @click="testBtcMessageError">错误消息</el-button>
          <el-button type="warning" @click="testBtcMessageWarning">警告消息</el-button>
          <el-button type="info" @click="testBtcMessageInfo">信息消息</el-button>
        </div>
        <div class="test-buttons">
          <el-button @click="testBtcMessageDuplicate">重复消息测试</el-button>
          <el-button type="warning" @click="testBtcMessageBatch">批量消息测试(100次)</el-button>
          <el-button @click="closeAllBtcMessages">关闭所有消息</el-button>
        </div>
      </div>

      <!-- BtcNotification 测试 -->
      <div class="test-section">
        <h3>BtcNotification 通知测试</h3>
        <div class="test-description">
          测试基于 Element Plus 的 BtcNotification 组件，支持重复通知徽标计数
        </div>
        <div class="test-buttons">
          <el-button type="success" @click="testBtcNotificationSuccess">成功通知</el-button>
          <el-button type="danger" @click="testBtcNotificationError">错误通知</el-button>
          <el-button type="warning" @click="testBtcNotificationWarning">警告通知</el-button>
          <el-button type="info" @click="testBtcNotificationInfo">信息通知</el-button>
        </div>
        <div class="test-buttons">
          <el-button @click="testBtcNotificationWithTitle">带标题通知</el-button>
          <el-button @click="testBtcNotificationCustom">自定义通知</el-button>
        </div>
        <div class="test-buttons">
          <el-button @click="testBtcNotificationDuplicate">重复通知测试</el-button>
          <el-button type="warning" @click="testBtcNotificationBatch"
            >批量通知测试(100次)</el-button
          >
          <el-button @click="closeAllBtcNotifications">关闭所有通知</el-button>
        </div>
      </div>

      <!-- 功能说明 -->
      <div class="test-section">
        <h3>功能说明</h3>
        <div class="test-info">
          <h4>BtcMessage 特性：</h4>
          <ul>
            <li><strong>重复消息徽标计数</strong>：相同内容的消息会显示重复次数徽标</li>
            <li>
              <strong>99+ 显示逻辑</strong>：当重复次数超过99时，显示"99+"，与 el-badge 原生行为一致
            </li>
            <li><strong>自动递增递减</strong>：连续重复消息时徽标递增，停止后自动递减</li>
            <li><strong>智能生命周期管理</strong>：消息自动关闭，状态自动清理，无需手动关闭按钮</li>
            <li><strong>类型化支持</strong>：支持 success、warning、info、error 四种类型</li>
            <li><strong>主题适配</strong>：支持亮色/暗色主题切换</li>
            <li><strong>响应式设计</strong>：移动端友好的徽标尺寸</li>
            <li><strong>完全兼容</strong>：基于原生 BtcMessage，保持所有原生功能</li>
          </ul>

          <h4>BtcNotification 特性：</h4>
          <ul>
            <li><strong>重复通知徽标计数</strong>：相同内容的通知会显示重复次数徽标</li>
            <li>
              <strong>99+ 显示逻辑</strong>：当重复次数超过99时，显示"99+"，与 el-badge 原生行为一致
            </li>
            <li><strong>自动递增递减</strong>：连续重复通知时徽标递增，停止后自动递减</li>
            <li><strong>智能生命周期管理</strong>：通知自动关闭，状态自动清理</li>
            <li><strong>类型化支持</strong>：支持 success、warning、info、error 四种类型</li>
            <li><strong>主题适配</strong>：支持亮色/暗色主题切换</li>
            <li><strong>位置控制</strong>：支持自定义显示位置</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BtcMessage, BtcNotification } from '@btc/shared-components';

// 组件名称
defineOptions({
  name: 'MessageNotificationTest',
});

// BtcMessage 测试方法
const testBtcMessageSuccess = () => {
  BtcMessage.success('这是一条成功消息！');
};

const testBtcMessageError = () => {
  BtcMessage.error('这是一条错误消息！');
};

const testBtcMessageWarning = () => {
  BtcMessage.warning('这是一条警告消息！');
};

const testBtcMessageInfo = () => {
  BtcMessage.info('这是一条信息消息！');
};

const testBtcMessageDuplicate = () => {
  // 快速连续发送相同的成功消息，测试徽标计数功能
  BtcMessage.success('重复消息测试 - 应该显示徽章');
};

const testBtcMessageBatch = () => {
  // 批量发送100次相同消息，测试99+显示功能
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      BtcMessage.success('批量消息测试 - 应该显示99+');
    }, i * 20); // 每20ms发送一次，1.8秒内完成，给递减逻辑留出时间
  }
};

const closeAllBtcMessages = () => {
  BtcMessage.closeAll();
};

// BtcNotification 测试方法
const testBtcNotificationSuccess = () => {
  BtcNotification.success('这是一条成功通知！');
};

const testBtcNotificationError = () => {
  BtcNotification.error('这是一条错误通知！');
};

const testBtcNotificationWarning = () => {
  BtcNotification.warning('这是一条警告通知！');
};

const testBtcNotificationInfo = () => {
  BtcNotification.info('这是一条信息通知！');
};

const testBtcNotificationWithTitle = () => {
  BtcNotification.success('操作成功完成！', {
    title: '系统提示',
  });
};

const testBtcNotificationCustom = () => {
  BtcNotification.info('这是一条自定义通知', {
    title: '自定义标题',
    duration: 8000,
    showClose: true,
    position: 'top-left',
  });
};

const testBtcNotificationDuplicate = () => {
  // 快速连续发送相同的成功通知，测试徽标计数功能
  BtcNotification.success('重复通知测试 - 应该显示徽章');
};

const testBtcNotificationBatch = () => {
  // 批量发送100次相同通知，测试99+显示功能
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      BtcNotification.success('批量通知测试 - 应该显示99+');
    }, i * 20); // 每20ms发送一次，1.8秒内完成，给递减逻辑留出时间
  }
};

const closeAllBtcNotifications = () => {
  BtcNotification.closeAll();
};
</script>

<style lang="scss" scoped>
.message-notification-test {
  padding: 20px;
}

.test-content {
  width: 100%;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);

  h3 {
    margin: 0 0 15px 0;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .test-description {
    margin: 0 0 20px 0;
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.6;
  }

  .test-buttons {
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .el-button {
      margin: 0;
    }
  }

  .test-info {
    margin-top: 20px;
    padding: 15px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);

    h4 {
      margin: 0 0 10px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 600;
    }

    ul {
      margin: 0 0 20px 0;
      padding-left: 20px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.6;

      li {
        margin-bottom: 8px;

        strong {
          color: var(--el-text-color-primary);
          font-weight: 600;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .message-notification-test {
    padding: 15px;
  }

  .test-section {
    padding: 15px;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
    }

    .test-buttons {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
