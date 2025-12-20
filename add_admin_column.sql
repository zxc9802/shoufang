-- ================================================
-- 管理员账号设置脚本
-- 请在 Supabase SQL Editor 中运行此脚本
-- ================================================

-- 1. 添加 is_admin 字段到 users 表（如果不存在）
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. 创建/更新管理员账号
-- =============================================
-- 管理员账号信息：
--   邮箱: admin@shoufang.ai
--   密码: Admin@123456
-- =============================================

-- 检查是否存在该邮箱账号，如果不存在就插入，存在则更新为管理员
INSERT INTO public.users (id, email, nickname, points, is_admin, password_hash, created_at)
VALUES (
    gen_random_uuid(),
    'admin@shoufang.ai',
    '超级管理员',
    99999,
    true,
    'ad89b64d66caa8e30e5d5ce4a9763f4ecc205814c412175f3e2c50027471426d',
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    is_admin = true,
    nickname = '超级管理员',
    points = GREATEST(public.users.points, 99999);

-- 确认管理员账号已创建
SELECT id, email, nickname, points, is_admin FROM public.users WHERE email = 'admin@shoufang.ai';
