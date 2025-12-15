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
        <div className="space-y-6">
            {/* 核心卖点 */}
            {result.sellingPoints && result.sellingPoints.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">🎯 核心卖点</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.sellingPoints.map((point, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                            >
                                <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-white/90">{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 图片分析结果 */}
            {result.analysis && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">🔍 图片分析</h3>
                    <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                        {result.analysis}
                    </div>
                </div>
            )}

            {/* 平台文案切换 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2 flex-wrap">
                        {platformKeys.map((platform) => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedPlatform === platform
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all text-sm font-medium"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                已复制
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                一键复制
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-black/20 rounded-xl p-6 text-white/90 whitespace-pre-wrap leading-relaxed">
                    {result.contents[selectedPlatform]}
                </div>
            </div>
        </div>
    )
}
