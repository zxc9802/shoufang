import { NextRequest, NextResponse } from 'next/server'

// Step 1: 图片分析 API
export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const { images } = await req.json()

        console.log('=== 图片分析 API ===')

        const GLM_API_KEY = process.env.GLM_API_KEY
        const GLM_API_URL = process.env.GLM_API_URL

        if (!GLM_API_KEY || !GLM_API_URL) {
            // 没有配置则返回默认描述
            return NextResponse.json({
                imageFeatures: '现代简约风格，采光良好，空间布局合理'
            })
        }

        const imageContent: any[] = images.slice(0, 3).map((url: string) => ({
            type: 'image_url',
            image_url: { url }
        }))
        imageContent.push({
            type: 'text',
            text: '分析这些房源照片的装修材质、风格、采光、空间特征，用一句话总结（50字内）'
        })

        const response = await fetch(GLM_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GLM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'glm-4.6v',
                messages: [{ role: 'user', content: imageContent }]
            })
        })

        if (!response.ok) {
            console.error('GLM Error:', response.status)
            return NextResponse.json({
                imageFeatures: '现代简约风格，采光良好，空间布局合理'
            })
        }

        const data = await response.json()
        const imageFeatures = data.choices?.[0]?.message?.content?.trim() || '现代简约风格，采光良好'

        console.log('✅ 识图成功:', imageFeatures)

        return NextResponse.json({ imageFeatures })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
            imageFeatures: '现代简约风格，采光良好，空间布局合理'
        })
    }
}
