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

// 使用 12AI Gemini (gemini-2.5-flash-image) 生成3D效果图 - 更快的模型
async function generateFloorPlanImage(imageUrl: string, styleEn: string): Promise<string | null> {
    const apiKey = process.env.AI_12_API_KEY || 'sk-E7zBDATYFYZCT1BviXfmTcdgrAUjXR7KV8FJZV8ojnpLoLuU'

    const prompt = `Transform this floor plan into a 3D bird's eye view interior design render. Keep the exact same room layout and proportions. Add ${styleEn} furniture and decor. Top-down perspective showing all rooms with furniture, professional architectural visualization, warm natural lighting, 8K quality. Generate an image based on this floor plan.`

    try {
        console.log('调用 12AI Gemini (gemini-2.5-flash-image) 生成3D效果图...')

        // 先将图片 URL 转换为 base64
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

        // 使用 Google 原生 API 格式 + 图片输入
        const response = await fetch(`https://cdn.12ai.org/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: imageBase64 } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['IMAGE'],
                    imageConfig: {
                        aspectRatio: '1:1'
                    }
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.log('12AI Image API error:', response.status, errorText)
            return null
        }

        const data = await response.json()

        // 从响应中提取生成的图片
        const candidates = data.candidates || []
        if (candidates.length > 0) {
            const parts = candidates[0].content?.parts || []
            for (const part of parts) {
                if (part.inlineData?.data) {
                    const imgMime = part.inlineData.mimeType || 'image/png'
                    return `data:${imgMime};base64,${part.inlineData.data}`
                }
                if (part.text && part.text.includes('http')) {
                    const urlMatch = part.text.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i)
                    if (urlMatch) return urlMatch[0]
                }
            }
        }

        console.log('未从响应中找到图片', JSON.stringify(data).substring(0, 500))
        return null

    } catch (e) {
        console.error('12AI image error:', e)
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
