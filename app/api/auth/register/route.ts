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
        const { email, password, username } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
        }

        const supabase = getSupabase()

        // 检查邮箱是否已注册
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single()

        if (existingUser) {
            return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
        }

        // 创建用户
        const hashedPassword = hashPassword(password)
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email: email.toLowerCase(),
                password_hash: hashedPassword,
                username: username || null,
                points: 30 // 注册赠送30积分
            })
            .select()
            .single()

        if (error) {
            console.error('Register error:', error)
            return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
        }

        // 记录积分交易
        await supabase.from('point_transactions').insert({
            user_id: newUser.id,
            amount: 30,
            type: 'register',
            description: '注册赠送',
            balance_after: 30
        })

        // 返回用户信息（不包含密码）
        const { password_hash, ...safeUser } = newUser

        return NextResponse.json({
            success: true,
            user: safeUser
        })

    } catch (error: any) {
        console.error('Register error:', error)
        return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
    }
}
