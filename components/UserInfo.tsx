'use client'

import { useState } from 'react'
import { Coins, LogOut, Gift } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface UserInfoProps {
    onRedeemClick: () => void
}

export default function UserInfo({ onRedeemClick }: UserInfoProps) {
    const { user, logout } = useUserStore()

    if (!user) return null

    return (
        <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full font-semibold shadow-lg">
                <Coins className="w-5 h-5" />
                <span>{user.points} 积分</span>
            </div>

            {/* Redeem Button */}
            <button
                onClick={onRedeemClick}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all"
            >
                <Gift className="w-5 h-5" />
                <span>兑换</span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="text-right">
                    <div className="text-white font-semibold text-sm">{user.username}</div>
                    <div className="text-white/60 text-xs">{user.email}</div>
                </div>
                <button
                    onClick={logout}
                    className="text-white/80 hover:text-white transition-colors"
                    title="退出登录"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
