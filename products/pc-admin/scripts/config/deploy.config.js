/**
 * 部署配置
 */

export const deployConfig = {
  // 部署环境
  environments: {
    development: {
      name: '开发环境',
      baseUrl: process.env.DEV_BASE_URL || '',
    },
    poc: {
      name: 'POC 环境',
      baseUrl: process.env.POC_BASE_URL || '',
    },
    sit: {
      name: 'SIT 环境',
      baseUrl: process.env.SIT_BASE_URL || '',
    },
    uat: {
      name: 'UAT 环境',
      baseUrl: process.env.UAT_BASE_URL || '',
    },
    test: {
      name: '测试环境',
      baseUrl: process.env.TEST_BASE_URL || '',
    },
    production: {
      name: '生产环境',
      baseUrl: process.env.PROD_BASE_URL || '',
    },
  },
  
  // 部署方式
  methods: {
    static: 'static',      // 静态文件部署
    k8s: 'k8s',            // Kubernetes 部署
    docker: 'docker',      // Docker 部署
  },
  
  // 部署选项
  options: {
    skipBuild: false,
    skipTest: false,
    force: false,
  },
};
