import { c as createRequest, l as loadEpsService, e as exportEpsServiceToGlobal } from "./vendor-tN3qNEcA.js";
import "./auth-api-CvJd6wHo.js";
import "./menu-registry-BOrHQOwD.js";
const request = createRequest("");
const serviceObj = { admin: { test: {
  test: {
    namespace: "/api/system/test/",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 操作失败
     */
    500(data) {
      return request({
        url: "/api/system/test/500",
        method: "GET",
        params: data
      });
    },
    /**
     * 登录失败，未获取到令牌
     */
    511(data) {
      return request({
        url: "/api/system/test/511",
        method: "GET",
        params: data
      });
    },
    /**
     * 系统繁忙，请稍候再试
     */
    501(data) {
      return request({
        url: "/api/system/test/501",
        method: "GET",
        params: data
      });
    },
    /**
     * 获取领域失败
     */
    513(data) {
      return request({
        url: "/api/system/test/513",
        method: "GET",
        params: data
      });
    },
    /**
     * 身份令牌已过期
     */
    517(data) {
      return request({
        url: "/api/system/test/517",
        method: "GET",
        params: data
      });
    },
    /**
     * 没有该工号
     */
    520(data) {
      return request({
        url: "/api/system/test/520",
        method: "GET",
        params: data
      });
    },
    /**
     * 获取客户端id失败
     */
    514(data) {
      return request({
        url: "/api/system/test/514",
        method: "GET",
        params: data
      });
    },
    /**
     * 参数不能为空
     */
    522(data) {
      return request({
        url: "/api/system/test/522",
        method: "GET",
        params: data
      });
    },
    /**
     * 连接keycloak失败
     */
    516(data) {
      return request({
        url: "/api/system/test/516",
        method: "GET",
        params: data
      });
    },
    /**
     * 初始密码错误
     */
    521(data) {
      return request({
        url: "/api/system/test/521",
        method: "GET",
        params: data
      });
    },
    /**
     * 获取到的身份令牌为空
     */
    518(data) {
      return request({
        url: "/api/system/test/518",
        method: "GET",
        params: data
      });
    },
    /**
     * keycloak客户端地址错误
     */
    512(data) {
      return request({
        url: "/api/system/test/512",
        method: "GET",
        params: data
      });
    },
    /**
     * 获取客户端密钥失败
     */
    515(data) {
      return request({
        url: "/api/system/test/515",
        method: "GET",
        params: data
      });
    },
    /**
     * 手机号不存在
     */
    527(data) {
      return request({
        url: "/api/system/test/527",
        method: "GET",
        params: data
      });
    },
    /**
     * 账号已存在
     */
    524(data) {
      return request({
        url: "/api/system/test/524",
        method: "GET",
        params: data
      });
    },
    /**
     * 邮箱不存在
     */
    529(data) {
      return request({
        url: "/api/system/test/529",
        method: "GET",
        params: data
      });
    },
    /**
     * 验证码已过期
     */
    528(data) {
      return request({
        url: "/api/system/test/528",
        method: "GET",
        params: data
      });
    },
    /**
     * 数据错误
     */
    523(data) {
      return request({
        url: "/api/system/test/523",
        method: "GET",
        params: data
      });
    },
    /**
     * 表单id过期
     */
    526(data) {
      return request({
        url: "/api/system/test/526",
        method: "GET",
        params: data
      });
    },
    /**
     * 方法参数校验异常
     */
    510(data) {
      return request({
        url: "/api/system/test/510",
        method: "GET",
        params: data
      });
    }
  }
}, base: {
  checkTicket: {
    namespace: "/api/system/base/checkTicket",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * savePrint
     */
    print(data) {
      return request({
        url: "/api/system/base/checkTicket/print",
        method: "POST",
        data
      });
    },
    /**
     * 盘点票查询打印
     */
    info(data) {
      return request({
        url: "/api/system/base/checkTicket/info",
        method: "POST",
        data
      });
    }
  },
  profile: {
    namespace: "/api/system/base/profile",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 修改初始密码
     */
    password(data) {
      return request({
        url: "/api/system/base/profile/update/password",
        method: "PUT",
        data
      });
    },
    /**
     * 编辑用户档案信息
     */
    update(data) {
      return request({
        url: "/api/system/base/profile/update",
        method: "POST",
        data
      });
    },
    /**
     * 获取当前用户档案信息
     */
    info(data) {
      return request({
        url: "/api/system/base/profile/info",
        method: "GET",
        params: data
      });
    },
    /**
     * 获取邮箱或手机号的脱敏数据
     */
    verify(data) {
      return request({
        url: "/api/system/base/profile/info/verify",
        method: "POST",
        data
      });
    }
  },
  email: {
    namespace: "/api/system/base/email",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 验证验证码并修改邮箱
     */
    update(data) {
      return request({
        url: "/api/system/base/email/update",
        method: "PUT",
        data
      });
    },
    /**
     * 绑定发送邮箱验证码
     */
    bind(data) {
      return request({
        url: "/api/system/base/email/bind",
        method: "POST",
        data
      });
    },
    /**
     * 校验邮箱或者手机号验证码
     */
    verify(data) {
      return request({
        url: "/api/system/base/email/verify",
        method: "POST",
        data
      });
    },
    /**
     * 发送邮箱验证码
     */
    send(data) {
      return request({
        url: "/api/system/base/email/send",
        method: "POST",
        data
      });
    }
  },
  phone: {
    namespace: "/api/system/base/phone",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 验证码并修改手机号
     */
    update(data) {
      return request({
        url: "/api/system/base/phone/update",
        method: "PUT",
        data
      });
    },
    /**
     * 绑定发送手机号验证码
     */
    bind(data) {
      return request({
        url: "/api/system/base/phone/bind",
        method: "POST",
        data
      });
    },
    /**
     * 校验邮箱或者手机号验证码
     */
    verify(data) {
      return request({
        url: "/api/system/base/phone/verify",
        method: "POST",
        data
      });
    },
    /**
     * 发送手机号验证码
     */
    send(data) {
      return request({
        url: "/api/system/base/phone/send",
        method: "POST",
        data
      });
    }
  }
}, log: {
  deletelog: {
    namespace: "/api/system/log/deletelog",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 恢复数据
     */
    restore(data) {
      return request({
        url: "/api/system/log/deletelog/restore",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询删除操作日志
     */
    page(data) {
      return request({
        url: "/api/system/log/deletelog/page",
        method: "POST",
        data
      });
    },
    /**
     * 批量恢复
     */
    batch(data) {
      return request({
        url: "/api/system/log/deletelog/restore/batch",
        method: "POST",
        data
      });
    }
  },
  config: {
    namespace: "/api/system/log/config",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增配置
     */
    add(data) {
      return request({
        url: "/api/system/log/config/add",
        method: "POST",
        data
      });
    },
    /**
     * 编辑日志配置
     */
    update(data) {
      return request({
        url: "/api/system/log/config/update",
        method: "POST",
        data
      });
    },
    /**
     * 获取日志保存天数
     */
    list(data) {
      return request({
        url: "/api/system/log/config/list",
        method: "GET",
        params: data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/log/config/page",
        method: "POST",
        data
      });
    }
  },
  operation: {
    namespace: "/api/system/log/operation",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页查询操作日志
     */
    page(data) {
      return request({
        url: "/api/system/log/operation/page",
        method: "POST",
        data
      });
    }
  },
  request: {
    namespace: "/api/system/log/request",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 保存请求日志
     */
    update(data) {
      return request({
        url: "/api/system/log/request/update",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询请求日志
     */
    page(data) {
      return request({
        url: "/api/system/log/request/page",
        method: "POST",
        data
      });
    },
    /**
     * 获取日志配置
     */
    getkep(data) {
      return request({
        url: "/api/system/log/request/getkep",
        method: "POST",
        data
      });
    },
    /**
     * 设置日志配置
     */
    setkep(data) {
      return request({
        url: "/api/system/log/request/setkep",
        method: "POST",
        data
      });
    }
  }
}, iam: {
  action: {
    namespace: "/api/system/iam/action",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/action/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/action/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/action/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/action/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/action/page",
        method: "POST",
        data
      });
    }
  },
  department: {
    namespace: "/api/system/iam/department",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/department/page",
        method: "POST",
        data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/department/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/department/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/department/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/department/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/department/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    }
  },
  domain: {
    namespace: "/api/system/iam/domain",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 异步新增域
     */
    add(data) {
      return request({
        url: "/api/system/iam/domain/add",
        method: "POST",
        data
      });
    },
    /**
     * 异步新增域
     */
    add(data) {
      return request({
        url: "/api/system/iam/domain/add",
        method: "POST",
        data
      });
    },
    /**
     * 编辑域
     */
    update(data) {
      return request({
        url: "/api/system/iam/domain/update",
        method: "PUT",
        data
      });
    },
    /**
     * 编辑域
     */
    update(data) {
      return request({
        url: "/api/system/iam/domain/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询当前用户有哪些域
     */
    me(data) {
      return request({
        url: "/api/system/iam/domain/me",
        method: "GET",
        params: data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/domain/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/domain/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/domain/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/domain/page",
        method: "POST",
        data
      });
    }
  },
  menu: {
    namespace: "/api/system/iam/menu",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/menu/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/menu/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/menu/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/menu/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/menu/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/menu/page",
        method: "POST",
        data
      });
    }
  },
  module: {
    namespace: "/api/system/iam/module",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 异步新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/module/add",
        method: "POST",
        data
      });
    },
    /**
     * 异步新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/module/add",
        method: "POST",
        data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/module/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/module/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/module/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/module/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/module/page",
        method: "POST",
        data
      });
    }
  },
  permission: {
    namespace: "/api/system/iam/permission",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/permission/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/permission/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/permission/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/permission/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/permission/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/permission/page",
        method: "POST",
        data
      });
    }
  },
  plugin: {
    namespace: "/api/system/iam/plugin",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/plugin/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/plugin/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/plugin/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/plugin/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/plugin/page",
        method: "POST",
        data
      });
    }
  },
  resource: {
    namespace: "/api/system/iam/resource",
    search: { "fieldEq": [{ "comment": "资源编码", "nullable": true, "propertyName": "resourceCode", "source": "resource_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源中文名", "nullable": true, "propertyName": "resourceNameCn", "source": "resource_name_cn", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源英文名", "nullable": true, "propertyName": "resourceNameEn", "source": "resource_name_en", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源类型", "nullable": true, "propertyName": "resourceType", "source": "resource_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "数据库表名", "nullable": true, "propertyName": "tableName", "source": "table_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 查询资源列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/resource/list",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询资源
     */
    page(data) {
      return request({
        url: "/api/system/iam/resource/page",
        method: "POST",
        data
      });
    },
    /**
     * 拉取资源
     */
    pull(data) {
      return request({
        url: "/api/system/iam/resource/pull",
        method: "GET",
        params: data
      });
    }
  },
  role: {
    namespace: "/api/system/iam/role",
    search: { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "角色名称", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "userId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "所属域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/role/page",
        method: "POST",
        data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/role/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/role/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/role/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/role/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/role/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    }
  },
  rolePermission: {
    namespace: "/api/system/iam/role-permission",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/iam/role-permission/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/role-permission/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/role-permission/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/role-permission/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/role-permission/page",
        method: "POST",
        data
      });
    }
  },
  tenant: {
    namespace: "/api/system/iam/tenant",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 异步新增租户
     */
    add(data) {
      return request({
        url: "/api/system/iam/tenant/add",
        method: "POST",
        data
      });
    },
    /**
     * 异步新增租户
     */
    add(data) {
      return request({
        url: "/api/system/iam/tenant/add",
        method: "POST",
        data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/tenant/delete/batch",
        method: "POST",
        data
      });
    },
    /**
     * 模糊搜索供应商租户
     */
    like(data) {
      return request({
        url: "/api/system/iam/tenant/tenant/like",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/iam/tenant/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/tenant/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/iam/tenant/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/tenant/page",
        method: "POST",
        data
      });
    }
  },
  user: {
    namespace: "/api/system/iam/user",
    search: { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "登录名", "nullable": true, "propertyName": "username", "source": "username", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 用户分配
     */
    update(data) {
      return request({
        url: "/api/system/iam/user/update",
        method: "POST",
        data
      });
    },
    /**
     * 用户列表
     */
    list(data) {
      return request({
        url: "/api/system/iam/user/list",
        method: "POST",
        data
      });
    },
    /**
     * 用户列表数据
     */
    data(data) {
      return request({
        url: "/api/system/iam/user/data",
        method: "POST",
        data
      });
    },
    /**
     * 删除用户
     */
    delete(data) {
      return request({
        url: "/api/system/iam/user/delete",
        method: "DELETE",
        params: data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/iam/user/page",
        method: "POST",
        data
      });
    },
    /**
     * 批量删除
     */
    batch(data) {
      return request({
        url: "/api/system/iam/user/delete/batch",
        method: "POST",
        data
      });
    }
  },
  userRole: {
    namespace: "/api/system/iam/user-role",
    search: { "fieldEq": [{ "comment": "用户id", "nullable": true, "propertyName": "userId", "source": "user_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [{ "comment": "roleName", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "keyWordLikeFields": [] },
    /**
     * 用户解绑角色
     */
    unbind(data) {
      return request({
        url: "/api/system/iam/user-role/unbind",
        method: "POST",
        data
      });
    },
    /**
     * 用户名筛选角色
     */
    data(data) {
      return request({
        url: "/api/system/iam/user-role/data",
        method: "POST",
        data
      });
    },
    /**
     * 批量新增授权
     */
    batchBind(data) {
      return request({
        url: "/api/system/iam/user-role/batchBind",
        method: "POST",
        data
      });
    },
    /**
     * 查询用户角色信息
     */
    page(data) {
      return request({
        url: "/api/system/iam/user-role/page",
        method: "POST",
        data
      });
    },
    /**
     * 修改绑定角色
     */
    modifyBind(data) {
      return request({
        url: "/api/system/iam/user-role/modifyBind",
        method: "PUT",
        data
      });
    },
    /**
     * 批量解绑角色
     */
    batchUnbind(data) {
      return request({
        url: "/api/system/iam/user-role/batchUnbind",
        method: "POST",
        data
      });
    }
  }
}, dict: {
  dictData: {
    namespace: "/api/system/dict/data",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增字典数据
     */
    add(data) {
      return request({
        url: "/api/system/dict/data/add",
        method: "POST",
        data
      });
    },
    /**
     * 更新字典数据
     */
    update(data) {
      return request({
        url: "/api/system/dict/data/update",
        method: "PUT",
        data
      });
    },
    /**
     * 列表查询字典数据
     */
    list(data) {
      return request({
        url: "/api/system/dict/data/list",
        method: "POST",
        data
      });
    },
    /**
     * 删除字典数据
     */
    delete(data) {
      return request({
        url: "/api/system/dict/data/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询字典数据
     */
    page(data) {
      return request({
        url: "/api/system/dict/data/page",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID查询字典数据
     */
    info(data) {
      return request({
        url: "/api/system/dict/data/info/{id}",
        method: "GET",
        params: data
      });
    },
    /**
     * 批量获取下拉菜单
     */
    batch(data) {
      return request({
        url: "/api/system/dict/data/options/batch",
        method: "POST",
        data
      });
    },
    /**
     * 获取所有下拉菜单
     */
    all(data) {
      return request({
        url: "/api/system/dict/data/options/all",
        method: "GET",
        params: data
      });
    }
  },
  info: {
    namespace: "/api/system/dict/info",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/dict/info/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/dict/info/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/system/dict/info/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/system/dict/info/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/dict/info/page",
        method: "POST",
        data
      });
    }
  }
} }, logistics: { base: {
  position: {
    namespace: "/api/logistics/warehouse/position",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 根据用户名查询域与仓位信息
     */
    me(data) {
      return request({
        url: "/api/logistics/warehouse/position/me",
        method: "GET",
        params: data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/position/page",
        method: "POST",
        data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/logistics/warehouse/position/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/position/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/logistics/warehouse/position/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/logistics/warehouse/position/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    }
  },
  check: {
    namespace: "/api/logistics/base/inventory/check",
    search: { "fieldEq": [{ "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 物流域结果
     */
    result(data) {
      return request({
        url: "/api/logistics/base/inventory/check/result",
        method: "POST",
        data
      });
    },
    /**
     * 盘点结果表
     */
    page(data) {
      return request({
        url: "/api/logistics/base/inventory/check/page",
        method: "POST",
        data
      });
    },
    /**
     * 物流差异TOP
     */
    top(data) {
      return request({
        url: "/api/logistics/base/inventory/check/top",
        method: "POST",
        data
      });
    }
  }
}, warehouse: {
  check: {
    namespace: "/api/logistics/warehouse/check",
    search: { "fieldEq": [{ "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点类型", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点状态", "nullable": true, "propertyName": "checkStatus", "source": "check_status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 查询盘点基础表列表
     */
    list(data) {
      return request({
        url: "/api/logistics/warehouse/check/list",
        method: "POST",
        data
      });
    },
    /**
     * 查询盘点流程表
     */
    info(data) {
      return request({
        url: "/api/logistics/warehouse/check/info",
        method: "GET",
        params: data
      });
    },
    /**
     * 查询盘点状态
     */
    status(data) {
      return request({
        url: "/api/logistics/warehouse/check/status",
        method: "POST",
        data
      });
    },
    /**
     * 结束盘点
     */
    finish(data) {
      return request({
        url: "/api/logistics/warehouse/check/finish",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询盘点基础表
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/check/page",
        method: "POST",
        data
      });
    },
    /**
     * 拉取syspro数据
     */
    pull(data) {
      return request({
        url: "/api/logistics/warehouse/check/pull",
        method: "GET",
        params: data
      });
    },
    /**
     * 开始盘点
     */
    start(data) {
      return request({
        url: "/api/logistics/warehouse/check/start",
        method: "POST",
        data
      });
    },
    /**
     * 新增盘点基础表
     */
    add(data) {
      return request({
        url: "/api/logistics/warehouse/check/add",
        method: "POST",
        data
      });
    },
    /**
     * 编辑盘点基础表
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/check/update",
        method: "POST",
        data
      });
    },
    /**
     * 删除盘点基础表
     */
    delete(data) {
      return request({
        url: "/api/logistics/warehouse/check/delete",
        method: "POST",
        data
      });
    },
    /**
     * 暂停盘点
     */
    pause(data) {
      return request({
        url: "/api/logistics/warehouse/check/pause",
        method: "POST",
        data
      });
    },
    /**
     * 继续盘点
     */
    recover(data) {
      return request({
        url: "/api/logistics/warehouse/check/recover",
        method: "POST",
        data
      });
    }
  },
  diff: {
    namespace: "/api/logistics/warehouse/diff",
    search: { "fieldEq": [{ "comment": "盘点流程ID", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页接口
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/diff/page",
        method: "POST",
        data
      });
    },
    /**
     * 编辑盘点差异记录
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/diff/update",
        method: "POST",
        data
      });
    },
    /**
     * exportDiff
     */
    export(data) {
      return request({
        url: "/api/logistics/warehouse/diff/export",
        method: "POST",
        data
      });
    }
  },
  subProcess: {
    namespace: "/api/logistics/warehouse/sub-process",
    search: { "fieldEq": [{ "comment": "主流程编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * selectPage
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/sub-process/page",
        method: "POST",
        data
      });
    },
    /**
     * editSubProcess
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/sub-process/update",
        method: "POST",
        data
      });
    },
    /**
     * insertSubProcess
     */
    add(data) {
      return request({
        url: "/api/logistics/warehouse/sub-process/add",
        method: "POST",
        data
      });
    }
  },
  ticket: {
    namespace: "/api/logistics/warehouse/ticket",
    search: { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "partName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 盘点票分页接口
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/ticket/page",
        method: "POST",
        data
      });
    },
    /**
     * 盘点票导入
     */
    import(data) {
      return request({
        url: "/api/logistics/warehouse/ticket/import",
        method: "POST",
        data
      });
    },
    /**
     * 盘点票导出
     */
    export(data) {
      return request({
        url: "/api/logistics/warehouse/ticket/export",
        method: "POST",
        data
      });
    },
    /**
     * 盘点票编辑
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/ticket/update",
        method: "POST",
        data
      });
    }
  },
  material: {
    namespace: "/api/logistics/warehouse/material",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/logistics/warehouse/material/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/logistics/warehouse/material/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/logistics/warehouse/material/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/logistics/warehouse/material/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/logistics/warehouse/material/page",
        method: "POST",
        data
      });
    }
  },
  bom: {
    namespace: "/api/logistics/bom",
    search: { "fieldEq": [{ "comment": "父节点", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子节点", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页查询BOM表
     */
    page(data) {
      return request({
        url: "/api/logistics/bom/page",
        method: "POST",
        data
      });
    }
  },
  data: {
    namespace: "/api/logistics/data",
    search: { "fieldEq": [{ "comment": "库存代码", "nullable": true, "propertyName": "stockCode", "source": "stock_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓库", "nullable": true, "propertyName": "warehouse", "source": "warehouse", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 分页查询数据表
     */
    page(data) {
      return request({
        url: "/api/logistics/data/page",
        method: "POST",
        data
      });
    }
  }
} }, system: { base: {
  approval: {
    namespace: "/api/system/base/approval",
    search: { "fieldEq": [{ "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 确认
     */
    confirm(data) {
      return request({
        url: "/api/system/base/approval/confirm",
        method: "POST",
        data
      });
    },
    /**
     * 撤销确认
     */
    revoke(data) {
      return request({
        url: "/api/system/base/approval/revoke",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/base/approval/page",
        method: "POST",
        data
      });
    }
  },
  bom: {
    namespace: "/api/system/base/bom",
    search: { "fieldEq": [{ "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父级", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子级", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/base/bom/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/base/bom/update",
        method: "PUT",
        data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/base/bom/page",
        method: "POST",
        data
      });
    },
    /**
     * 导出bom表
     */
    export(data) {
      return request({
        url: "/api/system/base/bom/export",
        method: "POST",
        data
      });
    },
    /**
     * 导入bom表
     */
    import(data) {
      return request({
        url: "/api/system/base/bom/import",
        method: "POST",
        data
      });
    }
  },
  data: {
    namespace: "/api/system/base/data",
    search: { "fieldEq": [{ "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/system/base/data/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/base/data/update",
        method: "PUT",
        data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/base/data/page",
        method: "POST",
        data
      });
    },
    /**
     * 导出数据表
     */
    export(data) {
      return request({
        url: "/api/system/base/data/export",
        method: "POST",
        data
      });
    },
    /**
     * 导入数据表
     */
    import(data) {
      return request({
        url: "/api/system/base/data/import",
        method: "POST",
        data
      });
    }
  },
  dataSource: {
    namespace: "/api/system/base/data-source",
    search: { "fieldEq": [{ "comment": "盘点序号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "扫码人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/system/base/data-source/update",
        method: "PUT",
        data
      });
    },
    /**
     * 导出数据源
     */
    export(data) {
      return request({
        url: "/api/system/base/data-source/export",
        method: "POST",
        data
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/system/base/data-source/page",
        method: "POST",
        data
      });
    }
  }
}, file: {
  avatar: {
    namespace: "/api/upload/file/avatar",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 头像上传
     */
    upload(data) {
      return request({
        url: "/api/upload/file/avatar/upload",
        method: "POST",
        data
      });
    }
  },
  files: {
    namespace: "/api/upload/file/files",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 查询所有文件类型
     */
    list(data) {
      return request({
        url: "/api/upload/file/files/list",
        method: "POST",
        data
      });
    },
    /**
     * 获取单个文件
     */
    info(data) {
      return request({
        url: "/api/upload/file/files/info/{id}",
        method: "GET",
        params: data
      });
    },
    /**
     * 删除文件
     */
    delete(data) {
      return request({
        url: "/api/upload/file/files/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 获取文件列表
     */
    page(data) {
      return request({
        url: "/api/upload/file/files/page",
        method: "POST",
        data
      });
    },
    /**
     * 文件上传
     */
    upload(data) {
      return request({
        url: "/api/upload/file/files/upload",
        method: "POST",
        data
      });
    }
  },
  category: {
    namespace: "/api/upload/file/category",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * drop
     */
    drop(data) {
      return request({
        url: "/api/upload/file/category/drop",
        method: "GET",
        params: data
      });
    },
    /**
     * 新增
     */
    add(data) {
      return request({
        url: "/api/upload/file/category/add",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID更新
     */
    update(data) {
      return request({
        url: "/api/upload/file/category/update",
        method: "PUT",
        data
      });
    },
    /**
     * 查询列表
     */
    list(data) {
      return request({
        url: "/api/upload/file/category/list",
        method: "POST",
        data
      });
    },
    /**
     * 根据ID删除
     */
    delete(data) {
      return request({
        url: "/api/upload/file/category/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    },
    /**
     * 分页查询
     */
    page(data) {
      return request({
        url: "/api/upload/file/category/page",
        method: "POST",
        data
      });
    }
  },
  folder: {
    namespace: "/api/upload/file/folder",
    search: { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 新建文件夹
     */
    add(data) {
      return request({
        url: "/api/upload/file/folder/add",
        method: "POST",
        data
      });
    },
    /**
     * 获取文件夹列表
     */
    list(data) {
      return request({
        url: "/api/upload/file/folder/list",
        method: "GET",
        params: data
      });
    },
    /**
     * 删除文件夹
     */
    delete(data) {
      return request({
        url: "/api/upload/file/folder/delete/{id}".replace(/{id}/g, Array.isArray(data) ? data[0] : data),
        method: "DELETE"
      });
    }
  }
} }, finance: { base: {
  financeResult: {
    namespace: "/api/system/base/finance-result",
    search: { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "materialCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] },
    /**
     * 导出结果数据
     */
    result(data) {
      return request({
        url: "/api/system/base/finance-result/result",
        method: "POST",
        data
      });
    },
    /**
     * 总结
     */
    summary(data) {
      return request({
        url: "/api/system/base/finance-result/summary",
        method: "POST",
        data
      });
    },
    /**
     * 财务结果查询
     */
    page(data) {
      return request({
        url: "/api/system/base/finance-result/page",
        method: "POST",
        data
      });
    },
    /**
     * 财务差异TOP
     */
    top(data) {
      return request({
        url: "/api/system/base/finance-result/top",
        method: "POST",
        data
      });
    }
  }
} } };
var epsModule = {
  service: serviceObj,
  list: [{ "prefix": "/api/system/test/", "name": "test", "api": [{ "name": "500", "method": "GET", "path": "/500", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "操作失败", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "511", "method": "GET", "path": "/511", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "登录失败，未获取到令牌", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "501", "method": "GET", "path": "/501", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "系统繁忙，请稍候再试", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "513", "method": "GET", "path": "/513", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "获取领域失败", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "517", "method": "GET", "path": "/517", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "身份令牌已过期", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "520", "method": "GET", "path": "/520", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "没有该工号", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "514", "method": "GET", "path": "/514", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "获取客户端id失败", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "522", "method": "GET", "path": "/522", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "参数不能为空", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "516", "method": "GET", "path": "/516", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "连接keycloak失败", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "521", "method": "GET", "path": "/521", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "初始密码错误", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "518", "method": "GET", "path": "/518", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "获取到的身份令牌为空", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "512", "method": "GET", "path": "/512", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "keycloak客户端地址错误", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "515", "method": "GET", "path": "/515", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "获取客户端密钥失败", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "527", "method": "GET", "path": "/527", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "手机号不存在", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "524", "method": "GET", "path": "/524", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "账号已存在", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "529", "method": "GET", "path": "/529", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "邮箱不存在", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "528", "method": "GET", "path": "/528", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "验证码已过期", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "523", "method": "GET", "path": "/523", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "数据错误", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "526", "method": "GET", "path": "/526", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "表单id过期", "tag": "TestController", "dts": { "parameters": [] } }, { "name": "510", "method": "GET", "path": "/510", "module": "admin.test", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.test:System:read", "summary": "方法参数校验异常", "tag": "TestController", "dts": { "parameters": [] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.test", "namespace": "/api/system/test/" }, { "prefix": "/api/logistics/warehouse/position", "name": "position", "api": [{ "name": "me", "method": "GET", "path": "/me", "module": "logistics.base", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "logistics.base:sys_domain_position:read", "summary": "根据用户名查询域与仓位信息", "tag": "SysDomainPositionController", "dts": { "parameters": [] } }, { "name": "page", "method": "POST", "path": "/page", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.base:sys_domain_position:create", "summary": "分页查询", "tag": "SysDomainPositionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.base:sys_domain_position:create", "summary": "新增", "tag": "SysDomainPositionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "logistics.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "logistics.base:sys_domain_position:update", "summary": "根据ID更新", "tag": "SysDomainPositionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.base:sys_domain_position:create", "summary": "查询列表", "tag": "SysDomainPositionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "logistics.base", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "logistics.base:sys_domain_position:delete", "summary": "根据ID删除", "tag": "SysDomainPositionController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "部门ID", "nullable": true, "propertyName": "deptId", "source": "dept_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "描述", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域名称", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.base", "namespace": "/api/logistics/warehouse/position" }, { "prefix": "/api/logistics/base/inventory/check", "name": "check", "api": [{ "name": "result", "method": "POST", "path": "/result", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.base:sys_inventory_check:create", "summary": "物流域结果", "tag": "InventoryCheckController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.base:sys_inventory_check:create", "summary": "盘点结果表", "tag": "InventoryCheckController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "top", "method": "POST", "path": "/top", "module": "logistics.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.base:sys_inventory_check:create", "summary": "物流差异TOP", "tag": "InventoryCheckController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "关联盘点任务", "nullable": true, "propertyName": "baseId", "source": "base_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料名称", "nullable": true, "propertyName": "materialName", "source": "material_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料规格", "nullable": true, "propertyName": "specification", "source": "specification", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "计量单位", "nullable": true, "propertyName": "unit", "source": "unit", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "批次号", "nullable": true, "propertyName": "batchNo", "source": "batch_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "账面数量", "nullable": true, "propertyName": "bookQty", "source": "book_qty", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "实际数量", "nullable": true, "propertyName": "actualQty", "source": "actual_qty", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "storageLocation", "source": "storage_location", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "差异数量", "nullable": true, "propertyName": "diffQty", "source": "diff_qty", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "差异率", "nullable": true, "propertyName": "diffRate", "source": "diff_rate", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点人", "nullable": true, "propertyName": "checkerId", "source": "checker_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "是否有差异", "nullable": true, "propertyName": "isDiff", "source": "is_diff", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "明细备注", "nullable": true, "propertyName": "remark", "source": "remark", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "materialCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "materialCode", "value": "" }, { "field": "position", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.base", "namespace": "/api/logistics/base/inventory/check" }, { "prefix": "/api/system/base/approval", "name": "approval", "api": [{ "name": "confirm", "method": "POST", "path": "/confirm", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.base:logistics_approval:create", "summary": "确认", "tag": "ApprovalController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "revoke", "method": "POST", "path": "/revoke", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.base:logistics_approval:create", "summary": "撤销确认", "tag": "ApprovalController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.base:logistics_approval:create", "summary": "分页查询", "tag": "ApprovalController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "序号", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "状态", "nullable": true, "propertyName": "status", "source": "status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "确认人", "nullable": true, "propertyName": "confirmer", "source": "confirmer", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "确认时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "name", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "checkNo", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.base", "namespace": "/api/system/base/approval" }, { "prefix": "/api/system/base/bom", "name": "bom", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.base:sys_btc_bom:create", "summary": "新增", "tag": "SysBtcBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "system.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "system.base:sys_btc_bom:update", "summary": "根据ID更新", "tag": "SysBtcBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.base:sys_btc_bom:create", "summary": "分页查询", "tag": "SysBtcBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "export", "method": "POST", "path": "/export", "module": "system.base", "ignoreToken": false, "action": "EXPORT", "auth": "permission", "permission": "system.base:sys_btc_bom:export", "summary": "导出bom表", "tag": "SysBtcBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "import", "method": "POST", "path": "/import", "module": "system.base", "ignoreToken": false, "action": "IMPORT", "auth": "permission", "permission": "system.base:sys_btc_bom:import", "summary": "导入bom表", "tag": "SysBtcBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "流程ID", "nullable": true, "propertyName": "processId", "source": "process_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点序号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父级", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子级", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子级数量", "nullable": true, "propertyName": "childQty", "source": "child_qty", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "parentNode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "childNode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkType", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "domainId", "value": "" }, { "field": "parentNode", "value": "" }, { "field": "childNode", "value": "" }, { "field": "checkType", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父级", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子级", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.base", "namespace": "/api/system/base/bom" }, { "prefix": "/api/system/base/data", "name": "data", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.base:sys_btc_data:create", "summary": "新增", "tag": "SysBtcDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "system.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "system.base:sys_btc_data:update", "summary": "根据ID更新", "tag": "SysBtcDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.base:sys_btc_data:create", "summary": "分页查询", "tag": "SysBtcDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "export", "method": "POST", "path": "/export", "module": "system.base", "ignoreToken": false, "action": "EXPORT", "auth": "permission", "permission": "system.base:sys_btc_data:export", "summary": "导出数据表", "tag": "SysBtcDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "import", "method": "POST", "path": "/import", "module": "system.base", "ignoreToken": false, "action": "IMPORT", "auth": "permission", "permission": "system.base:sys_btc_data:import", "summary": "导入数据表", "tag": "SysBtcDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "数量", "nullable": true, "propertyName": "partQty", "source": "part_qty", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "流程ID", "nullable": true, "propertyName": "processId", "source": "process_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点序号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "partName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkType", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "partName", "value": "" }, { "field": "position", "value": "" }, { "field": "domainId", "value": "" }, { "field": "checkType", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "checkType", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.base", "namespace": "/api/system/base/data" }, { "prefix": "/api/system/base/data-source", "name": "data-source", "api": [{ "name": "update", "method": "PUT", "path": "/update", "module": "system.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "system.base:sys_data_source:update", "summary": "根据ID更新", "tag": "SysDataSourceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "export", "method": "POST", "path": "/export", "module": "system.base", "ignoreToken": false, "action": "EXPORT", "auth": "permission", "permission": "system.base:sys_data_source:export", "summary": "导出数据源", "tag": "SysDataSourceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.base", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.base:sys_data_source:create", "summary": "分页查询", "tag": "SysDataSourceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点序号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "流程ID", "nullable": true, "propertyName": "processId", "source": "process_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "数量", "nullable": true, "propertyName": "partQty", "source": "part_qty", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "扫码人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "deleted_at", "nullable": true, "propertyName": "deleted_at", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checker", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "partName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "checkNo", "value": "" }, { "field": "position", "value": "" }, { "field": "checker", "value": "" }, { "field": "partName", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "盘点序号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "扫码人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料号", "nullable": true, "propertyName": "partName", "source": "part_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.base", "namespace": "/api/system/base/data-source" }, { "prefix": "/api/logistics/warehouse/check", "name": "check", "api": [{ "name": "list", "method": "POST", "path": "/list", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "查询盘点基础表列表", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "info", "method": "GET", "path": "/info", "module": "logistics.warehouse", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "logistics.warehouse:logistics_check_base:read", "summary": "查询盘点流程表", "tag": "CheckBaseController", "dts": { "parameters": [] } }, { "name": "status", "method": "POST", "path": "/status", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "查询盘点状态", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "finish", "method": "POST", "path": "/finish", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "结束盘点", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "分页查询盘点基础表", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "pull", "method": "GET", "path": "/pull", "module": "logistics.warehouse", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "logistics.warehouse:logistics_check_base:read", "summary": "拉取syspro数据", "tag": "CheckBaseController", "dts": { "parameters": [] } }, { "name": "start", "method": "POST", "path": "/start", "module": "logistics.warehouse", "ignoreToken": false, "action": "START", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:start", "summary": "开始盘点", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "新增盘点基础表", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "编辑盘点基础表", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "POST", "path": "/delete", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "删除盘点基础表", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "pause", "method": "POST", "path": "/pause", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "暂停盘点", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "recover", "method": "POST", "path": "/recover", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:logistics_check_base:create", "summary": "继续盘点", "tag": "CheckBaseController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点类型", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点状态", "nullable": true, "propertyName": "checkStatus", "source": "check_status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "开始时间", "nullable": true, "propertyName": "startTime", "source": "start_time", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "结束时间", "nullable": true, "propertyName": "endTime", "source": "end_time", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "备注", "nullable": true, "propertyName": "remark", "source": "remark", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "剩余时长(秒)", "nullable": true, "propertyName": "remainingSeconds", "source": "remaining_seconds", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkType", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkStatus", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checker", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "checkNo", "value": "" }, { "field": "checkType", "value": "" }, { "field": "checkStatus", "value": "" }, { "field": "checker", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "盘点编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点类型", "nullable": true, "propertyName": "checkType", "source": "check_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点状态", "nullable": true, "propertyName": "checkStatus", "source": "check_status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点人", "nullable": true, "propertyName": "checker", "source": "checker", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/warehouse/check" }, { "prefix": "/api/logistics/warehouse/diff", "name": "diff", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:sys_check_diff:create", "summary": "分页接口", "tag": "CheckDiffController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_check_diff:create", "summary": "编辑盘点差异记录", "tag": "CheckDiffController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "export", "method": "POST", "path": "/export", "module": "logistics.warehouse", "ignoreToken": false, "action": "EXPORT", "auth": "permission", "permission": "logistics.warehouse:sys_check_diff:export", "summary": "exportDiff", "tag": "CheckDiffController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "盘点流程ID", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "差异数量", "nullable": true, "propertyName": "diffQty", "source": "diff_qty", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "账面数量", "nullable": true, "propertyName": "bookQty", "source": "book_qty", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "实际数量", "nullable": true, "propertyName": "btcQty", "source": "btc_qty", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "处理人", "nullable": true, "propertyName": "processPerson", "source": "process_person", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "处理时间", "nullable": true, "propertyName": "processTime", "source": "process_time", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "处理备注", "nullable": true, "propertyName": "processRemark", "source": "process_remark", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "actualQty", "nullable": true, "propertyName": "actualQty", "source": "actual_qty", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "materialCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "checkNo", "value": "" }, { "field": "position", "value": "" }, { "field": "materialCode", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "盘点流程ID", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/warehouse/diff" }, { "prefix": "/api/logistics/warehouse/sub-process", "name": "subProcess", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:sys_check_sub_process:create", "summary": "selectPage", "tag": "CheckSubProcessController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_check_sub_process:create", "summary": "editSubProcess", "tag": "CheckSubProcessController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_check_sub_process:create", "summary": "insertSubProcess", "tag": "CheckSubProcessController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子流程编码", "nullable": true, "propertyName": "subProcessNo", "source": "sub_process_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "主流程编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "流程状态", "nullable": true, "propertyName": "checkStatus", "source": "check_status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "开始时间", "nullable": true, "propertyName": "startTime", "source": "start_time", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "结束时间", "nullable": true, "propertyName": "endTime", "source": "end_time", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "剩余时间", "nullable": true, "propertyName": "remainingSeconds", "source": "remaining_seconds", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父级流程", "nullable": true, "propertyName": "parentProcessNo", "source": "parent_process_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "checkNo", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "主流程编号", "nullable": true, "propertyName": "checkNo", "source": "check_no", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/warehouse/sub-process" }, { "prefix": "/api/logistics/warehouse/ticket", "name": "ticket", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:sys_ticket:create", "summary": "盘点票分页接口", "tag": "CheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "import", "method": "POST", "path": "/import", "module": "logistics.warehouse", "ignoreToken": false, "action": "IMPORT", "auth": "permission", "permission": "logistics.warehouse:sys_ticket:import", "summary": "盘点票导入", "tag": "CheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "export", "method": "POST", "path": "/export", "module": "logistics.warehouse", "ignoreToken": false, "action": "EXPORT", "auth": "permission", "permission": "logistics.warehouse:sys_ticket:export", "summary": "盘点票导出", "tag": "CheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_ticket:create", "summary": "盘点票编辑", "tag": "CheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "partName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "domainId", "value": "" }, { "field": "position", "value": "" }, { "field": "partName", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "partName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/warehouse/ticket" }, { "prefix": "/api/logistics/warehouse/material", "name": "material", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_material_master:create", "summary": "新增", "tag": "MaterialMasterController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "logistics.warehouse", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "logistics.warehouse:sys_material_master:update", "summary": "根据ID更新", "tag": "MaterialMasterController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:sys_material_master:create", "summary": "查询列表", "tag": "MaterialMasterController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "logistics.warehouse", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "logistics.warehouse:sys_material_master:delete", "summary": "根据ID删除", "tag": "MaterialMasterController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "logistics.warehouse:sys_material_master:create", "summary": "分页查询", "tag": "MaterialMasterController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料编码", "nullable": true, "propertyName": "materialCode", "source": "material_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料名称", "nullable": true, "propertyName": "materialName", "source": "material_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "物料类型", "nullable": true, "propertyName": "materialType", "source": "material_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "规格", "nullable": true, "propertyName": "specification", "source": "specification", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "材质", "nullable": true, "propertyName": "materialTexture", "source": "material_texture", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "单位", "nullable": true, "propertyName": "unit", "source": "unit", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "供应商编码", "nullable": true, "propertyName": "supplierCode", "source": "supplier_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "供应商名称", "nullable": true, "propertyName": "supplierName", "source": "supplier_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "单价", "nullable": true, "propertyName": "unitPrice", "source": "unit_price", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "税率", "nullable": true, "propertyName": "taxRate", "source": "tax_rate", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "总价", "nullable": true, "propertyName": "totalPrice", "source": "total_price", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "条形码", "nullable": true, "propertyName": "barCode", "source": "bar_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "安全库存", "nullable": true, "propertyName": "safetyStock", "source": "safety_stock", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "存储要求", "nullable": true, "propertyName": "storageRequirement", "source": "storage_requirement", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "过期周期", "nullable": true, "propertyName": "expireCycle", "source": "expire_cycle", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "备注", "nullable": true, "propertyName": "remark", "source": "remark", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/warehouse/material" }, { "prefix": "/api/logistics/bom", "name": "bom", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_bom:create", "summary": "分页查询BOM表", "tag": "SysBomController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "父节点", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子节点", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子节点数量", "nullable": true, "propertyName": "childQty", "source": "child_qty", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "parentNode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "childNode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "parentNode", "value": "" }, { "field": "childNode", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "父节点", "nullable": true, "propertyName": "parentNode", "source": "parent_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "子节点", "nullable": true, "propertyName": "childNode", "source": "child_node", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/bom" }, { "prefix": "/api/logistics/data", "name": "data", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "logistics.warehouse", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "logistics.warehouse:sys_data:create", "summary": "分页查询数据表", "tag": "SysDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "库存代码", "nullable": true, "propertyName": "stockCode", "source": "stock_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓库", "nullable": true, "propertyName": "warehouse", "source": "warehouse", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "总数量", "nullable": true, "propertyName": "totalQty", "source": "total_qty", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "单位成本", "nullable": true, "propertyName": "unitCost", "source": "unit_cost", "type": "decimal", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "stockCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "warehouse", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "stockCode", "value": "" }, { "field": "warehouse", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "库存代码", "nullable": true, "propertyName": "stockCode", "source": "stock_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "仓库", "nullable": true, "propertyName": "warehouse", "source": "warehouse", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "logistics.warehouse", "namespace": "/api/logistics/data" }, { "prefix": "/api/system/base/checkTicket", "name": "checkTicket", "api": [{ "name": "print", "method": "POST", "path": "/print", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:sys_check_ticket:create", "summary": "savePrint", "tag": "BaseSysCheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "info", "method": "POST", "path": "/info", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:sys_check_ticket:create", "summary": "盘点票查询打印", "tag": "BaseSysCheckTicketController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.base", "namespace": "/api/system/base/checkTicket" }, { "prefix": "/api/system/base/profile", "name": "profile", "api": [{ "name": "password", "method": "PUT", "path": "/update/password", "module": "admin.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.base:sys_user_profile:update", "summary": "修改初始密码", "tag": "BaseUserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:sys_user_profile:create", "summary": "编辑用户档案信息", "tag": "BaseUserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "info", "method": "GET", "path": "/info", "module": "admin.base", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.base:sys_user_profile:read", "summary": "获取当前用户档案信息", "tag": "BaseUserController", "dts": { "parameters": [{ "description": "showFull", "name": "query:showFull", "required": false, "schema": { "type": "boolean", "format": null, "items": null } }] } }, { "name": "verify", "method": "POST", "path": "/info/verify", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:sys_user_profile:create", "summary": "获取邮箱或手机号的脱敏数据", "tag": "BaseUserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "员工ID", "nullable": true, "propertyName": "employeeId", "source": "employee_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "姓名", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "真实姓名", "nullable": true, "propertyName": "realName", "source": "real_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "职位", "nullable": true, "propertyName": "position", "source": "position", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "邮箱", "nullable": true, "propertyName": "email", "source": "email", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "初始密码", "nullable": true, "propertyName": "initPass", "source": "init_pass", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "部门id", "nullable": true, "propertyName": "deptId", "source": "dept_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "头像", "nullable": true, "propertyName": "avatar", "source": "avatar", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "手机号", "nullable": true, "propertyName": "phone", "source": "phone", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "defaultValue": 1 }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "defaultValue": 20 }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string" }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.base", "namespace": "/api/system/base/profile" }, { "prefix": "/api/system/base/email", "name": "email", "api": [{ "name": "update", "method": "PUT", "path": "/update", "module": "admin.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.base:unknown:update", "summary": "验证验证码并修改邮箱", "tag": "EmailController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "bind", "method": "POST", "path": "/bind", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "绑定发送邮箱验证码", "tag": "EmailController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "verify", "method": "POST", "path": "/verify", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "校验邮箱或者手机号验证码", "tag": "EmailController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "send", "method": "POST", "path": "/send", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "发送邮箱验证码", "tag": "EmailController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "defaultValue": 1 }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "defaultValue": 20 }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string" }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.base", "namespace": "/api/system/base/email" }, { "prefix": "/api/system/base/phone", "name": "phone", "api": [{ "name": "update", "method": "PUT", "path": "/update", "module": "admin.base", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.base:unknown:update", "summary": "验证码并修改手机号", "tag": "PhoneController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "bind", "method": "POST", "path": "/bind", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "绑定发送手机号验证码", "tag": "PhoneController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "verify", "method": "POST", "path": "/verify", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "校验邮箱或者手机号验证码", "tag": "PhoneController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "send", "method": "POST", "path": "/send", "module": "admin.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.base:unknown:create", "summary": "发送手机号验证码", "tag": "PhoneController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "defaultValue": 1 }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "defaultValue": 20 }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string" }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.base", "namespace": "/api/system/base/phone" }, { "prefix": "/api/system/log/deletelog", "name": "deletelog", "api": [{ "name": "restore", "method": "POST", "path": "/restore", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:sys_operation_log:create", "summary": "恢复数据", "tag": "DeleteLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.log:sys_operation_log:create", "summary": "分页查询删除操作日志", "tag": "DeleteLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/restore/batch", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:sys_operation_log:create", "summary": "批量恢复", "tag": "DeleteLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.log", "namespace": "/api/system/log/deletelog" }, { "prefix": "/api/system/log/config", "name": "config", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:sys_log_config:create", "summary": "新增配置", "tag": "LogConfigController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "POST", "path": "/update", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:sys_log_config:create", "summary": "编辑日志配置", "tag": "LogConfigController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "GET", "path": "/list", "module": "admin.log", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.log:sys_log_config:read", "summary": "获取日志保存天数", "tag": "LogConfigController", "dts": { "parameters": [] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.log:sys_log_config:create", "summary": "分页查询", "tag": "LogConfigController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.log", "namespace": "/api/system/log/config" }, { "prefix": "/api/system/log/operation", "name": "operation", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.log:sys_operation_log:create", "summary": "分页查询操作日志", "tag": "OperationLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.log", "namespace": "/api/system/log/operation" }, { "prefix": "/api/system/log/request", "name": "request", "api": [{ "name": "update", "method": "POST", "path": "/update", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:request_log:create", "summary": "保存请求日志", "tag": "RequestLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.log:request_log:create", "summary": "分页查询请求日志", "tag": "RequestLogController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "getkep", "method": "POST", "path": "/getkep", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.log:request_log:create", "summary": "获取日志配置", "tag": "RequestLogController", "dts": { "parameters": [] } }, { "name": "setkep", "method": "POST", "path": "/setkep", "module": "admin.log", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.log:request_log:create", "summary": "设置日志配置", "tag": "RequestLogController", "dts": { "parameters": [{ "description": "arg0", "name": "query:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.log", "namespace": "/api/system/log/request" }, { "prefix": "/api/system/iam/action", "name": "action", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:action:create", "summary": "新增", "tag": "ActionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:action:update", "summary": "根据ID更新", "tag": "ActionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:action:create", "summary": "查询列表", "tag": "ActionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:action:delete", "summary": "根据ID删除", "tag": "ActionController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:action:create", "summary": "分页查询", "tag": "ActionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "行为ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "行为编码", "nullable": true, "propertyName": "actionCode", "source": "action_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "行为中文名", "nullable": true, "propertyName": "actionNameCn", "source": "action_name_cn", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "行为英文名", "nullable": true, "propertyName": "actionNameEn", "source": "action_name_en", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "行为类型", "nullable": true, "propertyName": "actionType", "source": "action_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "HTTP方法", "nullable": true, "propertyName": "httpMethod", "source": "http_method", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "行为说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "图标", "nullable": true, "propertyName": "icon", "source": "icon", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "颜色标识", "nullable": true, "propertyName": "color", "source": "color", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "排序", "nullable": true, "propertyName": "sortOrder", "source": "sort_order", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "是否危险操作", "nullable": true, "propertyName": "isDanger", "source": "is_danger", "type": "tinyint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/action" }, { "prefix": "/api/system/iam/department", "name": "department", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:department:create", "summary": "分页查询", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:department:create", "summary": "批量删除", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:department:create", "summary": "新增", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:department:update", "summary": "根据ID更新", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:department:create", "summary": "查询列表", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:department:delete", "summary": "根据ID删除", "tag": "DepartmentController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "部门ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "部门编码", "nullable": true, "propertyName": "deptCode", "source": "dept_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "部门名", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "上级部门ID", "nullable": true, "propertyName": "parentId", "source": "parent_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "排序", "nullable": true, "propertyName": "sort", "source": "sort", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "parentName", "nullable": true, "propertyName": "parentName", "source": "parent_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/department" }, { "prefix": "/api/system/iam/domain", "name": "domain", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:domain:create", "summary": "异步新增域", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:domain:create", "summary": "异步新增域", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:domain:update", "summary": "编辑域", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:domain:update", "summary": "编辑域", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "me", "method": "GET", "path": "/me", "module": "admin.iam", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.iam:domain:read", "summary": "查询当前用户有哪些域", "tag": "DomainController", "dts": { "parameters": [] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:domain:create", "summary": "批量删除", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:domain:create", "summary": "查询列表", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:domain:delete", "summary": "根据ID删除", "tag": "DomainController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:domain:create", "summary": "分页查询", "tag": "DomainController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "域ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域编码", "nullable": true, "propertyName": "domainCode", "source": "domain_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域名称", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域类型", "nullable": true, "propertyName": "domainType", "source": "domain_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/domain" }, { "prefix": "/api/system/iam/menu", "name": "menu", "api": [{ "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:menu:create", "summary": "批量删除", "tag": "MenuController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:menu:create", "summary": "新增", "tag": "MenuController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:menu:update", "summary": "根据ID更新", "tag": "MenuController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:menu:create", "summary": "查询列表", "tag": "MenuController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:menu:delete", "summary": "根据ID删除", "tag": "MenuController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:menu:create", "summary": "分页查询", "tag": "MenuController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "菜单ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "所属模块ID", "nullable": true, "propertyName": "moduleId", "source": "module_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域id", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "菜单编码", "nullable": true, "propertyName": "menuCode", "source": "menu_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "菜单中文名", "nullable": true, "propertyName": "menuNameCn", "source": "menu_name_cn", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "菜单英文名", "nullable": true, "propertyName": "menuNameEn", "source": "menu_name_en", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "菜单类型", "nullable": true, "propertyName": "menuType", "source": "menu_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "菜单路径", "nullable": true, "propertyName": "menuPath", "source": "menu_path", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "组件路径", "nullable": true, "propertyName": "componentPath", "source": "component_path", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "图标", "nullable": true, "propertyName": "icon", "source": "icon", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父菜单ID", "nullable": true, "propertyName": "parentMenuId", "source": "parent_menu_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "排序", "nullable": true, "propertyName": "sortOrder", "source": "sort_order", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "是否可见", "nullable": true, "propertyName": "visible", "source": "visible", "type": "tinyint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "路由缓存", "nullable": true, "propertyName": "routerCache", "source": "router_cache", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "文件路径", "nullable": true, "propertyName": "filePath", "source": "file_path", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/menu" }, { "prefix": "/api/system/iam/module", "name": "module", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:module:create", "summary": "异步新增", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:module:create", "summary": "异步新增", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:module:create", "summary": "批量删除", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:module:update", "summary": "根据ID更新", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:module:create", "summary": "查询列表", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:module:delete", "summary": "根据ID删除", "tag": "ModuleController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:module:create", "summary": "分页查询", "tag": "ModuleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "模块ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "所属域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "模块编码", "nullable": true, "propertyName": "moduleCode", "source": "module_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "模块名称", "nullable": true, "propertyName": "moduleName", "source": "module_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "模块类型", "nullable": true, "propertyName": "moduleType", "source": "module_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "模块说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "排序", "nullable": true, "propertyName": "sortOrder", "source": "sort_order", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/module" }, { "prefix": "/api/system/iam/permission", "name": "permission", "api": [{ "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:permission:create", "summary": "批量删除", "tag": "PermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:permission:create", "summary": "新增", "tag": "PermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:permission:update", "summary": "根据ID更新", "tag": "PermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:permission:create", "summary": "查询列表", "tag": "PermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:permission:delete", "summary": "根据ID删除", "tag": "PermissionController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:permission:create", "summary": "分页查询", "tag": "PermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "权限ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "所属模块ID", "nullable": true, "propertyName": "moduleId", "source": "module_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "所属插件ID", "nullable": true, "propertyName": "pluginId", "source": "plugin_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "权限编码", "nullable": true, "propertyName": "permCode", "source": "perm_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "权限名称", "nullable": true, "propertyName": "permName", "source": "perm_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "权限类型", "nullable": true, "propertyName": "permType", "source": "perm_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "权限分类", "nullable": true, "propertyName": "permCategory", "source": "perm_category", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "权限说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/permission" }, { "prefix": "/api/system/iam/plugin", "name": "plugin", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:plugin:create", "summary": "新增", "tag": "PluginController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:plugin:update", "summary": "根据ID更新", "tag": "PluginController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:plugin:create", "summary": "查询列表", "tag": "PluginController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:plugin:delete", "summary": "根据ID删除", "tag": "PluginController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:plugin:create", "summary": "分页查询", "tag": "PluginController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "插件ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件编码", "nullable": true, "propertyName": "pluginCode", "source": "plugin_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件名称", "nullable": true, "propertyName": "pluginName", "source": "plugin_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件类型", "nullable": true, "propertyName": "pluginType", "source": "plugin_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件分类", "nullable": true, "propertyName": "pluginCategory", "source": "plugin_category", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件版本", "nullable": true, "propertyName": "version", "source": "version", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件作者", "nullable": true, "propertyName": "author", "source": "author", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "插件说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "配置模式", "nullable": true, "propertyName": "configSchema", "source": "config_schema", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "默认配置", "nullable": true, "propertyName": "defaultConfig", "source": "default_config", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "状态", "nullable": true, "propertyName": "status", "source": "status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "安装路径", "nullable": true, "propertyName": "installPath", "source": "install_path", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "依赖插件", "nullable": true, "propertyName": "dependencies", "source": "dependencies", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建人", "nullable": true, "propertyName": "createdBy", "source": "created_by", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/plugin" }, { "prefix": "/api/system/iam/resource", "name": "resource", "api": [{ "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:resource:create", "summary": "查询资源列表", "tag": "ResourceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:resource:create", "summary": "分页查询资源", "tag": "ResourceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "pull", "method": "GET", "path": "/pull", "module": "admin.iam", "ignoreToken": false, "action": "READ", "auth": "permission", "permission": "admin.iam:resource:read", "summary": "拉取资源", "tag": "ResourceController", "dts": { "parameters": [] } }], "columns": [{ "comment": "资源ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源编码", "nullable": true, "propertyName": "resourceCode", "source": "resource_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源中文名", "nullable": true, "propertyName": "resourceNameCn", "source": "resource_name_cn", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源英文名", "nullable": true, "propertyName": "resourceNameEn", "source": "resource_name_en", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源类型", "nullable": true, "propertyName": "resourceType", "source": "resource_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "数据库表名", "nullable": true, "propertyName": "tableName", "source": "table_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "resourceCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "resourceNameCn", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "resourceNameEn", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "resourceType", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "tableName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "resourceCode", "value": "" }, { "field": "resourceNameCn", "value": "" }, { "field": "resourceNameEn", "value": "" }, { "field": "resourceType", "value": "" }, { "field": "tableName", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "资源编码", "nullable": true, "propertyName": "resourceCode", "source": "resource_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源中文名", "nullable": true, "propertyName": "resourceNameCn", "source": "resource_name_cn", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源英文名", "nullable": true, "propertyName": "resourceNameEn", "source": "resource_name_en", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "资源类型", "nullable": true, "propertyName": "resourceType", "source": "resource_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "数据库表名", "nullable": true, "propertyName": "tableName", "source": "table_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/resource" }, { "prefix": "/api/system/iam/role", "name": "role", "api": [{ "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:role:create", "summary": "分页查询", "tag": "RoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:role:create", "summary": "批量删除", "tag": "RoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:role:create", "summary": "新增", "tag": "RoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:role:update", "summary": "根据ID更新", "tag": "RoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:role:create", "summary": "查询列表", "tag": "RoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:role:delete", "summary": "根据ID删除", "tag": "RoleController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "角色ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "所属域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "角色编码", "nullable": true, "propertyName": "roleCode", "source": "role_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "角色名称", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "角色类型", "nullable": true, "propertyName": "roleType", "source": "role_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "角色说明", "nullable": true, "propertyName": "description", "source": "description", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父级ID", "nullable": true, "propertyName": "parentId", "source": "parent_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "roleName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "userId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "ids", "value": "" }, { "field": "roleName", "value": "" }, { "field": "userId", "value": "" }, { "field": "domainId", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "角色名称", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "userId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "所属域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/role" }, { "prefix": "/api/system/iam/role-permission", "name": "role-permission", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:unknown:create", "summary": "新增", "tag": "RolePermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:unknown:update", "summary": "根据ID更新", "tag": "RolePermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:unknown:create", "summary": "查询列表", "tag": "RolePermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:unknown:delete", "summary": "根据ID删除", "tag": "RolePermissionController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:unknown:create", "summary": "分页查询", "tag": "RolePermissionController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "id", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "tenantId", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "roleId", "nullable": true, "propertyName": "roleId", "source": "role_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "permissionId", "nullable": true, "propertyName": "permissionId", "source": "permission_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "createdAt", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "deletedAt", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/role-permission" }, { "prefix": "/api/system/iam/tenant", "name": "tenant", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:tenant:create", "summary": "异步新增租户", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "add", "method": "POST", "path": "/add", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:tenant:create", "summary": "异步新增租户", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:tenant:create", "summary": "批量删除", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "like", "method": "POST", "path": "/tenant/like", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:tenant:create", "summary": "模糊搜索供应商租户", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:tenant:update", "summary": "根据ID更新", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:tenant:create", "summary": "查询列表", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.iam:tenant:delete", "summary": "根据ID删除", "tag": "TenantController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:tenant:create", "summary": "分页查询", "tag": "TenantController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "租户ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户编码", "nullable": true, "propertyName": "tenantCode", "source": "tenant_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户名称", "nullable": true, "propertyName": "tenantName", "source": "tenant_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户中文名", "nullable": true, "propertyName": "tenantNameZh", "source": "tenant_name_zh", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户类型", "nullable": true, "propertyName": "tenantType", "source": "tenant_type", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "状态", "nullable": true, "propertyName": "status", "source": "status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/tenant" }, { "prefix": "/api/system/iam/user", "name": "user", "api": [{ "name": "update", "method": "POST", "path": "/update", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:user:create", "summary": "用户分配", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.iam:user:create", "summary": "用户列表", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "data", "method": "POST", "path": "/data", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:user:create", "summary": "用户列表数据", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete", "module": "admin.iam", "ignoreToken": false, "action": "DELETE", "auth": "login", "permission": "admin.iam:user:delete", "summary": "删除用户", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:user:create", "summary": "分页查询", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/delete/batch", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:user:create", "summary": "批量删除", "tag": "UserController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }], "columns": [{ "comment": "用户ID", "nullable": true, "propertyName": "id", "source": "id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "登录名", "nullable": true, "propertyName": "username", "source": "username", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "密码哈希", "nullable": true, "propertyName": "passwordHash", "source": "password_hash", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "状态", "nullable": true, "propertyName": "status", "source": "status", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "最后登录时间", "nullable": true, "propertyName": "lastLoginAt", "source": "last_login_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "最后登录IP", "nullable": true, "propertyName": "lastLoginIp", "source": "last_login_ip", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "登录次数", "nullable": true, "propertyName": "loginCount", "source": "login_count", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "deptId", "nullable": true, "propertyName": "deptId", "source": "dept_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "roleId", "nullable": true, "propertyName": "roleId", "source": "role_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "username", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "ids", "value": "" }, { "field": "username", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "ids", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "登录名", "nullable": true, "propertyName": "username", "source": "username", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/user" }, { "prefix": "/api/system/iam/user-role", "name": "user-role", "api": [{ "name": "unbind", "method": "POST", "path": "/unbind", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:sys_user_role:create", "summary": "用户解绑角色", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "data", "method": "POST", "path": "/data", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:sys_user_role:create", "summary": "用户名筛选角色", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batchBind", "method": "POST", "path": "/batchBind", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:sys_user_role:create", "summary": "批量新增授权", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:sys_user_role:create", "summary": "查询用户角色信息", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "modifyBind", "method": "PUT", "path": "/modifyBind", "module": "admin.iam", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.iam:sys_user_role:update", "summary": "修改绑定角色", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "batchUnbind", "method": "POST", "path": "/batchUnbind", "module": "admin.iam", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.iam:sys_user_role:create", "summary": "批量解绑角色", "tag": "UserRoleController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }], "columns": [{ "comment": "id", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "用户id", "nullable": true, "propertyName": "userId", "source": "user_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "角色id", "nullable": true, "propertyName": "roleId", "source": "role_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户id", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "name", "nullable": true, "propertyName": "name", "source": "name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "realName", "nullable": true, "propertyName": "realName", "source": "real_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "roleName", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "userId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "roleName", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "userId", "value": "" }, { "field": "domainId", "value": "" }], "fieldLike": [{ "field": "roleName", "value": "" }], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "用户id", "nullable": true, "propertyName": "userId", "source": "user_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "", "nullable": false, "propertyName": "domainId", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [{ "comment": "roleName", "nullable": true, "propertyName": "roleName", "source": "role_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "keyWordLikeFields": [] }, "moduleKey": "admin.iam", "namespace": "/api/system/iam/user-role" }, { "prefix": "/api/system/dict/data", "name": "dict-data", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.dict:dict-data:create", "summary": "新增字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.dict", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.dict:dict-data:update", "summary": "更新字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.dict:dict-data:create", "summary": "列表查询字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.dict", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.dict:dict-data:delete", "summary": "删除字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.dict:dict-data:create", "summary": "分页查询字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "info", "method": "GET", "path": "/info/{id}", "module": "admin.dict", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.dict:dict-data:read", "summary": "根据ID查询字典数据", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "batch", "method": "POST", "path": "/options/batch", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.dict:dict-data:create", "summary": "批量获取下拉菜单", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }, { "name": "{dictTypeCode}", "method": "GET", "path": "/options/{dictTypeCode}", "module": "admin.dict", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.dict:dict-data:read", "summary": "根据类型获取下拉菜单", "tag": "DictDataController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "all", "method": "GET", "path": "/options/all", "module": "admin.dict", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "admin.dict:dict-data:read", "summary": "获取所有下拉菜单", "tag": "DictDataController", "dts": { "parameters": [] } }], "columns": [{ "comment": "序号", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "字典数据ID", "nullable": true, "propertyName": "dictDataId", "source": "dict_data_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "字典类型编码", "nullable": true, "propertyName": "dictTypeCode", "source": "dict_type_code", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "字典值", "nullable": true, "propertyName": "dictValue", "source": "dict_value", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "字典标签", "nullable": true, "propertyName": "dictLabel", "source": "dict_label", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "排序", "nullable": true, "propertyName": "sortOrder", "source": "sort_order", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.dict", "namespace": "/api/system/dict/data" }, { "prefix": "/api/system/dict/info", "name": "info", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "admin.dict:dict-info:create", "summary": "新增", "tag": "DictInfoController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "admin.dict", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "admin.dict:dict-info:update", "summary": "根据ID更新", "tag": "DictInfoController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.dict:dict-info:create", "summary": "查询列表", "tag": "DictInfoController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "admin.dict", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "admin.dict:dict-info:delete", "summary": "根据ID删除", "tag": "DictInfoController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "admin.dict", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "admin.dict:dict-info:create", "summary": "分页查询", "tag": "DictInfoController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "实体类名", "nullable": true, "propertyName": "entityClass", "source": "entity_class", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "字段名称", "nullable": true, "propertyName": "fieldName", "source": "field_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "域ID", "nullable": true, "propertyName": "domainId", "source": "domain_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "备注", "nullable": true, "propertyName": "remark", "source": "remark", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建人", "nullable": true, "propertyName": "createdBy", "source": "created_by", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "最后修改时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "admin.dict", "namespace": "/api/system/dict/info" }, { "prefix": "/api/upload/file/avatar", "name": "avatar", "api": [{ "name": "upload", "method": "POST", "path": "/upload", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.file:sys_file_asset:create", "summary": "头像上传", "tag": "SysAvatarFileController", "dts": { "parameters": [{ "description": "file", "name": "query:file", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.file", "namespace": "/api/upload/file/avatar" }, { "prefix": "/api/upload/file/files", "name": "files", "api": [{ "name": "list", "method": "POST", "path": "/list", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.file:sys_file_asset:create", "summary": "查询所有文件类型", "tag": "SysFileAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "info", "method": "GET", "path": "/info/{id}", "module": "system.file", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "system.file:sys_file_asset:read", "summary": "获取单个文件", "tag": "SysFileAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "system.file", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "system.file:sys_file_asset:delete", "summary": "删除文件", "tag": "SysFileAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "string", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.file:sys_file_asset:create", "summary": "获取文件列表", "tag": "SysFileAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "upload", "method": "POST", "path": "/upload", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.file:sys_file_asset:create", "summary": "文件上传", "tag": "SysFileAssetController", "dts": { "parameters": [{ "description": "file", "name": "query:file", "required": true, "schema": { "type": "array", "format": null, "items": null } }] } }], "columns": [{ "comment": "文件ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "租户ID", "nullable": true, "propertyName": "tenantId", "source": "tenant_id", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "拥有者", "nullable": true, "propertyName": "ownerUser", "source": "owner_user", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "SHA256哈希值", "nullable": true, "propertyName": "sha256", "source": "sha256", "type": "blob", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "文件大小(字节)", "nullable": true, "propertyName": "sizeBytes", "source": "size_bytes", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "原始文件名", "nullable": true, "propertyName": "originalName", "source": "original_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "文件扩展名", "nullable": true, "propertyName": "ext", "source": "ext", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "MIME类型", "nullable": true, "propertyName": "mime", "source": "mime", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "存储桶", "nullable": true, "propertyName": "bucket", "source": "bucket", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "对象键", "nullable": true, "propertyName": "objectKey", "source": "object_key", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "文件版本", "nullable": true, "propertyName": "version", "source": "version", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.file", "namespace": "/api/upload/file/files" }, { "prefix": "/api/upload/file/category", "name": "category", "api": [{ "name": "drop", "method": "GET", "path": "/drop", "module": "system.file", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "system.file:sys_file_category:read", "summary": "drop", "tag": "SysFileCategoryController", "dts": { "parameters": [] } }, { "name": "add", "method": "POST", "path": "/add", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.file:sys_file_category:create", "summary": "新增", "tag": "SysFileCategoryController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "update", "method": "PUT", "path": "/update", "module": "system.file", "ignoreToken": false, "action": "UPDATE", "auth": "permission", "permission": "system.file:sys_file_category:update", "summary": "根据ID更新", "tag": "SysFileCategoryController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "POST", "path": "/list", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.file:sys_file_category:create", "summary": "查询列表", "tag": "SysFileCategoryController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "system.file", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "system.file:sys_file_category:delete", "summary": "根据ID删除", "tag": "SysFileCategoryController", "dts": { "parameters": [{ "description": "id", "name": "path:id", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "login", "permission": "system.file:sys_file_category:create", "summary": "分页查询", "tag": "SysFileCategoryController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": false, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [{ "comment": "主键ID", "nullable": true, "propertyName": "id", "source": "id", "type": "bigint", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "分类编码", "nullable": true, "propertyName": "category", "source": "category", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "分类标签", "nullable": true, "propertyName": "categoryLabel", "source": "category_label", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "MIME类型", "nullable": true, "propertyName": "mime", "source": "mime", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.file", "namespace": "/api/upload/file/category" }, { "prefix": "/api/upload/file/folder", "name": "folder", "api": [{ "name": "add", "method": "POST", "path": "/add", "module": "system.file", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "system.file:sys_folder_asset:create", "summary": "新建文件夹", "tag": "SysFolderAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "list", "method": "GET", "path": "/list", "module": "system.file", "ignoreToken": false, "action": "READ", "auth": "login", "permission": "system.file:sys_folder_asset:read", "summary": "获取文件夹列表", "tag": "SysFolderAssetController", "dts": { "parameters": [] } }, { "name": "delete", "method": "DELETE", "path": "/delete/{id}", "module": "system.file", "ignoreToken": false, "action": "DELETE", "auth": "permission", "permission": "system.file:sys_folder_asset:delete", "summary": "删除文件夹", "tag": "SysFolderAssetController", "dts": { "parameters": [{ "description": "arg0", "name": "path:arg0", "required": true, "schema": { "type": "integer", "format": "int32", "items": null } }] } }], "columns": [{ "comment": "文件夹ID", "nullable": true, "propertyName": "id", "source": "id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "文件夹名称", "nullable": true, "propertyName": "folderName", "source": "folder_name", "type": "varchar", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "父文件夹ID", "nullable": true, "propertyName": "parentId", "source": "parent_id", "type": "int", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "创建时间", "nullable": true, "propertyName": "createdAt", "source": "created_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "更新时间", "nullable": true, "propertyName": "updatedAt", "source": "updated_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }, { "comment": "删除时间", "nullable": true, "propertyName": "deletedAt", "source": "deleted_at", "type": "datetime", "dict": [], "defaultValue": null, "extensions": null }], "pageColumns": [{ "comment": "页码", "nullable": false, "propertyName": "page", "source": "page", "type": "number", "dict": null, "defaultValue": 1, "extensions": null }, { "comment": "每页数量", "nullable": false, "propertyName": "size", "source": "size", "type": "number", "dict": null, "defaultValue": 20, "extensions": null }, { "comment": "关键词", "nullable": true, "propertyName": "keyword", "source": "keyword", "type": "string", "dict": null, "defaultValue": null, "extensions": null }], "pageQueryOp": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "search": { "fieldEq": [], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "system.file", "namespace": "/api/upload/file/folder" }, { "prefix": "/api/system/base/finance-result", "name": "finance-result", "api": [{ "name": "result", "method": "POST", "path": "/result", "module": "finance.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "finance.base:unknown:create", "summary": "导出结果数据", "tag": "SysFinanceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "summary", "method": "POST", "path": "/summary", "module": "finance.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "finance.base:unknown:create", "summary": "总结", "tag": "SysFinanceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "page", "method": "POST", "path": "/page", "module": "finance.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "finance.base:unknown:create", "summary": "财务结果查询", "tag": "SysFinanceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }, { "name": "top", "method": "POST", "path": "/top", "module": "finance.base", "ignoreToken": false, "action": "CREATE", "auth": "permission", "permission": "finance.base:unknown:create", "summary": "财务差异TOP", "tag": "SysFinanceController", "dts": { "parameters": [{ "description": "arg0", "name": "body:arg0", "required": true, "schema": { "type": "object", "format": null, "items": null } }] } }], "columns": [], "pageColumns": [{ "comment": "", "nullable": false, "propertyName": "materialCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "pageQueryOp": { "fieldEq": [{ "field": "materialCode", "value": "" }, { "field": "position", "value": "" }, { "field": "checkNo", "value": "" }], "fieldLike": [], "keyWordLikeFields": [""] }, "search": { "fieldEq": [{ "comment": "", "nullable": false, "propertyName": "materialCode", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "position", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }, { "comment": "", "nullable": false, "propertyName": "checkNo", "source": "", "type": "string", "dict": null, "defaultValue": "", "extensions": null }], "fieldLike": [], "keyWordLikeFields": [] }, "moduleKey": "finance.base", "namespace": "/api/system/base/finance-result" }],
  isUpdate: false
};
const { service, list } = loadEpsService(epsModule);
exportEpsServiceToGlobal(service);
var eps = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: service,
  list,
  service
});
export {
  eps as a,
  epsModule as e,
  service as s
};
