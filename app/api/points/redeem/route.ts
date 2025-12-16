import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing Supabase credentials');
    }
    return createClient(url, key);
};

export async function POST(request: NextRequest) {
    try {
        const { userId, code } = await request.json();

        if (!userId || !code) {
            return NextResponse.json({ error: '请填写兑换码' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 1. 查找卡密
        const { data: redemptionCode, error: codeError } = await supabase
            .from('redemption_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (codeError || !redemptionCode) {
            return NextResponse.json({ error: '无效的兑换码' }, { status: 400 });
        }

        if (redemptionCode.is_used) {
            return NextResponse.json({ error: '该兑换码已被使用' }, { status: 400 });
        }

        // 2. 获取用户当前积分
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 });
        }

        const newBalance = user.points + redemptionCode.points;

        // 3. 更新用户积分
        const { error: updateError } = await supabase
            .from('users')
            .update({ points: newBalance })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ error: '积分更新失败' }, { status: 500 });
        }

        // 4. 标记卡密已使用
        await supabase
            .from('redemption_codes')
            .update({
                is_used: true,
                used_by: userId,
                used_at: new Date().toISOString()
            })
            .eq('id', redemptionCode.id);

        // 5. 记录积分交易
        await supabase.from('point_transactions').insert({
            user_id: userId,
            amount: redemptionCode.points,
            type: 'redeem',
            description: `兑换卡密: ${code.substring(0, 4)}****`,
            balance_after: newBalance
        });

        return NextResponse.json({
            success: true,
            points: redemptionCode.points,
            newBalance
        });

    } catch (error: unknown) {
        console.error('Redeem error:', error);
        return NextResponse.json({ error: '兑换失败，请稍后重试' }, { status: 500 });
    }
}
