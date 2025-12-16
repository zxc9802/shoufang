import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// 懒加载 Supabase 客户端
const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
        throw new Error('Missing Supabase credentials')
    }
    return createClient(url, key)
}

// 简单的密码哈希函数
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
        }

        const supabase = getSupabase()

        // 查找用户
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single()

        if (error || !user) {
            return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
        }

        // 验证密码
        const hashedPassword = hashPassword(password)
        if (user.password_hash !== hashedPassword) {
            return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
        }

        // 返回用户信息（不包含密码）
        const { password_hash, ...safeUser } = user

        return NextResponse.json({
            success: true,
            user: safeUser
        })

    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
    }
}
