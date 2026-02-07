/**
 * AppUpsert - Add/Edit Modal Component
 * React Admin - Access Control Module
 *
 * Wraps Ant Design Modal + Form for add/edit operations.
 */

import React, { useCallback } from 'react';
import type { FormInstance } from 'antd/es/form';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Radio } from 'antd';
import type { ModalProps } from 'antd/es/modal';
import type { FormProps } from 'antd/es/form';

interface UpsertField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime' | 'switch' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  width?: number | 'full';
  disabled?: boolean;
  hidden?: boolean;
}

interface AppUpsertProps {
  form?: FormInstance;
  open?: boolean;
  mode?: 'add' | 'edit';
  title?: string;
  fields?: UpsertField[];
  width?: number | 'small' | 'middle' | 'large' | 'full';
  onOk?: () => void;
  onCancel?: () => void;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  children?: React.ReactNode;
}

const getModalWidth = (width: number | 'small' | 'middle' | 'large' | 'full' | undefined): number | '100%' => {
  if (!width) return 600;
  const widthMap: Record<string, number> = {
    small: 400,
    middle: 600,
    large: 800,
    full: '100%',
  };
  return widthMap[width] || width;
};

const renderFormItem = (field: UpsertField, form?: FormInstance): React.ReactNode => {
  const { key, label, type, required, placeholder, options, width, disabled, hidden } = field;

  const fieldProps: Record<string, unknown> = {
    placeholder,
    disabled,
    style: width === 'full' ? { width: '100%' } : { width: (width as number) || '100%' },
  };

  if (type === 'text' || type === 'textarea') {
    return (
      <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
        {type === 'textarea' ? (
          <Input.TextArea rows={4} {...(fieldProps as Omit<typeof fieldProps, 'placeholder'>)} />
        ) : (
          <Input {...fieldProps} />
        )}
      </Form.Item>
    );
  }

  if (type === 'number') {
    return (
      <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
        <InputNumber style={{ width: '100%' }} {...fieldProps} />
      </Form.Item>
    );
  }

  if (type === 'select' || type === 'radio') {
    const Component = type === 'select' ? Select : Radio.Group;
    const itemProps = type === 'select' ? { options: options || [] } : { options: (options || []).map((opt) => ({ label: opt.label, value: opt.value })) };
    return (
      <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
        <Component {...itemProps} style={{ width: '100%' }} />
      </Form.Item>
    );
  }

  if (type === 'date') {
    return (
      <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
        <DatePicker style={{ width: '100%' }} {...fieldProps} />
      </Form.Item>
    );
  }

  if (type === 'datetime') {
    return (
      <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
        <DatePicker showTime style={{ width: '100%' }} {...fieldProps} />
      </Form.Item>
    );
  }

  if (type === 'switch') {
    return (
      <Form.Item key={key} name={key} label={label} valuePropName="checked" hidden={hidden}>
        <Switch {...fieldProps} />
      </Form.Item>
    );
  }

  return (
    <Form.Item key={key} name={key} label={label} required={required} hidden={hidden}>
      <Input {...fieldProps} />
    </Form.Item>
  );
};

export const AppUpsert: React.FC<AppUpsertProps> & {
  displayName: string;
} = ({
  form,
  open = false,
  mode = 'add',
  title = '',
  fields = [],
  width,
  onOk,
  onCancel,
  confirmLoading = false,
  okText,
  cancelText,
  destroyOnClose = true,
  maskClosable = false,
  children,
}) => {
  const handleOk = useCallback(() => {
    onOk?.();
  }, [onOk]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const modalWidth = getModalWidth(width);

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      width={modalWidth}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      okText={okText || (mode === 'add' ? '新增' : '保存')}
      cancelText={cancelText || '取消'}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {fields.map((field) => renderFormItem(field, form))}
      </Form>
      {children}
    </Modal>
  );
};

AppUpsert.displayName = 'AppUpsert';

export default AppUpsert;
