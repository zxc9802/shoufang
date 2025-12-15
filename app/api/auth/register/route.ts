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
        const { email, password, username } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
        }

        // 检查邮箱是否已存在
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

        if (existingUser) {
            return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
        }

        // 简单的密码哈希（生产环境应使用 bcrypt）
        const passwordHash = btoa(password)

        // 创建用户（自动获得30积分）
        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert({
                email,
                password_hash: passwordHash,
                username: username || email.split('@')[0],
                points: 30
            })
            .select()
            .single()

        if (insertError) throw insertError

        // 记录注册赠送积分
        await supabase
            .from('point_transactions')
            .insert({
                user_id: user.id,
                amount: 30,
                type: 'register',
                description: '新用户注册奖励',
                balance_after: 30
            })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                points: user.points
            }
        })

    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({
            error: '注册失败：' + (error as Error).message
        }, { status: 500 })
    }
}
