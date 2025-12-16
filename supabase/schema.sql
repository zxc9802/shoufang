-- ============================================
-- RealState AI 积分系统数据库表
-- ============================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 卡密表
CREATE TABLE IF NOT EXISTS redemption_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  points INTEGER NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 积分交易记录表
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('register', 'redeem', 'consume')),
  description TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_code ON redemption_codes(code);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_is_used ON redemption_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能查看自己的积分记录
CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 卡密表：所有人可查询（用于验证），但不能修改
CREATE POLICY "Anyone can view redemption codes" ON redemption_codes
  FOR SELECT USING (true);

-- 插入几个测试卡密（仅供开发测试）
INSERT INTO redemption_codes (code, points) VALUES
  ('TEST1234ABCD5678', 50),
  ('DEMO9876EFGH4321', 100),
  ('GIFT5555IJKL9999', 200)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE users IS '用户表：存储注册用户信息和积分余额';
COMMENT ON TABLE redemption_codes IS '卡密表：16位兑换码及对应积分';
COMMENT ON TABLE point_transactions IS '积分交易记录：所有积分变动的历史';

-- ============================================
-- 生成记录表 (最近5条)
-- ============================================
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('listing', 'layout')),
  
  -- 通用字段
  input_images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- listing 类型字段
  property_info JSONB,
  listing_result JSONB,
  
  -- layout 类型字段
  style_name TEXT,
  scene_name TEXT,
  layout_result JSONB,
  birdview_image TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON generation_history(created_at DESC);

COMMENT ON TABLE generation_history IS '生成记录表：存储用户最近5次生成结果';
