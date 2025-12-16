'use client'

import { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'

interface ResultPanelProps {
    result: {
        analysis?: string
        sellingPoints?: string[]
        contents: Record<string, string>
    }
}

export default function ResultPanel({ result }: ResultPanelProps) {
    const platformKeys = Object.keys(result.contents)
    const [selectedPlatform, setSelectedPlatform] = useState(platformKeys[0] || '')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (platformKeys.length > 0 && !platformKeys.includes(selectedPlatform)) {
            setSelectedPlatform(platformKeys[0])
        }
    }, [platformKeys, selectedPlatform])

    const handleCopy = async () => {
        const content = result.contents[selectedPlatform]
        if (content) {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (platformKeys.length === 0) {
        return null
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* 核心卖点 */}
            {result.sellingPoints && result.sellingPoints.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-amber-400 text-xl">🎯</span> 核心卖点提取
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.sellingPoints.map((point, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-amber-500/20 mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="text-indigo-100/90 text-sm leading-relaxed">{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 图片分析结果 */}
            {result.analysis && (
                <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-indigo-500">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-indigo-400 text-xl">🔍</span> 深度视觉分析
                    </h3>
                    <div className="text-slate-300 text-sm leading-relaxed tracking-wide bg-black/20 rounded-xl p-4 border border-white/5">
                        {result.analysis}
                    </div>
                </div>
            )}

            {/* 平台文案切换 */}
            <div className="glass-panel rounded-2xl p-6 border-t border-t-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex gap-2 bg-black/30 p-1 rounded-xl backdrop-blur-md">
                        {platformKeys.map((platform) => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPlatform === platform
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all text-sm font-medium group"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">已复制成功</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                一键复制文案
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-black/40 rounded-xl p-6 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans border border-white/5 shadow-inner min-h-[200px]">
                    {result.contents[selectedPlatform]}
                </div>
            </div>
        </div>
    )
}
