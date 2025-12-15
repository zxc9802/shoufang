import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// 懒加载 Supabase 客户端，避免构建时因缺少环境变量报错
const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    const supabase = getSupabase()
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
        }

        // 查找用户
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        // 验证密码
        const passwordHash = btoa(password)
        if (user.password_hash !== passwordHash) {
            return NextResponse.json({ error: '密码错误' }, { status: 401 })
        }

        // 更新最后登录时间
        await supabase
            .from('users')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id)

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                points: user.points,
                avatar_url: user.avatar_url
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({
            error: '登录失败：' + (error as Error).message
        }, { status: 500 })
    }
}
