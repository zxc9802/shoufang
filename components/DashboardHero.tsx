import React from 'react'

interface DashboardHeroProps {
    activeTab: 'photo' | 'layout'
    onTabChange: (tab: 'photo' | 'layout') => void
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="glass-panel rounded-3xl p-8 mb-6 relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">AI-Powered</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Real Estate Engine</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg text-lg">
                        解锁房地产营销的未来。通过人工智能瞬间生成爆款文案与沉浸式3D空间方案。
                    </p>
                </div>

                {/* Mode Switcher - Segmented Control */}
                <div className="glass-card p-1.5 rounded-2xl flex bg-black/20 backdrop-blur-xl border border-white/5">
                    <button
                        onClick={() => onTabChange('photo')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${activeTab === 'photo' ? 'text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {activeTab === 'photo' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl -z-10" /> // Active Bg
                        )}
                        <span className="flex items-center gap-2">
                            <span>📸</span> 图片生文案
                        </span>
                    </button>

                    <button
                        onClick={() => onTabChange('layout')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${activeTab === 'layout' ? 'text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {activeTab === 'layout' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl -z-10" /> // Active Bg
                        )}
                        <span className="flex items-center gap-2">
                            <span>🏗️</span> 户型图分析
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DashboardHero
