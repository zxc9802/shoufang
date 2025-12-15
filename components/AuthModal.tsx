'use client'

import { useState } from 'react'
import { X, Mail, Lock, User as UserIcon } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState<string>('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const setUser = useUserStore(state => state.setUser)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
            const body = mode === 'login'
                ? { email, password }
                : { email, password, username }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || '操作失败')
                return
            }

            setUser(data.user)
            onClose()

            if (mode === 'register') {
                alert('🎉 注册成功！您已获得30积分！')
            }

        } catch (err) {
            setError('网络错误，请重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {mode === 'login' ? '登录' : '注册'}
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                用户名
                            </label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="输入用户名（可选）"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            邮箱
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            密码
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="text-xs text-gray-500 bg-purple-50 p-3 rounded-lg">
                            🎁 注册即送 <span className="font-bold text-purple-600">30积分</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                    >
                        {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                    </button>
                </form>

                {/* Switch Mode */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    {mode === 'login' ? (
                        <>
                            还没有账号？
                            <button
                                onClick={() => {
                                    setMode('register')
                                    setError('')
                                }}
                                className="text-purple-600 hover:text-purple-700 font-semibold ml-1"
                            >
                                立即注册
                            </button>
                        </>
                    ) : (
                        <>
                            已有账号？
                            <button
                                onClick={() => {
                                    setMode('login')
                                    setError('')
                                }}
                                className="text-purple-600 hover:text-purple-700 font-semibold ml-1"
                            >
                                立即登录
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
