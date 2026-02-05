'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DialogueRecord, Phase, Section, DialogueLine } from '@/lib/parseDialogue'

// Sortable 말풍선 아이템
function SortableDialogueItem({
  line,
  onTextChange,
  onSpeakerChange,
  onDelete,
}: {
  line: DialogueLine
  onTextChange: (text: string) => void
  onSpeakerChange: (speaker: string) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: line.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isSadham = line.speaker === '사드함'
  const isMedia = line.speaker === '메디아'

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-3">
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={onDelete}
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 말풍선 */}
      <div className={`p-3 rounded-lg border ${
        isSadham ? 'bg-[#A0522D]/10 border-[#A0522D]/30' :
        isMedia ? 'bg-[#8B1538]/10 border-[#8B1538]/30' :
        'bg-white/5 border-white/10'
      }`}>
        {/* 화자 이름 */}
        <input
          type="text"
          value={line.speaker}
          onChange={(e) => onSpeakerChange(e.target.value)}
          className={`bg-transparent text-sm font-medium mb-2 outline-none w-full ${
            isSadham ? 'text-[#CD853F]' : isMedia ? 'text-[#C94A6E]' : 'text-white/60'
          }`}
          placeholder="화자 이름"
        />
        {/* 대사 */}
        <textarea
          value={line.text}
          onChange={(e) => onTextChange(e.target.value)}
          className="bg-transparent text-white/80 text-sm w-full resize-none outline-none font-accent leading-relaxed"
          rows={Math.max(2, Math.ceil(line.text.length / 40))}
          placeholder="대사 내용"
        />
      </div>
    </div>
  )
}

// 섹션 편집 모달
function SectionEditor({
  section,
  onSave,
  onClose,
}: {
  section: Section
  onSave: (updatedSection: Section) => void
  onClose: () => void
}) {
  const [editingSection, setEditingSection] = useState<Section>({ ...section, lines: [...section.lines] })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = editingSection.lines.findIndex((l) => l.id === active.id)
      const newIndex = editingSection.lines.findIndex((l) => l.id === over.id)
      setEditingSection({
        ...editingSection,
        lines: arrayMove(editingSection.lines, oldIndex, newIndex),
      })
    }
  }

  const updateLine = (lineId: string, updates: Partial<DialogueLine>) => {
    setEditingSection({
      ...editingSection,
      lines: editingSection.lines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)),
    })
  }

  const deleteLine = (lineId: string) => {
    setEditingSection({
      ...editingSection,
      lines: editingSection.lines.filter((l) => l.id !== lineId),
    })
  }

  const addLine = () => {
    const newLine: DialogueLine = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      speaker: '',
      text: '',
    }
    setEditingSection({
      ...editingSection,
      lines: [...editingSection.lines, newLine],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1A1614] border border-white/10 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1614] border-b border-white/10 p-4 flex items-center justify-between shrink-0">
          <input
            type="text"
            value={editingSection.title}
            onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
            className="bg-transparent text-xl text-white/80 font-accent outline-none"
            placeholder="소제목"
          />
          <div className="flex gap-2">
            <button
              onClick={addLine}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/70 text-sm rounded transition-colors"
            >
              + 대사 추가
            </button>
            <button
              onClick={() => onSave(editingSection)}
              className="px-4 py-1.5 bg-[#8B1538] hover:bg-[#A62045] text-white text-sm rounded transition-colors"
            >
              저장
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 p-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="pl-10 pr-10">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={editingSection.lines.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                {editingSection.lines.map((line) => (
                  <SortableDialogueItem
                    key={line.id}
                    line={line}
                    onTextChange={(text) => updateLine(line.id, { text })}
                    onSpeakerChange={(speaker) => updateLine(line.id, { speaker })}
                    onDelete={() => deleteLine(line.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {editingSection.lines.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/30 mb-4">대사가 없습니다.</p>
                <button
                  onClick={addLine}
                  className="px-4 py-2 bg-[#8B1538]/20 hover:bg-[#8B1538]/30 text-[#C94A6E] rounded transition-colors"
                >
                  + 첫 대사 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 섹션 카드 (어드민용)
function AdminSectionCard({
  section,
  onClick,
  onDelete,
}: {
  section: Section
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full text-left p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-[#8B1538]/40 transition-all"
      >
        <h4 className="font-accent text-base text-white/80 mb-2">{section.title}</h4>
        <p className="text-xs text-white/40">{section.lines.length}개 대사</p>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(true)

  const [records, setRecords] = useState<DialogueRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0)
  const [editingSection, setEditingSection] = useState<{ phaseIndex: number; sectionIndex: number } | null>(null)

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsLoggedIn(true)
        fetchRecords()
      } else {
        setLoginError(data.error || '로그인 실패')
      }
    } catch {
      setLoginError('서버 오류')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setIsLoggedIn(false)
    setSelectedRecord(null)
  }

  const fetchRecords = async () => {
    const res = await fetch('/api/records')
    const data = await res.json()
    setRecords(data)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', uploadTitle || file.name.replace('.txt', ''))

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setSelectedRecord(data)
        setSelectedPhaseIndex(0)
        setUploadTitle('')
        // input 초기화
        e.target.value = ''
      } else {
        alert(data.error || '업로드 실패')
      }
    } catch {
      alert('업로드 중 오류 발생')
    } finally {
      setUploading(false)
    }
  }

  const saveRecord = async () => {
    if (!selectedRecord) return

    setSaving(true)

    try {
      const isNew = !records.find((r) => r.id === selectedRecord.id)
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch('/api/records', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRecord),
      })

      if (res.ok) {
        await fetchRecords()
        alert('저장되었습니다!')
      } else {
        const data = await res.json()
        alert(data.error || '저장 실패')
      }
    } catch {
      alert('저장 중 오류 발생')
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/records?id=${id}`, { method: 'DELETE' })

      if (res.ok) {
        await fetchRecords()
        if (selectedRecord?.id === id) {
          setSelectedRecord(null)
        }
      }
    } catch {
      alert('삭제 중 오류 발생')
    }
  }

  const handleSectionSave = (updatedSection: Section) => {
    if (!selectedRecord || !editingSection) return

    const newPhases = [...selectedRecord.phases]
    newPhases[editingSection.phaseIndex].sections[editingSection.sectionIndex] = updatedSection

    setSelectedRecord({
      ...selectedRecord,
      phases: newPhases,
    })
    setEditingSection(null)
  }

  const deleteSection = (phaseIndex: number, sectionIndex: number) => {
    if (!selectedRecord) return
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return

    const newPhases = [...selectedRecord.phases]
    newPhases[phaseIndex].sections.splice(sectionIndex, 1)

    setSelectedRecord({
      ...selectedRecord,
      phases: newPhases,
    })
  }

  const addSection = (phaseIndex: number) => {
    if (!selectedRecord) return

    const newSection: Section = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      title: '새 섹션',
      lines: [],
    }

    const newPhases = [...selectedRecord.phases]
    newPhases[phaseIndex].sections.push(newSection)

    setSelectedRecord({
      ...selectedRecord,
      phases: newPhases,
    })
  }

  const addPhase = () => {
    if (!selectedRecord) return

    const phaseNumber = selectedRecord.phases.length
    const newPhase: Phase = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: `${phaseNumber}차`,
      sections: [],
    }

    setSelectedRecord({
      ...selectedRecord,
      phases: [...selectedRecord.phases, newPhase],
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B1538]/30 border-t-[#8B1538] rounded-full animate-spin" />
      </div>
    )
  }

  // 로그인 폼
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0D0B0A] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-[#8B1538] text-2xl">⟡</span>
            <h1 className="font-display text-2xl text-white/80 tracking-wider mt-4">Admin</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-white placeholder-white/30 outline-none focus:border-[#8B1538]/50 transition-colors"
            />

            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#8B1538] hover:bg-[#A62045] text-white font-medium rounded transition-colors"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  const currentPhase = selectedRecord?.phases[selectedPhaseIndex]

  // 어드민 대시보드
  return (
    <div className="min-h-screen bg-[#0D0B0A]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2D1F1A] to-[#3D2314] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-[#8B1538]">⟡</span>
          <span className="font-display text-lg text-white/80 tracking-wider">Admin</span>
        </div>
        <button onClick={handleLogout} className="text-white/50 hover:text-white/80 text-sm">
          로그아웃
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-60px)]">
        {/* 사이드바 */}
        <div className="w-72 bg-[#0D0B0A] border-r border-white/[0.06] p-4 space-y-6 shrink-0">
          {/* 업로드 */}
          <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.06]">
            <h3 className="text-white/70 text-sm font-medium mb-3">새 기록 업로드</h3>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="제목 (선택)"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-white/30 outline-none focus:border-[#8B1538]/50 mb-3"
            />
            <label className="block">
              <span className="block w-full py-2.5 bg-[#8B1538]/20 hover:bg-[#8B1538]/30 border border-[#8B1538]/30 rounded text-center text-[#C94A6E] text-sm cursor-pointer transition-colors">
                {uploading ? '업로드 중...' : 'txt 파일 선택'}
              </span>
              <input type="file" accept=".txt" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          {/* 기록 목록 */}
          <div>
            <h3 className="text-white/70 text-sm font-medium mb-3">기록 목록</h3>
            {records.length === 0 ? (
              <p className="text-white/30 text-sm">기록이 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {records.map((record) => (
                  <li key={record.id} className="group">
                    <button
                      onClick={() => {
                        setSelectedRecord(record)
                        setSelectedPhaseIndex(0)
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                        selectedRecord?.id === record.id
                          ? 'bg-[#8B1538]/20 text-[#C94A6E]'
                          : 'hover:bg-white/5 text-white/60'
                      }`}
                    >
                      <span className="truncate">{record.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRecord(record.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 메인 영역 */}
        <div className="flex-1 p-6">
          {selectedRecord ? (
            <>
              {/* 기록 제목 + 저장 */}
              <div className="flex items-center justify-between mb-6">
                <input
                  type="text"
                  value={selectedRecord.title}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, title: e.target.value })}
                  className="bg-transparent text-2xl text-white/80 font-accent outline-none"
                />
                <button
                  onClick={saveRecord}
                  disabled={saving}
                  className="px-5 py-2 bg-[#8B1538] hover:bg-[#A62045] text-white rounded transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>

              {/* 차수 탭 */}
              <div className="flex gap-2 mb-6 border-b border-white/[0.06] pb-4">
                {selectedRecord.phases.map((phase, index) => (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhaseIndex(index)}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedPhaseIndex === index
                        ? 'bg-[#8B1538]/25 text-[#C94A6E] border border-[#8B1538]/40'
                        : 'text-white/40 hover:text-white/60 border border-transparent'
                    }`}
                  >
                    {phase.name}
                  </button>
                ))}
                <button
                  onClick={addPhase}
                  className="px-3 py-2 text-sm text-white/30 hover:text-white/50 transition-colors"
                >
                  + 차수 추가
                </button>
              </div>

              {/* 섹션 카드들 */}
              {currentPhase && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {currentPhase.sections.map((section, sectionIndex) => (
                      <AdminSectionCard
                        key={section.id}
                        section={section}
                        onClick={() => setEditingSection({ phaseIndex: selectedPhaseIndex, sectionIndex })}
                        onDelete={() => deleteSection(selectedPhaseIndex, sectionIndex)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => addSection(selectedPhaseIndex)}
                    className="px-4 py-2 border border-dashed border-white/20 rounded-lg text-white/40 hover:text-white/60 hover:border-white/30 transition-colors text-sm"
                  >
                    + 새 섹션 추가
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/30">기록을 선택하거나 새로 업로드하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 섹션 편집 모달 */}
      {editingSection && selectedRecord && (
        <SectionEditor
          section={selectedRecord.phases[editingSection.phaseIndex].sections[editingSection.sectionIndex]}
          onSave={handleSectionSave}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  )
}
