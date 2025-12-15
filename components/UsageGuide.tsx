'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, X, Camera, CheckCircle, XCircle } from 'lucide-react'

export default function UsageGuide() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const modalContent = (
        <>
            {/* 背景遮罩 */}
            <div
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 999999
                }}
            />

            {/* 弹窗 - 显示在右侧 */}
            <div
                style={{
                    position: 'fixed',
                    top: '60px',
                    right: '16px',
                    width: '300px',
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
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: '#1e293b',
                    flexShrink: 0
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        📖 使用说明
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 内容 - 可滚动 */}
                <div style={{
                    padding: '12px 16px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {/* 使用步骤 */}

                    <div style={{ marginBottom: '14px' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>🚀 使用步骤</h4>
                        <ol style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                            <li>上传1-9张房源照片</li>
                            <li>填写房源基本信息</li>
                            <li>选择或自定义亮点标签</li>
                            <li>点击生成，等待AI生成</li>
                            <li>切换版本，一键复制使用</li>
                        </ol>
                    </div>

                    {/* 文案版本 */}
                    <div style={{ marginBottom: '14px' }}>
                        <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>📱 文案版本</h4>
                        <div style={{ fontSize: '11px' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px 8px', marginBottom: '4px', display: 'flex' }}>
                                <span style={{ color: '#fbbf24', fontWeight: '500', width: '60px' }}>贝壳版</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>专业规范</span>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px 8px', marginBottom: '4px', display: 'flex' }}>
                                <span style={{ color: '#f472b6', fontWeight: '500', width: '60px' }}>小红书版</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>感性种草+标签</span>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px 8px', display: 'flex' }}>
                                <span style={{ color: '#4ade80', fontWeight: '500', width: '60px' }}>朋友圈版</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>简洁有力</span>
                            </div>
                        </div>
                    </div>

                    {/* 积分说明 */}
                    <div style={{ backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '6px', padding: '8px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: 0 }}>
                            💰 每次生成消耗 <span style={{ color: '#fbbf24', fontWeight: '600' }}>10积分</span>
                        </p>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(to right, #fbbf24, #eab308)',
                            color: '#1e293b',
                            fontWeight: '600',
                            padding: '8px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        我知道了
                    </button>
                </div>
            </div>
        </>
    )

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-all text-sm"
            >
                <HelpCircle className="w-4 h-4" />
                使用说明
            </button>

            {isOpen && mounted && createPortal(modalContent, document.body)}
        </>
    )
}
