'use client'

import { useState, useEffect, useCallback } from 'react'
import { parseDialogue, DialogueRecord, DialogueLine, Phase, Section, TRPGSession, TRPGLine, TRPGCharacter } from '@/lib/parseDialogue'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- 유틸리티 함수 ---
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 이미지를 압축하고 서버에 업로드
async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1920
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('이미지 압축 실패'))
            return
          }
          
          const formData = new FormData()
          formData.append('image', blob, file.name)
          
          try {
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`서버 응답 실패 (${response.status}): ${errorText}`)
            }
            
            const data = await response.json()
            if (!data.path) {
              throw new Error('서버에서 경로를 반환하지 않음')
            }
            resolve(data.path)
          } catch (err: any) {
            reject(new Error(`업로드 실패: ${err.message}`))
          }
        }, 'image/jpeg', 0.8)
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

// Roll20 HTML 파싱 함수
function parseRoll20HTML(html: string): { lines: TRPGLine[], characters: TRPGCharacter[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  const lines: TRPGLine[] = []
  const characterMap = new Map<string, TRPGCharacter>()
  
  const messages = doc.querySelectorAll('.message')
  
  messages.forEach((msg) => {
    const id = generateId()
    const classes = msg.className
    
    // 내레이션 (desc)
    if (classes.includes('desc')) {
      const content = msg.innerHTML
      // spacer와 avatar 등 제거하고 텍스트만 추출
      const textEl = msg.cloneNode(true) as HTMLElement
      textEl.querySelectorAll('.spacer, .avatar, .tstamp, .by').forEach(el => el.remove())
      
      let text = textEl.innerHTML.trim()
      // 이미지 태그 처리
      const imgMatch = text.match(/<img[^>]+src="([^"]+)"/)
      
      if (imgMatch) {
        lines.push({
          id,
          type: 'narration',
          text: '',
          images: [imgMatch[1]]
        })
      } else {
        // 스타일이 있는 a 태그 내용 추출
        text = text.replace(/<a[^>]*>([^<]*)<\/a>/g, '$1')
        text = text.replace(/<[^>]+>/g, '').trim()
        
        if (text && text !== '*') {
          // 시스템 메시지 체크 (배경색이 있는 경우)
          if (msg.innerHTML.includes('background-color')) {
            lines.push({ id, type: 'system', text })
          } else {
            lines.push({ id, type: 'narration', text })
          }
        }
      }
      return
    }
    
    // 일반 대사 (general)
    if (classes.includes('general')) {
      const byEl = msg.querySelector('.by')
      if (!byEl) return
      
      let speaker = byEl.textContent?.replace(':', '').trim() || ''
      if (!speaker) return
      
      // 캐릭터 등록
      if (!characterMap.has(speaker)) {
        const isPC = classes.includes('you')
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#00BCD4']
        characterMap.set(speaker, {
          name: speaker,
          color: colors[characterMap.size % colors.length],
          isPC
        })
      }
      
      // 텍스트 추출
      const textEl = msg.cloneNode(true) as HTMLElement
      textEl.querySelectorAll('.spacer, .avatar, .tstamp, .by').forEach(el => el.remove())
      
      // 주사위 굴림 체크
      const rollTemplate = textEl.querySelector('.sheet-rolltemplate-coc-1')
      if (rollTemplate) {
        const caption = rollTemplate.querySelector('caption')?.textContent || ''
        const targetEl = rollTemplate.querySelectorAll('.sheet-template_value span')[0]
        const rolledEl = rollTemplate.querySelectorAll('.sheet-template_value span')[3]
        const resultCell = rollTemplate.querySelector('tr:last-child td:last-child')
        
        const target = parseInt(targetEl?.textContent || '0')
        const rolled = parseInt(rolledEl?.textContent || '0')
        
        let result: 'critical' | 'extreme' | 'hard' | 'success' | 'fail' | 'fumble' = 'fail'
        const resultText = resultCell?.textContent?.toLowerCase() || ''
        if (resultText.includes('대성공') || resultText.includes('critical')) result = 'critical'
        else if (resultText.includes('극단적') || resultText.includes('extreme')) result = 'extreme'
        else if (resultText.includes('어려운') || resultText.includes('hard')) result = 'hard'
        else if (resultText.includes('성공') || resultText.includes('success')) result = 'success'
        else if (resultText.includes('대실패') || resultText.includes('fumble')) result = 'fumble'
        
        lines.push({
          id,
          type: 'roll',
          speaker,
          text: caption,
          rollData: { skillName: caption, target, rolled, result }
        })
        return
      }
      
      let text = textEl.innerHTML
        .replace(/<strong>([^<]*)<\/strong>/g, '<b>$1</b>')
        .replace(/<em>([^<]*)<\/em>/g, '<i>$1</i>')
        .replace(/<[^bi/][^>]*>/g, '')
        .replace(/<\/[^bi][^>]*>/g, '')
        .trim()
      
      if (text) {
        lines.push({ id, type: 'dialogue', speaker, text })
      }
    }
  })
  
  return {
    lines,
    characters: Array.from(characterMap.values())
  }
}

// --- 드래그 가능한 말풍선 컴포넌트 ---
function SortableLine({ 
  line, 
  onChange, 
  onDelete,
  onImagesUpload,
  onImageDelete
}: { 
  line: DialogueLine
  onChange: (id: string, field: 'speaker'|'text', val: string) => void
  onDelete: (id: string) => void
  onImagesUpload: (id: string, paths: string[]) => void
  onImageDelete: (id: string, imageIndex: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: line.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    try {
      const pathArray: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const path = await uploadImage(file)
        pathArray.push(path)
      }
      if (pathArray.length > 0) {
        onImagesUpload(line.id, pathArray)
      }
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`)
    }
  }

  const images = line.images || []
  const hasImages = images.length > 0

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-[#2A2624] p-3 rounded border border-white/5 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-white/20 hover:text-white/50 mt-2 px-1 text-lg">⣿</div>
      <div className="flex-1 space-y-2">
        <input 
          value={line.speaker} 
          onChange={(e) => onChange(line.id, 'speaker', e.target.value)}
          className={`bg-transparent border-b border-white/10 w-24 text-sm focus:outline-none focus:border-[#ff99bb] transition-colors ${line.speaker.includes('딜런') ? 'text-[#8888aa]' : 'text-red-400'}`}
        />
        
        {hasImages && (
          <div className="relative inline-block">
            <img src={images[currentImageIndex]} alt="" className="max-w-xs rounded border border-white/20" />
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                <button onClick={() => setCurrentImageIndex(p => p === 0 ? images.length - 1 : p - 1)} className="text-white/80 text-sm">←</button>
                <span className="text-white/60 text-xs">{currentImageIndex + 1} / {images.length}</span>
                <button onClick={() => setCurrentImageIndex(p => p === images.length - 1 ? 0 : p + 1)} className="text-white/80 text-sm">→</button>
              </div>
            )}
            <button onClick={() => { onImageDelete(line.id, currentImageIndex); setCurrentImageIndex(Math.max(0, currentImageIndex - 1)) }}
              className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
          </div>
        )}
        
        <textarea value={line.text} onChange={(e) => onChange(line.id, 'text', e.target.value)} 
          className="w-full bg-black/20 text-white/90 text-sm p-2 rounded focus:outline-none resize-none"
          rows={Math.max(2, line.text.split('\n').length)} />
        
        <label className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer text-xs text-white/60">
          <span>+ 이미지</span>
          <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
        </label>
      </div>
      <button onClick={() => onDelete(line.id)} className="text-white/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// --- 드래그 가능한 Phase 컴포넌트 ---
function SortablePhase({ phase, pIdx, selectedPhaseIdx, selectedSectionIdx, onSelectPhase, onSelectSection, onEditPhaseName, onDeletePhase, onAddSection, onEditSectionName, onDeleteSection }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: phase.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [isEditing, setIsEditing] = useState(false)
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null)

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab text-white/20 hover:text-white/50">⣿</div>
        {isEditing ? (
          <input autoFocus value={phase.name} onChange={(e) => onEditPhaseName(pIdx, e.target.value)}
            onBlur={() => setIsEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-black/30 text-[#ff99bb] font-bold px-2 py-1 rounded focus:outline-none flex-1" />
        ) : (
          <button onClick={() => onSelectPhase(pIdx)} onDoubleClick={() => setIsEditing(true)}
            className={`text-left font-bold flex-1 ${selectedPhaseIdx === pIdx ? 'text-[#ff99bb]' : 'text-white/40'}`}>
            {phase.name}
          </button>
        )}
        <button onClick={() => onDeletePhase(pIdx)} className="text-white/20 hover:text-red-500 text-sm">🗑️</button>
      </div>
      
      <div className="space-y-1 pl-6 border-l border-white/10 ml-2">
        {phase.sections.map((section: Section, sIdx: number) => (
          <div key={section.id} className="flex items-center gap-2 group">
            {editingSectionIdx === sIdx ? (
              <input autoFocus value={section.title} onChange={(e) => onEditSectionName(pIdx, sIdx, e.target.value)}
                onBlur={() => setEditingSectionIdx(null)} onKeyDown={(e) => e.key === 'Enter' && setEditingSectionIdx(null)}
                className="bg-black/30 text-white text-sm px-2 py-1 rounded focus:outline-none flex-1" />
            ) : (
              <button onClick={() => onSelectSection(pIdx, sIdx)} onDoubleClick={() => setEditingSectionIdx(sIdx)}
                className={`text-left text-sm flex-1 py-1 px-2 rounded ${selectedPhaseIdx === pIdx && selectedSectionIdx === sIdx ? 'bg-[#ff99bb]/20 text-[#ff99bb]' : 'text-white/50 hover:bg-white/5'}`}>
                {section.title}
              </button>
            )}
            <button onClick={() => onDeleteSection(pIdx, sIdx)} className="text-white/20 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
      
      <button onClick={() => onAddSection(pIdx)} className="ml-8 mt-2 text-sm text-white/30 hover:text-white/60">+ 소제목 추가</button>
    </div>
  )
}

// --- TRPG Line 편집 컴포넌트 ---
function TRPGLineEditor({ line, characters, onChange, onDelete }: {
  line: TRPGLine
  characters: TRPGCharacter[]
  onChange: (line: TRPGLine) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: line.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  
  const character = characters.find(c => c.name === line.speaker)
  const color = character?.color || '#666'

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-[#2A2624] p-3 rounded border border-white/5 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-white/20 hover:text-white/50 mt-2 px-1">⣿</div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <select value={line.type} onChange={(e) => onChange({ ...line, type: e.target.value as any })}
            className="bg-black/30 text-white/70 text-xs px-2 py-1 rounded">
            <option value="dialogue">대사</option>
            <option value="narration">내레이션</option>
            <option value="system">시스템</option>
            <option value="roll">주사위</option>
          </select>
          {(line.type === 'dialogue' || line.type === 'roll') && (
            <input value={line.speaker || ''} onChange={(e) => onChange({ ...line, speaker: e.target.value })}
              className="bg-transparent border-b border-white/10 w-32 text-sm focus:outline-none" style={{ color }}
              placeholder="화자" />
          )}
        </div>
        <textarea value={line.text} onChange={(e) => onChange({ ...line, text: e.target.value })}
          className="w-full bg-black/20 text-white/90 text-sm p-2 rounded focus:outline-none resize-none"
          rows={Math.max(1, line.text.split('\n').length)} placeholder="내용" />
      </div>
      <button onClick={onDelete} className="text-white/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// --- 컬러 피커 ---
function ColorPicker({ color, onChange }: { color: string, onChange: (c: string) => void }) {
  const presets = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#00BCD4', '#FF5722', '#795548', '#607D8B', '#8BC34A']
  return (
    <div className="flex flex-wrap gap-1">
      {presets.map(c => (
        <button key={c} onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
          style={{ backgroundColor: c }} />
      ))}
      <input type="color" value={color} onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer" />
    </div>
  )
}

export default function AdminPage() {
  // 공통 상태
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roleplay' | 'trpg'>('roleplay')
  const [message, setMessage] = useState('')
  
  // 역극 상태
  const [recordsList, setRecordsList] = useState<DialogueRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0)
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0)
  
  // TRPG 상태
  const [trpgList, setTrpgList] = useState<TRPGSession[]>([])
  const [editingTRPG, setEditingTRPG] = useState<TRPGSession | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('sombre_admin_login')
    if (saved === 'true') setIsLoggedIn(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchRecords()
      fetchTRPG()
    }
  }, [isLoggedIn])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records')
      const data = await res.json()
      if (Array.isArray(data)) setRecordsList(data)
    } catch (e) { console.error(e) }
  }

  const fetchTRPG = async () => {
    try {
      const res = await fetch('/api/trpg')
      const data = await res.json()
      if (Array.isArray(data)) setTrpgList(data)
    } catch (e) { console.error(e) }
  }

  // 역극 핸들러들
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'append') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseDialogue(text, file.name.replace('.txt', ''))
      if (mode === 'new') {
        setEditingRecord(parsed)
        setSelectedPhaseIdx(0)
        setSelectedSectionIdx(0)
      } else if (editingRecord) {
        const newRecord = { ...editingRecord }
        parsed.phases.forEach(p => newRecord.phases.push(p))
        setEditingRecord(newRecord)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSaveRecord = async () => {
    if (!editingRecord) return
    setMessage('저장 중...')
    try {
      const exists = recordsList.some(r => r.id === editingRecord.id)
      const res = await fetch('/api/records', {
        method: exists ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord)
      })
      if (res.ok) {
        setMessage('저장 완료!')
        fetchRecords()
      }
    } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/records?id=${id}`, { method: 'DELETE' })
    fetchRecords()
    if (editingRecord?.id === id) setEditingRecord(null)
  }

  const handleLineChange = (id: string, field: 'speaker' | 'text', val: string) => {
    if (!editingRecord) return
    const newRecord = { ...editingRecord }
    const line = newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id)
    if (line) (line as any)[field] = val
    setEditingRecord(newRecord)
  }

  const handleLineDelete = (id: string) => {
    if (!editingRecord) return
    const newRecord = { ...editingRecord }
    newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines = 
      newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.filter(l => l.id !== id)
    setEditingRecord(newRecord)
  }

  const handleImagesUpload = (id: string, paths: string[]) => {
    if (!editingRecord) return
    const newRecord = { ...editingRecord }
    const line = newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id)
    if (line) line.images = [...(line.images || []), ...paths]
    setEditingRecord(newRecord)
  }

  const handleImageDelete = (id: string, idx: number) => {
    if (!editingRecord) return
    const newRecord = { ...editingRecord }
    const line = newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.find(l => l.id === id)
    if (line?.images) line.images.splice(idx, 1)
    setEditingRecord(newRecord)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!editingRecord) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const lines = editingRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines
    const oldIdx = lines.findIndex(l => l.id === active.id)
    const newIdx = lines.findIndex(l => l.id === over.id)
    
    if (oldIdx !== -1 && newIdx !== -1) {
      const newRecord = { ...editingRecord }
      newRecord.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines = arrayMove(lines, oldIdx, newIdx)
      setEditingRecord(newRecord)
    }
  }

  // TRPG 핸들러들
  const handleTRPGUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const html = ev.target?.result as string
      const { lines, characters } = parseRoll20HTML(html)
      
      // 파일명에서 날짜와 제목 추출 시도
      const fileName = file.name.replace('.html', '')
      const dateMatch = fileName.match(/^(\d{8})_/)
      const date = dateMatch ? `${dateMatch[1].slice(0,4)}.${dateMatch[1].slice(4,6)}.${dateMatch[1].slice(6,8)}` : ''
      const title = dateMatch ? fileName.replace(dateMatch[0], '').replace(/_/g, ' ') : fileName
      
      setEditingTRPG({
        id: generateId(),
        title,
        date,
        characters,
        lines,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingTRPG) return
    try {
      const path = await uploadImage(file)
      setEditingTRPG({ ...editingTRPG, coverImage: path })
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`)
    }
  }

  const handleSaveTRPG = async () => {
    if (!editingTRPG) return
    setMessage('저장 중...')
    try {
      const exists = trpgList.some(s => s.id === editingTRPG.id)
      const res = await fetch('/api/trpg', {
        method: exists ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTRPG)
      })
      if (res.ok) {
        setMessage('저장 완료!')
        fetchTRPG()
      }
    } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeleteTRPG = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/trpg?id=${id}`, { method: 'DELETE' })
    fetchTRPG()
    if (editingTRPG?.id === id) setEditingTRPG(null)
  }

  const handleTRPGLineChange = (idx: number, line: TRPGLine) => {
    if (!editingTRPG) return
    const newLines = [...editingTRPG.lines]
    newLines[idx] = line
    setEditingTRPG({ ...editingTRPG, lines: newLines })
  }

  const handleTRPGLineDragEnd = (event: DragEndEvent) => {
    if (!editingTRPG) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    
    const oldIdx = editingTRPG.lines.findIndex(l => l.id === active.id)
    const newIdx = editingTRPG.lines.findIndex(l => l.id === over.id)
    
    if (oldIdx !== -1 && newIdx !== -1) {
      setEditingTRPG({ ...editingTRPG, lines: arrayMove(editingTRPG.lines, oldIdx, newIdx) })
    }
  }

  const handleCharacterColorChange = (name: string, color: string) => {
    if (!editingTRPG) return
    const newChars = editingTRPG.characters.map(c => c.name === name ? { ...c, color } : c)
    setEditingTRPG({ ...editingTRPG, characters: newChars })
  }

  const handleCharacterPCToggle = (name: string) => {
    if (!editingTRPG) return
    const newChars = editingTRPG.characters.map(c => c.name === name ? { ...c, isPC: !c.isPC } : c)
    setEditingTRPG({ ...editingTRPG, characters: newChars })
  }

  if (isLoading) return <div className="min-h-screen bg-[#0D0B0A]" />

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0D0B0A] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1A1614] border border-white/10 rounded-lg p-8">
          <h1 className="font-display text-center text-[#ff99bb] mb-6">ADMIN ACCESS</h1>
          <form onSubmit={(e) => { e.preventDefault(); if (password === "sombre1234") { setIsLoggedIn(true); localStorage.setItem('sombre_admin_login', 'true') } else alert('비밀번호 불일치') }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:outline-none mb-4" placeholder="비밀번호" />
            <button type="submit" className="w-full bg-[#ff99bb] hover:bg-[#A01840] text-white py-3 rounded">로그인</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0D0B0A] text-white overflow-hidden">
      {/* 사이드바 */}
      <div className="w-80 bg-[#161312] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-xl text-[#ff99bb] mb-4">Sombre ADMIN</h1>
          
          {/* 탭 선택 */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('roleplay')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'roleplay' ? 'bg-[#ff99bb] text-white' : 'bg-white/5 text-white/40'}`}>
              역극
            </button>
            <button onClick={() => setActiveTab('trpg')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'trpg' ? 'bg-[#ff99bb] text-white' : 'bg-white/5 text-white/40'}`}>
              TRPG
            </button>
          </div>
          
          {activeTab === 'roleplay' ? (
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/80 py-3 rounded cursor-pointer border border-dashed border-white/20">
                <span>+ 새 파일로 시작</span>
                <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'new')} />
              </label>
              {editingRecord && (
                <label className="flex items-center justify-center gap-2 w-full bg-[#ff99bb]/10 text-[#ff99bb] py-3 rounded cursor-pointer border border-[#ff99bb]/30">
                  <span>+ 현재 레코드에 추가</span>
                  <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'append')} />
                </label>
              )}
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white/80 py-3 rounded cursor-pointer border border-dashed border-white/20">
              <span>+ Roll20 HTML 업로드</span>
              <input type="file" className="hidden" accept=".html" onChange={handleTRPGUpload} />
            </label>
          )}
        </div>
        
        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'roleplay' ? (
            recordsList.map(rec => (
              <div key={rec.id} onClick={() => { setEditingRecord(rec); setSelectedPhaseIdx(0); setSelectedSectionIdx(0) }}
                className={`group p-3 rounded cursor-pointer flex justify-between items-center ${editingRecord?.id === rec.id ? 'bg-[#ff99bb]/20 border border-[#ff99bb]/50' : 'hover:bg-white/5 border border-transparent'}`}>
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{rec.title}</div>
                  <div className="text-xs text-white/30">{new Date(rec.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => handleDeleteRecord(rec.id, e)} className="text-white/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            ))
          ) : (
            trpgList.map(session => (
              <div key={session.id} onClick={() => setEditingTRPG(session)}
                className={`group p-3 rounded cursor-pointer flex justify-between items-center ${editingTRPG?.id === session.id ? 'bg-[#ff99bb]/20 border border-[#ff99bb]/50' : 'hover:bg-white/5 border border-transparent'}`}>
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{session.title}</div>
                  <div className="text-xs text-white/30">{session.date || new Date(session.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => handleDeleteTRPG(session.id, e)} className="text-white/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 메인 에디터 영역 */}
      <div className="flex-1 flex flex-col bg-[#0D0B0A] h-full overflow-hidden">
        {activeTab === 'roleplay' ? (
          // 역극 에디터
          editingRecord ? (
            <>
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1A1614]">
                <input value={editingRecord.title} onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})}
                  className="bg-transparent text-lg font-bold text-white focus:outline-none w-1/2" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#ff99bb]">{message}</span>
                  <button onClick={handleSaveRecord} className="bg-[#ff99bb] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-[#110F0E] border-r border-white/10 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
                      const { active, over } = e
                      if (!over || active.id === over.id) return
                      const phases = editingRecord.phases
                      const oldIdx = phases.findIndex(p => p.id === active.id)
                      const newIdx = phases.findIndex(p => p.id === over.id)
                      if (oldIdx !== -1 && newIdx !== -1) {
                        setEditingRecord({ ...editingRecord, phases: arrayMove(phases, oldIdx, newIdx) })
                      }
                    }}>
                      <SortableContext items={editingRecord.phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {editingRecord.phases.map((phase, pIdx) => (
                          <SortablePhase key={phase.id} phase={phase} pIdx={pIdx}
                            selectedPhaseIdx={selectedPhaseIdx} selectedSectionIdx={selectedSectionIdx}
                            onSelectPhase={(idx: number) => { setSelectedPhaseIdx(idx); setSelectedSectionIdx(0) }}
                            onSelectSection={(pi: number, si: number) => { setSelectedPhaseIdx(pi); setSelectedSectionIdx(si) }}
                            onEditPhaseName={(pi: number, name: string) => { const r = {...editingRecord}; r.phases[pi].name = name; setEditingRecord(r) }}
                            onDeletePhase={(pi: number) => { const r = {...editingRecord}; r.phases.splice(pi, 1); setEditingRecord(r) }}
                            onAddSection={(pi: number) => { const r = {...editingRecord}; r.phases[pi].sections.push({ id: generateId(), title: '새 소제목', lines: [] }); setEditingRecord(r) }}
                            onEditSectionName={(pi: number, si: number, name: string) => { const r = {...editingRecord}; r.phases[pi].sections[si].title = name; setEditingRecord(r) }}
                            onDeleteSection={(pi: number, si: number) => { const r = {...editingRecord}; r.phases[pi].sections.splice(si, 1); setEditingRecord(r) }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <button onClick={() => { const r = {...editingRecord}; r.phases.push({ id: generateId(), name: '새 차수', sections: [] }); setEditingRecord(r) }}
                      className="w-full py-3 border border-dashed border-white/20 text-white/30 hover:text-white/60 rounded">+ 차수 추가</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-[#0D0B0A]">
                  <div className="max-w-3xl mx-auto pb-20">
                    <h2 className="text-xl font-bold text-white/80 mb-6 pb-4 border-b border-white/10">
                      {editingRecord.phases[selectedPhaseIdx]?.name} — {editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.title}
                    </h2>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.lines?.map(l => l.id) || []} strategy={verticalListSortingStrategy}>
                        {editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.lines?.map((line) => (
                          <SortableLine key={line.id} line={line} onChange={handleLineChange} onDelete={handleLineDelete}
                            onImagesUpload={handleImagesUpload} onImageDelete={handleImageDelete} />
                        ))}
                      </SortableContext>
                    </DndContext>
                    <button onClick={() => { 
                      const r = {...editingRecord}
                      r.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.push({ id: generateId(), speaker: '딜런', text: '' })
                      setEditingRecord(r)
                    }} className="w-full py-4 mt-4 border border-dashed border-white/10 text-white/20 hover:text-white/50 rounded">+ 대사 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4">
              <div className="text-4xl">📝</div>
              <p>파일을 불러오거나 목록에서 선택하세요.</p>
            </div>
          )
        ) : (
          // TRPG 에디터
          editingTRPG ? (
            <>
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1A1614]">
                <input value={editingTRPG.title} onChange={(e) => setEditingTRPG({...editingTRPG, title: e.target.value})}
                  className="bg-transparent text-lg font-bold text-white focus:outline-none w-1/3" placeholder="세션 제목" />
                <input value={editingTRPG.date || ''} onChange={(e) => setEditingTRPG({...editingTRPG, date: e.target.value})}
                  className="bg-transparent text-sm text-white/60 focus:outline-none w-32" placeholder="날짜 (YYYY.MM.DD)" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#ff99bb]">{message}</span>
                  <button onClick={handleSaveTRPG} className="bg-[#ff99bb] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* 캐릭터 & 설정 사이드바 */}
                <div className="w-72 bg-[#110F0E] border-r border-white/10 overflow-y-auto p-4">
                  {/* 커버 이미지 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-white/60 mb-2">세션 카드</h3>
                    {editingTRPG.coverImage ? (
                      <div className="relative">
                        <img src={editingTRPG.coverImage} className="w-full rounded" />
                        <button onClick={() => setEditingTRPG({...editingTRPG, coverImage: undefined})}
                          className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-6 h-6 text-xs">✕</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded cursor-pointer hover:bg-white/10">
                        <span className="text-white/40 text-sm">+ 커버 이미지</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                      </label>
                    )}
                  </div>
                  
                  {/* 캐릭터 목록 */}
                  <h3 className="text-sm font-bold text-white/60 mb-3">캐릭터 ({editingTRPG.characters.length})</h3>
                  <div className="space-y-3">
                    {editingTRPG.characters.map((char) => (
                      <div key={char.name} className="p-3 bg-white/5 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${char.color}30`, color: char.color }}>
                            {char.name.charAt(0)}
                          </div>
                          <span className="text-white/80 text-sm flex-1">{char.name}</span>
                          <button onClick={() => handleCharacterPCToggle(char.name)}
                            className={`text-xs px-2 py-1 rounded ${char.isPC ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-white/40'}`}>
                            {char.isPC ? 'PC' : 'NPC'}
                          </button>
                        </div>
                        <ColorPicker color={char.color} onChange={(c) => handleCharacterColorChange(char.name, c)} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 로그 편집 영역 */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#0D0B0A]">
                  <div className="max-w-3xl mx-auto pb-20">
                    <h2 className="text-xl font-bold text-white/80 mb-6 pb-4 border-b border-white/10">
                      로그 편집 ({editingTRPG.lines.length}줄)
                    </h2>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleTRPGLineDragEnd}>
                      <SortableContext items={editingTRPG.lines.map(l => l.id)} strategy={verticalListSortingStrategy}>
                        {editingTRPG.lines.map((line, idx) => (
                          <TRPGLineEditor key={line.id} line={line} characters={editingTRPG.characters}
                            onChange={(l) => handleTRPGLineChange(idx, l)}
                            onDelete={() => {
                              const lines = [...editingTRPG.lines]
                              lines.splice(idx, 1)
                              setEditingTRPG({...editingTRPG, lines})
                            }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    <button onClick={() => {
                      setEditingTRPG({...editingTRPG, lines: [...editingTRPG.lines, { id: generateId(), type: 'dialogue', speaker: '', text: '' }]})
                    }} className="w-full py-4 mt-4 border border-dashed border-white/10 text-white/20 hover:text-white/50 rounded">+ 라인 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4">
              <div className="text-4xl">🎲</div>
              <p>Roll20 HTML 파일을 업로드하거나 목록에서 선택하세요.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
