'use client'

import { useState } from 'react'
import { Coins, LogOut, Gift, Shield } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import Link from 'next/link'

interface UserInfoProps {
    onRedeemClick: () => void
}

export default function UserInfo({ onRedeemClick }: UserInfoProps) {
    const { user, logout } = useUserStore()

    if (!user) return null

    return (
        <div className="flex items-center gap-4">
            {/* Points Display - Crypto Token Style */}
            <div className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full backdrop-blur-md hover:border-amber-500/50 transition-all cursor-default">
                <div className="absolute inset-0 bg-amber-500/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-medium text-sm tabular-nums tracking-wide">{user.points} <span className="text-[10px] opacity-70">PTS</span></span>
            </div>

            {/* Redeem Button */}
            <button
                onClick={onRedeemClick}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all active:scale-95"
                title="充值积分"
            >
                <Gift className="w-4 h-4 text-purple-300" />
            </button>

            {/* Admin Dashboard Button - Only show for admins */}
            {user.is_admin && (
                <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-red-200 transition-all text-xs font-medium"
                    title="卡密管理后台"
                >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">管理后台</span>
                </Link>
            )}

            {/* User Avatar & Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                    <div className="text-white/90 font-medium text-xs leading-none mb-1">{user.username || user.email?.split('@')[0] || '用户'}</div>
                    <div className="text-white/40 text-[10px] leading-none max-w-[80px] truncate">{user.email || ''}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                    {(user.username || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <button
                    onClick={logout}
                    className="text-white/40 hover:text-red-400 transition-colors ml-1"
                    title="退出登录"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
