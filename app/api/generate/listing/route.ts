import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 扣除积分的辅助函数
async function deductPoints(userId: string, amount: number, description: string) {
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single()

    if (userError || !user) {
        throw new Error('用户不存在')
    }

    if (user.points < amount) {
        throw new Error('积分不足')
    }

    const newPoints = user.points - amount

    await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', userId)

    await supabase
        .from('point_transactions')
        .insert({
            user_id: userId,
            amount: -amount,
            type: 'consume',
            description,
            balance_after: newPoints
        })

    return newPoints
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, ...requestData } = body

        if (!userId) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 })
        }

        const { imageUrls, propertyInfo } = requestData
        const platforms = propertyInfo.platforms || ['beike']

        if (!platforms || platforms.length === 0) {
            return NextResponse.json({ error: '请选择至少一个平台' }, { status: 400 })
        }

        if (!imageUrls || imageUrls.length === 0) {
            return NextResponse.json({ error: '请提供图片' }, { status: 400 })
        }

        // 扣除积分（每个平台2积分）
        const pointsCost = platforms.length * 2
        let newPoints = 0
        try {
            newPoints = await deductPoints(userId, pointsCost, `生成${platforms.length}个平台文案`)
            console.log(`用户 ${userId} 消耗${pointsCost}积分，剩余: ${newPoints}`)
        } catch (error: any) {
            if (error.message === '积分不足') {
                return NextResponse.json({
                    error: `积分不足！生成${platforms.length}个平台文案需要${pointsCost}积分，请充值后再试`
                }, { status: 403 })
            }
            throw error
        }

        const GLM_API_KEY = process.env.GLM_API_KEY
        const GLM_API_URL = process.env.GLM_API_URL
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

        if (!GLM_API_KEY || !GLM_API_URL || !DEEPSEEK_API_KEY) {
            return NextResponse.json({ error: 'API配置缺失' }, { status: 500 })
        }

        // Step 1: 图片识别 + 提取卖点
        const imageContent = imageUrls.map((url: string) => ({
            type: 'image_url',
            image_url: { url }
        }))

        const analysisPrompt = `你是房产信息分析专家。分析图片并提取核心卖点。

请输出以下JSON格式：
{
  "analysis": "图片分析描述（100-150字，包含：布局特点、装修风格、家具配置、特色亮点）",
  "sellingPoints": [
    "核心卖点1（15-20字，突出一个具体优势）",
    "核心卖点2",
    "核心卖点3",
    "核心卖点4",
    "核心卖点5"
  ]
}

要求：
1. 卖点要具体、有吸引力，例如："南北通透采光好"、"品牌家电拎包入住"
2. 不要使用特殊符号
3. 只输出JSON，不要其他内容`

        const glmRes = await fetch(GLM_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GLM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'glm-4.6v',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: analysisPrompt },
                        ...imageContent
                    ]
                }]
            })
        })

        if (!glmRes.ok) throw new Error('图片分析失败')

        const glmData = await glmRes.json()
        let rawAnalysis = glmData.choices?.[0]?.message?.content || ''
        rawAnalysis = rawAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        // 解析JSON获取卖点
        let analysisResult = ''
        let sellingPoints: string[] = []
        try {
            const parsed = JSON.parse(rawAnalysis)
            analysisResult = parsed.analysis || rawAnalysis
            sellingPoints = parsed.sellingPoints || []
        } catch {
            // 如果解析失败，使用原始文本
            analysisResult = rawAnalysis.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s*/g, '')
        }

        // Step 2: 生成平台文案
        const customInput = propertyInfo.customInput || ''
        const highlights = propertyInfo.highlights || []
        const baseInfo = `
房源信息：
- 小区：${propertyInfo.community || '优质小区'}
- 面积：${propertyInfo.area || ''}㎡
- 房型：${propertyInfo.houseType || propertyInfo.layout || ''}
- 楼层：${propertyInfo.floor || ''}
- 朝向：${propertyInfo.direction || ''}
- 装修：${propertyInfo.decoration || ''}
- 年代：${propertyInfo.year || ''}
- 价格：${propertyInfo.price || ''}万
${highlights.length > 0 ? `\n亮点标签：${highlights.join('、')}` : ''}
${customInput ? `\n补充信息：${customInput}` : ''}

图片分析：${analysisResult}
${sellingPoints.length > 0 ? `\n核心卖点：${sellingPoints.join('、')}` : ''}`

        const platformPrompts = {
            beike: `# Role
你是一名从业 10 年的专业房产咨询师。你的文案风格严谨、客观、逻辑清晰。你拒绝花哨的情绪描写，专注于用专业的词汇描述房子的物理属性和居住价值。

${baseInfo}

# 输出要求

## 1. 房源标题（20-30字）
格式：[核心卖点] + [户型] + [独特优势]
示例：精装全配大两居 南北通透 采光好 拎包入住 随时看房

## 2. 房源详情
必须包含以下结构化内容：

【核心卖点】
用一句话总结最大优势

【户型介绍】
结合图片描述布局，使用专业术语（动静分离、南北通透、明厨明卫）

【装修描述】
根据图片识别材质和保养状况

# Constraints
- 严禁使用Emoji
- 多用专业词汇
- 拒绝煽情，保持客观
- 基于图片事实描述

# 输出格式（可直接复制粘贴）
不要写"标题："、"正文："等字样，直接按以下格式输出：

[20-30字的标题]

【核心卖点】
[一句话总结]

【户型介绍】
[布局描述]

【装修描述】
[材质和保养状况]

直接输出，用户可一键复制使用。`,

            xiaohongshu: `# Role
你是一名拥有百万粉丝的小红书房产家居博主。你擅长挖掘房子的"氛围感"和"居住价值"，用极具吸引力、年轻化、种草感强烈的语气撰写文案。

${baseInfo}

# 输出要求

## 1. 爆款标题
生成1个标题，包含情感冲击力 + 核心卖点
格式参考：
- "谁懂啊！😭 在XX终于找到了我的梦中情房！✨"
- "独居幸福感拉满🏠 | 每天被阳光叫醒的日子☀️"

## 2. 正文内容
- 开头：制造场景感（例如："每天下班回到家，打开暖黄色的灯..."）
- 亮点罗列：用✨/🏠/🛋️列出3-4个核心优势
- 生活想象：描述具体居住场景
- 结尾：行动号召（CTA）

## 3. 标签
生成8-10个相关标签
格式：#地区 #租房 #装修风格 #生活方式

# 风格要求
- 语气：热情、真诚、像跟闺蜜分享
- 关键词：绝绝子、氛围感拉满、神仙房源、治愈系、梦中情房
- 大量使用Emoji
- 分段清晰，避免大段文字

# 输出格式（可直接复制粘贴）
不要写"标题："、"正文："、"标签："等字样，直接按小红书发布格式输出：

[爆款标题]

[开头场景感1-2句]

✨ [亮点1]
🏠 [亮点2]
🛋️ [亮点3]
👀 [亮点4]

[生活想象场景]

[CTA行动号召]

[空一行]
#标签1 #标签2 #标签3 #标签4 #标签5 #标签6 #标签7 #标签8

直接输出，用户可一键复制到小红书。`,

            moments: `# Role
你是一名深耕本地、拥有大量老客户的资深房产经纪人。你的朋友圈风格务实、消息灵通。文案要体现"手慢无"的紧迫感和"真实靠谱"的信任感。

${baseInfo}

# 输出要求（总字数100-150字）

## 第一行：黄金钩子
用【】或✨突出核心卖点（价格/地段/稀缺性）
示例："【笋盘急租】市中心这也太划算了吧！"

## 中间段：硬核参数 + 视觉佐证
直接列出3-4个关键信息，结合图片描述
格式：短句 + Emoji（作为列表符）
示例：
📍 位置：[地段]
🏠 户型：正规一室一厅，方正通透
🛋️ 配置：全套家具，民水民电
👀 视觉：实拍原图，干净清爽

## 结尾：行动号召
制造稀缺感，引导私信
示例："手慢无，随时看房，懂的来私！👇"

# Constraints
- 不要使用符号#和*
- 语气像老朋友推荐
- 强调"实拍"、"真房源"

# 输出格式（可直接复制粘贴）
不要写任何标注，直接按朋友圈格式输出：

【黄金钩子】或✨ [核心卖点]

📍 [位置信息]
🏠 [户型简述]
🛋️ [配置简述]
👀 [视觉描述]

[行动号召CTA]

直接输出，用户可一键复制到朋友圈发布。`
        }

        // 只生成用户选择的平台文案
        const contents: Record<string, string> = {}
        const platformNameMap: Record<string, string> = {
            beike: '贝壳版',
            xiaohongshu: '小红书版',
            moments: '朋友圈版'
        }

        for (const platformId of platforms) {
            const prompt = platformPrompts[platformId as keyof typeof platformPrompts]
            if (!prompt) continue

            const res = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: '你是房产文案专家' },
                        { role: 'user', content: prompt }
                    ],
                    stream: false
                })
            })

            const data = await res.json()
            let content = data.choices?.[0]?.message?.content || ''
            content = content.replace(/\*\*/g, '').replace(/\*/g, '')
            contents[platformNameMap[platformId]] = content.trim()
        }

        return NextResponse.json({
            success: true,
            analysis: analysisResult,
            sellingPoints,
            contents,
            newPoints
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
            error: '生成失败：' + (error as Error).message
        }, { status: 500 })
    }
}
