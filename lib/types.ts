// Supabase 数据库类型定义

export interface User {
    id: string
    phone: string | null
    email?: string | null
    wechat_openid: string | null
    nickname: string | null
    avatar_url: string | null
    points: number
    is_admin?: boolean  // 可选字段，老用户可能没有
    created_at: string
    last_login_at: string | null
}

export interface RedeemCode {
    id: string
    code: string
    points: number
    is_used: boolean
    used_by: string | null
    used_at: string | null
    created_at: string
    created_by: string | null
}

export interface Generation {
    id: string
    user_id: string
    type: 'photo_listing' | 'layout_analysis'
    input_images: string[]
    input_params: Record<string, any>
    output_content: Record<string, any>
    generated_images: string[] | null
    points_cost: number
    created_at: string
}
