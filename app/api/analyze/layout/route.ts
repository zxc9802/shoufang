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

// 软装建议提示词（让 Gemini 直接识别户型图）
const ROOM_SUGGESTIONS_PROMPT = `你是专业室内设计师。请分析用户上传的户型图，然后为每个房间生成软装建议。

设计风格：{STYLE_DESCRIPTION}

请先列出户型图中所有房间，然后为每个房间生成软装建议。

输出JSON格式：
{
  "analysis": "户型分析（50-100字）",
  "rooms": [
    {
      "name": "房间名",
      "suggestions": {
        "布局": "家具摆放（20-30字）",
        "配色": "颜色搭配（20-30字）",
        "材质": "推荐材质（10-20字）",
        "氛围": "灯光设计（10-20字）"
      }
    }
  ]
}

只输出JSON，不要其他内容`

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

// 使用 Sydney AI Gemini 3 Pro 识别户型图并生成软装建议
async function analyzeFloorPlanWithGemini(imageUrl: string, styleCn: string): Promise<{ analysis: string, rooms: any[], error?: string } | null> {
    const apiKey = process.env.SYDNEY_AI_API_KEY
    const baseUrl = process.env.SYDNEY_AI_BASE_URL || 'https://api.sydney-ai.com/v1'

    if (!apiKey) {
        console.log('未配置 SYDNEY_AI_API_KEY')
        return { analysis: '', rooms: [], error: 'SYDNEY_AI_API_KEY未配置' }
    }

    const prompt = ROOM_SUGGESTIONS_PROMPT.replace('{STYLE_DESCRIPTION}', styleCn)

    try {
        console.log('调用 Gemini 3 Pro 识别户型图...')

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
            console.log('Gemini API error:', response.status, errorText)
            // 返回更详细的错误信息
            let errorDetail = `Gemini API错误: ${response.status}`
            if (response.status === 403) {
                errorDetail = `访问被拒绝(403)：可能是API Key无效或地区限制。详情: ${errorText.substring(0, 100)}`
            }
            return { analysis: '', rooms: [], error: errorDetail }
        }

        const data = await response.json()
        let content = data.choices?.[0]?.message?.content || ''

        // 清理 markdown 代码块
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        try {
            const parsed = JSON.parse(content)
            return {
                analysis: parsed.analysis || '',
                rooms: parsed.rooms || []
            }
        } catch (e) {
            console.log('JSON解析失败:', content.substring(0, 200))
            return null
        }

    } catch (e) {
        console.error('Gemini API error:', e)
        return null
    }
}

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

        // 解析响应中的图片
        if (Array.isArray(content)) {
            for (const item of content) {
                if (item.type === 'image_url' || item.image_url) {
                    return item.image_url?.url || item.url
                }
            }
        }

        if (typeof content === 'string') {
            if (content.startsWith('data:image')) return content
            const urlMatch = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i)
            if (urlMatch) return urlMatch[0]
        }

        if (data.choices?.[0]?.message?.image_url) {
            return data.choices[0].message.image_url
        }

        console.log('未找到图片')
        return null

    } catch (e) {
        console.error('Gemini image error:', e)
        return null
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, imageUrl, style, scene } = body

        console.log('=== 户型分析 API (Sydney AI) ===')
        console.log('选择的风格:', style)
        console.log('选择的场景:', scene)

        // 检查是否登录
        if (!userId) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 })
        }

        const SYDNEY_API_KEY = process.env.SYDNEY_AI_API_KEY
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

        if (!SYDNEY_API_KEY) {
            return NextResponse.json({ error: '缺少SYDNEY_AI_API_KEY' }, { status: 500 })
        }

        // 扣除积分（15积分）
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

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

        const newPoints = user.points - 15

        // 更新积分
        await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', userId)

        // 记录交易
        await supabase
            .from('point_transactions')
            .insert({
                user_id: userId,
                amount: -15,
                type: 'consume',
                description: '户型图分析',
                balance_after: newPoints
            })

        console.log(`用户 ${userId} 消耗15积分，剩余: ${newPoints}`)

        const styleInfo = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.cream

        // Step 1: 用 Gemini 识别户型图并生成软装建议
        console.log('Step 1/3: 识别户型图并生成软装建议...')

        const analysisResult = await analyzeFloorPlanWithGemini(imageUrl, styleInfo.cn)

        if (!analysisResult || analysisResult.error) {
            const errorDetail = analysisResult?.error || '未知错误'
            return NextResponse.json({ error: `户型识别失败：${errorDetail}` }, { status: 500 })
        }

        const { analysis, rooms } = analysisResult
        console.log(`✅ Step 1/3 完成（${rooms.length}个房间）`)

        // Step 2: 生成场景剧本
        console.log('Step 2/3: 生成场景剧本...')

        const sceneInfo = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS.single

        let storyScript = ''
        if (DEEPSEEK_API_KEY) {
            const scriptPrompt = STORY_SCRIPT_PROMPT
                .replace('{ANALYSIS}', analysis)
                .replace('{STYLE_DESCRIPTION}', styleInfo.cn)
                .replace(/{SCENE_PERSONA}/g, sceneInfo.cn)
                .replace('{SCENE_KEYWORDS}', sceneInfo.keywords)

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
            storyScript = storyScript.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s*/g, '')
        }

        console.log('✅ Step 2/3 完成')

        // Step 3: 生成3D鸟瞰效果图（带重试）
        console.log('Step 3/3: 生成3D效果图...')

        let birdviewImage = null
        for (let attempt = 1; attempt <= 3; attempt++) {
            birdviewImage = await generateFloorPlanImage(imageUrl, styleInfo.en)
            if (birdviewImage) {
                console.log('✅ Step 3/3 完成：效果图生成成功')
                break
            }
            if (attempt < 3) {
                console.log(`⚠️ 尝试 ${attempt} 失败，等待5秒后重试...`)
                await new Promise(resolve => setTimeout(resolve, 5000))
            } else {
                console.log('⚠️ Step 3/3：效果图生成失败（已重试3次）')
            }
        }

        return NextResponse.json({
            analysis,
            roomSuggestions: rooms,
            storyScript,
            birdviewImage,
            styleName: styleInfo.cn,
            sceneName: sceneInfo.cn,
            newPoints
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
            error: '分析失败：' + (error as Error).message
        }, { status: 500 })
    }
}
