---
title: Search Service (搜索服务)
type: guide
project: backend
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - backend
  - search
  - microservices
sidebar_label: 搜索服务
sidebar_order: 6
sidebar_group: guides-backend
---

# Search Service (搜索服务)

## 1. 服务说明

Search Service是BTC Shop Flow 3.0项目的**搜索服务**，基于Elasticsearch提供全文搜索商品搜索智能推荐等功能

### 主要职责
- 全文搜索功能
- 菜单搜索
- 搜索建议和自动补全
- 搜索结果排序和高亮
- 搜索历史记录
- 热门搜索统计

## 2. 技术栈

### 核心框架
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.7.6 | 核心框架 |
| Java | 17 | JDK版本 |
| Maven | 3.6+ | 项目构建工具 |

### 搜索引擎
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Data Elasticsearch | 4.4.6 | Elasticsearch集成 |
| Elasticsearch Client | 7.17.7 | Elasticsearch Java客户端 |

**功能特性**:
- 全文搜索
- 中文分词和索引
- 聚合统计
- 搜索结果高亮

### Web层
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Web | 2.7.6 | REST API开发 |
| Swagger | 3.0.0 | API文档生成 |
| Springfox Boot Starter | 3.0.0 | Swagger集成 |

### 数据库
| 技术 | 版本 | 说明 |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL数据库驱动 |

### 微服务组件
| 技术 | 版本 | 说明 |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | 服务注册与发现 |
| Nacos Config | 2021.0.5.0 | 配置中心 |

### 工具库
| 技术 | 版本 | 说明 |
|------|------|------|
| Lombok | 1.18.24 | 简化Java代码 |
| Sa-Token | 1.44.0 | 权限认证框架 |

## 3. 模块结构

```
search-service/
src/main/java/com/btc/searchservice/
controller/ # 控制层
SearchController.java # 搜索接口
TestController.java # 测试接口
service/ # 服务层
SearchService.java # 搜索服务
repository/ # ES仓库
ProductRepository.java # 商品索引仓库
entity/ # 实体类
SearchResult.java # 搜索结果实体
config/ # 配置类
ElasticsearchConfig.java # ES配置
SearchServiceApplication.java # 启动类
src/main/resources/
application.properties # 配置文件
static/ # 静态资源
```

## 4. 核心功能

### 1. 全文搜索
- 多字段搜索
- 模糊搜索
- 精确搜索
- 范围搜索

### 2. 搜索优化
- 中文分词
- 同义词处理
- 搜索建议
- 自动补全

### 3. 结果处理
- 搜索结果排序
- 关键词高亮
- 分页支持
- 聚合统计

### 4. 搜索分析
- 热门搜索词统计
- 搜索历史记录
- 搜索趋势分析

## 5. API接口

### 搜索接口
- `GET /api/search/query` - 搜索查询
- `GET /api/search/suggest` - 搜索建议
- `GET /api/search/hot` - 热门搜索
- `GET /api/search/history` - 搜索历史

### 索引管理
- `POST /api/search/index/create` - 创建索引
- `PUT /api/search/index/update` - 更新索引
- `DELETE /api/search/index/{id}` - 删除索引
- `POST /api/search/index/rebuild` - 重建索引

## 6. 配置说明

### Elasticsearch配置
```properties
spring.elasticsearch.rest.uris=http://localhost:9200
spring.elasticsearch.rest.username=elastic
spring.elasticsearch.rest.password=password
```

### 索引配置
```properties
# 索引名称前缀
search.index.prefix=btc_
# 分片数量
search.index.shards=3
# 副本数量
search.index.replicas=1
```

## 7. 服务端口

- **默认端口**: 未明确指定
- **Nacos注册**: search-service

## 8. 服务依赖

### 外部服务
- **Nacos**: 服务注册中心
- **Elasticsearch**: 搜索引擎
- **MySQL**: 元数据存储

## 9. 注意事项

1. **Elasticsearch版本**: 确保版本兼容性
2. **索引设计**: 合理设计索引结构和分片策略
3. **分词器**: 根据业务选择合适的中文分词器
4. **性能优化**: 避免深度分页，使用scroll或search_after
5. **索引更新**: 定期同步数据库数据到ES索引
