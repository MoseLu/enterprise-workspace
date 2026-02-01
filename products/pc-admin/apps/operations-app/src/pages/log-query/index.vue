<template>
  <div class="page">
    <BtcCrud ref="crudRef" :service="logService" :on-before-refresh="handleBeforeRefresh" :options="crudOptions">
      <BtcCrudRow>
        <BtcRefreshBtn />
        <BtcCrudFlex1 />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </BtcCrudRow>
      <!-- 筛选表单 -->
      <BtcCrudRow>
        <div class="filter-form-container">
          <!-- 表单头部：标题和展开/收起按钮 -->
          <div class="filter-form-header">
            <span class="filter-form-title">筛选条件</span>
            <el-button
              link
              type="primary"
              size="small"
              @click="isExpanded = !isExpanded"
              class="filter-form-expand-toggle"
            >
              {{ isExpanded ? '收起' : '展开' }}
              <el-icon style="margin-left: 4px">
                <ArrowUp v-if="isExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </div>
          <!-- 表单内容 -->
          <div class="filter-form-content">
            <el-form :model="filters" label-position="top" @submit.prevent="handleSearch">
              <BtcRow :gutter="10">
                <BtcCol :span="6">
                  <el-form-item label="应用名称">
                    <el-select
                      v-model="filters.appId"
                      placeholder="请选择应用名称"
                      clearable
                      filterable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in filterOptions.appIds"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6">
                  <el-form-item label="消息关键词">
                    <el-input
                      v-model="filters.messageKeyword"
                      placeholder="请输入消息关键词"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6">
                  <el-form-item label="时间范围">
                    <el-date-picker
                      v-model="filters.timeRange"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                      style="width: 100%"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6">
                  <el-form-item label="日志级别">
                    <el-select
                      v-model="filters.logLevel"
                      placeholder="请选择日志级别"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in filterOptions.logLevels"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="日志名称">
                    <el-select
                      v-model="filters.loggerName"
                      placeholder="请输入或选择日志名称"
                      clearable
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in loggerNameOptions"
                        :key="option"
                        :label="option"
                        :value="option"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="生命周期">
                    <el-select
                      v-model="filters.microAppLifecycle"
                      placeholder="请选择生命周期"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in filterOptions.microAppLifecycles"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="用户ID">
                    <el-input
                      v-model="filters.userId"
                      placeholder="请输入用户ID"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 微前端信息 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="微应用类型">
                    <el-select
                      v-model="filters.microAppType"
                      placeholder="请选择微应用类型"
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in filterOptions.microAppTypes"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="微应用名称">
                    <el-select
                      v-model="filters.microAppName"
                      placeholder="请选择微应用名称"
                      clearable
                      filterable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="option in filterOptions.microAppNames"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="微应用实例ID">
                    <el-input
                      v-model="filters.microAppInstanceId"
                      placeholder="请输入微应用实例ID"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 事件类型和会话 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="事件类型">
                    <el-input
                      v-model="filters.eventType"
                      placeholder="多个用逗号分隔，如：api:request,api:response"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="会话ID">
                    <el-input
                      v-model="filters.sessionId"
                      placeholder="请输入会话ID"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 路由查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="路由路径">
                    <el-input
                      v-model="filters.routePath"
                      placeholder="请输入路由路径"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="路由名称">
                    <el-input
                      v-model="filters.routeName"
                      placeholder="请输入路由名称"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- API 查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="API端点">
                    <el-input
                      v-model="filters.apiEndpoint"
                      placeholder="请输入API端点"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="HTTP方法">
                    <el-select
                      v-model="filters.apiMethod"
                      placeholder="请选择HTTP方法"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="GET" value="GET" />
                      <el-option label="POST" value="POST" />
                      <el-option label="PUT" value="PUT" />
                      <el-option label="DELETE" value="DELETE" />
                      <el-option label="PATCH" value="PATCH" />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="HTTP状态码">
                    <el-input-number
                      v-model="filters.apiStatusCode"
                      placeholder="请输入HTTP状态码"
                      :min="100"
                      :max="599"
                      clearable
                      style="width: 100%"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="API响应时间范围（毫秒）">
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <el-input-number
                        v-model="filters.apiResponseTimeRange.min"
                        placeholder="最小值"
                        :min="0"
                        style="flex: 1"
                      />
                      <span>至</span>
                      <el-input-number
                        v-model="filters.apiResponseTimeRange.max"
                        placeholder="最大值"
                        :min="0"
                        style="flex: 1"
                      />
                    </div>
                  </el-form-item>
                </BtcCol>
                <!-- 错误查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="错误类型">
                    <el-input
                      v-model="filters.errorType"
                      placeholder="请输入错误类型"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="错误代码">
                    <el-input
                      v-model="filters.errorCode"
                      placeholder="请输入错误代码"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="是否有错误">
                    <el-select
                      v-model="filters.hasError"
                      placeholder="请选择"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="是" :value="true" />
                      <el-option label="否" :value="false" />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <!-- 性能查询 -->
                <BtcCol :span="24" v-show="isExpanded">
                  <el-form-item label="性能指标范围">
                    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="min-width: 60px;">持续时间：</span>
                        <el-input-number
                          v-model="filters.performanceRange.duration.min"
                          placeholder="最小值"
                          :min="0"
                          style="width: 120px"
                        />
                        <span>至</span>
                        <el-input-number
                          v-model="filters.performanceRange.duration.max"
                          placeholder="最大值"
                          :min="0"
                          style="width: 120px"
                        />
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="min-width: 60px;">FCP：</span>
                        <el-input-number
                          v-model="filters.performanceRange.fcp.min"
                          placeholder="最小值"
                          :min="0"
                          style="width: 120px"
                        />
                        <span>至</span>
                        <el-input-number
                          v-model="filters.performanceRange.fcp.max"
                          placeholder="最大值"
                          :min="0"
                          style="width: 120px"
                        />
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="min-width: 60px;">LCP：</span>
                        <el-input-number
                          v-model="filters.performanceRange.lcp.min"
                          placeholder="最小值"
                          :min="0"
                          style="width: 120px"
                        />
                        <span>至</span>
                        <el-input-number
                          v-model="filters.performanceRange.lcp.max"
                          placeholder="最大值"
                          :min="0"
                          style="width: 120px"
                        />
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="min-width: 60px;">TTFB：</span>
                        <el-input-number
                          v-model="filters.performanceRange.ttfb.min"
                          placeholder="最小值"
                          :min="0"
                          style="width: 120px"
                        />
                        <span>至</span>
                        <el-input-number
                          v-model="filters.performanceRange.ttfb.max"
                          placeholder="最大值"
                          :min="0"
                          style="width: 120px"
                        />
                      </div>
                    </div>
                  </el-form-item>
                </BtcCol>
                <!-- 资源查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="资源类型">
                    <el-select
                      v-model="filters.resourceType"
                      placeholder="请选择资源类型"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="script" value="script" />
                      <el-option label="stylesheet" value="stylesheet" />
                      <el-option label="image" value="image" />
                      <el-option label="font" value="font" />
                      <el-option label="other" value="other" />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="资源URL">
                    <el-input
                      v-model="filters.resourceUrl"
                      placeholder="请输入资源URL"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 用户行为查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="用户操作类型">
                    <el-select
                      v-model="filters.userActionType"
                      placeholder="请选择操作类型"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="click" value="click" />
                      <el-option label="submit" value="submit" />
                      <el-option label="scroll" value="scroll" />
                      <el-option label="focus" value="focus" />
                      <el-option label="blur" value="blur" />
                      <el-option label="change" value="change" />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="操作元素">
                    <el-input
                      v-model="filters.userActionElement"
                      placeholder="请输入操作元素"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="操作（向后兼容）">
                    <el-input
                      v-model="filters.action"
                      placeholder="请输入操作"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 业务查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="业务事件名称">
                    <el-input
                      v-model="filters.businessEventName"
                      placeholder="多个用逗号分隔，如：order:create,order:pay"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="业务事件分类">
                    <el-input
                      v-model="filters.businessEventCategory"
                      placeholder="请输入业务事件分类"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <!-- 系统查询 -->
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="设备类型">
                    <el-select
                      v-model="filters.deviceType"
                      placeholder="请选择设备类型"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="desktop" value="desktop" />
                      <el-option label="mobile" value="mobile" />
                      <el-option label="tablet" value="tablet" />
                    </el-select>
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="浏览器">
                    <el-input
                      v-model="filters.browser"
                      placeholder="请输入浏览器"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
                <BtcCol :span="6" v-show="isExpanded">
                  <el-form-item label="操作系统">
                    <el-input
                      v-model="filters.os"
                      placeholder="请输入操作系统"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </BtcCol>
              </BtcRow>
            </el-form>
          </div>
        </div>
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcTable 
          :columns="columns" 
          :header-background="false" 
          border 
          :disable-auto-created-at="true"
          :auto-height="true"
        />
      </BtcCrudRow>
      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>
    </BtcCrud>
  </div>
</template>

<script setup lang="ts">
import {
  BtcCrud,
  BtcTable,
  BtcPagination,
  BtcRefreshBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcRow,
  BtcCol,
} from '@btc/shared-components';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { usePageColumns, usePageService, registerPageConfig, useI18n } from '@btc/shared-core';
import { sysApi } from '@/modules/api-services/sys';
import config from './config';

// 注册页面配置
registerPageConfig('log.query', config);

// 从 config.ts 读取配置
const { columns } = usePageColumns('log.query');
const logService = usePageService('log.query', 'log.query');
const { t } = useI18n();

// 导入 BtcMessage
import { BtcMessage } from '@btc/shared-components';

// CRUD 选项：onSuccess 只用于增删改操作，不用于查询
// 注意：loadData（查询）不会调用 onSuccess，只有删除、新增、更新操作才会调用
const crudOptions = {
  onSuccess: (message: string) => {
    // onSuccess 只在增删改操作时调用，查询不会调用
    // 所以这里直接显示成功提示即可
    BtcMessage.success(message);
  },
  // 查询完成后显示提示信息（仅当用户主动查询时）
  onAfterRefresh: (data: any) => {
    // 只有用户主动点击查询按钮时才显示消息提示
    if (!isUserSearch.value) {
      return;
    }

    // 处理多种数据格式
    let total = 0;
    if (data) {
      if (typeof data.total === 'number') {
        // 标准格式：{ list: [], total: 25 }
        total = data.total;
      } else if (Array.isArray(data)) {
        // 数组格式：[]
        total = data.length;
      } else if (data.data && Array.isArray(data.data)) {
        // 嵌套格式：{ data: [] }
        total = typeof data.total === 'number' ? data.total : data.data.length;
      }
    }

    if (total > 0) {
      BtcMessage.success(`数据已更新${total}条`);
    }

    // 重置标志位
    isUserSearch.value = false;
  },
};

// BtcCrud 组件引用
const crudRef = ref<InstanceType<typeof BtcCrud> | null>(null);

// 标记是否是用户主动查询（点击查询按钮）
const isUserSearch = ref(false);

// 获取筛选选项并翻译应用名称
const rawFilterOptions = sysApi.logs.getFilterOptions();
const filterOptions = computed(() => {
  // 从 value 中提取 appId（支持两种格式）
  // 格式1：btc-shopflow-{appId}-app（用于 appIds）
  // 格式2：{appId}-app（用于 microAppNames）
  const extractAppId = (value: string): string => {
    if (!value || typeof value !== 'string') {
      return value;
    }
    // 先尝试格式1：btc-shopflow-{appId}-app
    let match = value.match(/btc-shopflow-([^-]+)-app$/);
    if (match) {
      return match[1];
    }
    // 再尝试格式2：{appId}-app
    match = value.match(/^([^-]+)-app$/);
    if (match) {
      return match[1];
    }
    // 如果都不匹配，返回原始值
    return value;
  };

  // 获取应用显示名称：优先使用 domain.type.{appId}，如果失败则使用原始 label
  const getAppDisplayName = (option: { label: string; value: string }): string => {
    // 从 value 中提取 appId
    const appId = extractAppId(option.value);

    // 优先使用 domain.type.{appId} 翻译
    const domainTypeKey = `domain.type.${appId}`;
    const domainTypeTranslated = t(domainTypeKey);
    if (domainTypeTranslated && domainTypeTranslated !== domainTypeKey) {
      return domainTypeTranslated;
    }

    // 如果 domain.type.{appId} 翻译失败，检查 label 是否是国际化键
    if (option.label && typeof option.label === 'string' && option.label.includes('.')) {
      const translated = t(option.label);
      // 如果翻译成功（返回值不等于 key），使用翻译结果
      if (translated !== option.label) {
        return translated;
      }
    }

    // 最后使用原始 label 或 appId
    return option.label || appId;
  };

  return {
    appIds: rawFilterOptions.appIds.map(option => ({
      ...option,
      label: getAppDisplayName(option),
    })),
    logLevels: rawFilterOptions.logLevels,
    microAppTypes: rawFilterOptions.microAppTypes,
    microAppNames: rawFilterOptions.microAppNames.map(option => ({
      ...option,
      label: getAppDisplayName(option),
    })),
    microAppLifecycles: rawFilterOptions.microAppLifecycles,
  };
});

// 筛选条件（扩展后的查询参数结构）
const filters = reactive({
  // 基础查询
  appId: '',
  logLevel: '',
  loggerName: '',
  messageKeyword: '',
  timeRange: null as [string, string] | null,
  
  // 微前端信息
  microAppType: '',
  microAppName: '',
  microAppInstanceId: '',
  microAppLifecycle: '',
  
  // 事件类型
  eventType: '',
  
  // 会话和用户
  sessionId: '',
  userId: '',
  
  // 路由查询
  routePath: '',
  routeName: '',
  
  // API 查询
  apiEndpoint: '',
  apiMethod: '',
  apiStatusCode: null as number | null,
  apiResponseTimeRange: {} as { min?: number; max?: number },
  
  // 错误查询
  errorType: '',
  errorCode: '',
  hasError: null as boolean | null,
  
  // 性能查询
  performanceRange: {
    duration: {},
    fcp: {},
    lcp: {},
    fid: {},
    cls: {},
    ttfb: {},
  } as {
    duration?: { min?: number; max?: number };
    fcp?: { min?: number; max?: number };
    lcp?: { min?: number; max?: number };
    fid?: { min?: number; max?: number };
    cls?: { min?: number; max?: number };
    ttfb?: { min?: number; max?: number };
  },
  
  // 资源查询
  resourceType: '',
  resourceUrl: '',
  
  // 用户行为查询
  userActionType: '',
  userActionElement: '',
  
  // 业务查询
  businessEventName: '',
  businessEventCategory: '',
  
  // 系统查询
  deviceType: '',
  browser: '',
  os: '',
  
  // 向后兼容的字段
  action: '', // 保留，映射到 userActionType
});

// 展开/收起状态
const isExpanded = ref(false);

// loggerName 选项（允许用户输入，这里提供一个空数组，用户可以自由输入）
const loggerNameOptions = ref<string[]>([]);

// 查询
const handleSearch = () => {
  // 标记为用户主动查询
  isUserSearch.value = true;

  // 通过 ref 获取 crud 实例（BtcCrud 通过 defineExpose 暴露了 crud 和所有 crud 方法）
  if (crudRef.value) {
    if (typeof crudRef.value.handleRefresh === 'function') {
      crudRef.value.handleRefresh();
    } else if (typeof crudRef.value.refresh === 'function') {
      crudRef.value.refresh();
    } else {
      console.warn('[log-query] crud 实例不可用，无法触发查询');
      // 如果查询失败，重置标志位
      isUserSearch.value = false;
    }
  } else {
    console.warn('[log-query] crudRef 未初始化，无法触发查询');
    // 如果查询失败，重置标志位
    isUserSearch.value = false;
  }
};

// 重置
const handleReset = () => {
  // 基础查询
  filters.appId = '';
  filters.logLevel = '';
  filters.loggerName = '';
  filters.messageKeyword = '';
  filters.timeRange = null;
  
  // 微前端信息
  filters.microAppType = '';
  filters.microAppName = '';
  filters.microAppInstanceId = '';
  filters.microAppLifecycle = '';
  
  // 事件类型
  filters.eventType = '';
  
  // 会话和用户
  filters.sessionId = '';
  filters.userId = '';
  
  // 路由查询
  filters.routePath = '';
  filters.routeName = '';
  
  // API 查询
  filters.apiEndpoint = '';
  filters.apiMethod = '';
  filters.apiStatusCode = null;
  filters.apiResponseTimeRange = {};
  
  // 错误查询
  filters.errorType = '';
  filters.errorCode = '';
  filters.hasError = null;
  
  // 性能查询
  filters.performanceRange = {
    duration: {},
    fcp: {},
    lcp: {},
    fid: {},
    cls: {},
    ttfb: {},
  };
  
  // 资源查询
  filters.resourceType = '';
  filters.resourceUrl = '';
  
  // 用户行为查询
  filters.userActionType = '';
  filters.userActionElement = '';
  
  // 业务查询
  filters.businessEventName = '';
  filters.businessEventCategory = '';
  
  // 系统查询
  filters.deviceType = '';
  filters.browser = '';
  filters.os = '';
  
  // 向后兼容
  filters.action = '';
  
  handleSearch();
};

// 刷新前钩子：将筛选条件转换为查询参数
const handleBeforeRefresh = (params: Record<string, any>) => {
  // 获取最新的 filters 值（确保读取的是 reactive 对象的最新值）
  const currentFilters = { ...filters };

  // 始终创建 keyword 对象，即使所有筛选条件都为空
  const keyword: Record<string, any> = {};

  // 将所有筛选条件添加到 keyword 对象中，即使值为空字符串也包含
  // 这样后端可以正确处理空值
  
  // 基础查询
  keyword.appId = currentFilters.appId || '';
  keyword.logLevel = currentFilters.logLevel || '';
  keyword.loggerName = currentFilters.loggerName || '';
  keyword.messageKeyword = currentFilters.messageKeyword || '';
  
  // 微前端信息
  if (currentFilters.microAppType) keyword.microAppType = currentFilters.microAppType;
  if (currentFilters.microAppName) keyword.microAppName = currentFilters.microAppName;
  if (currentFilters.microAppInstanceId) keyword.microAppInstanceId = currentFilters.microAppInstanceId;
  if (currentFilters.microAppLifecycle) keyword.microAppLifecycle = currentFilters.microAppLifecycle;
  
  // 事件类型
  if (currentFilters.eventType) keyword.eventType = currentFilters.eventType;
  
  // 会话和用户
  if (currentFilters.sessionId) keyword.sessionId = currentFilters.sessionId;
  if (currentFilters.userId) keyword.userId = currentFilters.userId;
  
  // 路由查询
  if (currentFilters.routePath) keyword.routePath = currentFilters.routePath;
  if (currentFilters.routeName) keyword.routeName = currentFilters.routeName;
  
  // API 查询
  if (currentFilters.apiEndpoint) keyword.apiEndpoint = currentFilters.apiEndpoint;
  if (currentFilters.apiMethod) keyword.apiMethod = currentFilters.apiMethod;
  if (currentFilters.apiStatusCode !== null) keyword.apiStatusCode = currentFilters.apiStatusCode;
  // 只有当 apiResponseTimeRange 有值时才添加
  if (currentFilters.apiResponseTimeRange && (currentFilters.apiResponseTimeRange.min !== undefined || currentFilters.apiResponseTimeRange.max !== undefined)) {
    keyword.apiResponseTimeRange = currentFilters.apiResponseTimeRange;
  }
  
  // 错误查询
  if (currentFilters.errorType) keyword.errorType = currentFilters.errorType;
  if (currentFilters.errorCode) keyword.errorCode = currentFilters.errorCode;
  if (currentFilters.hasError !== null) keyword.hasError = currentFilters.hasError;
  
  // 性能查询：只有当 performanceRange 有值时才添加
  const hasPerformanceRange = currentFilters.performanceRange && (
    (currentFilters.performanceRange.duration && (currentFilters.performanceRange.duration.min !== undefined || currentFilters.performanceRange.duration.max !== undefined)) ||
    (currentFilters.performanceRange.fcp && (currentFilters.performanceRange.fcp.min !== undefined || currentFilters.performanceRange.fcp.max !== undefined)) ||
    (currentFilters.performanceRange.lcp && (currentFilters.performanceRange.lcp.min !== undefined || currentFilters.performanceRange.lcp.max !== undefined)) ||
    (currentFilters.performanceRange.fid && (currentFilters.performanceRange.fid.min !== undefined || currentFilters.performanceRange.fid.max !== undefined)) ||
    (currentFilters.performanceRange.cls && (currentFilters.performanceRange.cls.min !== undefined || currentFilters.performanceRange.cls.max !== undefined)) ||
    (currentFilters.performanceRange.ttfb && (currentFilters.performanceRange.ttfb.min !== undefined || currentFilters.performanceRange.ttfb.max !== undefined))
  );
  if (hasPerformanceRange) {
    keyword.performanceRange = currentFilters.performanceRange;
  }
  
  // 资源查询
  if (currentFilters.resourceType) keyword.resourceType = currentFilters.resourceType;
  if (currentFilters.resourceUrl) keyword.resourceUrl = currentFilters.resourceUrl;
  
  // 用户行为查询
  if (currentFilters.userActionType) keyword.userActionType = currentFilters.userActionType;
  if (currentFilters.userActionElement) keyword.userActionElement = currentFilters.userActionElement;
  
  // 业务查询
  if (currentFilters.businessEventName) keyword.businessEventName = currentFilters.businessEventName;
  if (currentFilters.businessEventCategory) keyword.businessEventCategory = currentFilters.businessEventCategory;
  
  // 系统查询
  if (currentFilters.deviceType) keyword.deviceType = currentFilters.deviceType;
  if (currentFilters.browser) keyword.browser = currentFilters.browser;
  if (currentFilters.os) keyword.os = currentFilters.os;
  
  // 向后兼容的字段
  if (currentFilters.action) keyword.action = currentFilters.action;
  // 如果 action 有值但 userActionType 为空，将 action 映射到 userActionType
  if (currentFilters.action && !currentFilters.userActionType) {
    keyword.userActionType = currentFilters.action;
  }

  // 处理时间范围（放在 keyword 对象中）
  if (currentFilters.timeRange && Array.isArray(currentFilters.timeRange) && currentFilters.timeRange.length === 2) {
    keyword.timeRange = {
      startTime: currentFilters.timeRange[0],
      endTime: currentFilters.timeRange[1],
    };
  }

  // 始终设置 keyword 对象，即使为空对象也要传递
  // 合并已有的 keyword（如果有的话）
  params.keyword = { ...(params.keyword || {}), ...keyword };

  return params;
};
</script>

<style lang="scss" scoped>

.filter-form-container {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;

  .filter-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color);

    .filter-form-title {
      font-weight: 500;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .filter-form-expand-toggle {
      padding: 0;
    }
  }

  .filter-form-content {
    padding: 10px 10px 0 10px; // 顶部、左右有 padding，底部由最后一行的 margin-bottom 控制
    box-sizing: border-box;

    // 确保 el-form 和 el-form-item 不会产生额外的 margin/padding
    :deep(.el-form) {
      margin: 0;
      padding: 0;
    }

    // 确保 el-form-item 不会因为 label 宽度而产生额外的左边距
    // Element Plus 的 gutter 机制会自动处理 el-row 和 el-col 的 margin/padding
    // 我们只需要确保 el-form-item 占满 col 的宽度，且没有额外的 margin
    :deep(.el-form-item) {
      margin-left: 0;
      margin-right: 0;
      width: 100%; // 确保表单项占满 col 的宽度
    }

    // 给所有表单项添加 margin-bottom（用于行间距和底部间距）
    :deep(.el-col .el-form-item) {
      margin-bottom: 10px;
    }

    // 每行的最后一个表单项不需要右侧 margin，但保留底部 margin 用于行间距
    // 注意：这里的 last-child 是针对同一行的最后一个，不是整个表单的最后一个
    // 实际上每行的最后一个表单项仍然需要 margin-bottom，因为下面可能还有下一行

  }
}
</style>
