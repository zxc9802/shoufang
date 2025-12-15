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
        const { userId, code } = await req.json()

        if (!userId || !code) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        // 查找卡密
        const { data: redemptionCode, error: codeError } = await supabase
            .from('redemption_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single()

        if (codeError || !redemptionCode) {
            return NextResponse.json({ error: '卡密不存在' }, { status: 404 })
        }

        // 检查是否已使用
        if (redemptionCode.is_used) {
            return NextResponse.json({ error: '该卡密已被使用' }, { status: 409 })
        }

        // 获取用户当前积分
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        const newPoints = user.points + redemptionCode.points

        // 更新用户积分
        await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', userId)

        // 标记卡密为已使用
        await supabase
            .from('redemption_codes')
            .update({
                is_used: true,
                used_by: userId,
                used_at: new Date().toISOString()
            })
            .eq('id', redemptionCode.id)

        // 记录积分交易
        await supabase
            .from('point_transactions')
            .insert({
                user_id: userId,
                amount: redemptionCode.points,
                type: 'redeem',
                description: `兑换卡密: ${code}`,
                balance_after: newPoints
            })

        return NextResponse.json({
            success: true,
            points: redemptionCode.points,
            newBalance: newPoints
        })

    } catch (error) {
        console.error('Redeem error:', error)
        return NextResponse.json({
            error: '兑换失败：' + (error as Error).message
        }, { status: 500 })
    }
}
