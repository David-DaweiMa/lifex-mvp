# LifeX 数据库现状分析报告

## 概述
基于 `/api/test/db?action=all_tables` 的检查结果，以下是 Supabase 数据库中现有表和数据量的完整分析。

## 核心业务表

### 1. 用户相关表
- `profiles` - 用户档案表 (数据量: 待确认)
- `user_profiles` - 用户详细档案 (数据量: 待确认)
- `users` - 用户基础信息 (数据量: 待确认)

### 2. 商家相关表
- `businesses` - 商家主表 (数据量: 大量数据，具体数量待确认)
- `business_menus` - 商家菜单 (数据量: 有数据)
- `business_descriptions` - 商家描述 (数据量: 有数据)
- `business_editorial_summaries` - 商家编辑摘要 (数据量: 有数据)

### 3. 内容相关表
- `posts` - 帖子表 (数据量: 待确认)
- `trending_posts` - 热门帖子 (数据量: 待确认)
- `chat_messages` - 聊天消息 (数据量: 待确认)

### 4. 广告相关表
- `advertisements` - 广告表 (数据量: 待确认)

## 商家详细功能表

### 菜单相关
- `business_menus` - 主菜单表
- `business_menu_photos` - 菜单照片
- `business_menu_links` - 菜单链接

### 服务相关
- `business_services` - 商家服务
- `service_items` - 服务项目
- `service_photos` - 服务照片

### 照片和媒体
- `business_photos` - 商家照片
- `business_gallery_photos` - 商家画廊照片
- `business_cover_photos` - 商家封面照片

### 评价和评论
- `business_reviews` - 商家评价
- `business_ratings` - 商家评分

### 预订和预约
- `bookings` - 预订表
- `business_booking_settings` - 预订设置

### 促销和活动
- `business_promotions` - 商家促销
- `promotion_photos` - 促销照片
- `events` - 活动表
- `event_photos` - 活动照片

### 区域和服务范围
- `business_service_areas` - 服务区域
- `business_delivery_areas` - 配送区域
- `business_pickup_areas` - 自提区域
- `business_catering_areas` - 餐饮服务区域

### 营业时间和设置
- `business_hours` - 营业时间
- `business_settings` - 商家设置
- `business_contact_info` - 联系信息

## 系统功能表

### 分类和标签
- `categories` - 分类表
- `business_categories` - 商家分类关联
- `tags` - 标签表
- `business_tags` - 商家标签关联

### 用户行为跟踪
- `user_preferences` - 用户偏好
- `saved_businesses` - 收藏的商家
- `viewed_businesses` - 浏览过的商家
- `user_quotas` - 用户配额

### 数据采集和分析
- `scraping_logs` - 数据采集日志
- `business_structured_data` - 商家结构化数据
- `analytics_events` - 分析事件

## 特殊功能表

### 多语言支持
- `business_translations` - 商家翻译
- `menu_translations` - 菜单翻译

### 高级功能
- `business_ai_summaries` - AI生成的商家摘要
- `business_sentiment_analysis` - 情感分析
- `business_trending_scores` - 趋势评分

## 数据量统计

### 主要数据表
1. **businesses** - 核心商家数据 (**2,156 条记录**)
   - 包含完整的商家信息：名称、地址、电话、网站、营业时间、评分、评论数等
   - 数据来源：Google Places API
   - 覆盖地区：主要集中在新西兰奥克兰地区
   - 商家类型：房地产、银行、法律、零售、餐饮、服务等

### 空数据表（已创建但无数据）
- **profiles** - 用户档案表 (0 条记录)
- **user_profiles** - 用户详细档案 (0 条记录)
- **users** - 用户基础信息 (0 条记录)
- **products** - 产品表 (0 条记录)
- **posts** - 帖子表 (0 条记录)
- **trending_posts** - 热门帖子 (0 条记录)
- **chat_messages** - 聊天消息 (0 条记录)
- **advertisements** - 广告表 (0 条记录)
- **subscriptions** - 订阅表 (0 条记录)
- **quotas** - 配额表 (0 条记录)
- **user_quotas** - 用户配额 (0 条记录)
- **usage_statistics** - 使用统计 (0 条记录)
- **ad_impressions** - 广告展示 (0 条记录)
- **user_preferences** - 用户偏好 (0 条记录)
- **search_history** - 搜索历史 (0 条记录)
- **user_actions** - 用户行为 (0 条记录)
- **notifications** - 通知表 (0 条记录)

### 待确认数据量的表
- business_menus
- business_descriptions
- business_editorial_summaries
- 其他商家相关表

## 商家数据详细分析

### 数据来源和质量
- **数据来源**: Google Places API
- **数据更新时间**: 2025年4月11日
- **数据质量**: 高质量，包含完整的商家信息
- **数据完整性**: 大部分记录包含完整的基础信息

### 商家类型分布
基于样本数据分析，主要商家类型包括：
1. **房地产服务** - 房地产中介、物业管理
2. **金融服务** - 银行、保险
3. **法律服务** - 律师事务所、移民服务
4. **零售商店** - 服装、鞋类、运动用品
5. **餐饮服务** - 餐厅、咖啡店
6. **专业服务** - 教育、医疗、美容

### 地理位置分布
- **主要城市**: 奥克兰 (Auckland)
- **主要区域**: Newmarket, Remuera, Epsom, Mount Eden, Parnell
- **邮编范围**: 1010-1052

### 数据字段完整性
**完整字段**:
- 商家名称 (name)
- 地址信息 (address, city, country, postal_code)
- 地理坐标 (latitude, longitude)
- 联系信息 (phone, website)
- 营业时间 (opening_hours)
- 评分和评论 (rating, review_count)
- 外部ID (external_id, external_source)

**部分完整字段**:
- 邮箱 (email) - 大部分为空
- 价格范围 (price_range) - 大部分为空
- 设施信息 (amenities) - 部分记录包含

### 数据特点
1. **高评分商家**: 大部分商家评分在3.5-5.0之间
2. **活跃商家**: 大部分商家标记为活跃状态 (is_active=True)
3. **未认领商家**: 所有商家都标记为未认领 (is_claimed=False)
4. **Google地图集成**: 所有商家都有Google地图链接
5. **图片资源**: 大部分商家都有logo和封面图片URL

## 数据库关系分析

### 核心关系
1. **用户 → 商家**: 通过 user_profiles 和 businesses 关联
2. **商家 → 菜单**: 通过 business_menus 和 business_menu_photos 关联
3. **商家 → 服务**: 通过 business_services 和 service_items 关联
4. **商家 → 评价**: 通过 business_reviews 关联
5. **商家 → 预订**: 通过 bookings 关联

### 数据流向
1. **数据采集**: scraping_logs → business_structured_data
2. **内容生成**: business_descriptions → business_editorial_summaries
3. **用户交互**: user_preferences → saved_businesses → viewed_businesses
4. **分析反馈**: analytics_events → business_trending_scores

## 建议的开发策略

### 第一阶段：核心功能（基于现有数据）
1. **商家展示系统** - 基于现有的2,156条商家数据
   - 商家列表页面
   - 商家详情页面
   - 搜索和筛选功能
   - 地图集成（利用现有的Google地图链接）

2. **用户认证系统** - 创建用户数据
   - 用户注册和登录
   - 用户档案管理
   - 权限控制

3. **基础UI框架** - 响应式设计
   - 移动端优化
   - 现代化UI组件
   - 导航和布局

### 第二阶段：交互功能（需要创建数据）
1. **聊天系统** - 基于AI的智能对话
   - 用户与AI的对话
   - 商家推荐功能
   - 对话历史记录

2. **内容系统** - 用户生成内容
   - 帖子发布功能
   - 热门内容展示
   - 内容互动功能

3. **广告系统** - 嵌入式广告
   - 广告展示逻辑
   - 广告点击跟踪
   - 广告效果分析

### 第三阶段：高级功能（扩展功能）
1. **商家管理** - 商家认领和验证
   - 商家信息更新
   - 商家认证流程
   - 商家管理后台

2. **评价系统** - 用户评价和评分
   - 评价发布功能
   - 评分计算
   - 评价管理

3. **预订系统** - 在线预订服务
   - 预订流程
   - 时间管理
   - 通知系统

### 第四阶段：优化和扩展
1. **性能优化** - 数据库和前端优化
2. **数据分析** - 用户行为分析
3. **移动应用** - 原生移动应用开发

## 注意事项

1. **数据完整性**: 现有数据需要验证完整性和一致性
2. **性能优化**: 大量数据表需要适当的索引和查询优化
3. **权限控制**: 需要实现适当的 Row Level Security (RLS) 策略
4. **数据迁移**: 新功能开发时需要考虑与现有数据的兼容性

## 立即行动建议

### 本周内完成
1. **启动开发服务器** - 解决EPERM错误
   - 清理 `.next` 缓存目录
   - 检查端口占用情况
   - 确保开发环境稳定

2. **创建基础页面** - 基于现有商家数据
   - 商家列表页面 (`/businesses`)
   - 商家详情页面 (`/businesses/[id]`)
   - 搜索页面 (`/search`)

3. **实现用户认证** - 基础功能
   - 用户注册页面
   - 用户登录页面
   - 用户档案页面

### 下周内完成
1. **AI聊天功能** - 集成现有AI系统
   - 聊天界面优化
   - 商家推荐逻辑
   - 对话历史管理

2. **内容系统** - 基础功能
   - 帖子发布功能
   - 内容展示页面
   - 基础互动功能

3. **广告系统** - 嵌入式广告
   - 广告展示逻辑
   - 广告数据管理
   - 效果跟踪

### 长期计划
1. **数据扩展** - 丰富商家信息
   - 菜单数据采集
   - 商家描述生成
   - 图片资源管理

2. **功能完善** - 高级功能
   - 预订系统
   - 评价系统
   - 商家管理后台

3. **性能优化** - 系统优化
   - 数据库查询优化
   - 前端性能优化
   - 用户体验改进
