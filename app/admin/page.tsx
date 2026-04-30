'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { parseDialogue, DialogueRecord, DialogueLine, Phase, Section, TRPGSession, TRPGLine, TRPGCharacter } from '@/lib/parseDialogue'
import type { CharacterData, CharacterPhaseData } from '@/app/api/characters/route'
import type { GameDialogueData, BodyPart } from '@/app/api/game-dialogues/route'
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
        
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
        const outputType = isPng ? 'image/png' : 'image/jpeg'
        const quality = isPng ? undefined : 0.8

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
        }, outputType, quality)
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

// Roll20 HTML 파싱 함수

// 오디오 파일을 서버에 업로드
async function uploadAudio(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('audio', file, file.name)
  
  const response = await fetch('/api/upload-audio', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`서버 응답 실패 (${response.status}): ${errorText}`)
  }
  
  const data = await response.json()
  if (!data.path) throw new Error('서버에서 경로를 반환하지 않음')
  return data.path
}

// 기본 캐릭터 데이터 (배열 형식)
const defaultCharacterData: CharacterData = {
  media: [
    {
      id: 'media-0', symbol: '毒', label: 'PHASE 00', name: '[ 마녀 ]', quote: '" 비밀이야. "',
      nameKr: '메디아 아우렐리우스', nameEn: 'MEDIA AURELIUS',
      age: '13세', height: '143cm', weight: '37kg',
      personality: ['불가해', '냉소', '강박'],
      abilityName: '과잉 생장',
      abilityDesc: '계절과 시간을 무시하고 제멋대로 피어나는 찰나의 초록색.',
      mainQuote: '"상대가 나를 멸시하면서도 나를 필요로 하게 만드는 것."',
    },
    {
      id: 'media-1', symbol: '種', label: 'PHASE 01', name: '[ 씨앗 ]', quote: '" 신경 쓰지 마. "',
      nameKr: '메디아', nameEn: 'MEDIA',
      age: '19세', height: '172cm', weight: '68kg',
      personality: ['유기', '침묵', '균열'],
      abilityName: '과잉 생장',
      abilityDesc: '덩굴로 사람 두 명 정도를 강하게 옭아맬 수 있다.',
      mainQuote: '"모두가 나를 필요로 하게 하기 위해서."',
      stats: [{ label: '근력', value: 4 }, { label: '체력', value: 1 }, { label: '민첩', value: 5 }, { label: '이능력', value: 6 }],
    },
    {
      id: 'media-2', symbol: '長', label: 'PHASE 02', name: '[ 생장 ]', quote: '" 속죄 따윈 안 해. "',
      nameKr: '메디아', nameEn: 'MEDIA',
      age: '19세', height: '172cm', weight: '68kg',
      personality: ['유기', '침묵', '균열'],
      abilityName: '과잉 생장',
      abilityDesc: '균열난 화분이 깨져도 그것을 조각조각 맞추어 본래의 태가 나도록 만들었으니.',
      mainQuote: '"어떤 것도 나를 정확하게 표현할 수 없으나."',
      stats: [{ label: '근력', value: 4 }, { label: '체력', value: 1 }, { label: '민첩', value: 5 }, { label: '이능력', value: 8 }],
    },
  ],
  sadham: [
    {
      id: 'sadham-0', symbol: '修', label: 'PHASE 00', name: '[ 修羅道 ]', quote: '" 그만. 그 이상 접근하지 마라…. "',
      nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
      age: '11세', height: '150cm', weight: '45kg',
      personality: ['억제', '반골', '방관'],
      abilityName: '아수라 — 삼독三毒',
      abilityDesc: '세 번째 눈의 개안과 함께 삼독에 따른 세 가지 저주를 내릴 수 있다.',
      mainQuote: '"힘은 진정한 나 자신을 나타내는, 가장 순수하고도 강력한 증명."',
    },
    {
      id: 'sadham-1', symbol: '人', label: 'PHASE 01', name: '[ 人間道 ]', quote: '" 그만. 실없는 소리를 하는군…. "',
      nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
      age: '17세', height: '180cm', weight: '75kg',
      personality: ['억제', '비탈', '간섭'],
      abilityName: '아수라 — 삼독三毒',
      abilityDesc: '탐貪과 진瞋의 저주를 사용할 수 있다.',
      mainQuote: '"나의 힘은 속죄하기 위해 존재한다."',
      stats: [{ label: '근력', value: 3 }, { label: '체력', value: 5 }, { label: '민첩', value: 2 }, { label: '이능력', value: 6 }],
    },
    {
      id: 'sadham-2', symbol: '鬼', label: 'PHASE 02', name: '[ 餓鬼道 ]', quote: '" 그만. 아무 것도 듣고 싶지 않다…. "',
      nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
      age: '17세', height: '180cm', weight: '75kg',
      personality: ['억제', '혼란', '강박'],
      abilityName: '아수라 — 삼독三毒',
      abilityDesc: '혼란, 혼돈, 혼동. 여전히 온갖 번뇌에서 벗어나지 못한 채.',
      mainQuote: '"돌아오지 말아라."',
      stats: [{ label: '근력', value: 3 }, { label: '체력', value: 5 }, { label: '민첩', value: 2 }, { label: '이능력', value: 6 }],
    },
  ]
}

// Roll20 HTML 파싱 함수
function parseRoll20HTML(html: string): { lines: TRPGLine[], characters: TRPGCharacter[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const lines: TRPGLine[] = []
  const characterMap = new Map<string, TRPGCharacter>()
  const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#00BCD4']

  // 캐릭터 등록 헬퍼
  const ensureCharacter = (name: string, isPC: boolean, avatarSrc?: string) => {
    if (!characterMap.has(name)) {
      characterMap.set(name, {
        name,
        color: colors[characterMap.size % colors.length],
        isPC,
        avatar: avatarSrc && !avatarSrc.startsWith('/users/avatar/') ? avatarSrc : undefined
      })
    } else if (avatarSrc && !avatarSrc.startsWith('/users/avatar/') && !characterMap.get(name)!.avatar) {
      characterMap.get(name)!.avatar = avatarSrc
    }
  }

  // 아바타 URL 추출 헬퍼
  const getAvatarSrc = (msg: Element): string | undefined => {
    const avatarImg = msg.querySelector('.avatar img') as HTMLImageElement | null
    return avatarImg?.getAttribute('src') || undefined
  }

  const messages = doc.querySelectorAll('.message')
  let lastSpeaker = ''
  let lastIsPC = false

  messages.forEach((msg) => {
    const id = generateId()
    const classes = msg.className

    // ── emote 메시지 ──
    if (classes.includes('emote')) {
      const textEl = msg.cloneNode(true) as HTMLElement
      textEl.querySelectorAll('.spacer, .avatar, .tstamp, .by, .flyout').forEach(el => el.remove())
      let text = textEl.innerHTML.trim()
      text = text.replace(/<a[^>]*>([^<]*)<\/a>/g, '$1')
      text = text.replace(/<[^>]+>/g, '').trim()
      if (text) {
        lines.push({ id, type: 'emote', text })
      }
      return
    }

    // ── 내레이션 (desc) ──
    if (classes.includes('desc')) {
      const textEl = msg.cloneNode(true) as HTMLElement
      textEl.querySelectorAll('.spacer, .avatar, .tstamp, .by, .flyout').forEach(el => el.remove())

      let text = textEl.innerHTML.trim()
      // 이미지 태그 처리 (imgur 등)
      const imgMatches = Array.from(textEl.querySelectorAll('img'))
      const imgSrcs = imgMatches.map(img => img.getAttribute('src')).filter(Boolean) as string[]

      if (imgSrcs.length > 0) {
        // 이미지 외에 텍스트가 있는지 확인
        let remainingText = text.replace(/<a[^>]*>[\s\S]*?<\/a>/g, '').replace(/<img[^>]*>/g, '').replace(/<[^>]+>/g, '').trim()
        lines.push({
          id,
          type: 'narration',
          text: remainingText,
          images: imgSrcs
        })
      } else {
        text = text.replace(/<a[^>]*>([^<]*)<\/a>/g, '$1')
        text = text.replace(/<[^>]+>/g, '').trim()

        if (text && text !== '*') {
          if (msg.innerHTML.includes('background-color')) {
            lines.push({ id, type: 'system', text })
          } else {
            lines.push({ id, type: 'narration', text })
          }
        }
      }
      return
    }

    // ── 주사위 굴림 (rollresult) — em/메디아/플레이어 직접 주사위 ──
    if (classes.includes('rollresult')) {
      const byEl = msg.querySelector('.by')
      let speaker = byEl?.textContent?.replace(':', '').trim() || lastSpeaker
      const avatarSrc = getAvatarSrc(msg)
      if (speaker) {
        ensureCharacter(speaker, classes.includes('you'), avatarSrc)
        lastSpeaker = speaker
        lastIsPC = classes.includes('you')
      }

      // 공식 텍스트
      const formulaEl = msg.querySelector('.formula:not(.formattedformula)')
      const formula = formulaEl?.textContent?.replace('rolling ', '').trim() || ''

      // 개별 주사위 파싱
      const diceEls = msg.querySelectorAll('.diceroll')
      const dice: { value: number; sides: number; crit?: 'success' | 'fail' }[] = []
      diceEls.forEach(d => {
        const value = parseInt(d.querySelector('.didroll')?.textContent || '0')
        const sidesMatch = d.className.match(/d(\d+)/)
        const sides = sidesMatch ? parseInt(sidesMatch[1]) : 6
        let crit: 'success' | 'fail' | undefined
        if (d.classList.contains('critsuccess')) crit = 'success'
        if (d.classList.contains('critfail')) crit = 'fail'
        dice.push({ value, sides, crit })
      })

      // 합계
      const total = parseInt(msg.querySelector('.rolled')?.textContent || '0')

      lines.push({
        id,
        type: 'diceroll',
        speaker: speaker || undefined,
        text: formula,
        diceData: { formula, dice, total }
      })
      return
    }

    // ── 일반 대사 (general) ──
    if (classes.includes('general')) {
      const byEl = msg.querySelector('.by')
      let speaker = byEl?.textContent?.replace(':', '').trim() || lastSpeaker
      if (!speaker) return

      const avatarSrc = getAvatarSrc(msg)
      const isPC = byEl ? classes.includes('you') : lastIsPC
      ensureCharacter(speaker, isPC, avatarSrc)
      lastSpeaker = speaker
      lastIsPC = isPC

      // 텍스트 추출
      const textEl = msg.cloneNode(true) as HTMLElement
      textEl.querySelectorAll('.spacer, .avatar, .tstamp, .by, .flyout').forEach(el => el.remove())

      // ── 광기의 발작 체크 ──
      const madnessTemplate = textEl.querySelector('.sheet-rolltemplate-coc-bomadness-rt')
      if (madnessTemplate) {
        const title = madnessTemplate.querySelector('caption')?.textContent || '광기의 발작'
        const valueEls = madnessTemplate.querySelectorAll('.sheet-template_value')
        let effectName = ''
        let effectDesc = ''
        let rounds: number | undefined
        let duration: number | undefined

        valueEls.forEach(el => {
          const bold = el.querySelector('b')
          const text = el.textContent?.trim() || ''
          if (bold) {
            const boldText = bold.textContent?.trim() || ''
            if (text.includes('Rounds:') || text.includes('라운드')) {
              const numMatch = text.match(/\d+/)
              if (numMatch) rounds = parseInt(numMatch[0])
            } else if (text.includes('Duration') || text.includes('Underlying')) {
              const numMatch = text.match(/\d+/)
              if (numMatch) duration = parseInt(numMatch[0])
            } else {
              effectName = boldText
            }
          } else if (text.length > 10 && !effectDesc) {
            effectDesc = text
          } else if (text.includes('Rounds:') || text.includes('라운드')) {
            const numMatch = text.match(/\d+/)
            if (numMatch) rounds = parseInt(numMatch[0])
          } else if (text.includes('Duration') || text.includes('Underlying')) {
            const numMatch = text.match(/\d+/)
            if (numMatch) duration = parseInt(numMatch[0])
          }
        })

        lines.push({
          id,
          type: 'madness',
          speaker,
          text: title,
          madnessData: { title, effectName, effectDesc, rounds, duration }
        })
        return
      }

      // ── CoC 판정 주사위 체크 ──
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

      // ── 이미지 추출 (imgur 등) ──
      const imgEls = textEl.querySelectorAll('img:not(.avatar img)')
      const imgSrcs = Array.from(imgEls)
        .map(img => img.getAttribute('src'))
        .filter(src => src && !src.startsWith('/users/avatar/')) as string[]

      let text = textEl.innerHTML
      // 이미지 링크 제거
      text = text.replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/g, '')
      text = text.replace(/<img[^>]*>/g, '')
        .replace(/<strong>([^<]*)<\/strong>/g, '<b>$1</b>')
        .replace(/<em>([^<]*)<\/em>/g, '<i>$1</i>')
        .replace(/<[^bi/][^>]*>/g, '')
        .replace(/<\/[^bi][^>]*>/g, '')
        .trim()

      if (text || imgSrcs.length > 0) {
        lines.push({
          id,
          type: 'dialogue',
          speaker,
          text: text || '',
          images: imgSrcs.length > 0 ? imgSrcs : undefined
        })
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
  onImageDelete,
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
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-white/50 p-3 rounded border border-ink/5 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-ink/20 hover:text-ink/50 mt-2 px-1 text-lg">⣿</div>
      <div className="flex-1 space-y-2">
        <input
          value={line.speaker}
          onChange={(e) => onChange(line.id, 'speaker', e.target.value)}
          className={`bg-transparent border-b border-ink/10 w-24 text-sm focus:outline-none focus:border-[#8B1538] transition-colors ${line.speaker.includes('사드함') ? 'text-[#5E7B97]' : 'text-red-400'}`}
        />

        {hasImages && (
          <div className="relative inline-block">
            <img src={images[currentImageIndex]} alt="" className="max-w-xs rounded border border-ink/20" />
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
          className="w-full bg-white/60 text-ink/90 text-sm p-2 rounded focus:outline-none resize-none"
          rows={Math.max(2, line.text.split('\n').length)} />

        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-2 px-3 py-1 bg-ink/[0.03] hover:bg-ink/[0.06] rounded cursor-pointer text-xs text-ink/60">
            <span>+ 이미지</span>
            <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
          </label>
        </div>
      </div>
      <button onClick={() => onDelete(line.id)} className="text-ink/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// --- 드래그 가능한 소제목 컴포넌트 ---
function SortableSection({ section, pIdx, sIdx, selectedPhaseIdx, selectedSectionIdx, onSelectSection, onEditSectionName, onDeleteSection }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group">
      <div {...attributes} {...listeners} className="cursor-grab text-ink/15 hover:text-ink/40 text-xs px-0.5">⣿</div>
      {isEditing ? (
        <input autoFocus value={section.title} onChange={(e) => onEditSectionName(pIdx, sIdx, e.target.value)}
          onBlur={() => setIsEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="bg-white/70 text-ink text-sm px-2 py-1 rounded focus:outline-none flex-1" />
      ) : (
        <button onClick={() => onSelectSection(pIdx, sIdx)} onDoubleClick={() => setIsEditing(true)}
          className={`text-left text-sm flex-1 py-1 px-2 rounded ${selectedPhaseIdx === pIdx && selectedSectionIdx === sIdx ? 'bg-[#8B1538]/20 text-[#8B1538]' : 'text-ink/50 hover:bg-ink/[0.04]'}`}>
          {section.title}
        </button>
      )}
      <button onClick={() => onDeleteSection(pIdx, sIdx)} className="text-ink/20 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100">✕</button>
    </div>
  )
}

// --- 드래그 가능한 Phase 컴포넌트 (소제목은 별도 DnD) ---
function SortablePhase({ phase, pIdx, selectedPhaseIdx, selectedSectionIdx, onSelectPhase, onSelectSection, onEditPhaseName, onDeletePhase, onAddSection, onEditSectionName, onDeleteSection }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: phase.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab text-ink/20 hover:text-ink/50">⣿</div>
        {isEditing ? (
          <input autoFocus value={phase.name} onChange={(e) => onEditPhaseName(pIdx, e.target.value)}
            onBlur={() => setIsEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-white/70 text-[#8B1538] font-bold px-2 py-1 rounded focus:outline-none flex-1" />
        ) : (
          <button onClick={() => onSelectPhase(pIdx)} onDoubleClick={() => setIsEditing(true)}
            className={`text-left font-bold flex-1 ${selectedPhaseIdx === pIdx ? 'text-[#8B1538]' : 'text-ink/40'}`}>
            {phase.name}
          </button>
        )}
        <button onClick={() => onDeletePhase(pIdx)} className="text-ink/20 hover:text-red-500 text-sm">🗑️</button>
      </div>

      <div className="space-y-1 pl-6 border-l border-ink/10 ml-2">
        {phase.sections.map((section: Section, sIdx: number) => (
          <SortableSection key={section.id} section={section} pIdx={pIdx} sIdx={sIdx}
            selectedPhaseIdx={selectedPhaseIdx} selectedSectionIdx={selectedSectionIdx}
            onSelectSection={onSelectSection} onEditSectionName={onEditSectionName} onDeleteSection={onDeleteSection} />
        ))}
      </div>
      
      <button onClick={() => onAddSection(pIdx)} className="ml-8 mt-2 text-sm text-ink/30 hover:text-ink/60">+ 소제목 추가</button>
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
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2 bg-white/50 p-3 rounded border border-ink/5 items-start group">
      <div {...attributes} {...listeners} className="cursor-grab text-ink/20 hover:text-ink/50 mt-2 px-1">⣿</div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <select value={line.type} onChange={(e) => onChange({ ...line, type: e.target.value as any })}
            className="bg-white/70 text-ink/70 text-xs px-2 py-1 rounded">
            <option value="dialogue">대사</option>
            <option value="narration">내레이션</option>
            <option value="system">시스템</option>
            <option value="roll">판정</option>
            <option value="diceroll">주사위</option>
            <option value="emote">감정표현</option>
            <option value="madness">광기</option>
          </select>
          {(line.type === 'dialogue' || line.type === 'roll' || line.type === 'diceroll' || line.type === 'madness') && (
            <input value={line.speaker || ''} onChange={(e) => onChange({ ...line, speaker: e.target.value })}
              className="bg-transparent border-b border-ink/10 w-32 text-sm focus:outline-none" style={{ color }}
              placeholder="화자" />
          )}
        </div>
        <textarea value={line.text} onChange={(e) => onChange({ ...line, text: e.target.value })}
          className="w-full bg-white/60 text-ink/90 text-sm p-2 rounded focus:outline-none resize-none"
          rows={Math.max(1, line.text.split('\n').length)} placeholder="내용" />
      </div>
      <button onClick={onDelete} className="text-ink/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
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
          className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-ink' : 'border-transparent'}`}
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
  const [activeTab, setActiveTab] = useState<'roleplay' | 'trpg' | 'character' | 'game'>('roleplay')
  const [message, setMessage] = useState('')
  
  // 역극 상태
  const [recordsList, setRecordsList] = useState<DialogueRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0)
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0)
  
  // TRPG 상태
  const [trpgList, setTrpgList] = useState<TRPGSession[]>([])
  const [editingTRPG, setEditingTRPG] = useState<TRPGSession | null>(null)

  // 캐릭터 상태
  const [characterData, setCharacterData] = useState<CharacterData>(defaultCharacterData)
  const [charTab, setCharTab] = useState<'media' | 'sadham'>('media')
  const [charPhaseIdx, setCharPhaseIdx] = useState(0)
  const [charUploading, setCharUploading] = useState(false)

  // 게임 대사 상태
  const [gameData, setGameData] = useState<GameDialogueData>({ foreword: { parts: [] }, rebuttal: { parts: [] } })
  const [gameTab, setGameTab] = useState<'foreword' | 'rebuttal'>('foreword')
  const [gameUploading, setGameUploading] = useState(false)
  const [drawingPartIdx, setDrawingPartIdx] = useState<number | null>(null)  // 현재 그리기 중인 부위
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])  // 임시 꼭짓점
  const [draggingVertex, setDraggingVertex] = useState<{ partIdx: number; pointIdx: number } | null>(null)
  const gameImgRef = useRef<HTMLImageElement>(null)
  const gameCanvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('same_admin_login')
    if (saved === 'true') setIsLoggedIn(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchRecords()
      fetchTRPG()
      fetchCharacterData()
      fetchGameData()
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

  const fetchGameData = async () => {
    try {
      const res = await fetch('/api/game-dialogues')
      const data = await res.json()
      if (data) setGameData(data)
    } catch (e) { console.error(e) }
  }

  const fetchCharacterData = async () => {
    try {
      const res = await fetch('/api/characters')
      const data = await res.json()
      if (data?.media?.length && data?.sadham?.length) {
        setCharacterData(data)
      }
    } catch (e) { console.error(e) }
  }

  const getCurrentCharPhase = (): CharacterPhaseData => {
    const phases = charTab === 'media' ? characterData.media : characterData.sadham
    return phases[charPhaseIdx] || phases[0]
  }

  const updateCharPhase = (updates: Partial<CharacterPhaseData>) => {
    setCharacterData(prev => {
      const phases = [...prev[charTab]]
      if (phases[charPhaseIdx]) {
        phases[charPhaseIdx] = { ...phases[charPhaseIdx], ...updates }
      }
      return { ...prev, [charTab]: phases }
    })
  }

  const handleAddPhase = () => {
    const phases = characterData[charTab]
    const newPhase: CharacterPhaseData = {
      id: generateId(),
      symbol: '?', label: `PHASE ${String(phases.length).padStart(2, '0')}`, name: '[ 새 페이즈 ]', quote: '""',
      nameKr: charTab === 'media' ? '메디아' : '사드함 눈',
      nameEn: charTab === 'media' ? 'MEDIA' : 'SAKDĀGĀMI NOON',
      age: '', height: '', weight: '',
      personality: [],
      abilityName: '', abilityDesc: '', mainQuote: '',
    }
    setCharacterData(prev => ({ ...prev, [charTab]: [...prev[charTab], newPhase] }))
    setCharPhaseIdx(phases.length)
  }

  const handleDeletePhase = (idx: number) => {
    const phases = characterData[charTab]
    if (phases.length <= 1) return
    if (!confirm(`"${phases[idx].label}" 페이즈를 삭제하시겠습니까?`)) return
    setCharacterData(prev => ({
      ...prev,
      [charTab]: prev[charTab].filter((_, i) => i !== idx)
    }))
    setCharPhaseIdx(Math.max(0, idx - 1))
  }

  const handleCharProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCharUploading(true)
    try {
      const path = await uploadImage(file)
      updateCharPhase({ profileImage: path })
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`)
    }
    setCharUploading(false)
  }

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCharUploading(true)
    try {
      const path = await uploadAudio(file)
      updateCharPhase({ voiceFile: path, voiceLabel: file.name })
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`)
    }
    setCharUploading(false)
  }

  const handleSaveCharacterData = async () => {
    setMessage('저장 중...')
    try {
      const res = await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      })
      if (res.ok) {
        setMessage('저장 완료!')
      } else {
        setMessage('저장 실패')
      }
    } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleAddStat = () => {
    const phase = getCurrentCharPhase()
    const stats = [...(phase.stats || []), { label: '새 스탯', value: 5 }]
    updateCharPhase({ stats })
  }

  const handleUpdateStat = (idx: number, field: 'label' | 'value', val: string | number) => {
    const phase = getCurrentCharPhase()
    const stats = [...(phase.stats || [])]
    stats[idx] = { ...stats[idx], [field]: val }
    updateCharPhase({ stats })
  }

  const handleDeleteStat = (idx: number) => {
    const phase = getCurrentCharPhase()
    const stats = [...(phase.stats || [])]
    stats.splice(idx, 1)
    updateCharPhase({ stats: stats.length > 0 ? stats : undefined })
  }

  const handleAddPersonality = () => {
    const phase = getCurrentCharPhase()
    updateCharPhase({ personality: [...phase.personality, '새 태그'] })
  }

  const handleUpdatePersonality = (idx: number, val: string) => {
    const phase = getCurrentCharPhase()
    const p = [...phase.personality]
    p[idx] = val
    updateCharPhase({ personality: p })
  }

  const handleDeletePersonality = (idx: number) => {
    const phase = getCurrentCharPhase()
    const p = [...phase.personality]
    p.splice(idx, 1)
    updateCharPhase({ personality: p })
  }

  // 게임 대사 핸들러들
  const currentGameSection = gameData[gameTab]

  const handleSaveGameData = async () => {
    setMessage('저장 중...')
    try {
      const res = await fetch('/api/game-dialogues', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      })
      if (res.ok) setMessage('저장 완료!')
      else setMessage('저장 실패')
    } catch (e) { setMessage('저장 실패') }
    setTimeout(() => setMessage(''), 2000)
  }

  const updateGameSection = (updates: Partial<typeof currentGameSection>) => {
    setGameData(prev => ({ ...prev, [gameTab]: { ...prev[gameTab], ...updates } }))
  }

  const handleAddBodyPart = () => {
    const newPart: BodyPart = { id: generateId(), label: '새 부위', x: 50, y: 50, width: 10, height: 10, dialogue: '', points: [] }
    const newParts = [...currentGameSection.parts, newPart]
    updateGameSection({ parts: newParts })
    // 바로 그리기 모드 시작
    setDrawingPartIdx(newParts.length - 1)
    setDrawingPoints([])
  }

  const handleUpdateBodyPart = (idx: number, updates: Partial<BodyPart>) => {
    const parts = [...currentGameSection.parts]
    parts[idx] = { ...parts[idx], ...updates }
    updateGameSection({ parts })
  }

  const handleDeleteBodyPart = (idx: number) => {
    const parts = [...currentGameSection.parts]
    parts.splice(idx, 1)
    updateGameSection({ parts })
    if (drawingPartIdx === idx) { setDrawingPartIdx(null); setDrawingPoints([]) }
    else if (drawingPartIdx !== null && drawingPartIdx > idx) setDrawingPartIdx(drawingPartIdx - 1)
  }

  // 이미지 위 클릭 → 다각형 꼭짓점 추가
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingPartIdx === null) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newPoints: [number, number][] = [...drawingPoints, [x, y]]
    setDrawingPoints(newPoints)
    handleUpdateBodyPart(drawingPartIdx, { points: newPoints })
  }

  // 그리기 완료
  const finishDrawing = () => {
    if (drawingPartIdx !== null && drawingPoints.length >= 3) {
      handleUpdateBodyPart(drawingPartIdx, { points: drawingPoints })
    }
    setDrawingPartIdx(null)
    setDrawingPoints([])
  }

  // 마지막 점 취소
  const undoLastPoint = () => {
    if (drawingPoints.length === 0) return
    const newPoints = drawingPoints.slice(0, -1)
    setDrawingPoints(newPoints)
    if (drawingPartIdx !== null) handleUpdateBodyPart(drawingPartIdx, { points: newPoints })
  }

  // 다시 그리기
  const restartDrawing = (idx: number) => {
    setDrawingPartIdx(idx)
    setDrawingPoints([])
    handleUpdateBodyPart(idx, { points: [] })
  }

  // 꼭짓점 드래그 시작
  const handleVertexMouseDown = (e: React.MouseEvent, partIdx: number, pointIdx: number) => {
    e.stopPropagation()
    e.preventDefault()
    setDraggingVertex({ partIdx, pointIdx })
  }

  // 꼭짓점 드래그 중
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingVertex) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    const part = currentGameSection.parts[draggingVertex.partIdx]
    if (!part?.points) return
    const newPoints: [number, number][] = part.points.map((p, i) => i === draggingVertex.pointIdx ? [x, y] : p)
    handleUpdateBodyPart(draggingVertex.partIdx, { points: newPoints })
  }

  // 꼭짓점 드래그 끝
  const handleCanvasMouseUp = () => {
    setDraggingVertex(null)
  }

  const handleGameImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setGameUploading(true)
    try {
      const path = await uploadImage(file)
      updateGameSection({ characterImage: path })
    } catch (err: any) { alert(`업로드 실패: ${err.message}`) }
    setGameUploading(false)
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
        const newRecord = { ...editingRecord, phases: editingRecord.phases.map(p => ({ ...p, sections: [...p.sections] })) }
        parsed.phases.forEach(newPhase => {
          // 같은 이름의 차수가 있으면 소제목을 합침
          const existingPhase = newRecord.phases.find(p => p.name.trim() === newPhase.name.trim())
          if (existingPhase) {
            newPhase.sections.forEach(s => existingPhase.sections.push(s))
          } else {
            newRecord.phases.push(newPhase)
          }
        })
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

  if (isLoading) return <div className="min-h-screen bg-bg" />

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-bg-cream border border-ink/10 rounded-lg p-8">
          <h1 className="font-display text-center text-[#8B1538] mb-6">ADMIN ACCESS</h1>
          <form onSubmit={(e) => { e.preventDefault(); if (password === "same1234") { setIsLoggedIn(true); localStorage.setItem('same_admin_login', 'true') } else alert('비밀번호 불일치') }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/60 border border-ink/10 rounded px-4 py-3 text-ink focus:outline-none focus:border-[#8B1538] mb-4 placeholder-ink/40" placeholder="비밀번호" />
            <button type="submit" className="w-full bg-[#8B1538] hover:bg-[#A01840] text-white py-3 rounded">로그인</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden">
      {/* 사이드바 */}
      <div className="w-80 bg-bg-cream border-r border-ink/10 flex flex-col">
        <div className="p-6 border-b border-ink/10">
          <h1 className="font-display text-xl text-[#8B1538] mb-4">SAME ADMIN</h1>
          
          {/* 탭 선택 */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('roleplay')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'roleplay' ? 'bg-[#8B1538] text-white' : 'bg-ink/[0.03] text-ink/40'}`}>
              역극
            </button>
            <button onClick={() => setActiveTab('trpg')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'trpg' ? 'bg-[#8B1538] text-white' : 'bg-ink/[0.03] text-ink/40'}`}>
              TRPG
            </button>
            <button onClick={() => setActiveTab('character')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'character' ? 'bg-[#8B1538] text-white' : 'bg-ink/[0.03] text-ink/40'}`}>
              캐릭터
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('game')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'game' ? 'bg-[#8B1538] text-white' : 'bg-ink/[0.03] text-ink/40'}`}>
              게임 대사
            </button>
          </div>
          
          {activeTab === 'roleplay' ? (
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 w-full bg-ink/[0.03] hover:bg-ink/[0.06] text-ink/80 py-3 rounded cursor-pointer border border-dashed border-ink/20">
                <span>+ 새 파일로 시작</span>
                <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'new')} />
              </label>
              {editingRecord && (
                <label className="flex items-center justify-center gap-2 w-full bg-[#8B1538]/10 text-[#8B1538] py-3 rounded cursor-pointer border border-[#8B1538]/30">
                  <span>+ 현재 레코드에 추가</span>
                  <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'append')} />
                </label>
              )}
            </div>
          ) : activeTab === 'trpg' ? (
            <label className="flex items-center justify-center gap-2 w-full bg-ink/[0.03] hover:bg-ink/[0.06] text-ink/80 py-3 rounded cursor-pointer border border-dashed border-ink/20">
              <span>+ Roll20 HTML 업로드</span>
              <input type="file" className="hidden" accept=".html" onChange={handleTRPGUpload} />
            </label>
          ) : activeTab === 'character' ? (
            <div className="space-y-3">
              <div className="flex gap-1">
                <button onClick={() => { setCharTab('media'); setCharPhaseIdx(0) }}
                  className={`flex-1 py-2 rounded text-xs font-bold ${charTab === 'media' ? 'bg-[#8B1538]/30 text-[#8B1538] border border-[#8B1538]/50' : 'bg-ink/[0.03] text-ink/40'}`}>
                  메디아
                </button>
                <button onClick={() => { setCharTab('sadham'); setCharPhaseIdx(0) }}
                  className={`flex-1 py-2 rounded text-xs font-bold ${charTab === 'sadham' ? 'bg-[#5E7B97]/30 text-[#5E7B97] border border-[#5E7B97]/50' : 'bg-ink/[0.03] text-ink/40'}`}>
                  사드함
                </button>
              </div>
              <div className="space-y-1">
                {characterData[charTab].map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-1">
                    <button onClick={() => setCharPhaseIdx(idx)}
                      className={`flex-1 text-left px-3 py-2.5 rounded text-sm transition-colors ${
                        charPhaseIdx === idx
                          ? charTab === 'media'
                            ? 'bg-[#8B1538]/20 text-[#8B1538] border border-[#8B1538]/40'
                            : 'bg-[#5E7B97]/20 text-[#5E7B97] border border-[#5E7B97]/40'
                          : 'text-ink/50 hover:bg-ink/[0.04] border border-transparent'
                      }`}>
                      {p.label} · {p.name.replace(/[\[\]]/g, '').trim()}
                    </button>
                    {characterData[charTab].length > 1 && (
                      <button onClick={() => handleDeletePhase(idx)} className="text-ink/20 hover:text-red-500 text-xs px-1 shrink-0">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={handleAddPhase}
                  className="w-full py-2 border border-dashed border-ink/15 rounded text-ink/30 hover:text-ink/60 text-xs">+ 페이즈 추가</button>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'roleplay' ? (
            recordsList.map(rec => (
              <div key={rec.id} onClick={() => { setEditingRecord(rec); setSelectedPhaseIdx(0); setSelectedSectionIdx(0) }}
                className={`group p-3 rounded cursor-pointer flex justify-between items-center ${editingRecord?.id === rec.id ? 'bg-[#8B1538]/20 border border-[#8B1538]/50' : 'hover:bg-ink/[0.04] border border-transparent'}`}>
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{rec.title}</div>
                  <div className="text-xs text-ink/30">{new Date(rec.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => handleDeleteRecord(rec.id, e)} className="text-ink/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            ))
          ) : activeTab === 'trpg' ? (
            trpgList.map(session => (
              <div key={session.id} onClick={() => setEditingTRPG(session)}
                className={`group p-3 rounded cursor-pointer flex justify-between items-center ${editingTRPG?.id === session.id ? 'bg-[#8B1538]/20 border border-[#8B1538]/50' : 'hover:bg-ink/[0.04] border border-transparent'}`}>
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{session.title}</div>
                  <div className="text-xs text-ink/30">{session.date || new Date(session.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => handleDeleteTRPG(session.id, e)} className="text-ink/20 hover:text-red-500 px-2 opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            ))
          ) : activeTab === 'character' ? (
            <div className="text-center text-ink/30 text-sm py-4">
              <p className="mb-2">좌측에서 캐릭터와<br/>차수를 선택하세요</p>
              <div className="w-12 h-px bg-ink/10 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3 p-2">
              <div className="flex gap-1">
                <button onClick={() => setGameTab('foreword')}
                  className={`flex-1 py-2 rounded text-xs font-bold ${gameTab === 'foreword' ? 'bg-[#8B1538]/30 text-[#8B1538] border border-[#8B1538]/50' : 'bg-ink/[0.03] text-ink/40'}`}>
                  Foreword (Media)
                </button>
                <button onClick={() => setGameTab('rebuttal')}
                  className={`flex-1 py-2 rounded text-xs font-bold ${gameTab === 'rebuttal' ? 'bg-[#5E7B97]/30 text-[#5E7B97] border border-[#5E7B97]/50' : 'bg-ink/[0.03] text-ink/40'}`}>
                  Rebuttal (Sadham)
                </button>
              </div>
              <p className="text-xs text-ink/25">캐릭터 이미지 위에 클릭 가능한 부위를 추가하고 각 부위에 대사를 지정합니다.</p>
              <div className="space-y-1">
                {currentGameSection.parts.map((part, idx) => (
                  <div key={part.id} className="flex items-center gap-1 group">
                    <button onClick={() => {}}
                      className="flex-1 text-left px-3 py-2 rounded text-sm text-ink/50 hover:bg-ink/[0.04]">
                      {part.label} ({part.x}%, {part.y}%)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 메인 에디터 영역 */}
      <div className="flex-1 flex flex-col bg-bg h-full overflow-hidden">
        {activeTab === 'roleplay' ? (
          // 역극 에디터
          editingRecord ? (
            <>
              <div className="h-16 border-b border-ink/10 flex items-center justify-between px-6 bg-bg-cream">
                <input value={editingRecord.title} onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})}
                  className="bg-transparent text-lg font-bold text-ink focus:outline-none w-1/2" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#8B1538]">{message}</span>
                  <button onClick={handleSaveRecord} className="bg-[#8B1538] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-white/50 border-r border-ink/10 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Section-level DnD (cross-phase) */}
                    <DndContext collisionDetection={closestCenter} onDragEnd={(e) => {
                      const { active, over } = e
                      if (!over || active.id === over.id) return
                      
                      // Check if this is a section drag (not phase drag)
                      const allSectionIds = editingRecord.phases.flatMap(p => p.sections.map(s => s.id))
                      const isSection = allSectionIds.includes(active.id as string)
                      
                      if (isSection) {
                        // Find source phase/section
                        let srcPI = -1, srcSI = -1
                        let dstPI = -1, dstSI = -1
                        editingRecord.phases.forEach((p, pi) => {
                          p.sections.forEach((s, si) => {
                            if (s.id === active.id) { srcPI = pi; srcSI = si }
                            if (s.id === over.id) { dstPI = pi; dstSI = si }
                          })
                        })
                        
                        if (srcPI === -1) return
                        
                        // If dropped on a phase header, move to end of that phase
                        if (dstPI === -1) {
                          const phaseIdx = editingRecord.phases.findIndex(p => p.id === over.id)
                          if (phaseIdx === -1) return
                          dstPI = phaseIdx
                          dstSI = editingRecord.phases[phaseIdx].sections.length
                        }
                        
                        const newPhases = editingRecord.phases.map(p => ({ ...p, sections: [...p.sections] }))
                        const [movedSection] = newPhases[srcPI].sections.splice(srcSI, 1)
                        
                        // Recalculate dstSI after removal if same phase
                        if (srcPI === dstPI) {
                          const targetIdx = newPhases[dstPI].sections.findIndex(s => s.id === over.id)
                          const insertAt = targetIdx === -1 ? newPhases[dstPI].sections.length : targetIdx
                          newPhases[dstPI].sections.splice(insertAt, 0, movedSection)
                        } else {
                          const insertAt = Math.min(dstSI, newPhases[dstPI].sections.length)
                          newPhases[dstPI].sections.splice(insertAt, 0, movedSection)
                        }
                        
                        setEditingRecord({ ...editingRecord, phases: newPhases })
                        
                        // Update selection to follow the moved section
                        const newPI = newPhases.findIndex(p => p.sections.some(s => s.id === movedSection.id))
                        const newSI = newPhases[newPI]?.sections.findIndex(s => s.id === movedSection.id) ?? 0
                        if (newPI !== -1) {
                          setSelectedPhaseIdx(newPI)
                          setSelectedSectionIdx(newSI)
                        }
                      } else {
                        // Phase drag
                        const phases = editingRecord.phases
                        const oldIdx = phases.findIndex(p => p.id === active.id)
                        const newIdx = phases.findIndex(p => p.id === over.id)
                        if (oldIdx !== -1 && newIdx !== -1) {
                          setEditingRecord({ ...editingRecord, phases: arrayMove(phases, oldIdx, newIdx) })
                        }
                      }
                    }}>
                      <SortableContext items={[
                        ...editingRecord.phases.map(p => p.id),
                        ...editingRecord.phases.flatMap(p => p.sections.map(s => s.id))
                      ]} strategy={verticalListSortingStrategy}>
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
                  <div className="p-4 border-t border-ink/10">
                    <button onClick={() => { const r = {...editingRecord}; r.phases.push({ id: generateId(), name: '새 차수', sections: [] }); setEditingRecord(r) }}
                      className="w-full py-3 border border-dashed border-ink/20 text-ink/30 hover:text-ink/60 rounded">+ 차수 추가</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 bg-bg">
                  <div className="max-w-3xl mx-auto pb-20">
                    {/* 대화 아바타 설정 (섹션별) */}
                    <div className="mb-6 pb-4 border-b border-ink/10">
                      <h2 className="text-xl font-bold text-ink/80 mb-4">
                        {editingRecord.phases[selectedPhaseIdx]?.name} — {editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]?.title}
                      </h2>
                      {(() => {
                        const sec = editingRecord.phases[selectedPhaseIdx]?.sections[selectedSectionIdx]
                        if (!sec) return null
                        const updateSectionAvatar = (field: 'mediaAvatar' | 'sadhamAvatar', value: string | undefined) => {
                          const r = {...editingRecord}
                          r.phases[selectedPhaseIdx].sections[selectedSectionIdx] = { ...sec, [field]: value }
                          setEditingRecord(r)
                        }
                        return (
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-ink/40">메디아:</span>
                              <button onClick={() => updateSectionAvatar('mediaAvatar', undefined)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] ${!sec.mediaAvatar ? 'border-[#8B1538] bg-ink/5 text-ink/40' : 'border-transparent bg-ink/[0.03] text-ink/20 hover:bg-ink/[0.06]'}`}>
                                毒
                              </button>
                              {(characterData.mediaAvatars || []).map((url, i) => (
                                <button key={i} onClick={() => updateSectionAvatar('mediaAvatar', url)}
                                  className={`w-8 h-8 rounded-full border-2 overflow-hidden ${sec.mediaAvatar === url ? 'border-[#8B1538]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                              {(characterData.mediaAvatars || []).length === 0 && (
                                <span className="text-[10px] text-ink/20">캐릭터 탭에서 후보 등록</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-ink/40">사드함:</span>
                              <button onClick={() => updateSectionAvatar('sadhamAvatar', undefined)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] ${!sec.sadhamAvatar ? 'border-[#5E7B97] bg-ink/5 text-ink/40' : 'border-transparent bg-ink/[0.03] text-ink/20 hover:bg-ink/[0.06]'}`}>
                                眼
                              </button>
                              {(characterData.sadhamAvatars || []).map((url, i) => (
                                <button key={i} onClick={() => updateSectionAvatar('sadhamAvatar', url)}
                                  className={`w-8 h-8 rounded-full border-2 overflow-hidden ${sec.sadhamAvatar === url ? 'border-[#5E7B97]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                              {(characterData.sadhamAvatars || []).length === 0 && (
                                <span className="text-[10px] text-ink/20">캐릭터 탭에서 후보 등록</span>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
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
                      r.phases[selectedPhaseIdx].sections[selectedSectionIdx].lines.push({ id: generateId(), speaker: '사드함', text: '' })
                      setEditingRecord(r)
                    }} className="w-full py-4 mt-4 border border-dashed border-ink/10 text-ink/20 hover:text-ink/50 rounded">+ 대사 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-ink/30 gap-4">
              <div className="text-4xl">📝</div>
              <p>파일을 불러오거나 목록에서 선택하세요.</p>
            </div>
          )
        ) : activeTab === 'trpg' ? (
          // TRPG 에디터
          editingTRPG ? (
            <>
              <div className="h-16 border-b border-ink/10 flex items-center justify-between px-6 bg-bg-cream">
                <input value={editingTRPG.title} onChange={(e) => setEditingTRPG({...editingTRPG, title: e.target.value})}
                  className="bg-transparent text-lg font-bold text-ink focus:outline-none w-1/3" placeholder="세션 제목" />
                <input value={editingTRPG.date || ''} onChange={(e) => setEditingTRPG({...editingTRPG, date: e.target.value})}
                  className="bg-transparent text-sm text-ink/60 focus:outline-none w-32" placeholder="날짜 (YYYY.MM.DD)" />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#8B1538]">{message}</span>
                  <button onClick={handleSaveTRPG} className="bg-[#8B1538] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* 캐릭터 & 설정 사이드바 */}
                <div className="w-72 bg-white/50 border-r border-ink/10 overflow-y-auto p-4">
                  {/* 커버 이미지 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-ink/60 mb-2">세션 카드</h3>
                    {editingTRPG.coverImage ? (
                      <div className="relative">
                        <img src={editingTRPG.coverImage} className="w-full rounded" />
                        <button onClick={() => setEditingTRPG({...editingTRPG, coverImage: undefined})}
                          className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-6 h-6 text-xs">✕</button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full aspect-video bg-ink/[0.03] border border-dashed border-ink/20 rounded cursor-pointer hover:bg-ink/[0.06]">
                        <span className="text-ink/40 text-sm">+ 커버 이미지</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                      </label>
                    )}
                  </div>
                  
                  {/* 캐릭터 목록 */}
                  <h3 className="text-sm font-bold text-ink/60 mb-3">캐릭터 ({editingTRPG.characters.length})</h3>
                  <div className="space-y-3">
                    {editingTRPG.characters.map((char) => (
                      <div key={char.name} className="p-3 bg-ink/[0.03] rounded">
                        <div className="flex items-center gap-2 mb-2">
                          {char.avatar ? (
                            <img src={char.avatar} alt={char.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${char.color}30`, color: char.color }}>
                              {char.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-ink/80 text-sm flex-1">{char.name}</span>
                          <button onClick={() => handleCharacterPCToggle(char.name)}
                            className={`text-xs px-2 py-1 rounded ${char.isPC ? 'bg-blue-500/30 text-blue-600' : 'bg-ink/10 text-ink/40'}`}>
                            {char.isPC ? 'PC' : 'NPC'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={char.avatar || ''}
                            onChange={(e) => {
                              const newChars = editingTRPG.characters.map(c =>
                                c.name === char.name ? { ...c, avatar: e.target.value || undefined } : c
                              )
                              setEditingTRPG({ ...editingTRPG, characters: newChars })
                            }}
                            placeholder="아바타 이미지 URL"
                            className="flex-1 bg-white/60 text-ink/70 text-xs px-2 py-1 rounded focus:outline-none"
                          />
                          <label className="text-xs text-ink/40 hover:text-ink/60 cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const path = await uploadImage(file)
                                const newChars = editingTRPG.characters.map(c =>
                                  c.name === char.name ? { ...c, avatar: path } : c
                                )
                                setEditingTRPG({ ...editingTRPG, characters: newChars })
                              } catch (err: any) {
                                alert(`업로드 실패: ${err.message}`)
                              }
                            }} />
                            업로드
                          </label>
                        </div>
                        <ColorPicker color={char.color} onChange={(c) => handleCharacterColorChange(char.name, c)} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 로그 편집 영역 */}
                <div className="flex-1 overflow-y-auto p-8 bg-bg">
                  <div className="max-w-3xl mx-auto pb-20">
                    <h2 className="text-xl font-bold text-ink/80 mb-6 pb-4 border-b border-ink/10">
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
                    }} className="w-full py-4 mt-4 border border-dashed border-ink/10 text-ink/20 hover:text-ink/50 rounded">+ 라인 추가</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-ink/30 gap-4">
              <div className="text-4xl">🎲</div>
              <p>Roll20 HTML 파일을 업로드하거나 목록에서 선택하세요.</p>
            </div>
          )
        ) : activeTab === 'character' ? (
          // 캐릭터 에디터
          <>
            <div className="h-16 border-b border-ink/10 flex items-center justify-between px-6 bg-bg-cream">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-ink">{getCurrentCharPhase().nameKr}</span>
                <span className="text-sm text-ink/40">{getCurrentCharPhase().label}</span>
              </div>
              <div className="flex items-center gap-4">
                {charUploading && <span className="text-sm text-yellow-400">업로드 중...</span>}
                <span className="text-sm text-[#8B1538]">{message}</span>
                <button onClick={handleSaveCharacterData} className="bg-[#8B1538] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-bg">
              <div className="max-w-4xl mx-auto pb-20 space-y-8">
                
                {/* 프로필 이미지 & 보이스 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 프로필 이미지 */}
                  <div>
                    <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                      <span>🖼️</span> 프로필 이미지
                    </h3>
                    {getCurrentCharPhase().profileImage ? (
                      <div className="relative">
                        <img src={getCurrentCharPhase().profileImage} className="w-full max-h-[400px] object-cover rounded border border-ink/10" />
                        <button onClick={() => updateCharPhase({ profileImage: undefined })}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">✕</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-[3/4] bg-ink/[0.03] border-2 border-dashed border-ink/15 rounded-lg cursor-pointer hover:bg-ink/[0.06] hover:border-ink/25 transition-colors">
                        <span className="text-3xl mb-2">📷</span>
                        <span className="text-ink/40 text-sm">클릭하여 이미지 업로드</span>
                        <span className="text-ink/20 text-xs mt-1">JPG, PNG, WebP</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCharProfileUpload} />
                      </label>
                    )}
                    {getCurrentCharPhase().profileImage && (
                      <label className="flex items-center justify-center gap-2 w-full mt-2 py-2 bg-ink/[0.03] hover:bg-ink/[0.06] rounded cursor-pointer text-sm text-ink/50">
                        <span>🔄 이미지 변경</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCharProfileUpload} />
                      </label>
                    )}
                  </div>

                  {/* 보이스 파일 */}
                  <div>
                    <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                      <span>🔊</span> 보이스
                    </h3>
                    {getCurrentCharPhase().voiceFile ? (
                      <div className="p-4 bg-ink/[0.03] border border-ink/10 rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${charTab === 'media' ? 'bg-[#8B1538]/30 text-[#8B1538]' : 'bg-[#5E7B97]/30 text-[#5E7B97]'}`}>
                            ♪
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-ink/70 truncate">{getCurrentCharPhase().voiceLabel || '음성 파일'}</div>
                          </div>
                          <button onClick={() => updateCharPhase({ voiceFile: undefined, voiceLabel: undefined })}
                            className="text-ink/30 hover:text-red-500 text-lg">✕</button>
                        </div>
                        <audio controls src={getCurrentCharPhase().voiceFile} className="w-full h-10" />
                        <label className="flex items-center justify-center gap-2 w-full py-2 bg-ink/[0.03] hover:bg-ink/[0.06] rounded cursor-pointer text-sm text-ink/50">
                          <span>🔄 보이스 변경</span>
                          <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" className="hidden" onChange={handleVoiceUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 bg-ink/[0.03] border-2 border-dashed border-ink/15 rounded-lg cursor-pointer hover:bg-ink/[0.06] hover:border-ink/25 transition-colors">
                        <span className="text-3xl mb-2">🎵</span>
                        <span className="text-ink/40 text-sm">클릭하여 보이스 업로드</span>
                        <span className="text-ink/20 text-xs mt-1">MP3, WAV, OGG, M4A</span>
                        <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" className="hidden" onChange={handleVoiceUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* 채팅 아바타 후보 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>💬</span> 채팅 아바타 후보
                  </h3>
                  <p className="text-xs text-ink/30 mb-3">역극 기록마다 선택할 수 있는 아바타 후보를 등록하세요.</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {(characterData[charTab === 'media' ? 'mediaAvatars' : 'sadhamAvatars'] || []).map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-ink/10" />
                        <button onClick={() => {
                          const key = charTab === 'media' ? 'mediaAvatars' : 'sadhamAvatars'
                          const arr = [...(characterData[key] || [])]
                          arr.splice(idx, 1)
                          setCharacterData(prev => ({ ...prev, [key]: arr }))
                        }} className="absolute -top-1 -right-1 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-full border-2 border-dashed border-ink/15 flex items-center justify-center cursor-pointer hover:bg-ink/[0.03] text-ink/30 text-lg">
                      +
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setCharUploading(true)
                        try {
                          const path = await uploadImage(file)
                          const key = charTab === 'media' ? 'mediaAvatars' : 'sadhamAvatars'
                          setCharacterData(prev => ({ ...prev, [key]: [...(prev[key] || []), path] }))
                        } catch (err: any) { alert(`업로드 실패: ${err.message}`) }
                        setCharUploading(false)
                        e.target.value = ''
                      }} />
                    </label>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>📋</span> 기본 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">페이즈 라벨</label>
                      <input value={getCurrentCharPhase().label} onChange={(e) => updateCharPhase({ label: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" placeholder="PHASE 00" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">한국어 이름</label>
                      <input value={getCurrentCharPhase().nameKr} onChange={(e) => updateCharPhase({ nameKr: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">영어 이름</label>
                      <input value={getCurrentCharPhase().nameEn} onChange={(e) => updateCharPhase({ nameEn: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">한자 심볼</label>
                      <input value={getCurrentCharPhase().symbol} onChange={(e) => updateCharPhase({ symbol: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">별명</label>
                      <input value={getCurrentCharPhase().name} onChange={(e) => updateCharPhase({ name: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">나이</label>
                      <input value={getCurrentCharPhase().age} onChange={(e) => updateCharPhase({ age: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">키</label>
                      <input value={getCurrentCharPhase().height} onChange={(e) => updateCharPhase({ height: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">몸무게</label>
                      <input value={getCurrentCharPhase().weight} onChange={(e) => updateCharPhase({ weight: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">인용구</label>
                      <input value={getCurrentCharPhase().quote} onChange={(e) => updateCharPhase({ quote: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                  </div>
                </div>

                {/* 성격 태그 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>💠</span> 성격 태그
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getCurrentCharPhase().personality.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-white/60 border border-ink/10 rounded px-2 py-1">
                        <input value={tag} onChange={(e) => handleUpdatePersonality(idx, e.target.value)}
                          className="bg-transparent text-sm text-ink/80 w-20 focus:outline-none" />
                        <button onClick={() => handleDeletePersonality(idx)} className="text-ink/30 hover:text-red-500 text-xs">✕</button>
                      </div>
                    ))}
                    <button onClick={handleAddPersonality}
                      className="px-3 py-1 border border-dashed border-ink/20 rounded text-ink/30 hover:text-ink/60 text-sm">+ 추가</button>
                  </div>
                </div>

                {/* 스탯 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>📊</span> 스탯
                  </h3>
                  <div className="space-y-2">
                    {(getCurrentCharPhase().stats || []).map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input value={stat.label} onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                          className="bg-white/60 border border-ink/10 rounded px-2 py-1.5 text-ink text-sm w-24 focus:outline-none" />
                        <input type="range" min="0" max="10" value={stat.value}
                          onChange={(e) => handleUpdateStat(idx, 'value', parseInt(e.target.value))}
                          className="flex-1 accent-[#8B1538]" />
                        <span className="text-ink/50 text-sm w-6 text-center">{stat.value}</span>
                        <button onClick={() => handleDeleteStat(idx)} className="text-ink/30 hover:text-red-500">✕</button>
                      </div>
                    ))}
                    <button onClick={handleAddStat}
                      className="w-full py-2 border border-dashed border-ink/15 rounded text-ink/30 hover:text-ink/60 text-sm">+ 스탯 추가</button>
                  </div>
                </div>

                {/* 능력 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>⚡</span> 능력
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">능력 이름</label>
                      <input value={getCurrentCharPhase().abilityName} onChange={(e) => updateCharPhase({ abilityName: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25" />
                    </div>
                    <div>
                      <label className="text-xs text-ink/30 mb-1 block">능력 설명</label>
                      <textarea value={getCurrentCharPhase().abilityDesc} onChange={(e) => updateCharPhase({ abilityDesc: e.target.value })}
                        className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25 resize-none"
                        rows={3} />
                    </div>
                  </div>
                </div>

                {/* 메인 대사 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3 flex items-center gap-2">
                    <span>💬</span> 메인 대사
                  </h3>
                  <textarea value={getCurrentCharPhase().mainQuote} onChange={(e) => updateCharPhase({ mainQuote: e.target.value })}
                    className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-ink text-sm focus:outline-none focus:border-ink/25 resize-none"
                    rows={3} />
                </div>

              </div>
            </div>
          </>
        ) : (
          // 게임 대사 에디터
          <>
            <div className="h-16 border-b border-ink/10 flex items-center justify-between px-6 bg-bg-cream">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-ink">
                  {gameTab === 'foreword' ? 'Foreword by Media' : 'Rebuttal by Sakdāgāmi'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {gameUploading && <span className="text-sm text-yellow-400">업로드 중...</span>}
                <span className="text-sm text-[#8B1538]">{message}</span>
                <button onClick={handleSaveGameData} className="bg-[#8B1538] hover:bg-[#A01840] text-white px-6 py-2 rounded font-bold">저장하기</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-bg">
              <div className="max-w-4xl mx-auto pb-20 space-y-8">

                {/* 캐릭터 이미지 + 그리기 캔버스 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3">캐릭터 이미지</h3>
                  {currentGameSection.characterImage ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img src={currentGameSection.characterImage} className="max-h-[70vh] rounded border border-ink/10" />
                        <button onClick={() => updateGameSection({ characterImage: undefined })}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">✕</button>
                        <label className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded px-3 py-1 text-xs cursor-pointer">
                          변경
                          <input type="file" accept="image/*" className="hidden" onChange={handleGameImageUpload} />
                        </label>
                      </div>

                      {/* 그리기 캔버스 */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-bold text-ink/60">부위 그리기</h3>
                          {drawingPartIdx !== null && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B1538]/10 text-[#8B1538] font-bold animate-pulse">
                              그리기 모드 — 이미지를 클릭하여 꼭짓점 추가
                            </span>
                          )}
                        </div>
                        <div
                          ref={gameCanvasRef}
                          className="relative inline-block select-none"
                          style={{ cursor: draggingVertex ? 'grabbing' : drawingPartIdx !== null ? 'crosshair' : 'default' }}
                          onClick={draggingVertex ? undefined : handleImageClick}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                        >
                          <img ref={gameImgRef} src={currentGameSection.characterImage} className="max-w-full max-h-[80vh] rounded border border-ink/10" draggable={false} />
                          {/* SVG 오버레이 */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"
                            style={{ pointerEvents: 'none' }}>
                            {currentGameSection.parts.map((part, idx) => {
                              const pts = part.points && part.points.length >= 3 ? part.points : null
                              if (!pts) return null
                              const accent = gameTab === 'foreword' ? '#8B1538' : '#5E7B97'
                              const isDrawing = drawingPartIdx === idx
                              return (
                                <g key={part.id}>
                                  <polygon
                                    points={pts.map(p => `${p[0]},${p[1]}`).join(' ')}
                                    fill={isDrawing ? `${accent}22` : `${accent}15`}
                                    stroke={accent}
                                    strokeWidth="0.5"
                                    strokeDasharray={isDrawing ? '1.5 1' : 'none'}
                                  />
                                  {/* 라벨 */}
                                  {(() => {
                                    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
                                    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
                                    return (
                                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                                        fill={accent} fontSize="2.5" fontWeight="bold">{part.label}</text>
                                    )
                                  })()}
                                  {/* 드래그 가능한 꼭짓점 */}
                                  {drawingPartIdx === null && pts.map((p, pi) => (
                                    <circle key={pi} cx={p[0]} cy={p[1]} r="1.2"
                                      fill="white" stroke={accent} strokeWidth="0.4"
                                      style={{ pointerEvents: 'auto', cursor: 'grab' }}
                                      onMouseDown={(e) => handleVertexMouseDown(e as any, idx, pi)} />
                                  ))}
                                </g>
                              )
                            })}
                            {/* 현재 그리기 중인 임시 점들 */}
                            {drawingPartIdx !== null && drawingPoints.length > 0 && (
                              <g>
                                {drawingPoints.length >= 2 && (
                                  <polyline
                                    points={drawingPoints.map(p => `${p[0]},${p[1]}`).join(' ')}
                                    fill="none"
                                    stroke={gameTab === 'foreword' ? '#8B1538' : '#5E7B97'}
                                    strokeWidth="0.4"
                                    strokeDasharray="1.5 1"
                                  />
                                )}
                                {drawingPoints.map((p, pi) => (
                                  <circle key={pi} cx={p[0]} cy={p[1]} r="0.8"
                                    fill={gameTab === 'foreword' ? '#8B1538' : '#5E7B97'} />
                                ))}
                              </g>
                            )}
                          </svg>
                        </div>

                        {/* 그리기 도구 */}
                        {drawingPartIdx !== null && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-ink/40">{drawingPoints.length}개 점</span>
                            <button onClick={undoLastPoint}
                              className="text-xs px-2 py-1 bg-ink/5 hover:bg-ink/10 rounded text-ink/50" disabled={drawingPoints.length === 0}>
                              ↩ 되돌리기
                            </button>
                            <button onClick={finishDrawing}
                              className="text-xs px-3 py-1 bg-[#8B1538] hover:bg-[#A01840] text-white rounded font-bold"
                              disabled={drawingPoints.length < 3}>
                              ✓ 완료 ({drawingPoints.length < 3 ? `최소 ${3 - drawingPoints.length}점 더` : '닫기'})
                            </button>
                            <button onClick={() => { setDrawingPartIdx(null); setDrawingPoints([]) }}
                              className="text-xs px-2 py-1 text-ink/30 hover:text-red-500">
                              취소
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-md aspect-[3/4] bg-ink/[0.03] border-2 border-dashed border-ink/15 rounded-lg cursor-pointer hover:bg-ink/[0.06]">
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-ink/40 text-sm">캐릭터 이미지 업로드</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleGameImageUpload} />
                    </label>
                  )}
                </div>

                {/* 부위 목록 */}
                <div>
                  <h3 className="text-sm font-bold text-ink/60 mb-3">부위 목록 ({currentGameSection.parts.length})</h3>
                  <div className="space-y-3">
                    {currentGameSection.parts.map((part, idx) => (
                      <div key={part.id} className={`p-4 border rounded-lg space-y-3 group ${drawingPartIdx === idx ? 'border-[#8B1538]/40 bg-[#8B1538]/5' : 'border-ink/10 bg-white/50'}`}>
                        <div className="flex items-center justify-between">
                          <input value={part.label} onChange={(e) => handleUpdateBodyPart(idx, { label: e.target.value })}
                            className="bg-transparent text-ink font-bold text-sm focus:outline-none border-b border-transparent focus:border-ink/20 w-40"
                            placeholder="부위 이름 (예: 눈)" />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-ink/25">{part.points && part.points.length >= 3 ? `${part.points.length}각형` : '영역 없음'}</span>
                            {drawingPartIdx !== idx ? (
                              <button onClick={() => restartDrawing(idx)}
                                className="text-xs px-2 py-0.5 bg-ink/5 hover:bg-ink/10 rounded text-ink/40 hover:text-ink/70">
                                {part.points && part.points.length >= 3 ? '다시 그리기' : '그리기'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#8B1538] font-bold">그리기 중...</span>
                            )}
                            <button onClick={() => handleDeleteBodyPart(idx)}
                              className="text-ink/20 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100">✕</button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-ink/30 block mb-1">대사</label>
                          <textarea value={part.dialogue}
                            onChange={(e) => handleUpdateBodyPart(idx, { dialogue: e.target.value })}
                            className="w-full bg-white/60 border border-ink/10 rounded px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                            rows={3} placeholder="이 부위를 클릭했을 때 표시될 대사..." />
                        </div>
                      </div>
                    ))}
                    <button onClick={handleAddBodyPart}
                      className="w-full py-4 border border-dashed border-ink/15 text-ink/30 hover:text-ink/60 rounded-lg">+ 부위 추가</button>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}