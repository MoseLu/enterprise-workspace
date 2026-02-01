;
import type { App, Directive } from 'vue';

/**
 * 权限指令插件
 * 用于控制元素的显示/隐藏基于用户权限
 */
export interface PermissionPluginOptions {
  /**
   * 获取用户权限列表的函数
   * @returns 用户权限列表
   */
  getUserPermissions?: () => string[];

  /**
   * 权限检查函数
   * @param permission 权限标识
   * @param userPermissions 用户权限列表
   * @returns 是否有权限
   */
  checkPermission?: (permission: string, userPermissions: string[]) => boolean;
}

/**
 * 默认权限检查函数
 */
const defaultCheckPermission = (permission: string, userPermissions: string[]): boolean => {
  if (!permission) return true;
  if (!userPermissions || userPermissions.length === 0) return false;

  // 支持通配符匹配
  if (permission.includes('*')) {
    const pattern = permission.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return userPermissions.some(p => regex.test(p));
  }

  // 精确匹配
  return userPermissions.includes(permission);
};

/**
 * 默认获取用户权限函数
 */
const defaultGetUserPermissions = (): string[] => {
  // 从 localStorage 或其他地方获取用户权限
  // 这里返回一个默认的权限列表，实际项目中应该从用户信息中获取
  return ['*']; // 默认拥有所有权限
};

/**
 * 权限指令
 */
const permissionDirective: Directive = {
  mounted(el, binding) {
    const { value: permission, instance } = binding;
    const app = (instance as any)?.appContext?.app;

    if (!app) {
      console.warn('[permission] 无法获取 app 实例');
      return;
    }

    // 获取插件选项
    const options = app.config.globalProperties.$permissionOptions || {};
    const getUserPermissions = options.getUserPermissions || defaultGetUserPermissions;
    const checkPermission = options.checkPermission || defaultCheckPermission;

    // 获取用户权限
    const userPermissions = getUserPermissions();

    // 检查权限
    const hasPermission = checkPermission(permission, userPermissions);

    // 如果没有权限，隐藏元素
    if (!hasPermission) {
      el.style.display = 'none';
      // 或者完全移除元素
      // el.remove();
    }
  },

  updated(el, binding) {
    // 权限更新时重新检查
    const { value: permission, instance } = binding;
    const app = (instance as any)?.appContext?.app;

    if (!app) {
      return;
    }

    // 获取插件选项
    const options = app.config.globalProperties.$permissionOptions || {};
    const getUserPermissions = options.getUserPermissions || defaultGetUserPermissions;
    const checkPermission = options.checkPermission || defaultCheckPermission;

    // 获取用户权限
    const userPermissions = getUserPermissions();

    // 检查权限
    const hasPermission = checkPermission(permission, userPermissions);

    // 如果没有权限，隐藏元素
    if (!hasPermission) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
};

/**
 * 创建权限插件
 */
export function createPermissionPlugin(options: PermissionPluginOptions = {}) {
  return {
    install(app: App) {
      // 注册权限指令
      app.directive('permission', permissionDirective);

      // 将选项保存到全局属性中
      app.config.globalProperties.$permissionOptions = options;

      // 提供权限检查方法
      app.config.globalProperties.$checkPermission = (permission: string) => {
        const getUserPermissions = options.getUserPermissions || defaultGetUserPermissions;
        const checkPermission = options.checkPermission || defaultCheckPermission;
        const userPermissions = getUserPermissions();
        return checkPermission(permission, userPermissions);
      };
    }
  };
}

/**
 * 权限检查 composable
 */
export function usePermission() {
  const checkPermission = (permission: string): boolean => {
    // 这里可以从 Vue 实例中获取权限检查函数
    // 或者直接调用权限检查逻辑
    const getUserPermissions = defaultGetUserPermissions;
    const checkPermissionFn = defaultCheckPermission;
    const userPermissions = getUserPermissions();
    return checkPermissionFn(permission, userPermissions);
  };

  return {
    checkPermission
  };
}

export default createPermissionPlugin;
