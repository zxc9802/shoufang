'use client'

import { useState } from 'react'
import { X, Gift, Loader2 } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface RedeemModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState<{ points: number, newBalance: number } | null>(null)

    const { user, updatePoints } = useUserStore()

    if (!isOpen) return null

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setError('')
        setSuccess(null)
        setLoading(true)

        try {
            const res = await fetch('/api/points/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    code: code.trim().toUpperCase()
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || '兑换失败')
                return
            }

            setSuccess(data)
            updatePoints(data.newBalance)
            setCode('')

        } catch (err) {
            setError('网络错误，请重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">兑换积分</h2>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">兑换成功！</h3>
                        <p className="text-gray-600 mb-4">
                            已获得 <span className="text-2xl font-bold text-purple-600">{success.points}</span> 积分
                        </p>
                        <p className="text-sm text-gray-500">
                            当前余额：{success.newBalance} 积分
                        </p>
                        <button
                            onClick={() => {
                                setSuccess(null)
                                onClose()
                            }}
                            className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                        >
                            继续使用
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                兑换码
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={16}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-lg font-mono tracking-wider text-gray-900 bg-white"
                                placeholder="输入16位兑换码"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                测试卡密：TEST1234ABCD5678 (50积分)
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || code.length !== 16}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    兑换中...
                                </>
                            ) : (
                                '立即兑换'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
