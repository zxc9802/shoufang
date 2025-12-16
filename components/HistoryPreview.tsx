'use client'

import { X, FileText, Home, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HistoryRecord } from './HistoryPanel'

interface HistoryPreviewProps {
    record: HistoryRecord
    onClose: () => void
}

export default function HistoryPreview({ record, onClose }: HistoryPreviewProps) {
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleCopy = async (text: string, platform: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedPlatform(platform)
        setTimeout(() => setCopiedPlatform(null), 2000)
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!mounted) return null

    const content = (
        <>
            {/* Blurred Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9990] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.type === 'listing' ? 'bg-amber-500/20' : 'bg-purple-500/20'
                                }`}>
                                {record.type === 'listing' ? (
                                    <FileText className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <Home className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {record.type === 'listing' ? '历史文案预览' : '历史户型分析预览'}
                                    {record.style_name && ` · ${record.style_name}`}
                                </h2>
                                <p className="text-white/40 text-xs">{formatDate(record.created_at)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                            title="关闭预览"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 space-y-6">
                        {/* Input Images */}
                        {record.input_images && record.input_images.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-3">原始图片</h3>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {record.input_images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`Input ${i + 1}`}
                                            className="w-28 h-28 rounded-xl object-cover flex-shrink-0 border border-white/10"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Listing Results */}
                        {record.type === 'listing' && record.listing_result?.listings && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-white/60">生成的文案</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {record.listing_result.listings.map((listing: any, i: number) => (
                                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium">
                                                    {listing.platform}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(listing.content, listing.platform)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs text-white/60"
                                                >
                                                    {copiedPlatform === listing.platform ? (
                                                        <>
                                                            <Check className="w-4 h-4 text-green-400" />
                                                            <span className="text-green-400">已复制</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            复制
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                                {listing.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Layout Analysis Results */}
                        {record.type === 'layout' && record.layout_result && (
                            <div className="space-y-6">
                                {/* Analysis */}
                                {record.layout_result.analysis && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white/60 mb-3">户型分析</h3>
                                        <p className="text-white/80 text-sm bg-white/5 rounded-xl p-4 border border-white/10">
                                            {record.layout_result.analysis}
                                        </p>
                                    </div>
                                )}

                                {/* Room Suggestions */}
                                {record.layout_result.roomSuggestions && record.layout_result.roomSuggestions.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white/60 mb-3">软装建议</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {record.layout_result.roomSuggestions.map((room: any, i: number) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs text-purple-300">
                                                            {i + 1}
                                                        </span>
                                                        {room.name}
                                                    </h4>
                                                    <div className="space-y-2 text-sm">
                                                        {room.suggestions && Object.entries(room.suggestions).map(([key, value]) => (
                                                            <div key={key} className="flex gap-2">
                                                                <span className="text-purple-300 flex-shrink-0">{key}：</span>
                                                                <span className="text-white/70">{value as string}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Scene Narrative */}
                                {record.layout_result.sceneNarrative && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white/60 mb-3">生活场景描述</h3>
                                        <p className="text-white/80 text-sm bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-500/20 leading-relaxed">
                                            {record.layout_result.sceneNarrative}
                                        </p>
                                    </div>
                                )}

                                {/* Birdview Image */}
                                {record.birdview_image && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white/60 mb-3">鸟瞰效果图</h3>
                                        <img
                                            src={record.birdview_image}
                                            alt="鸟瞰效果图"
                                            className="w-full max-w-lg rounded-xl border border-white/10"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )

    return createPortal(content, document.body)
}
