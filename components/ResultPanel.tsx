'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface GenerationResult {
    sellingPoints: string[]
    contents: {
        '贝壳版': string
        '小红书版': string
        '朋友圈版': string
    }
}

interface ResultPanelProps {
    result: GenerationResult
}

export default function ResultPanel({ result }: ResultPanelProps) {
    const [selectedPlatform, setSelectedPlatform] = useState<keyof GenerationResult['contents']>('贝壳版')
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const content = result.contents[selectedPlatform]
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* 卖点清单 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 核心卖点</h3>
                <div className="space-y-2">
                    {result.sellingPoints.map((point, index) => (
                        <div key={index} className="text-white/80 flex items-start">
                            <span className="text-amber-400 mr-2">•</span>
                            <span>{point.replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 平台文案切换 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        {(Object.keys(result.contents) as Array<keyof typeof result.contents>).map((platform) => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`px-4 py-2 rounded-lg transition-all ${selectedPlatform === platform
                                    ? 'bg-amber-400 text-slate-900 font-medium'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>

                    {/* 一键复制按钮 */}
                    <button
                        onClick={handleCopy}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
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

                <div className="bg-white/5 rounded-lg p-4 min-h-[200px]">
                    <pre className="text-white/80 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {result.contents[selectedPlatform]}
                    </pre>
                </div>
            </div>

        </div>
    )
}
