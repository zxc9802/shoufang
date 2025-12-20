'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Copy, Check, Trash2, Plus, RefreshCw, ShieldX, Lock } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RedemptionCode {
    id: string
    code: string
    points: number
    is_used: boolean
    used_by: string | null
    used_at: string | null
    created_at: string
}

// 生成随机16位卡密
function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 16; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export default function AdminPage() {
    const [codes, setCodes] = useState<RedemptionCode[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [points, setPoints] = useState(50)
    const [count, setCount] = useState(1)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('all')

    // 管理员验证状态
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const [adminChecking, setAdminChecking] = useState(true)

    // 验证管理员身份
    useEffect(() => {
        const checkAdmin = async () => {
            setAdminChecking(true)
            try {
                // zustand persist 使用 'user-storage' key，格式为 { state: { user: {...} } }
                const storedData = localStorage.getItem('user-storage')
                if (!storedData) {
                    setIsAdmin(false)
                    setAdminChecking(false)
                    return
                }

                const parsed = JSON.parse(storedData)
                const user = parsed?.state?.user

                if (!user || !user.id) {
                    setIsAdmin(false)
                    setAdminChecking(false)
                    return
                }

                // 从数据库验证管理员身份
                const { data, error } = await supabase
                    .from('users')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single()

                if (error || !data) {
                    setIsAdmin(false)
                } else {
                    setIsAdmin(data.is_admin === true)
                }
            } catch (e) {
                console.error('Admin check error:', e)
                setIsAdmin(false)
            }
            setAdminChecking(false)
        }

        checkAdmin()
    }, [])

    // 如果正在检查管理员身份，显示加载状态
    if (adminChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-white/60 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">验证管理员身份...</p>
                </div>
            </div>
        )
    }

    // 如果不是管理员，显示拒绝访问页面
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md">
                    <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">访问被拒绝</h1>
                    <p className="text-white/60 mb-6">
                        您没有管理员权限访问此页面。<br />
                        请使用管理员账号登录后再试。
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                        返回首页
                    </a>
                </div>
            </div>
        )
    }

    // 加载卡密列表
    const loadCodes = async () => {
        setLoading(true)
        let query = supabase
            .from('redemption_codes')
            .select('*')
            .order('created_at', { ascending: false })

        if (filter === 'unused') {
            query = query.eq('is_used', false)
        } else if (filter === 'used') {
            query = query.eq('is_used', true)
        }

        const { data, error } = await query
        if (!error && data) {
            setCodes(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadCodes()
    }, [filter])

    // 生成卡密
    const handleGenerate = async () => {
        setGenerating(true)
        const newCodes = []

        for (let i = 0; i < count; i++) {
            const code = generateCode()
            newCodes.push({
                code,
                points,
                is_used: false
            })
        }

        const { error } = await supabase
            .from('redemption_codes')
            .insert(newCodes)

        if (!error) {
            await loadCodes()
        }
        setGenerating(false)
    }

    // 复制卡密
    const handleCopy = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // 删除卡密
    const handleDelete = async (id: string) => {
        if (!confirm('确定删除这个卡密吗？')) return

        await supabase
            .from('redemption_codes')
            .delete()
            .eq('id', id)

        await loadCodes()
    }

    // 统计
    const stats = {
        total: codes.length,
        unused: codes.filter(c => !c.is_used).length,
        used: codes.filter(c => c.is_used).length,
        totalPoints: codes.filter(c => !c.is_used).reduce((sum, c) => sum + c.points, 0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">🔐 卡密管理后台</h1>
                    <a
                        href="/"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                        返回首页
                    </a>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                        <div className="text-white/60 text-sm">总卡密数</div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
                        <div className="text-green-300 text-sm">未使用</div>
                        <div className="text-2xl font-bold text-green-400">{stats.unused}</div>
                    </div>
                    <div className="bg-gray-500/20 backdrop-blur-lg rounded-xl p-4 border border-gray-500/30">
                        <div className="text-gray-300 text-sm">已使用</div>
                        <div className="text-2xl font-bold text-gray-400">{stats.used}</div>
                    </div>
                    <div className="bg-amber-500/20 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30">
                        <div className="text-amber-300 text-sm">未使用积分</div>
                        <div className="text-2xl font-bold text-amber-400">{stats.totalPoints}</div>
                    </div>
                </div>

                {/* 生成卡密 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">生成新卡密</h2>
                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">积分数量</label>
                            <select
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
                            >
                                <option value={10} className="bg-slate-800">10 积分</option>
                                <option value={30} className="bg-slate-800">30 积分</option>
                                <option value={50} className="bg-slate-800">50 积分</option>
                                <option value={100} className="bg-slate-800">100 积分</option>
                                <option value={200} className="bg-slate-800">200 积分</option>
                                <option value={500} className="bg-slate-800">500 积分</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-2">生成数量</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={count}
                                onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                                className="w-24 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                        >
                            {generating ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            {generating ? '生成中...' : '生成卡密'}
                        </button>
                    </div>
                </div>

                {/* 卡密列表 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">卡密列表</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-lg text-sm transition-all ${filter === 'all' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                全部
                            </button>
                            <button
                                onClick={() => setFilter('unused')}
                                className={`px-3 py-1 rounded-lg text-sm transition-all ${filter === 'unused' ? 'bg-green-500/30 text-green-300' : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                未使用
                            </button>
                            <button
                                onClick={() => setFilter('used')}
                                className={`px-3 py-1 rounded-lg text-sm transition-all ${filter === 'used' ? 'bg-gray-500/30 text-gray-300' : 'text-white/60 hover:text-white'
                                    }`}
                            >
                                已使用
                            </button>
                            <button
                                onClick={loadCodes}
                                className="px-3 py-1 text-white/60 hover:text-white transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-white/60">加载中...</div>
                    ) : codes.length === 0 ? (
                        <div className="text-center py-8 text-white/60">暂无卡密</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-white/60 text-sm border-b border-white/10">
                                        <th className="pb-3 px-2">卡密</th>
                                        <th className="pb-3 px-2">积分</th>
                                        <th className="pb-3 px-2">状态</th>
                                        <th className="pb-3 px-2">创建时间</th>
                                        <th className="pb-3 px-2">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {codes.map((code) => (
                                        <tr key={code.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-2">
                                                <code className="font-mono text-amber-400 bg-black/20 px-2 py-1 rounded">
                                                    {code.code}
                                                </code>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-white font-semibold">{code.points}</span>
                                                <span className="text-white/40 text-sm ml-1">积分</span>
                                            </td>
                                            <td className="py-3 px-2">
                                                {code.is_used ? (
                                                    <span className="px-2 py-1 bg-gray-500/30 text-gray-300 rounded text-sm">
                                                        已使用
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-500/30 text-green-300 rounded text-sm">
                                                        可用
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-white/60 text-sm">
                                                {new Date(code.created_at).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCopy(code.code, code.id)}
                                                        className="p-2 hover:bg-white/10 rounded transition-all text-white/60 hover:text-white"
                                                        title="复制"
                                                    >
                                                        {copiedId === code.id ? (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    {!code.is_used && (
                                                        <button
                                                            onClick={() => handleDelete(code.id)}
                                                            className="p-2 hover:bg-red-500/20 rounded transition-all text-white/60 hover:text-red-400"
                                                            title="删除"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
