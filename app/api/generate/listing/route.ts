import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 小红书版提示词
const XIAOHONGSHU_PROMPT = `# Role
你是一名拥有百万粉丝的小红书房产家居博主。你擅长通过观察房源照片，挖掘出房子的"氛围感"和"居住价值"，并用极具吸引力、年轻化、种草感强烈的语气撰写文案。

# 输出要求
直接输出完整的小红书笔记内容，不要添加任何副标题（如"1. 爆款标题"、"2. 正文"等）。

按以下格式输出：

[标题]（选一个最吸引人的标题，包含情感冲击力 + 核心卖点）

[正文]
- 开头：用一两句话制造场景感
- 亮点罗列：用 ✨/🏠/🛋️ 列出 3-4 个房子的核心优势
- 生活想象：描述一个具体的居住场景
- 结尾：简单的行动号召

[标签]
生成 8-10 个相关标签，用空格分隔

# 风格要求
* 语气：热情、真诚、像是跟闺蜜分享好物
* 关键词：绝绝子、氛围感拉满、神仙房源、治愈系、独居女孩、梦中情房
* Emoji：大量使用，穿插在文中
* 排版：分段清晰，避免大段文字

# Constraints
不要编造照片中没有的设施，不要使用AI味儿的解释`

// 朋友圈版提示词
const MOMENTS_PROMPT = `# Role
你是一名深耕本地、拥有大量老客户的资深房产经纪人。你的朋友圈风格务实、消息灵通、往往能拿到"独家好房"。

# 输出要求
直接输出完整的朋友圈文案，不要添加任何副标题或序号。总字数控制在 100-150 字以内。

按以下格式输出：

【核心卖点】突出亮点

📍 位置：[地段信息]
🏠 户型：正规X室X厅
🛋️ 配置：家具家电情况
👀 视野：实拍特点

手慢无，随时看房！

# 风格要求
* 第一行用【】突出核心卖点，制造紧迫感
* 中间用emoji列表展示硬核参数
* 结尾行动号召，引导私信
* 语气像老朋友推荐，真实靠谱
* 强调"实拍"、"真房源"

# Constraints
字数限制100-150字，不要用小红书甜腻语气`

// 贝壳版提示词
const BEIKE_PROMPT = `# Role
你是一名从业 10 年的专业房产咨询师。你的文案风格严谨、客观、逻辑清晰。

# 输出要求
直接输出完整的房源描述，不要添加任何副标题（如"1. 房源标题"、"【核心卖点】"等）。

按以下格式输出：

[标题]（20-30字，包含小区名+户型+核心卖点）

[正文]
第一段：核心卖点总结（房东自住/首次出租/家电全配等）

第二段：户型介绍（进门客厅、卧室朝向、厨卫布局、动线合理性）

第三段：装修描述（材质识别、品牌卫浴、保养状况、整体风格）

# 风格要求
* 严禁使用Emoji，保持纯文本专业风格
* 多用专业术语：明厨明卫、动静分区、利用率高、视野开阔
* 拒绝煽情词汇，使用"舒适"、"宜居"、"功能齐全"
* 基于图片事实，不凭空编造设施

# Constraints
不要写"治愈"、"绝绝子"等小红书用语，保持专业严谨`

export async function POST(req: NextRequest) {
    try {
        const { propertyInfo, imageFeatures } = await req.json()

        console.log('=== 文案生成 API ===')

        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

        if (!DEEPSEEK_API_KEY) {
            return NextResponse.json({ error: '缺少API配置' }, { status: 500 })
        }

        const baseInfo = `
【房源信息】
户型：${propertyInfo.houseType}
面积：${propertyInfo.area}平米
小区：${propertyInfo.communityName}
价格：${propertyInfo.price}万
亮点：${propertyInfo.highlights.join('、') || '无'}
图片分析：${imageFeatures}
`

        // 并行生成三个版本
        const [xhsRes, momentsRes, beikeRes] = await Promise.all([
            // 小红书版
            fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: XIAOHONGSHU_PROMPT },
                        { role: 'user', content: `请为以下房源生成小红书文案：${baseInfo}` }
                    ],
                    stream: false
                })
            }),
            // 朋友圈版
            fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: MOMENTS_PROMPT },
                        { role: 'user', content: `请为以下房源生成微信朋友圈文案：${baseInfo}` }
                    ],
                    stream: false
                })
            }),
            // 贝壳版
            fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: BEIKE_PROMPT },
                        { role: 'user', content: `请为以下房源生成贝壳找房文案：${baseInfo}` }
                    ],
                    stream: false
                })
            })
        ])

        const [xhsData, momentsData, beikeData] = await Promise.all([
            xhsRes.json(),
            momentsRes.json(),
            beikeRes.json()
        ])

        // 清理Markdown符号的函数
        const cleanContent = (text: string) => {
            return text
                .replace(/^#{1,6}\s*/gm, '')  // 删除标题符号 ###
                .replace(/\*\*/g, '')          // 删除加粗 **
                .replace(/\*/g, '')            // 删除单个 *
                .replace(/^-\s+/gm, '• ')      // 将 - 列表替换为 •
                .trim()
        }

        const xhsContent = cleanContent(xhsData.choices?.[0]?.message?.content || '')
        const momentsContent = cleanContent(momentsData.choices?.[0]?.message?.content || '')
        const beikeContent = cleanContent(beikeData.choices?.[0]?.message?.content || '')

        console.log('✅ 三平台文案生成成功')

        // 从亮点中提取卖点
        const sellingPoints = [
            '• ' + (propertyInfo.highlights[0] || '优质房源'),
            '• ' + (propertyInfo.highlights[1] || '交通便利'),
            '• ' + (propertyInfo.highlights[2] || '装修精美'),
            '• 采光充足，空间通透',
            '• 拎包入住，配套齐全'
        ]

        return NextResponse.json({
            sellingPoints,
            contents: {
                '贝壳版': beikeContent,
                '小红书版': xhsContent,
                '朋友圈版': momentsContent
            }
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({
            error: '生成失败：' + (error as Error).message
        }, { status: 500 })
    }
}
