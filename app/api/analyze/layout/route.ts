import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用 Node.js runtime 避免 Edge 10秒超时限制
export const runtime = 'nodejs'
export const maxDuration = 300 // 增加到300秒，适配 Zeabur

// 软装风格描述
const STYLE_DESCRIPTIONS: Record<string, { cn: string, en: string }> = {
    japandi: { cn: '日式侘寂风格', en: 'Japandi style, natural wood tones, zen minimalist, cream and earth colors' },
    cream: { cn: '奶油风', en: 'cream style, soft beige ivory tones, cozy warm, gentle curves, modern' },
    minimalist: { cn: '现代极简', en: 'modern minimalist, black white gray, sleek furniture, clean lines' },
    nordic: { cn: '北欧风', en: 'Scandinavian style, white walls, light wood, bright airy' },
    french: { cn: '法式轻奢', en: 'French luxury, elegant moldings, gold accents, romantic' },
    industrial: { cn: '工业风', en: 'industrial style, exposed concrete, metal elements, vintage' },
    chinese: { cn: '新中式', en: 'new Chinese style, traditional elements, dark wood, ink painting' },
    american: { cn: '美式乡村', en: 'American country style, warm cozy, distressed wood, vintage' }
}

// 生活场景描述
const SCENE_DESCRIPTIONS: Record<string, { cn: string, keywords: string }> = {
    single: {
        cn: '独居青年',
        keywords: 'Chill、自由、开放厨房、阅读角、绿植、咖啡时光、窝在沙发追剧'
    },
    couple: {
        cn: '新婚夫妻',
        keywords: '浪漫、双人空间、温馨、周末早餐、一起做饭、电影之夜'
    },
    family: {
        cn: '三口之家',
        keywords: '安全、儿童友好、储物空间、学习区、亲子时光、成长陪伴'
    }
}

// 软装建议提示词（严谨版本，适配 GLM-4.6V）
const ROOM_SUGGESTIONS_PROMPT = `【任务说明】
你是一位专业的室内设计师，请仔细分析用户上传的户型图图片，识别图中的所有房间，并为每个房间生成软装设计建议。

【设计风格】
{STYLE_DESCRIPTION}

【分析步骤】
1. 首先识别图片中的户型结构，包括：客厅、卧室、厨房、卫生间、阳台等
2. 分析每个房间的面积和采光情况
3. 根据指定风格，为每个房间生成具体的软装建议

【输出要求】
请严格按照以下JSON格式输出，不要添加任何其他文字或解释：

{
  "analysis": "这是一个XX平米的户型，包含X室X厅X卫。整体格局方正/紧凑，采光良好/一般。（50-80字的整体分析）",
  "rooms": [
    {
      "name": "客厅",
      "suggestions": {
        "布局": "沙发靠墙摆放，茶几选择圆形款式，电视柜采用悬浮式设计（20-30字）",
        "配色": "主色调采用米白色，搭配原木色家具，用绿植点缀（20-30字）",
        "材质": "布艺沙发、实木茶几、棉麻窗帘（10-20字）",
        "氛围": "主灯选暖光吊灯，辅以落地灯营造温馨感（10-20字）"
      }
    }
  ]
}

【注意事项】
- 只输出JSON，不要有任何前缀或后缀文字
- rooms数组中必须包含图中识别到的所有房间
- 每个建议要具体可执行，不要空泛
- 如果图片模糊或无法识别，analysis中说明原因`

// 场景剧本提示词
const STORY_SCRIPT_PROMPT = `你是房产文案专家。

根据以下户型和软装信息，为{SCENE_PERSONA}写200-300字生活场景描述。

户型信息：{ANALYSIS}
软装风格：{STYLE_DESCRIPTION}
目标人群：{SCENE_PERSONA}
场景关键词：{SCENE_KEYWORDS}

要求：
1. 用第二人称"你"
2. 包含具体时间、动作、感受
3. 结合场景关键词描述典型生活片段
4. 语言温暖有画面感
5. 不用特殊符号

直接输出文字`

// 使用 12AI Gemini 识别户型图并生成软装建议
async function analyzeFloorPlanWithGemini(imageUrl: string, styleCn: string): Promise<{ analysis: string, rooms: any[], error?: string } | null> {
    const apiKey = process.env.AI_12_API_KEY || 'sk-E7zBDATYFYZCT1BviXfmTcdgrAUjXR7KV8FJZV8ojnpLoLuU'

    const prompt = ROOM_SUGGESTIONS_PROMPT.replace('{STYLE_DESCRIPTION}', styleCn)

    try {
        console.log('调用 12AI Gemini (gemini-2.5-flash-image) 识别户型图...')

        // 先将图片 URL 转换为 base64
        let imageBase64 = ''
        let mimeType = 'image/jpeg'

        try {
            console.log('下载图片并转为base64...')
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
            console.error('图片下载失败:', imgError)
            return { analysis: '', rooms: [], error: `图片加载失败: ${(imgError as Error).message}` }
        }

        // 使用 Google 原生 API 格式
        const response = await fetch(`https://cdn.12ai.org/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: imageBase64 } }
                    ]
                }]
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.log('12AI API error:', response.status, errorText)
            return { analysis: '', rooms: [], error: `12AI API错误: ${response.status} - ${errorText.substring(0, 100)}` }
        }

        const data = await response.json()

        // 从 Google 原生格式中提取文本
        let content = ''
        const candidates = data.candidates || []
        if (candidates.length > 0) {
            const parts = candidates[0].content?.parts || []
            for (const part of parts) {
                if (part.text) content += part.text
            }
        }

        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        try {
            const parsed = JSON.parse(content)
            return { analysis: parsed.analysis || '', rooms: parsed.rooms || [] }
        } catch (e) {
            console.log('JSON解析失败:', content.substring(0, 300))
            return { analysis: '', rooms: [], error: `AI响应格式错误 (JSON解析失败)` }
        }

    } catch (e) {
        console.error('12AI API error:', e)
        return { analysis: '', rooms: [], error: `调用失败: ${(e as Error).message}` }
    }
}

// 懒加载 Supabase 客户端
const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, imageUrl, style, scene } = body

        console.log('=== 户型分析 API (Text Only) ===')
        console.log('选择的风格:', style)
        console.log('选择的场景:', scene)

        if (!userId) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 })
        }

        const SYDNEY_API_KEY = process.env.SYDNEY_AI_API_KEY
        if (!SYDNEY_API_KEY) {
            return NextResponse.json({ error: '缺少SYDNEY_AI_API_KEY' }, { status: 500 })
        }

        const supabase = getSupabase()

        // 获取当前积分
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        if (user.points < 15) {
            return NextResponse.json({
                error: '积分不足！户型分析需要15积分，请充值后再试'
            }, { status: 403 })
        }

        // 预先扣除积分（15积分）
        const newPoints = user.points - 15

        await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', userId)

        await supabase
            .from('point_transactions')
            .insert({
                user_id: userId,
                amount: -15,
                type: 'consume',
                description: `户型分析: ${style}`,
                balance_after: newPoints
            })

        console.log(`用户 ${userId} 消耗15积分，剩余: ${newPoints}`)

        const styleInfo = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.cream

        // Step 1: 识别户型图
        console.log('Step 1/2: 识别户型图...')
        const analysisResult = await analyzeFloorPlanWithGemini(imageUrl, styleInfo.cn)

        if (!analysisResult || analysisResult.error) {
            const errorDetail = analysisResult?.error || '未知错误'
            return NextResponse.json({ error: `户型识别失败：${errorDetail}` }, { status: 500 })
        }

        const { analysis, rooms } = analysisResult
        console.log(`✅ Step 1/2 完成`)

        // Step 2: 生成场景剧本
        console.log('Step 2/2: 生成场景剧本...')
        const sceneInfo = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS.single
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

        let storyScript = ''
        if (DEEPSEEK_API_KEY) {
            const scriptPrompt = STORY_SCRIPT_PROMPT
                .replace('{ANALYSIS}', analysis)
                .replace('{STYLE_DESCRIPTION}', styleInfo.cn)
                .replace(/{SCENE_PERSONA}/g, sceneInfo.cn)
                .replace('{SCENE_KEYWORDS}', sceneInfo.keywords)

            try {
                const scriptRes = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: '你是房产文案专家' },
                            { role: 'user', content: scriptPrompt }
                        ],
                        stream: false
                    })
                })
                const scriptData = await scriptRes.json()
                storyScript = scriptData.choices?.[0]?.message?.content?.trim() || ''
                // 清理 markdown
                storyScript = storyScript.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s*/g, '')
            } catch (e) {
                console.error('Script generation failed:', e)
                // 剧本生成失败不影响主要流程
            }
        }

        return NextResponse.json({
            analysis,
            roomSuggestions: rooms,
            storyScript,
            styleName: styleInfo.cn,
            styleEn: styleInfo.en, // 返回英文风格名供第二步使用
            sceneName: sceneInfo.cn,
            newPoints
        })

    } catch (error) {
        console.error('Analyze error:', error)
        return NextResponse.json({
            error: '分析失败：' + (error as Error).message
        }, { status: 500 })
    }
}
