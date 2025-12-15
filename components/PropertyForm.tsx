'use client'

import { useState } from 'react'

export interface PropertyInfo {
    houseType: string
    area: string
    communityName: string
    price: string
    highlights: string[]
}

interface PropertyFormProps {
    onSubmit: (info: PropertyInfo) => void
}

const HOUSE_TYPES = ['1室', '2室1厅', '2室2厅', '3室1厅', '3室2厅', '4室2厅', '自定义']
const HIGHLIGHT_OPTIONS = ['地铁近', '学区房', '朝南', '精装修', '电梯房', '低楼层', '有车位', '采光好']

export default function PropertyForm({ onSubmit }: PropertyFormProps) {
    const [formData, setFormData] = useState<PropertyInfo>({
        houseType: '2室1厅',
        area: '',
        communityName: '',
        price: '',
        highlights: []
    })

    const [customHouseType, setCustomHouseType] = useState('')
    const [showCustomHouseType, setShowCustomHouseType] = useState(false)
    const [customHighlight, setCustomHighlight] = useState('')

    const handleHouseTypeChange = (value: string) => {
        if (value === '自定义') {
            setShowCustomHouseType(true)
            setFormData({ ...formData, houseType: customHouseType || '' })
        } else {
            setShowCustomHouseType(false)
            setFormData({ ...formData, houseType: value })
        }
    }

    const toggleHighlight = (highlight: string) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.includes(highlight)
                ? prev.highlights.filter(h => h !== highlight)
                : [...prev.highlights, highlight]
        }))
    }

    const addCustomHighlight = () => {
        if (customHighlight.trim() && !formData.highlights.includes(customHighlight.trim())) {
            setFormData(prev => ({
                ...prev,
                highlights: [...prev.highlights, customHighlight.trim()]
            }))
            setCustomHighlight('')
        }
    }

    const removeHighlight = (highlight: string) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter(h => h !== highlight)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* 户型选择 */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        户型
                    </label>
                    <select
                        value={showCustomHouseType ? '自定义' : formData.houseType}
                        onChange={(e) => handleHouseTypeChange(e.target.value)}
                        className="w-full h-[42px] bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                        {HOUSE_TYPES.map(type => (
                            <option key={type} value={type} className="bg-slate-800">
                                {type}
                            </option>
                        ))}
                    </select>

                    {showCustomHouseType && (
                        <input
                            type="text"
                            value={customHouseType}
                            onChange={(e) => {
                                setCustomHouseType(e.target.value)
                                setFormData({ ...formData, houseType: e.target.value })
                            }}
                            placeholder="例如：5室3厅2卫"
                            className="w-full mt-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        面积 (平米)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="例如：89"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 小区名称 */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        小区名称
                    </label>
                    <input
                        type="text"
                        value={formData.communityName}
                        onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                        placeholder="例如：阳光花园"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                    />
                </div>

                {/* 价格 */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        参考价格 (万)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="例如：350"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                    />
                </div>
            </div>

            {/* 亮点标签 */}
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                    亮点标签
                </label>

                {/* 预设标签 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {HIGHLIGHT_OPTIONS.map(highlight => (
                        <button
                            key={highlight}
                            type="button"
                            onClick={() => toggleHighlight(highlight)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${formData.highlights.includes(highlight)
                                ? 'bg-amber-400 text-slate-900 font-medium'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            {highlight}
                        </button>
                    ))}
                </div>

                {/* 自定义标签输入 */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customHighlight}
                        onChange={(e) => setCustomHighlight(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomHighlight()
                            }
                        }}
                        placeholder="输入自定义标签后按回车"
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                    />
                    <button
                        type="button"
                        onClick={addCustomHighlight}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                    >
                        添加
                    </button>
                </div>

                {/* 已选标签显示 */}
                {formData.highlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-sm text-white/60">已选择：</span>
                        {formData.highlights.map(highlight => (
                            <span
                                key={highlight}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-lg text-sm"
                            >
                                {highlight}
                                <button
                                    type="button"
                                    onClick={() => removeHighlight(highlight)}
                                    className="hover:text-red-400 transition-colors"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-semibold py-3 px-6 rounded-lg hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
            >
                ✨ 开始生成文案 (消耗10积分)
            </button>
        </form>
    )
}
