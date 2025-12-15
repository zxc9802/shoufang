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

// 使用 Gemini 3 Pro 生成与户型图一致的3D效果图
async function generateFloorPlanImage(imageUrl: string, styleEn: string): Promise<string | null> {
    const apiKey = process.env.SYDNEY_AI_API_KEY
    const baseUrl = process.env.SYDNEY_AI_BASE_URL || 'https://api.sydney-ai.com/v1'

    if (!apiKey) {
        console.log('未配置 SYDNEY_AI_API_KEY')
        return null
    }

    const prompt = `Transform this floor plan into a 3D bird's eye view interior design render. Keep the exact same room layout and proportions. Add ${styleEn} furniture and decor. Top-down perspective showing all rooms with furniture, professional architectural visualization, warm natural lighting, 8K quality.`

    try {
        console.log('调用 Gemini 3 Pro 生成3D效果图...')

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                model: 'gemini-3-pro-image-preview-2k',
                stream: false,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }]
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.log('Gemini Image API error:', response.status, errorText)
            return null
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        // 尝试提取图片URL
        if (data.choices?.[0]?.message?.image_url) {
            return data.choices[0].message.image_url.url || data.choices[0].message.image_url
        }

        // 如果内容是 markdown 图片链接
        if (typeof content === 'string') {
            const urlMatch = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i)
            if (urlMatch) return urlMatch[0]
            if (content.startsWith('http')) return content
        }

        console.log('未从响应中找到图片URL')
        return null

    } catch (e) {
        console.error('Gemini image error:', e)
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

        // 转存图片的逻辑我们先简化，直接返回 URL，让前端去处理或者如果有余力再转存
        // 为了稳健，我们应该转存到 Supabase，但为了避免 OOM，我们先直接返回 URL
        // 如果是 Vercel/Zeabur，服务端下载再上传可能也会超时。
        // 最好的做法是前端拿到 URL 只有展示，或者前端去转存。
        // 这里我们直接返回 URL。

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
