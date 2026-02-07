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
sidebar_label: Search Service
sidebar_order: 6
sidebar_group: guides-backend
---

# Search Service (搜索服务)

## 1. Service Description

Search Service is the **search service** of the BTC Shop Flow 3.0 project, providing full-text search, product search, intelligent recommendations, and other functions based on Elasticsearch.

### Main Responsibilities
- Full-text search functionality
- Menu search
- Search suggestions and auto-completion
- Search result sorting and highlighting
- Search history records
- Popular search statistics

## 2. Technology Stack

### Core Framework
| Technology | Version | Description |
|------|------|------|
| Spring Boot | 2.7.6 | Core framework |
| Java | 17 | JDK version |
| Maven | 3.6+ | Project build tool |

### Search Engine
| Technology | Version | Description |
|------|------|------|
| Spring Data Elasticsearch | 4.4.6 | Elasticsearch integration |
| Elasticsearch Client | 7.17.7 | Elasticsearch Java client |

**Features**:
- Full-text search
- Chinese word segmentation and indexing
- Aggregation statistics
- Search result highlighting

### Web Layer
| Technology | Version | Description |
|------|------|------|
| Spring Web | 2.7.6 | REST API development |
| Swagger | 3.0.0 | API documentation generation |
| Springfox Boot Starter | 3.0.0 | Swagger integration |

### Database
| Technology | Version | Description |
|------|------|------|
| MySQL Connector | 8.0.31 | MySQL database driver |

### Microservices Components
| Technology | Version | Description |
|------|------|------|
| Nacos Discovery | 2021.0.5.0 | Service registration and discovery |
| Nacos Config | 2021.0.5.0 | Configuration center |

### Utility Libraries
| Technology | Version | Description |
|------|------|------|
| Lombok | 1.18.24 | Simplify Java code |
| Sa-Token | 1.44.0 | Permission authentication framework |

## 3. Module Structure

```
search-service/
src/main/java/com/btc/searchservice/
controller/ # Controller layer
SearchController.java # Search interfaces
TestController.java # Test interfaces
service/ # Service layer
SearchService.java # Search service
repository/ # ES repository
ProductRepository.java # Product index repository
entity/ # Entity classes
SearchResult.java # Search result entity
config/ # Configuration classes
ElasticsearchConfig.java # ES configuration
SearchServiceApplication.java # Main class
src/main/resources/
application.properties # Configuration file
static/ # Static resources
```

## 4. Core Features

### 1. Full-Text Search
- Multi-field search
- Fuzzy search
- Exact search
- Range search

### 2. Search Optimization
- Chinese word segmentation
- Synonym processing
- Search suggestions
- Auto-completion

### 3. Result Processing
- Search result sorting
- Keyword highlighting
- Pagination support
- Aggregation statistics

### 4. Search Analysis
- Popular search term statistics
- Search history records
- Search trend analysis

## 5. API Interfaces

### Search Interfaces
- `GET /api/search/query` - Search query
- `GET /api/search/suggest` - Search suggestions
- `GET /api/search/hot` - Popular searches
- `GET /api/search/history` - Search history

### Index Management
- `POST /api/search/index/create` - Create index
- `PUT /api/search/index/update` - Update index
- `DELETE /api/search/index/{id}` - Delete index
- `POST /api/search/index/rebuild` - Rebuild index

## 6. Configuration

### Elasticsearch Configuration
```properties
spring.elasticsearch.rest.uris=http://localhost:9200
spring.elasticsearch.rest.username=elastic
spring.elasticsearch.rest.password=password
```

### Index Configuration
```properties
# Index name prefix
search.index.prefix=btc_
# Number of shards
search.index.shards=3
# Number of replicas
search.index.replicas=1
```

## 7. Service Port

- **Default Port**: Not explicitly specified
- **Nacos Registration**: search-service

## 8. Service Dependencies

### External Services
- **Nacos**: Service registry
- **Elasticsearch**: Search engine
- **MySQL**: Metadata storage

## 9. Notes

1. **Elasticsearch Version**: Ensure version compatibility
2. **Index Design**: Reasonably design index structure and sharding strategy
3. **Word Segmenter**: Choose appropriate Chinese word segmenter based on business
4. **Performance Optimization**: Avoid deep pagination, use scroll or search_after
5. **Index Updates**: Regularly sync database data to ES index
