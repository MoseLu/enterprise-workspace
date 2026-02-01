/**
 * 应用级国际化配置
 * 只包含基础的应用信息和菜单配置，作为父级模板
 * 详细的页面配置应该在页面级 config.ts 中
 */

import type { AppLevelLocaleConfig } from '../../../../types/locale';

export default {
  'zh-CN': {
    subapp: {
      name: '物流模块',
    },
    common: {
      // 错误消息
      error: {
        failed: '执行失败',
        request_failed: '请求失败',
        not_retrying: '请求失败，不进行重试',
        preparing_retry: '请求失败，准备重试',
        get_user_info_failed: '获取用户信息失败',
        render_failed: '渲染失败',
        mount_failed: 'mount 失败',
        cannot_display_loading: '无法显示应用级 loading',
      },
      // 重试相关
      retry: {
        retrying: '正在重试请求 ({count}/{max})，下次重试延迟: {delay}ms',
        failed: '请求重试失败 ({count}/{max})，请检查网络连接',
        normal: '网络连接正常',
        request_retry: '请求重试',
        delay: '，延迟',
      },
      // 应用相关
      apps: {
        logistics: '物流应用',
        engineering: '工程应用',
        quality: '品质应用',
        production: '生产应用',
        app: '应用',
      },
      // 系统相关
      system: {
        btc_shop_management: 'BTC车间管理',
        btc_shop_management_system_logistics: 'BTC车间管理系统 - 物流应用',
        logistics_module: '物流模块',
        bellis: '拜里斯',
        address: '深圳市南山区科技园',
        loading_resources: '正在加载系统资源...',
        loading_resources_subtitle: '初次加载可能需要较多时间，请耐心等待',
        simplified_chinese: '简体中文',
        english: 'English',
        app_config_not_found: '未找到应用配置',
        container_not_in_dom: '容器 #subapp-viewport 不在 DOM 中',
        container_not_in_dom_cannot_load: '容器 #subapp-viewport 不在 DOM 中，无法加载应用',
        container_still_invisible: '容器 #subapp-viewport 仍然不可见，强制显示',
        container_not_found: '容器 #subapp-viewport 在 {time}ms 内未找到',
        container_not_exists: '容器 #subapp-viewport 不存在，无法加载应用',
      },
      // 确认对话框
      confirm: {
        confirm: '确认',
        ok: '确定',
        cancel: '取消',
      },
      // 操作相关
      operation: {
        success: '操作成功',
        failed: '操作失败，请稍后重试',
      },
      // UI 相关
      ui: {
        export: '导出',
        export_success: '导出成功',
        export_failed: '导出失败',
      },
      // 其他
      other: {
        data_truncated: '[数据过大，已截断]',
        more_data_truncated: '[更多数据已截断]',
        depth_exceeded: '[深度超限]',
        test_message: '测试消息',
        not_exists: '不存在',
        error: '错误',
        failed: '失败',
        exception: '异常',
        invalid: '无效',
        expired: '过期',
        rejected: '拒绝',
        forbidden: '禁止',
        not_found: '未找到',
        cannot: '无法',
        cannot_do: '不能',
        missing: '缺少',
        insufficient: '不足',
        resource_not_found: '请求的资源不存在',
        unknown_error: '未知错误',
        identity_expired: '身份已过期，请重新登录',
        listener_error: '监听器执行出错 (key: {key})',
        request_no_token: '请求 {url} 没有 token',
        request_log_queue_full: '请求日志队列已满({size})，丢弃最旧的日志',
        param_serialize_failed: '参数序列化失败，使用空对象:',
        service_not_initialized: 'Service 未初始化，无法发送请求日志',
        request_log_service_unavailable: '请求日志服务不可用',
        batch_send_failed: '批量发送请求日志失败（已重试）:',
        request_log_service_reenabled: '请求日志服务已重新启用，继续发送队列中的数据',
        loading_failed: '加载「{name}」失败，请刷新重试',
        app_load_failed: '[应用加载失败]',
        manifest_injected: '已从 manifest 注入应用配置:',
        manifest_inject_failed: '从 manifest 注入配置失败:',
      },
      // 插件相关
      plugin: {
        user_setting: '用户设置',
        user_setting_description: '提供用户偏好设置和主题配置',
      },
      // 仓储模块相关
      warehouse: {
        material: {
          fields: {
            material_code: '物料编码',
            material_name: '物料名称',
            material_type: '物料类型',
            specification: '规格型号',
            material_texture: '材质',
            unit: '单位',
            supplier_code: '供应商编码',
            supplier_name: '供应商名称',
            unit_price: '单价',
            tax_rate: '税率',
            total_price: '含税总价',
            bar_code: '条形码',
            safety_stock: '安全库存',
            storage_requirement: '储存要求',
            expire_cycle: '保质周期',
            remark: '备注',
            created_at: '创建时间',
            updated_at: '更新时间',
          },
        },
      },
      // 盘点模块相关
      inventory: {
        storage_location: {
          fields: {
            name: '名称',
            position: '仓位',
            description: '描述',
            domain_id: '域ID',
            createdAt: '创建时间',
            updatedAt: '更新时间',
          },
        },
        info: {
          fields: {
            check_no: '盘点单号',
            domain_id: '域ID',
            check_type: '盘点类型',
            check_status: '盘点状态',
            start_time: '开始时间',
            end_time: '结束时间',
            checker_id: '负责人',
            remark: '备注',
            created_at: '创建时间',
            update_at: '更新时间',
          },
        },
        detail: {
          fields: {
            material_code: '物料编码',
            diff_reason: '差异原因',
            process_person: '处理人',
            process_time: '处理时间',
            process_remark: '处理备注',
            check_no: '盘点流程ID',
            position: '仓位',
            diff_qty: '差异数量',
          },
        },
        result: {
          fields: {
            material_code: '物料编码',
            position: '仓位',
            book_qty: '账面数量',
            actual_qty: '实际数量',
            diff_qty: '差异数量',
          },
        },
        sub_process: {
          fields: {
            sub_process_no: '子流程编号',
            check_status: '盘点状态',
            start_time: '开始时间',
            end_time: '结束时间',
            remaining_seconds: '剩余秒数',
            parent_process_no: '父流程编号',
          },
        },
        check: {
          fields: {
            base_id: '关联盘点任务',
            material_code: '物料编码',
            material_name: '物料名称',
            specification: '物料规格',
            unit: '计量单位',
            batch_no: '批次号',
            book_qty: '账面数量',
            actual_qty: '实际数量',
            storage_location: '仓位',
            diff_qty: '差异数量',
            diff_rate: '差异率',
            checker_id: '盘点人',
            is_diff: '是否有差异',
            remark: '明细备注',
          },
        },
        // 页面相关配置（从 page 层级移到这里，因为支持多层嵌套）
        base: {
          button: {
            pull: '拉取数据',
          },
          pull: {
            success: '数据拉取成功',
            failed: '数据拉取失败',
          },
          fields: {
            check_status: {
              notStarted: '未开始',
              inProgress: '进行中',
              completed: '已完成',
            },
          },
        },
        diff: {
          detail: {
            title: '差异记录详情',
          },
          fields: {
            diff_reason: '差异原因',
            process_time: '处理时间',
            process_remark: '处理备注',
            material_code: '物料编码',
            position: '仓位',
          },
        },
        result_page: {
          detail: {
            title: '盘点结果详情',
          },
          search_placeholder: '搜索盘点结果',
        },
        subProcess: {
          detail: {
            title: '子流程详情',
          },
        },
      },
    },
  },
  'en-US': {
    subapp: {
      name: 'Logistics Module',
    },
    common: {
      error: {
        failed: 'Execution failed',
        request_failed: 'Request failed',
        not_retrying: 'Request failed, not retrying',
        preparing_retry: 'Request failed, preparing retry',
        get_user_info_failed: 'Failed to get user info',
        render_failed: 'Render failed',
        mount_failed: 'Mount failed',
        cannot_display_loading: 'Cannot display app-level loading',
      },
      retry: {
        retrying: 'Retrying request ({count}/{max}), next retry delay: {delay}ms',
        failed: 'Request retry failed ({count}/{max}), please check network connection',
        normal: 'Network connection normal',
        request_retry: 'Request retry',
        delay: ', delay',
      },
      apps: {
        logistics: 'Logistics App',
        engineering: 'Engineering App',
        quality: 'Quality App',
        production: 'Production App',
        app: 'App',
      },
      system: {
        btc_shop_management: 'BTC Shop Management',
        btc_shop_management_system_logistics: 'BTC Shop Management System - Logistics App',
        logistics_module: 'Logistics Module',
        bellis: 'Bellis',
        address: 'Nanshan District, Shenzhen',
        loading_resources: 'Loading system resources...',
        loading_resources_subtitle: 'Initial loading may take some time, please wait patiently',
        simplified_chinese: 'Simplified Chinese',
        english: 'English',
        app_config_not_found: 'App config not found',
        container_not_in_dom: 'Container #subapp-viewport not in DOM',
        container_not_in_dom_cannot_load: 'Container #subapp-viewport not in DOM, cannot load app',
        container_still_invisible: 'Container #subapp-viewport still invisible, force show',
        container_not_found: 'Container #subapp-viewport not found within {time}ms',
        container_not_exists: 'Container #subapp-viewport does not exist, cannot load app',
      },
      confirm: {
        confirm: 'Confirm',
        ok: 'OK',
        cancel: 'Cancel',
      },
      operation: {
        success: 'Operation successful',
        failed: 'Operation failed, please try again later',
      },
      // UI 相关
      ui: {
        export: 'Export',
        export_success: 'Export successful',
        export_failed: 'Export failed',
      },
      other: {
        data_truncated: '[Data too large, truncated]',
        more_data_truncated: '[More data truncated]',
        depth_exceeded: '[Depth exceeded]',
        test_message: 'Test message',
        not_exists: 'Not exists',
        error: 'Error',
        failed: 'Failed',
        exception: 'Exception',
        invalid: 'Invalid',
        expired: 'Expired',
        rejected: 'Rejected',
        forbidden: 'Forbidden',
        not_found: 'Not found',
        cannot: 'Cannot',
        cannot_do: 'Cannot do',
        missing: 'Missing',
        insufficient: 'Insufficient',
        resource_not_found: 'Requested resource not found',
        unknown_error: 'Unknown error',
        identity_expired: 'Identity expired, please login again',
        listener_error: 'Listener execution error (key: {key})',
        request_no_token: 'Request {url} has no token',
        request_log_queue_full: 'Request log queue full ({size}), dropping oldest log',
        param_serialize_failed: 'Parameter serialization failed, using empty object:',
        service_not_initialized: 'Service not initialized, cannot send request log',
        request_log_service_unavailable: 'Request log service unavailable',
        batch_send_failed: 'Batch send request log failed (retried):',
        request_log_service_reenabled: 'Request log service re-enabled, continuing to send queued data',
        loading_failed: 'Failed to load "{name}", please refresh and retry',
        app_load_failed: '[App load failed]',
        manifest_injected: 'App config injected from manifest:',
        manifest_inject_failed: 'Failed to inject config from manifest:',
      },
      plugin: {
        user_setting: 'User Settings',
        user_setting_description: 'Provides user preference settings and theme configuration',
      },
      // 仓储模块相关
      warehouse: {
        material: {
          fields: {
            material_code: 'Material Code',
            material_name: 'Material Name',
            material_type: 'Material Type',
            specification: 'Specification',
            material_texture: 'Material Texture',
            unit: 'Unit',
            supplier_code: 'Supplier Code',
            supplier_name: 'Supplier Name',
            unit_price: 'Unit Price',
            tax_rate: 'Tax Rate',
            total_price: 'Total Price (Including Tax)',
            bar_code: 'Bar Code',
            safety_stock: 'Safety Stock',
            storage_requirement: 'Storage Requirement',
            expire_cycle: 'Expire Cycle',
            remark: 'Remark',
            created_at: 'Created At',
            updated_at: 'Updated At',
          },
        },
      },
      // 盘点模块相关
      inventory: {
        storage_location: {
          fields: {
            name: 'Name',
            position: 'Position',
            description: 'Description',
            domain_id: 'Domain ID',
            createdAt: 'Created At',
            updatedAt: 'Updated At',
          },
        },
        info: {
          fields: {
            check_no: 'Check No',
            domain_id: 'Domain ID',
            check_type: 'Check Type',
            check_status: 'Check Status',
            start_time: 'Start Time',
            end_time: 'End Time',
            checker_id: 'Checker ID',
            remark: 'Remark',
            created_at: 'Created At',
            update_at: 'Updated At',
          },
        },
        detail: {
          fields: {
            material_code: 'Material Code',
            diff_reason: 'Difference Reason',
            process_person: 'Process Person',
            process_time: 'Process Time',
            process_remark: 'Process Remark',
            check_no: 'Check Process ID',
            position: 'Position',
            diff_qty: 'Difference Quantity',
          },
        },
        result: {
          fields: {
            material_code: 'Material Code',
            position: 'Position',
            book_qty: 'Book Quantity',
            actual_qty: 'Actual Quantity',
            diff_qty: 'Difference Quantity',
          },
        },
        sub_process: {
          fields: {
            sub_process_no: 'Sub Process No',
            check_status: 'Check Status',
            start_time: 'Start Time',
            end_time: 'End Time',
            remaining_seconds: 'Remaining Seconds',
            parent_process_no: 'Parent Process No',
          },
        },
        check: {
          fields: {
            base_id: 'Related Check Task',
            material_code: 'Material Code',
            material_name: 'Material Name',
            specification: 'Material Specification',
            unit: 'Unit',
            batch_no: 'Batch No',
            book_qty: 'Book Quantity',
            actual_qty: 'Actual Quantity',
            storage_location: 'Storage Location',
            diff_qty: 'Difference Quantity',
            diff_rate: 'Difference Rate',
            checker_id: 'Checker ID',
            is_diff: 'Has Difference',
            remark: 'Detail Remark',
          },
        },
        // 页面相关配置（从 page 层级移到这里，因为支持多层嵌套）
        base: {
          button: {
            pull: 'Pull Data',
          },
          pull: {
            success: 'Data pulled successfully',
            failed: 'Failed to pull data',
          },
          fields: {
            check_status: {
              notStarted: 'Not Started',
              inProgress: 'In Progress',
              completed: 'Completed',
            },
          },
        },
        diff: {
          detail: {
            title: 'Difference Record Detail',
          },
          fields: {
            diff_reason: 'Difference Reason',
            process_time: 'Process Time',
            process_remark: 'Process Remark',
            material_code: 'Material Code',
            position: 'Position',
          },
        },
        result_page: {
          detail: {
            title: 'Inventory Result Detail',
          },
          search_placeholder: 'Search inventory results',
        },
        subProcess: {
          detail: {
            title: 'Sub Process Detail',
          },
        },
      },
    },
  },
} satisfies AppLevelLocaleConfig;
