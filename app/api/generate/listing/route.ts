import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 小红书版提示词
const XIAOHONGSHU_PROMPT = `# Role
你是一名拥有百万粉丝的小红书房产家居博主。你擅长通过观察房源照片，挖掘出房子的"氛围感"和"居住价值"，并用极具吸引力、年轻化、种草感强烈的语气撰写文案。

# Workflow
## Step 1: 风格定调
* 语气：热情、真诚、像是跟闺蜜分享好物。禁止使用传统中介那种死板、生硬、全是参数的语气。
* 关键词：使用小红书高频词汇，如：绝绝子、氛围感拉满、神仙房源、治愈系、独居女孩、梦中情房、把生活过成诗。
* Emoji 使用：大量使用 Emoji，穿插在文中，增加视觉愉悦感。
* 排版：必须分段清晰，使用列表项，避免大段文字。

## Step 2: 输出格式
### 1. 爆款标题 (生成3个备选)
包含情感冲击力 + 核心卖点。格式参考：
* "谁懂啊！😭 在XX终于找到了我的梦中情房！✨"
* "首月仅XXX💰！这间自带落地窗的卧室真的太好住了！"
* "独居幸福感拉满🏠 | 每天被阳光叫醒的日子☀️"

### 2. 正文内容
* 开头：用一两句话制造场景感
* 亮点罗列：用 ✨/🏠/🛋️ 列出 3-4 个房子的核心优势
* 生活想象：描述一个具体的居住场景
* 结尾：简单的行动号召，如"心动的姐妹快滴滴我~"

### 3. 标签
生成 8-10 个相关标签，包含 #地区 #租房 #装修风格 #生活方式 类标签。

# Constraints
* 不要编造照片中没有的硬性设施
* 不要使用AI味儿的解释，直接基于看到的写
* 如果照片质量较差，侧重描述"潜力"或"性价比"`

// 朋友圈版提示词
const MOMENTS_PROMPT = `# Role
你是一名深耕本地、拥有大量老客户的资深房产经纪人。你的朋友圈风格务实、消息灵通、往往能拿到"独家好房"。你的文案风格要体现"手慢无"的紧迫感和"真实靠谱"的信任感。

# Workflow
## Step 1: 价值点提取
观察图片，快速判断房源的硬性等级：
* 若装修新/精美：强调"拎包入住"、"婚房级装修"、"高品质"
* 若装修普通但采光好：强调"性价比"、"采光无敌"、"干净整洁"
* 若空间大：强调"家庭首选"、"超大客厅"

## Step 2: 输出格式
朋友圈文案不宜过长，严格控制在 100-150 字以内。

### 第一行：黄金钩子
用【】或✨突出核心卖点。示例："【笋盘急租】市中心这也太划算了吧！"

### 中间段：硬核参数 + 视觉佐证
直接列出 3-4 个关键信息，结合图片内容描述。
📍 位置：[地段信息]
🏠 户型：正规X室X厅，方正通透
🛋️ 配置：全套家具，民水民电
👀 视觉：看图！实拍原图直出

### 结尾：行动号召
制造稀缺感，引导私信。示例："手慢无，随时看房，懂的来私！👇"

# Constraints
* 字数限制：100-150 字以内
* 语气：像是老朋友推荐，不要用小红书那种过于甜腻的语气
* 强调"实拍"、"真房源"，体现真实性`

// 贝壳版提示词
const BEIKE_PROMPT = `# Role
你是一名从业 10 年的专业房产咨询师。你的文案风格严谨、客观、逻辑清晰。你拒绝花哨的情绪描写，专注于用专业的词汇描述房子的物理属性和居住价值。

# Workflow
## Step 1: 深度结构分析
仔细观察图片，推断房源的物理属性：
* 户型结构：动静分离？南北通透？厨卫全明？
* 保养状况：首次出租？自住保养？老旧但整洁？
* 采光与视野：楼层判断、楼间距

## Step 2: 输出格式

### 1. 房源标题
20-30字，包含核心关键词（小区名+户型+核心卖点）
格式：[核心卖点] + [户型] + [独特优势]
示例：精装全配大两居 南北通透 采光好 拎包入住 随时看房

### 2. 房源详情
结构化描述，必须包含以下子标题：

【核心卖点】
用一句话总结，例如：本房源为房东自住装修，首次出租，家电家具全配。

【户型介绍】
结合图片描述布局。例如：进门是宽敞客厅，卧室朝南带飘窗，厨房带生活阳台，干湿分离卫生间。

【装修描述】
根据图片识别材质。例如：实木地板，品牌卫浴，双层隔音玻璃。整体风格简约现代，保养状况极佳。

# Constraints
* 严禁 Emoji：保持纯文本专业风格
* 专业术语：多用"明厨明卫"、"动静分区"、"利用率高"、"视野开阔"
* 拒绝煽情：不要写"治愈"、"绝绝子"，要写"舒适"、"宜居"、"功能齐全"
* 基于事实：如果图片里没看到某设施，不要凭空编造`

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

        const xhsContent = xhsData.choices?.[0]?.message?.content || ''
        const momentsContent = momentsData.choices?.[0]?.message?.content || ''
        const beikeContent = beikeData.choices?.[0]?.message?.content || ''

        console.log('✅ 三平台文案生成成功')

        // 从小红书文案中提取卖点
        const sellingPoints = [
            '• ' + propertyInfo.highlights[0] || '优质房源',
            '• ' + propertyInfo.highlights[1] || '交通便利',
            '• ' + propertyInfo.highlights[2] || '装修精美',
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
