import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用 Node.js runtime，设置超长超时时间
export const runtime = 'nodejs'
export const maxDuration = 300 // 5分钟

// 懒加载 Supabase 客户端
const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 使用 yunwu.ai Gemini 3 Pro Image Preview 生成3D效果图
async function generateFloorPlanImage(imageUrl: string, styleEn: string): Promise<string | null> {
    const GEMINI_IMAGE_KEY = process.env.GEMINI_IMAGE_KEY || 'sk-JrZjjnwnrtkLV8i3v8K2TSV9CLTpmHqx0twPjDIjyGYfBuYO'
    const GEMINI_IMAGE_ENDPOINT = 'https://yunwu.ai/v1beta/models/gemini-3-pro-image-preview:generateContent'

    const prompt = `Transform this floor plan into a 3D bird's eye view interior design render. Keep the exact same room layout and proportions. Add ${styleEn} furniture and decor. Top-down perspective showing all rooms with furniture, professional architectural visualization, warm natural lighting, 8K quality. Generate an image based on this floor plan.`

    try {
        console.log('调用 yunwu.ai Gemini 3 Pro Image Preview 生成3D效果图...')

        // 下载图片并转为 base64
        let imageBase64 = ''
        let mimeType = 'image/jpeg'

        try {
            console.log('下载户型图并转为base64...')
            const imageResponse = await fetch(imageUrl)
            if (!imageResponse.ok) {
                throw new Error(`图片下载失败: ${imageResponse.status}`)
            }
            const arrayBuffer = await imageResponse.arrayBuffer()
            imageBase64 = Buffer.from(arrayBuffer).toString('base64')

            const contentType = imageResponse.headers.get('content-type')
            if (contentType && contentType.includes('image/')) {
                mimeType = contentType.split(';')[0]
            }
        } catch (imgError) {
            console.error('户型图下载失败:', imgError)
            return null
        }

        // 使用 Google 原生 API 格式
        const response = await fetch(`${GEMINI_IMAGE_ENDPOINT}?key=${GEMINI_IMAGE_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GEMINI_IMAGE_KEY}`
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: imageBase64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['IMAGE']
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.log('Gemini Image API error:', response.status, errorText)
            return null
        }

        const data = await response.json()

        // 从响应中提取生成的图片
        const candidates = data.candidates || []
        if (candidates.length > 0) {
            const parts = candidates[0].content?.parts || []
            for (const part of parts) {
                // 处理 inlineData (base64)
                if (part.inlineData?.data) {
                    const imgMime = part.inlineData.mimeType || 'image/png'
                    return `data:${imgMime};base64,${part.inlineData.data}`
                }
                // 处理 inline_data (下划线命名)
                if (part.inline_data?.data) {
                    const imgMime = part.inline_data.mime_type || 'image/png'
                    return `data:${imgMime};base64,${part.inline_data.data}`
                }
            }
        }

        console.log('未从响应中找到图片', JSON.stringify(data).substring(0, 500))
        return null

    } catch (e) {
        console.error('Gemini image generation error:', e)
        return null
    }
}

export async function POST(req: NextRequest) {
    const supabase = getSupabase()
    try {
        const body = await req.json()
        const { userId, imageUrl, styleEn } = body

        if (!userId || !imageUrl || !styleEn) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        // 验证用户（不扣分，扣分在第一步由于是并行，我们在第一步扣过了 15分）
        // 这里只是生成，假设第一步已经付费

        console.log('=== 开始生成效果图 API ===')
        let birdviewImage = null

        // 重试机制
        for (let attempt = 1; attempt <= 3; attempt++) {
            birdviewImage = await generateFloorPlanImage(imageUrl, styleEn)
            if (birdviewImage) {
                console.log('✅ 效果图生成成功')
                break
            }
            if (attempt < 3) {
                console.log(`⚠️ 尝试 ${attempt} 失败，等待5秒后重试...`)
                await new Promise(resolve => setTimeout(resolve, 5000))
            }
        }

        if (!birdviewImage) {
            return NextResponse.json({ error: '效果图生成失败' }, { status: 500 })
        }

        // 更新最近的历史记录，添加鸟瞰图
        try {
            const supabase = getSupabase()
            // 获取该用户最近的 layout 类型记录
            const { data: latestRecord } = await supabase
                .from('generation_history')
                .select('id')
                .eq('user_id', userId)
                .eq('type', 'layout')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (latestRecord) {
                await supabase
                    .from('generation_history')
                    .update({ birdview_image: birdviewImage })
                    .eq('id', latestRecord.id)
                console.log('✅ 已更新历史记录的鸟瞰图')
            }
        } catch (historyError) {
            console.error('更新历史记录鸟瞰图失败:', historyError)
            // 不影响主流程
        }

        return NextResponse.json({
            imageUrl: birdviewImage
        })

    } catch (error) {
        console.error('Render error:', error)
        return NextResponse.json({
            error: '生成失败：' + (error as Error).message
        }, { status: 500 })
    }
}
