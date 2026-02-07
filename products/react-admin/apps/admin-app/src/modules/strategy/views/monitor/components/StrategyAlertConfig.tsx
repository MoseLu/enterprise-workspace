/**
 * Strategy Alert Configuration Component
 *
 * Provides alert configuration functionality including:
 * - Alert threshold settings
 * - Notification channel configuration
 * - Alert rule preview
 * - Existing alert management
 *
 * Migrated from Vue3 to React + TypeScript
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Table,
  Tag,
  Card,
  Alert,
  Popconfirm,
  message,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button as AppButton,
  Modal,
  Checkbox,
  InputNumber,
} from '@enterprise-workspace/frontend/shared';
import styles from './StrategyAlertConfig.module.css';

// ============================================================================
// Types
// ============================================================================

/** 策略类型 */
export type StrategyType =
  | 'PERMISSION'
  | 'BUSINESS'
  | 'DATA'
  | 'WORKFLOW';

/** 策略状态 */
export type StrategyStatus =
  | 'DRAFT'
  | 'TESTING'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

/** 告警类型 */
export type AlertType =
  | 'PERFORMANCE'
  | 'ERROR_RATE'
  | 'EXECUTION_COUNT';

/** 告警动作类型 */
export type AlertActionType = 'EMAIL' | 'WEBHOOK' | 'SMS';

/** 告警条件 */
export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  threshold: number;
  duration: number;
}

/** 告警动作 */
export interface AlertAction {
  type: AlertActionType;
  config: Record<string, unknown>;
}

/** 告警配置 */
export interface StrategyAlert {
  id: string;
  strategyId: string;
  name: string;
  type: AlertType;
  condition: AlertCondition;
  actions: AlertAction[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 策略基础信息 */
export interface Strategy {
  id: string;
  name: string;
  description?: string;
  type: StrategyType;
  status: StrategyStatus;
  version: string;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

// ============================================================================
// Props
// ============================================================================

interface StrategyAlertConfigProps {
  strategy?: Strategy;
}

// ============================================================================
// Translation Helper
// ============================================================================

const t = (key: string): string => {
  const translations: Record<string, string> = {
    'common.strategy.monitor.alert_config': '告警配置',
    'common.strategy.monitor.alert_for_strategy': '为策略 "{{name}}" 配置监控告警',
    'common.strategy.monitor.system_level': '配置系统级监控告警',
    'common.strategy.monitor.alert_name': '告警名称',
    'common.strategy.monitor.please_input_alert_name': '请输入告警名称',
    'common.strategy.monitor.alert_type': '告警类型',
    'common.strategy.monitor.please_select_alert_type': '请选择告警类型',
    'common.strategy.monitor.monitor_metric': '监控指标',
    'common.strategy.monitor.please_select_metric': '请选择监控指标',
    'common.strategy.monitor.operator': '比较操作符',
    'common.strategy.monitor.threshold': '阈值',
    'common.strategy.monitor.duration': '持续时间',
    'common.strategy.monitor.alert_methods': '告警方式',
    'common.strategy.monitor.email_notification': '邮件通知',
    'common.strategy.monitor.webhook': 'Webhook',
    'common.strategy.monitor.sms_notification': '短信通知',
    'common.strategy.monitor.email_address': '邮件地址',
    'common.strategy.monitor.email_placeholder': '多个邮箱用逗号分隔',
    'common.strategy.monitor.email_subject': '邮件主题',
    'common.strategy.monitor.webhook_url': 'Webhook URL',
    'common.strategy.monitor.webhook_placeholder': 'https://example.com/webhook',
    'common.strategy.monitor.request_method': '请求方法',
    'common.strategy.monitor.phone_numbers': '手机号码',
    'common.strategy.monitor.phone_placeholder': '多个号码用逗号分隔',
    'common.strategy.monitor.enabled': '启用状态',
    'common.strategy.monitor.alert_preview': '告警规则预览',
    'common.strategy.monitor.alert_rule': '告警规则',
    'common.strategy.monitor.please_complete_config': '请完成告警配置',
    'common.strategy.monitor.existing_alerts': '现有告警规则',
    'common.strategy.monitor.no_alerts': '暂无告警规则',
    'common.strategy.monitor.save_alert': '保存告警规则',
    'common.strategy.monitor.reset': '重置',
    'common.strategy.monitor.load_alerts_failed': '加载告警列表失败',
    'common.strategy.monitor.save_success': '告警保存成功',
    'common.strategy.monitor.save_failed': '保存失败',
    'common.strategy.monitor.delete_confirm': '确定要删除该告警规则吗？',
    'common.strategy.monitor.delete_success': '告警删除成功',
    'common.strategy.monitor.delete_failed': '删除失败',
    'common.strategy.monitor.edit': '编辑',
    'common.strategy.monitor.delete': '删除',
    // Alert types
    'common.strategy.monitor.types.performance': '性能告警',
    'common.strategy.monitor.types.error_rate': '错误率告警',
    'common.strategy.monitor.types.execution_count': '执行次数告警',
    // Metrics
    'common.strategy.monitor.metrics.avg_response_time': '平均响应时间',
    'common.strategy.monitor.metrics.p95_response_time': 'P95 响应时间',
    'common.strategy.monitor.metrics.p99_response_time': 'P99 响应时间',
    'common.strategy.monitor.metrics.error_rate': '错误率',
    'common.strategy.monitor.metrics.failure_count': '失败次数',
    'common.strategy.monitor.metrics.execution_count': '执行次数',
    'common.strategy.monitor.metrics.execution_rate': '执行频率',
    // Operators
    'common.strategy.monitor.operators.gt': '大于',
    'common.strategy.monitor.operators.gte': '大于等于',
    'common.strategy.monitor.operators.lt': '小于',
    'common.strategy.monitor.operators.lte': '小于等于',
    'common.strategy.monitor.operators.eq': '等于',
    // Units
    'common.strategy.monitor.units.ms': '毫秒',
    'common.strategy.monitor.units.percent': '百分比',
    'common.strategy.monitor.units.times': '次',
    'common.strategy.monitor.units.times_per_minute': '次/分钟',
  };
  return translations[key] || key;
};

// ============================================================================
// Mock Service (Replace with actual API)
// ============================================================================

const mockAlertService = {
  getAlerts: async (strategyId?: string): Promise<StrategyAlert[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 'alert-1',
        strategyId: strategyId || '',
        name: '性能告警',
        type: 'PERFORMANCE',
        condition: {
          metric: 'avg_response_time',
          operator: 'gt',
          threshold: 500,
          duration: 300,
        },
        actions: [
          { type: 'EMAIL', config: { recipients: 'admin@example.com' } },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'alert-2',
        strategyId: strategyId || '',
        name: '错误率告警',
        type: 'ERROR_RATE',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 5,
          duration: 600,
        },
        actions: [
          { type: 'WEBHOOK', config: { url: 'https://example.com/webhook' } },
        ],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  createAlert: async (alert: Partial<StrategyAlert>): Promise<StrategyAlert> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `alert-${Date.now()}`,
      strategyId: alert.strategyId || '',
      name: alert.name || '',
      type: alert.type || 'PERFORMANCE',
      condition: alert.condition || {
        metric: '',
        operator: 'gt',
        threshold: 0,
        duration: 300,
      },
      actions: alert.actions || [],
      enabled: alert.enabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  updateAlert: async (
    id: string,
    alert: Partial<StrategyAlert>
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Update alert:', id, alert);
  },

  deleteAlert: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Delete alert:', id);
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getTypeLabel = (type: AlertType): string => {
  const labelMap: Record<AlertType, string> = {
    PERFORMANCE: t('common.strategy.monitor.types.performance'),
    ERROR_RATE: t('common.strategy.monitor.types.error_rate'),
    EXECUTION_COUNT: t('common.strategy.monitor.types.execution_count'),
  };
  return labelMap[type] || type;
};

const getThresholdPrecision = (metric: string): number => {
  if (metric === 'error_rate') return 2;
  return 0;
};

const getThresholdUnit = (metric: string): string => {
  const unitMap: Record<string, string> = {
    avg_response_time: t('common.strategy.monitor.units.ms'),
    p95_response_time: t('common.strategy.monitor.units.ms'),
    p99_response_time: t('common.strategy.monitor.units.ms'),
    error_rate: t('common.strategy.monitor.units.percent'),
    failure_count: t('common.strategy.monitor.units.times'),
    execution_count: t('common.strategy.monitor.units.times'),
    execution_rate: t('common.strategy.monitor.units.times_per_minute'),
  };
  return unitMap[metric] || '';
};

// ============================================================================
// Main Component
// ============================================================================

export const StrategyAlertConfig: React.FC<StrategyAlertConfigProps> = ({
  strategy,
}) => {
  // Form ref
  const formRef = useRef<HTMLFormElement>(null);

  // State
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [existingAlerts, setExistingAlerts] = useState<StrategyAlert[]>([]);
  const [selectedActionTypes, setSelectedActionTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Alert type change
  const handleTypeChange = useCallback(() => {
    form.setFieldsValue({
      condition: {
        metric: '',
        threshold: 0,
      },
    });
  }, [form]);

  // Load existing alerts
  const loadExistingAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const alerts = await mockAlertService.getAlerts(strategy?.id);
      setExistingAlerts(alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      message.error(t('common.strategy.monitor.load_alerts_failed'));
    } finally {
      setLoading(false);
    }
  }, [strategy?.id]);

  // Initial load
  useEffect(() => {
    loadExistingAlerts();
  }, [loadExistingAlerts]);

  // Set default alert name
  useEffect(() => {
    if (strategy) {
      form.setFieldsValue({
        name: `${strategy.name} - ${t('common.strategy.monitor.types.performance')}`,
      });
    }
  }, [strategy, form]);

  // Available metrics based on alert type
  const availableMetrics = useMemo(() => {
    const alertType = form.getFieldValue('type') as AlertType;

    const metricsMap: Record<AlertType, { value: string; label: string }[]> = {
      PERFORMANCE: [
        {
          value: 'avg_response_time',
          label: t('common.strategy.monitor.metrics.avg_response_time'),
        },
        {
          value: 'p95_response_time',
          label: t('common.strategy.monitor.metrics.p95_response_time'),
        },
        {
          value: 'p99_response_time',
          label: t('common.strategy.monitor.metrics.p99_response_time'),
        },
      ],
      ERROR_RATE: [
        {
          value: 'error_rate',
          label: t('common.strategy.monitor.metrics.error_rate'),
        },
        {
          value: 'failure_count',
          label: t('common.strategy.monitor.metrics.failure_count'),
        },
      ],
      EXECUTION_COUNT: [
        {
          value: 'execution_count',
          label: t('common.strategy.monitor.metrics.execution_count'),
        },
        {
          value: 'execution_rate',
          label: t('common.strategy.monitor.metrics.execution_rate'),
        },
      ],
    };

    return metricsMap[alertType || 'PERFORMANCE'] || [];
  }, [form.getFieldValue('type')]);

  // Operator options
  const operatorOptions = [
    { value: 'gt', label: t('common.strategy.monitor.operators.gt') + ' (>)' },
    {
      value: 'gte',
      label: t('common.strategy.monitor.operators.gte') + ' (>=)',
    },
    { value: 'lt', label: t('common.strategy.monitor.operators.lt') + ' (<)' },
    {
      value: 'lte',
      label: t('common.strategy.monitor.operators.lte') + ' (<=)',
    },
    { value: 'eq', label: t('common.strategy.monitor.operators.eq') + ' (=)' },
  ];

  // Alert type options
  const alertTypeOptions = [
    {
      value: 'PERFORMANCE',
      label: t('common.strategy.monitor.types.performance'),
    },
    {
      value: 'ERROR_RATE',
      label: t('common.strategy.monitor.types.error_rate'),
    },
    {
      value: 'EXECUTION_COUNT',
      label: t('common.strategy.monitor.types.execution_count'),
    },
  ];

  // Action type options
  const actionTypeOptions = [
    { value: 'EMAIL', label: t('common.strategy.monitor.email_notification') },
    { value: 'WEBHOOK', label: t('common.strategy.monitor.webhook') },
    { value: 'SMS', label: t('common.strategy.monitor.sms_notification') },
  ];

  // Get preview title
  const getPreviewTitle = useMemo(() => {
    const name = form.getFieldValue('name');
    if (!name) return t('common.strategy.monitor.alert_preview');
    return `${t('common.strategy.monitor.alert_rule')}: ${name}`;
  }, [form.getFieldValue('name')]);

  // Get preview description
  const getPreviewDescription = useMemo(() => {
    const condition = form.getFieldValue('condition') as AlertCondition;
    if (!condition?.metric) {
      return t('common.strategy.monitor.please_complete_config');
    }

    const metricLabel =
      availableMetrics.find((m) => m.value === condition.metric)?.label ||
      condition.metric;

    const operatorMap: Record<string, string> = {
      gt: t('common.strategy.monitor.operators.gt'),
      gte: t('common.strategy.monitor.operators.gte'),
      lt: t('common.strategy.monitor.operators.lt'),
      lte: t('common.strategy.monitor.operators.lte'),
      eq: t('common.strategy.monitor.operators.eq'),
    };

    return `当 ${metricLabel} ${operatorMap[condition.operator]} ${condition.threshold}${getThresholdUnit(condition.metric)} 持续 ${condition.duration} 秒时触发告警`;
  }, [form.getFieldValue('condition'), availableMetrics]);

  // Reset form
  const handleReset = useCallback(() => {
    form.resetFields();
    setSelectedActionTypes([]);
  }, [form]);

  // Save alert
  const handleSave = useCallback(async () => {
    try {
      await form.validateFields();

      setSaving(true);

      const values = form.getFieldsValue();

      // Build actions
      const actions = selectedActionTypes.map((type) => {
        const configMap: Record<string, Record<string, string>> = {
          EMAIL: {
            recipients: values.emailRecipients || '',
            subject: values.emailSubject || '',
          },
          WEBHOOK: {
            url: values.webhookUrl || '',
            method: values.webhookMethod || 'POST',
          },
          SMS: {
            phoneNumbers: values.smsPhoneNumbers || '',
          },
        };

        return {
          type: type as AlertActionType,
          config: configMap[type] || {},
        };
      });

      const alertData = {
        strategyId: strategy?.id || '',
        name: values.name,
        type: values.type,
        condition: {
          metric: values.condition?.metric || '',
          operator: values.condition?.operator || 'gt',
          threshold: values.condition?.threshold || 0,
          duration: values.condition?.duration || 300,
        },
        actions,
        enabled: values.enabled ?? true,
      };

      await mockAlertService.createAlert(alertData);

      message.success(t('common.strategy.monitor.save_success'));
      loadExistingAlerts();
      handleReset();
    } catch (error) {
      console.error('Save failed:', error);
      message.error(t('common.strategy.monitor.save_failed'));
    } finally {
      setSaving(false);
    }
  }, [form, selectedActionTypes, strategy, loadExistingAlerts]);

  // Edit alert
  const handleEdit = useCallback((alert: StrategyAlert) => {
    form.setFieldsValue({
      name: alert.name,
      type: alert.type,
      condition: { ...alert.condition },
      enabled: alert.enabled,
    });

    setSelectedActionTypes(alert.actions.map((a) => a.type));

    alert.actions.forEach((action) => {
      if (action.type === 'EMAIL') {
        form.setFieldsValue({
          emailRecipients: action.config.recipients,
          emailSubject: action.config.subject,
        });
      } else if (action.type === 'WEBHOOK') {
        form.setFieldsValue({
          webhookUrl: action.config.url,
          webhookMethod: action.config.method,
        });
      } else if (action.type === 'SMS') {
        form.setFieldsValue({
          smsPhoneNumbers: action.config.phoneNumbers,
        });
      }
    });
  }, [form]);

  // Delete alert
  const handleDelete = useCallback(
    async (alert: StrategyAlert) => {
      try {
        await Modal.confirm({
          title: t('common.strategy.monitor.delete'),
          content: t('common.strategy.monitor.delete_confirm'),
          okText: '确认',
          cancelText: '取消',
        });

        await mockAlertService.deleteAlert(alert.id);
        message.success(t('common.strategy.monitor.delete_success'));
        loadExistingAlerts();
      } catch (error) {
        if (error !== 'cancel') {
          message.error(t('common.strategy.monitor.delete_failed'));
        }
      }
    },
    [loadExistingAlerts]
  );

  // Existing alerts table columns
  const alertColumns = [
    {
      title: t('common.strategy.monitor.alert_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('common.strategy.monitor.alert_type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: AlertType) => (
        <Tag>{getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: t('common.strategy.monitor.monitor_metric'),
      dataIndex: ['condition', 'metric'],
      key: 'metric',
      width: 120,
    },
    {
      title: '条件',
      key: 'condition',
      width: 150,
      render: (_: unknown, record: StrategyAlert) => (
        <span>
          {record.condition.operator}{' '}
          {record.condition.threshold}
        </span>
      ),
    },
    {
      title: t('common.strategy.monitor.enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'success' : 'error'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: t('common.strategy.monitor.operation'),
      key: 'action',
      width: 120,
      render: (_: unknown, record: StrategyAlert) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.strategy.monitor.edit')}
          </Button>
          <Popconfirm
            title={t('common.strategy.monitor.delete')}
            description={t('common.strategy.monitor.delete_confirm')}
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              {t('common.strategy.monitor.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.alertConfig}>
      {/* Header */}
      <div className={styles.configHeader}>
        <h3>{t('common.strategy.monitor.alert_config')}</h3>
        <p>
          {strategy
            ? t('common.strategy.monitor.alert_for_strategy').replace(
                '{{name}}',
                strategy.name
              )
            : t('common.strategy.monitor.system_level')}
        </p>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'PERFORMANCE',
          condition: {
            operator: 'gt',
            threshold: 0,
            duration: 300,
          },
          enabled: true,
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label={t('common.strategy.monitor.alert_name')}
            name="name"
            rules={[
              {
                required: true,
                message: t('common.strategy.monitor.please_input_alert_name'),
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input placeholder="请输入告警名称" />
          </Form.Item>

          <Form.Item
            label={t('common.strategy.monitor.alert_type')}
            name="type"
            rules={[
              {
                required: true,
                message: t('common.strategy.monitor.please_select_alert_type'),
              },
            ]}
            style={{ flex: 1 }}
          >
            <Select
              options={alertTypeOptions}
              onChange={handleTypeChange}
              placeholder="选择告警类型"
            />
          </Form.Item>
        </div>

        <div className={styles.conditionRow}>
          <Form.Item
            label={t('common.strategy.monitor.monitor_metric')}
            name={['condition', 'metric']}
            rules={[
              {
                required: true,
                message: t('common.strategy.monitor.please_select_metric'),
              },
            ]}
            className={styles.conditionItem}
          >
            <Select
              options={availableMetrics}
              placeholder="选择监控指标"
            />
          </Form.Item>

          <Form.Item
            label={t('common.strategy.monitor.operator')}
            name={['condition', 'operator']}
            className={styles.conditionItem}
          >
            <Select options={operatorOptions} />
          </Form.Item>

          <Form.Item
            label={t('common.strategy.monitor.threshold')}
            name={['condition', 'threshold']}
            className={styles.conditionItem}
          >
            <InputNumber
              min={0}
              precision={getThresholdPrecision(
                form.getFieldValue('condition')?.metric || ''
              )}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('common.strategy.monitor.duration')}
            name={['condition', 'duration']}
            className={styles.conditionItem}
          >
            <InputNumber
              min={60}
              max={3600}
              style={{ width: '100%' }}
              addonAfter="秒"
            />
          </Form.Item>
        </div>

        <Form.Item label={t('common.strategy.monitor.alert_methods')}>
          <Checkbox.Group
            value={selectedActionTypes}
            onChange={setSelectedActionTypes}
          >
            {actionTypeOptions.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>

        {/* Email config */}
        {selectedActionTypes.includes('EMAIL') && (
          <div className={styles.channelConfigs}>
            <div className={styles.channelTitle}>邮件配置</div>
            <Form.Item
              label={t('common.strategy.monitor.email_address')}
              name="emailRecipients"
            >
              <Input placeholder={t('common.strategy.monitor.email_placeholder')} />
            </Form.Item>
            <Form.Item
              label={t('common.strategy.monitor.email_subject')}
              name="emailSubject"
            >
              <Input placeholder={t('common.strategy.monitor.email_subject')} />
            </Form.Item>
          </div>
        )}

        {/* Webhook config */}
        {selectedActionTypes.includes('WEBHOOK') && (
          <div className={styles.channelConfigs}>
            <div className={styles.channelTitle}>Webhook 配置</div>
            <Form.Item
              label={t('common.strategy.monitor.webhook_url')}
              name="webhookUrl"
            >
              <Input placeholder={t('common.strategy.monitor.webhook_placeholder')} />
            </Form.Item>
            <Form.Item
              label={t('common.strategy.monitor.request_method')}
              name="webhookMethod"
            >
              <Select
                options={[
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                ]}
              />
            </Form.Item>
          </div>
        )}

        {/* SMS config */}
        {selectedActionTypes.includes('SMS') && (
          <div className={styles.channelConfigs}>
            <div className={styles.channelTitle}>短信配置</div>
            <Form.Item
              label={t('common.strategy.monitor.phone_numbers')}
              name="smsPhoneNumbers"
            >
              <Input placeholder={t('common.strategy.monitor.phone_placeholder')} />
            </Form.Item>
          </div>
        )}

        <Form.Item label={t('common.strategy.monitor.enabled')} name="enabled">
          <Switch />
        </Form.Item>

        {/* Preview */}
        <div className={styles.alertPreview}>
          <h4>{t('common.strategy.monitor.alert_preview')}</h4>
          <div className={styles.previewContent}>
            <Alert
              message={getPreviewTitle}
              description={getPreviewDescription}
              type="info"
              showIcon
            />
          </div>
        </div>

        {/* Existing alerts */}
        {existingAlerts.length > 0 && (
          <div className={styles.existingAlerts}>
            <h4>{t('common.strategy.monitor.existing_alerts')}</h4>
            <Table
              dataSource={existingAlerts}
              columns={alertColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}

        {/* Actions */}
        <div className={styles.formActions}>
          <Button onClick={handleReset}>{t('common.strategy.monitor.reset')}</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            {t('common.strategy.monitor.save_alert')}
          </Button>
        </div>
      </Form>
    </div>
  );
};

StrategyAlertConfig.displayName = 'StrategyAlertConfig';

export default StrategyAlertConfig;
