# 🏠 RealState AI - 房产文案大师

> **让每套房子都会讲故事** - AI 驱动的房产营销文案生成工具

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange?logo=google)](https://ai.google.dev/)

---

## ✨ 功能特性

### 📸 图片生爆款文案
- 上传 1-9 张房间照片，AI 自动分析
- **AI 视觉分析** - 识别材质类型、采光条件、空间特征
- **卖点智能提取** - 自动生成 5 个核心卖点 + 销售话术
- **多平台文案** - 一键生成贝壳/小红书/朋友圈等多平台适配文案

### 🏗️ 户型图智能分析
- 上传户型图，智能识别空间布局
- **软装建议** - AI 生成专业改造建议
- **风格化剧本** - 独居青年/新婚夫妻/三口之家多种场景
- **AI 效果图** - 调用 Gemini AI 生成优化场景效果图

### 👤 用户系统
- 手机号注册登录
- 积分系统 + 卡密兑换
- 生成历史记录

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 |
| 状态管理 | Zustand |
| UI动效 | Framer Motion |
| 图标库 | Lucide React |
| CSS框架 | Tailwind CSS 4 |
| 数据库 | Supabase (PostgreSQL) |
| 用户认证 | Supabase Auth |
| 文件存储 | Supabase Storage |
| AI 分析 | Gemini Vision Pro |
| AI 生图 | Gemini 2.5 Flash |

---

## 📁 项目结构

```
售房网站/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── analyze/       # AI 图片分析
│   │   ├── auth/          # 用户认证
│   │   ├── generate/      # 文案/图片生成
│   │   ├── history/       # 历史记录
│   │   └── points/        # 积分系统
│   ├── admin/             # 管理后台
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── AuthModal.tsx      # 登录/注册弹窗
│   ├── ImageUploader.tsx  # 图片上传器
│   ├── PropertyForm.tsx   # 房源信息表单
│   ├── ResultPanel.tsx    # 结果展示面板
│   ├── LayoutUploader.tsx # 户型图上传
│   ├── LayoutResult.tsx   # 户型分析结果
│   ├── HistoryPanel.tsx   # 历史记录面板
│   ├── RedeemModal.tsx    # 卡密兑换弹窗
│   └── ...
├── lib/                   # 工具库
├── hooks/                 # 自定义 Hooks
├── store/                 # Zustand 状态
└── supabase/              # Supabase 配置
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-username/realstate-ai.git
cd realstate-ai
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env.local` 文件：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI 配置
GEMINI_API_KEY=your_gemini_api_key
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

---

## 📊 数据库架构

```sql
-- 用户表
users (id, phone, nickname, points, is_admin, created_at)

-- 卡密表
redeem_codes (id, code, points, is_used, used_by, created_at)

-- 生成记录表
generations (id, user_id, type, input_images, output_content, points_cost)
```

---

## 💰 积分规则

| 操作 | 积分消耗 |
|------|----------|
| 图片生文案 | 10 积分 |
| 户型图分析 | 15 积分 |
| 新用户注册 | 赠送 20 积分 |

---

## 🌐 部署

推荐使用 [Vercel](https://vercel.com) 部署:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/realstate-ai)

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

<p align="center">
  Made with ❤️ by RealState AI Team
</p>
