'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock, FileText, Home, Copy, Check, ChevronRight, AlertCircle, Eye } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

export interface HistoryRecord {
    id: string
    type: 'listing' | 'layout'
    created_at: string
    input_images: string[]
    property_info?: any
    listing_result?: any
    style_name?: string
    scene_name?: string
    layout_result?: any
    birdview_image?: string
}

interface HistoryPanelProps {
    isOpen: boolean
    onClose: () => void
    onSelectRecord?: (record: HistoryRecord | null) => void
}

export default function HistoryPanel({ isOpen, onClose, onSelectRecord }: HistoryPanelProps) {
    const [history, setHistory] = useState<HistoryRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const { user } = useUserStore()

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen && user) {
            fetchHistory()
        }
        if (!isOpen) {
            // 关闭面板时清除选中状态
            setSelectedId(null)
            onSelectRecord?.(null)
        }
    }, [isOpen, user])

    const fetchHistory = async () => {
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch(`/api/history?userId=${user.id}`)
            const data = await res.json()
            if (data.history) {
                setHistory(data.history)
            }
        } catch (e) {
            console.error('Failed to fetch history:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleViewRecord = (record: HistoryRecord) => {
        if (selectedId === record.id) {
            // 取消选中
            setSelectedId(null)
            onSelectRecord?.(null)
        } else {
            // 选中记录
            setSelectedId(record.id)
            onSelectRecord?.(record)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getListingText = (record: HistoryRecord) => {
        if (!record.listing_result?.listings) return ''
        return record.listing_result.listings.map((l: any) => `【${l.platform}】\n${l.title}\n${l.content}`).join('\n\n')
    }

    const getLayoutText = (record: HistoryRecord) => {
        if (!record.layout_result) return ''
        const parts = []
        if (record.layout_result.roomSuggestions) {
            parts.push(record.layout_result.roomSuggestions.map((r: any) => {
                const lines = [`【${r.name}】`]
                Object.entries(r.suggestions || {}).forEach(([k, v]) => lines.push(`${k}：${v}`))
                return lines.join('\n')
            }).join('\n\n'))
        }
        if (record.layout_result.sceneNarrative) {
            parts.push(`\n【场景叙事】\n${record.layout_result.sceneNarrative}`)
        }
        return parts.join('\n')
    }

    if (!mounted) return null

    const panelContent = (
        <>
            {/* Panel - No backdrop, slides in from right */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-slate-900/98 backdrop-blur-xl border-l border-white/10 z-[9999] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">生成记录</h2>
                            <p className="text-xs text-white/40">最近 5 次生成结果</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>暂无生成记录</p>
                            <p className="text-xs mt-1">生成文案或分析户型后会自动保存</p>
                        </div>
                    ) : (
                        history.map((record) => (
                            <div
                                key={record.id}
                                className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${selectedId === record.id
                                        ? 'border-indigo-500/50 ring-1 ring-indigo-500/30'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {/* Card Header */}
                                <button
                                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                    className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${record.type === 'listing' ? 'bg-amber-500/20' : 'bg-purple-500/20'
                                        }`}>
                                        {record.type === 'listing' ? (
                                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                                        ) : (
                                            <Home className="w-3.5 h-3.5 text-purple-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {record.type === 'listing' ? '图片生文案' : '户型图分析'}
                                            {record.style_name && ` · ${record.style_name}`}
                                        </p>
                                        <p className="text-xs text-white/40">{formatDate(record.created_at)}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${expandedId === record.id ? 'rotate-90' : ''
                                        }`} />
                                </button>

                                {/* Expanded Content */}
                                {expandedId === record.id && (
                                    <div className="px-3 pb-3 pt-2 border-t border-white/5 space-y-2 animate-in fade-in duration-200">
                                        {/* Preview Images */}
                                        {record.input_images && record.input_images.length > 0 && (
                                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                                                {record.input_images.slice(0, 3).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Input ${i + 1}`}
                                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10"
                                                    />
                                                ))}
                                                {record.input_images.length > 3 && (
                                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs flex-shrink-0">
                                                        +{record.input_images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewRecord(record)}
                                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs font-medium ${selectedId === record.id
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300'
                                                    }`}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                {selectedId === record.id ? '取消预览' : '在左边预览'}
                                            </button>
                                            <button
                                                onClick={() => handleCopy(
                                                    record.type === 'listing' ? getListingText(record) : getLayoutText(record),
                                                    record.id
                                                )}
                                                className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
                                            >
                                                {copiedId === record.id ? (
                                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Notice */}
                <div className="px-3 py-2.5 border-t border-white/10 bg-amber-500/5">
                    <div className="flex items-start gap-2 text-amber-300/80 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <p>仅保留最近 5 次生成记录，超出部分将自动删除</p>
                    </div>
                </div>
            </div>
        </>
    )

    if (!isOpen) return null

    return createPortal(panelContent, document.body)
}
