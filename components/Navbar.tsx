import React from 'react'
import { Clock } from 'lucide-react'
import UserInfo from './UserInfo'
import PhotoTips from './PhotoTips'

interface NavbarProps {
    user: any
    onAuthClick: () => void
    onRedeemClick: () => void
    onHistoryClick: () => void
    activeTab: string
}

const Navbar: React.FC<NavbarProps> = ({ user, onAuthClick, onRedeemClick, onHistoryClick, activeTab }) => {
    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav className="glass-panel pointer-events-auto rounded-full px-6 py-3 flex items-center gap-8 animate-[float_6s_ease-in-out_infinite]">

                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-lg">🏠</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white/90">
                        RealState <span className="text-indigo-400">AI</span>
                    </span>
                </div>

                <div className="h-6 w-[1px] bg-white/10" />

                {/* Action Area */}
                <div className="flex items-center gap-3">
                    {activeTab === 'photo' && <PhotoTips />}

                    {/* History Button - Only show when logged in */}
                    {user && (
                        <button
                            onClick={onHistoryClick}
                            className="p-2.5 rounded-full bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/30 text-white/60 hover:text-indigo-300 transition-all"
                            title="生成记录"
                        >
                            <Clock className="w-4 h-4" />
                        </button>
                    )}

                    {user ? (
                        <UserInfo onRedeemClick={onRedeemClick} />
                    ) : (
                        <button
                            onClick={onAuthClick}
                            className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all active:scale-95"
                        >
                            登录 / 注册
                        </button>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar

