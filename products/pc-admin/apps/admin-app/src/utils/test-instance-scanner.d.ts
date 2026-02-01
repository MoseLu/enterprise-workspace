/**
 * 测试实例扫描器
 * 自动扫描 test 目录下的所有测试实例
 */
export interface TestInstanceConfig {
    name: string;
    title: string;
    description: string;
    icon: string;
    tags: string[];
    path: string;
}
/**
 * 测试实例配置映射
 * 每个测试实例都需要在这里注册配置信息
 */
export declare const TEST_INSTANCE_CONFIGS: Record<string, TestInstanceConfig>;
/**
 * 动态导入测试实例组件
 */
export declare function loadTestInstanceComponent(instanceName: string): Promise<any>;
/**
 * 获取所有测试实例配置
 */
export declare function getAllTestInstanceConfigs(): TestInstanceConfig[];
/**
 * 根据名称获取测试实例配置
 */
export declare function getTestInstanceConfig(name: string): TestInstanceConfig | undefined;
/**
 * 检查测试实例是否存在
 */
export declare function hasTestInstance(name: string): boolean;
/**
 * 添加新的测试实例配置
 * 当创建新的测试实例时，需要调用此函数注册配置
 */
export declare function registerTestInstance(config: TestInstanceConfig): void;
/**
 * 移除测试实例配置
 */
export declare function unregisterTestInstance(name: string): void;
