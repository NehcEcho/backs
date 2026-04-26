# 工矿帽平台联调项目

## 1. 项目简介

这是一个围绕 `jiekou.md` 搭建的完整联调工程，分为前后端两个独立目录：

- `backend`：Spring Boot 后端代理
- `frontend`：React + Vite 联调前端

当前项目已经不只是“接口示例”，而是一个可直接启动、登录、联调、查看结果、保存本地记录的真实工作台。

目前已经覆盖：

- 登录与当前用户信息
- 设备列表、详情、更新
- 设备文件查询、图片预览、文件删除
- 历史轨迹查询
- 围栏与报警
- 对讲分组
- GB28181 直播、回放、语音喊话 WebSocket
- 私有 RTC、平台文件、设备文件、下载
- LiveKit Token
- 本地 SQLite 设置、操作日志、报警快照

## 2. 目录结构

```text
backs/
├─ jiekou.md                     # 平台接口文档
├─ README.md                     # 当前说明文档
├─ backend/                      # Spring Boot 后端
│  ├─ src/
│  ├─ pom.xml
│  └─ data/                      # SQLite 数据文件目录
└─ frontend/                     # React + Vite 前端
   ├─ src/
   ├─ package.json
   └─ vite.config.ts
```

## 3. 环境要求

### 后端

- JDK 17 或更高版本
- Maven 3.9 或更高版本

### 前端

- Node.js 18 或更高版本
- npm 9 或更高版本

## 4. 启动前配置

### 4.1 后端默认配置

后端配置文件在 `backend/src/main/resources/application.yml`。

默认关键配置如下：

- 服务端口：`8080`
- 公司接口地址：`https://api.znhaas.net:2443`
- 语音喊话 WebSocket 地址：`wss://api.znhaas.net:2443`
- LiveKit 服务地址：`wss://webrtc.znhaas.net`
- 本地 SQLite 文件：`./data/app.db`

如果后续需要切环境，优先改这里。

### 4.2 前端环境变量

前端默认会请求：

- `http://localhost:8080/api/proxy`

也就是说，只要后端跑在本机 `8080`，前端一般不需要额外配置就能启动。

如果你想自定义，可以在 `frontend/` 下创建 `.env.local`：

```env
VITE_API_BASE_URL=http://localhost:8080/api/proxy
VITE_AMAP_API_KEY=你的高德地图 key
VITE_AMAP_SECURITY_JS_CODE=你的高德安全密钥
```

说明：

- 不填高德 Key，首页地图底图仍会显示占位提示，但不影响大部分接口联调
- 填好高德 Key 后，首页门户会直接渲染真实设备、围栏和报警地图

## 5. 后端启动教程

在项目根目录打开终端后，执行：

```bash
cd backend
mvn spring-boot:run
```

启动成功后，默认访问地址：

- 健康检查：`http://localhost:8080/api/health`
- 代理前缀：`http://localhost:8080/api/proxy`
- 本地能力：`http://localhost:8080/api/local`

### 5.1 后端首次启动会做什么

- 自动创建 SQLite 数据库文件
- 自动初始化表结构
- 自动插入部分默认设置

主要本地表包括：

- `app_settings`
- `operation_logs`
- `alarm_snapshots`

## 6. 前端启动教程

另开一个终端窗口，执行：

```bash
cd frontend
npm install
npm run dev
```

启动成功后，默认访问：

- `http://localhost:5173`

如需打包：

```bash
cd frontend
npm run build
```

## 7. 推荐启动顺序

建议按这个顺序来：

1. 先启动 `backend`
2. 打开 `http://localhost:8080/api/health`，确认后端正常
3. 再启动 `frontend`
4. 打开 `http://localhost:5173`
5. 先登录，再进行各模块联调

## 8. 登录与联调流程

### 8.1 登录

打开前端后，先在登录页输入平台账号密码。

登录成功后：

- 前端会自动保存 token
- 后续所有模块都会自动复用该 token

### 8.2 推荐联调顺序

建议按下面顺序测试，最不容易绕乱：

1. `认证用户`
   - 获取当前用户
   - 验证 token 是否可用
2. `设备管理`
   - 查询设备列表
   - 获取设备详情
   - 查询设备图片
   - 查询历史轨迹
3. `围栏报警`
   - 查询围栏
   - 查询报警
   - 测试更新处理
4. `国标视频`
   - 开始直播
   - 查询录像
   - 开始回放
   - 测试语音喊话
5. `私有 RTC`
   - 查询 RTC 信息
   - 文件检索
   - 下载验证
6. `LiveKit`
   - 生成 Token
7. `本地工位`
   - 查看本地设置
   - 查看操作日志
   - 查看报警快照

## 9. 关键页面说明

### 首页门户

- 展示型首页
- 接入真实设备、围栏、报警数据
- 适合演示，不放调试表单

### 设备管理

- 设备列表、详情、更新
- 设备图片查询后可直接在页面下方渲染照片
- 文件删除支持自动带入 `path`
- 历史轨迹使用时间选择器，不再手填时间戳

### 国标视频

- 支持直播
- 支持录像列表 / 回放
- 支持浏览器端喊话 WebSocket 中继
- 已支持 `pcm`、`g711a`、`g711u`

### 本地工位

这是最近新增的本地能力总入口，主要用于：

- 修改本地设置
- 浏览最近操作日志
- 查看报警快照详情

如果你想确认“我刚刚到底有没有打到后端、报警有没有被同步到本地”，优先看这个页面。

## 10. 常用检查地址

### 后端

```text
GET http://localhost:8080/api/health
GET http://localhost:8080/api/local/settings
GET http://localhost:8080/api/local/operation-logs
GET http://localhost:8080/api/local/alarm-snapshots
```

### 前端

```text
http://localhost:5173
```

## 11. 常见问题

### 11.1 登录成功但接口还是报未授权

排查顺序：

- 确认登录返回里确实拿到了 token
- 确认当前浏览器没清掉 localStorage
- 确认后端已启动且前端请求的还是本地 `8080`

### 11.2 图片能查到但首页地图不显示

通常不是接口问题，而是高德地图配置问题：

- 没填 `VITE_AMAP_API_KEY`
- 没填 `VITE_AMAP_SECURITY_JS_CODE`
- 返回的设备缺少 `longitude` / `latitude`

### 11.3 本地工位没有数据

需要先真实调用过接口，本地日志和快照才会逐步积累：

- 调用代理接口后会记录操作日志
- 调用报警接口后会同步报警快照

### 11.4 设备图片查不到

目前 `/v1/device/file` 按文档是单日 `date` 查询，不是时间区间：

- 默认查今天
- 如需查历史，请切换到对应日期

## 12. 开发建议

- 先保证后端健康检查通过，再开前端
- 不要把平台账号密码写死进代码
- 新增接口时，优先复用后端统一代理风格
- 前端联调页尽量保留“结果摘要 + 原始返回”两层结构，方便排查

## 13. 一组最小可用启动命令

### 启动后端

```bash
cd backend
mvn spring-boot:run
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 打包前端

```bash
cd frontend
npm run build
```

## 14. 当前项目状态

当前仓库已经具备：

- 可运行前端
- 可运行后端
- 登录与完整联调链路
- 本地 SQLite 记录能力
- 图片预览、轨迹时间选择、结果自动回填等体验优化

如果你是第一次接手这个项目，按本 README 的第 5、6、7、8 节走，基本就能把系统跑起来。
