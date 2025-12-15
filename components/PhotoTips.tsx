'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X, Sun, Mountain, Sofa, Sparkles, LayoutGrid } from 'lucide-react'

const PHOTO_TIPS = [
    {
        icon: LayoutGrid,
        title: '全景照（1-2张）',
        tip: '站在角落对角线拍摄',
        aiRecognize: '布局、空间感、动线',
        tags: ['#通透', '#方正', '#宽敞']
    },
    {
        icon: Sofa,
        title: '功能区特写（3-4张）',
        tip: '床铺、厨房、卫生间单独拍',
        aiRecognize: '收纳、干湿分离、功能性',
        tags: ['#超大收纳', '#干湿分离']
    },
    {
        icon: Sun,
        title: '光影瞬间（1-2张）',
        tip: '阳光洒落或暖灯氛围',
        aiRecognize: '采光、温馨感、时间段',
        tags: ['#阳光满屋', '#氛围感']
    },
    {
        icon: Mountain,
        title: '窗外风景（1张）',
        tip: '窗边向外拍绿植/夜景',
        aiRecognize: '视野、环境、私密性',
        tags: ['#绝美窗景', '#视野开阔']
    },
    {
        icon: Sparkles,
        title: '材质细节（1-2张）',
        tip: '地毯、窗帘、绿植特写',
        aiRecognize: '装修档次、品味风格',
        tags: ['#精致生活', '#细节控']
    }
]

export default function PhotoTips() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const modalContent = (
        <>
            <div
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 999999
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: '60px',
                    right: '130px',
                    width: '380px',
                    maxHeight: 'calc(100vh - 80px)',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    zIndex: 9999999,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    overflow: 'hidden'
                }}
            >
                {/* 头部 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Camera size={18} /> 拍照秘籍 · 让AI写出爆款文案
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ color: '#1e293b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 内容 */}
                <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
                    {PHOTO_TIPS.map((item, index) => {
                        const IconComponent = item.icon
                        return (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    marginBottom: index < PHOTO_TIPS.length - 1 ? '10px' : 0
                                }}
                            >
                                {/* 标题行 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <IconComponent size={14} color="#1e293b" />
                                    </div>
                                    <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{item.title}</span>
                                </div>

                                {/* 拍摄方法 */}
                                <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                                    <span style={{ color: '#4ade80' }}>📷 怎么拍：</span>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>{item.tip}</span>
                                </div>

                                {/* AI识别 */}
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                                    <span style={{ color: '#60a5fa' }}>🤖 AI识别：</span>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>{item.aiRecognize}</span>
                                </div>

                                {/* 标签 */}
                                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                                    {item.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                backgroundColor: 'rgba(251,191,36,0.2)',
                                                color: '#fbbf24',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </>
    )

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-500/30 border border-amber-400/30 text-amber-300 hover:text-amber-200 rounded-lg transition-all text-sm"
            >
                <Camera className="w-4 h-4" />
                拍照建议
            </button>

            {isOpen && mounted && createPortal(modalContent, document.body)}
        </>
    )
}
