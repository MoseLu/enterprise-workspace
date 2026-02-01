## 健康检查接口规范

| **用户状态（userStatus）** | 描述当前用户的凭证 / 权限情况 | valid（凭证有效）、expired（已过期）、soon_expire（即将过期）、unauthorized（未授权） |
| :------------------------: | ----------------------------- | ------------------------------------------------------------ |

```json
{
  "status": "soon_expire",        // 用户状态即将过期
  "serverCurrentTime": "2025-12-19T14:20:00Z",  // 服务端UTC当前时间
  "credentialExpireTime": "2025-12-19T14:30:00Z" // 当前用户凭证的过期时间
  "remainingTime": 60,  // 剩余60秒过期（秒）
  "details": "服务正常，登录凭证即将过期"
}
```

```json
{
  "status": "valid",        // 用户状态凭证有效
  "serverCurrentTime": "2025-12-19T14:20:00Z",  // 服务端UTC当前时间
  "credentialExpireTime": "2025-12-19T14:30:00Z" // 当前用户凭证的过期时间
  "remainingTime": 6666,  // 剩余60秒过期（秒）
  "details": "服务正常"
}
```

```json
{
  "status": "unauthorized",        // 用户状态未授权
  "serverCurrentTime": "",  // 服务端UTC当前时间
  "credentialExpireTime": "" // 当前用户凭证的过期时间
  "remainingTime": 0,  // 剩余过期（秒）此时为默认值
  "details": "用户未授权，需要注册后方可使用健康检查"
}
```

```json
{
  "status": "expired",        // 用户状态已过期
  "serverCurrentTime": "2025-12-19T14:20:00Z",  // 服务端UTC当前时间
  "credentialExpireTime": "2025-12-19T14:30:00Z" // 当前用户凭证的过期时间
  "remainingTime": 0,  // 剩余0秒过期（秒）
  "details": "服务已过期"
}
```

