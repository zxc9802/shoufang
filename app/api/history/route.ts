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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('generation_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('获取历史记录失败:', error);
            // 如果表不存在，返回空数组
            return NextResponse.json({ history: [] });
        }

        return NextResponse.json({ history: data || [] });
    } catch (error: unknown) {
        console.error('History API Error:', error);
        return NextResponse.json({ history: [] });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, type, inputImages, propertyInfo, listingResult, styleName, sceneName, layoutResult, birdviewImage } = body;

        if (!userId || !type) {
            return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { error: insertError } = await supabase
            .from('generation_history')
            .insert({
                user_id: userId,
                type,
                input_images: inputImages || [],
                property_info: propertyInfo || null,
                listing_result: listingResult || null,
                style_name: styleName || null,
                scene_name: sceneName || null,
                layout_result: layoutResult || null,
                birdview_image: birdviewImage || null
            });

        if (insertError) {
            console.error('保存记录失败:', insertError);
            return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }

        const { data: allRecords } = await supabase
            .from('generation_history')
            .select('id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (allRecords && allRecords.length > 5) {
            const idsToDelete = allRecords.slice(5).map(r => r.id);
            await supabase.from('generation_history').delete().in('id', idsToDelete);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('History POST Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
