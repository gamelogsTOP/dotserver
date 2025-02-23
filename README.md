# dotserver
此项目用于上报游戏用户行为记录统计事件
# 遵循 SOLID 原则和关注点分离:
# dotserver 项目结构
```
dotserver/
├── src/
│ ├── config/ # 配置文件
│ ├── core/ # 核心组件
│ ├── api/ # API 路由和控制器
│ ├── services/ # 业务逻辑服务
│ ├── models/ # 数据模型
│ ├── repositories/ # 数据访问层
│ ├── middlewares/ # 中间件
│ └── utils/ # 工具函数
├── tests/ # 测试文件
└── logs/ # 日志文件
```

### src/config/
```
config/
├── index.js           # 主配置文件
├── database.js        # 数据库配置
├── redis.js          # Redis配置
└── logger.js         # 日志配置
```

### src/core/
```
core/
├── MongoManager.js    # MongoDB连接管理
├── RedisManager.js    # Redis连接管理
└── EventEmitter.js    # 事件发射器
```

### src/api/
```
api/
├── controllers/
│   ├── EventController.js    # 事件控制器
│   ├── UserController.js     # 用户控制器
│   └── AdminController.js    # 管理控制器
├── routes/
│   ├── index.js             # 路由主文件
│   ├── eventRoutes.js       # 事件相关路由
│   ├── userRoutes.js        # 用户相关路由
│   └── adminRoutes.js       # 管理相关路由
```

### src/services/
```
services/
├── EventService.js          # 事件处理服务
├── UserService.js           # 用户管理服务
├── CacheService.js          # 缓存服务
└── AnalyticsService.js      # 数据分析服务
```

### src/models/
```
models/
├── Event.js                # 事件模型
├── User.js                # 用户模型
└── Session.js             # 会话模型
```

### src/repositories/
```
repositories/
├── EventRepository.js     # 事件数据访问
├── UserRepository.js      # 用户数据访问
└── SessionRepository.js   # 会话数据访问
```

### src/middlewares/
```
middlewares/
├── auth.js               # 认证中间件
├── rateLimiter.js       # 限流中间件
├── errorHandler.js       # 错误处理中间件
├── validator.js         # 请求验证中间件
└── logger.js            # 日志中间件
```

### src/utils/
```
utils/
├── logger.js            # 日志工具
├── validators.js        # 数据验证工具
├── helpers.js          # 通用辅助函数
└── constants.js        # 常量定义
```

### tests/
```
tests/
├── unit/
│   ├── services/
│   │   └── EventService.test.js
│   ├── models/
│   │   └── Event.test.js
│   └── utils/
│       └── validators.test.js
├── integration/
│   ├── api/
│   │   └── events.test.js
│   └── database/
│       └── mongo.test.js
└── setup.js
```

### 应用根目录其他文件
```
dotserver/
├── package.json
├── README.md
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── jest.config.js
```

这个文件结构遵循以下原则：
1. 清晰的职责分离
2. 模块化设计
3. 易于测试
4. 可扩展性
5. 符合Node.js最佳实践

每个目录都有其特定的职责：

- core: 核心功能组件
- api: API接口和路由定义
- `services/`: 业务逻辑实现
- models: 数据模型定义
- repositories: 数据访问层封装
- middlewares: 中间件功能
- utils: 通用工具函数
- `tests/`: 单元测试和集成测试

这种结构便于团队协作和代码维护，同时也方便进行单元测试和集成测试。
