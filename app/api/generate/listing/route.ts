import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { images, propertyInfo } = await req.json()

        console.log('=== API Called ===')

        const GLM_API_KEY = process.env.GLM_API_KEY
        const GLM_API_URL = process.env.GLM_API_URL
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

        // Step 1: GLM-4.6v 识图
        console.log('=== Step 1: GLM Vision ===')
        let imageFeatures = '现代简约风格，采光良好'

        if (GLM_API_KEY && GLM_API_URL) {
            try {
                const imageContent: any[] = images.slice(0, 3).map((url: string) => ({
                    type: 'image_url',
                    image_url: { url }
                }))
                imageContent.push({
                    type: 'text',
                    text: '分析这些房源照片的装修材质、风格、采光、空间特征，用一句话总结（30字内）'
                })

                const glmRes = await fetch(GLM_API_URL, {
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

                if (glmRes.ok) {
                    const data = await glmRes.json()
                    imageFeatures = data.choices?.[0]?.message?.content?.trim() || imageFeatures
                    console.log('✅ 识图成功:', imageFeatures)
                }
            } catch (e) {
                console.log('识图跳过')
            }
        }

        // Step 2: DeepSeek 生成文案
        console.log('=== Step 2: DeepSeek ===')

        const prompt = `你是专业房产文案专家。根据以下信息生成可直接复制使用的文案：

【房源信息】
户型：${propertyInfo.houseType}
面积：${propertyInfo.area}平米
小区：${propertyInfo.communityName}
价格：${propertyInfo.price}万
亮点：${propertyInfo.highlights.join('、') || '无'}
图片分析：${imageFeatures}

【输出要求】严格按格式输出：

===卖点===
• 卖点1
• 卖点2
• 卖点3
• 卖点4
• 卖点5

===贝壳版===
（300-500字专业房源描述，直接可发布）

===小红书版===
（200-400字感性文案，带emoji和#话题标签，直接可发布）

===朋友圈版===
（100-200字简洁文案，直接可发布到微信）`

        const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: '你是专业的房产营销文案专家，擅长撰写各平台风格的房源文案' },
                    { role: 'user', content: prompt }
                ],
                stream: false
            })
        })

        console.log('DeepSeek Status:', deepseekRes.status)

        if (!deepseekRes.ok) {
            const err = await deepseekRes.text()
            console.error('DeepSeek Error:', err)
            throw new Error(`DeepSeek失败: ${err.substring(0, 100)}`)
        }

        const data = await deepseekRes.json()
        const fullContent = data.choices?.[0]?.message?.content || ''

        console.log('✅ 文案生成成功')

        // 解析内容
        const sellingMatch = fullContent.match(/===卖点===([\s\S]*?)===贝壳版===/)
        const beikeMatch = fullContent.match(/===贝壳版===([\s\S]*?)===小红书版===/)
        const xhsMatch = fullContent.match(/===小红书版===([\s\S]*?)===朋友圈版===/)
        const momentsMatch = fullContent.match(/===朋友圈版===([\s\S]*?)$/)

        const sellingPoints = sellingMatch
            ? sellingMatch[1].trim().split('\n').filter((l: string) => l.trim().startsWith('•'))
            : ['• 优质房源', '• 交通便利', '• 装修精美', '• 配套齐全', '• 性价比高']

        return NextResponse.json({
            sellingPoints,
            contents: {
                '贝壳版': beikeMatch?.[1]?.trim() || fullContent,
                '小红书版': xhsMatch?.[1]?.trim() || fullContent,
                '朋友圈版': momentsMatch?.[1]?.trim() || fullContent
            }
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
            error: '生成失败：' + (error as Error).message
        }, { status: 500 })
    }
}
