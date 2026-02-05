'use client'

import { useState, useEffect } from 'react'
import { DialogueRecord, Phase, Section, DialogueLine, TRPGSession, TRPGLine, TRPGCharacter } from '@/lib/parseDialogue'

// 이미지 갤러리 모달
function ImageGalleryModal({
  images,
  initialIndex,
  onClose
}: {
  images: { src: string; speaker?: string }[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, images.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const current = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img 
          src={current.src} 
          alt={current.speaker || '이미지'}
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
          >
            →
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
        <p className="text-white/80 text-sm">
          {current.speaker && <span className="text-white/60">{current.speaker}</span>}
          {images.length > 1 && (
            <span className="text-white/50 ml-2">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

// 기존 역극 말풍선 컴포넌트
function DialogueBubble({ 
  line, 
  onImageClick 
}: { 
  line: DialogueLine
  onImageClick?: (imageIndex: number) => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isSadham = line.speaker.includes('딜런')
  const isMedia = line.speaker.includes('마농')
  const isRight = isSadham

  const images = line.images || []
  const hasImages = images.length > 0

  return (
    <div className={`flex gap-3 mb-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
          isSadham
            ? 'bg-[#8888aa]/20 text-[#8888aa]'
            : isMedia
            ? 'bg-[#ff99bb]/20 text-[#ff99bb]'
            : 'bg-white/10 text-white/50'
        }`}
      >
        {isSadham ? '♣' : isMedia ? '♠' : '?'}
      </div>

      <div className={`max-w-[75%]`}>
        <div className={`mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
          <span
            className={`text-xs font-medium ${
              isSadham ? 'text-[#8888aa]' : isMedia ? 'text-[#ff99bb]' : 'text-white/50'
            }`}
          >
            {line.speaker}
          </span>
        </div>
        
        <div
          className={`px-4 py-3 rounded-2xl ${
            isRight
              ? 'bg-[#8888aa]/15 rounded-tr-sm'
              : isMedia
              ? 'bg-[#ff99bb]/15 rounded-tl-sm'
              : 'bg-white/10 rounded-tl-sm'
          }`}
        >
          {hasImages && (
            <div className="mb-2 relative">
              <img 
                src={images[currentImageIndex]} 
                alt={`${line.speaker}의 이미지`}
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick && onImageClick(currentImageIndex)}
              />
              
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
                    }}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    ←
                  </button>
                  <span className="text-white/60 text-xs">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                    }}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
          
          {line.text && (
            <p className="text-white/80 text-sm font-accent leading-relaxed tracking-[-0.02em] whitespace-pre-wrap">
              {line.text}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// TRPG 말풍선 컴포넌트
function TRPGBubble({ 
  line, 
  characters,
  onImageClick 
}: { 
  line: TRPGLine
  characters: TRPGCharacter[]
  onImageClick?: (imageIndex: number) => void
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const character = characters.find(c => c.name === line.speaker)
  const color = character?.color || '#666666'
  const isPC = character?.isPC
  const isRight = isPC
  
  const images = line.images || []
  const hasImages = images.length > 0

  // 내레이션인 경우
  if (line.type === 'narration') {
    return (
      <div className="my-4 px-6 py-3 text-center">
        <p className="text-white/60 text-sm italic leading-relaxed" dangerouslySetInnerHTML={{ __html: line.text }} />
      </div>
    )
  }

  // 주사위 굴림인 경우
  if (line.type === 'roll' && line.rollData) {
    const { skillName, target, rolled, result } = line.rollData
    const resultColors: Record<string, string> = {
      critical: 'bg-yellow-500',
      extreme: 'bg-green-500',
      hard: 'bg-green-400',
      success: 'bg-blue-400',
      fail: 'bg-red-500',
      fumble: 'bg-red-700',
    }
    const resultTexts: Record<string, string> = {
      critical: '대성공',
      extreme: '극단적 성공',
      hard: '어려운 성공',
      success: '성공',
      fail: '실패',
      fumble: '대실패',
    }
    
    return (
      <div className="my-3 flex justify-center">
        <div className="bg-[#1A1614] border border-white/10 rounded-lg p-3 min-w-[200px]">
          <div className="text-center text-white/60 text-xs mb-2">{line.speaker}</div>
          <div className="text-center text-white/80 font-medium mb-2">{skillName}</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-white/50">목표: {target}</span>
            <span className="text-white/80 font-bold">{rolled}</span>
          </div>
          <div className={`mt-2 text-center text-white text-xs py-1 px-2 rounded ${resultColors[result]}`}>
            {resultTexts[result]}
          </div>
        </div>
      </div>
    )
  }

  // 시스템 메시지
  if (line.type === 'system') {
    return (
      <div className="my-3 flex justify-center">
        <div className="bg-pink-900/30 border border-pink-500/30 rounded-lg px-4 py-2">
          <p className="text-pink-300 text-sm text-center" dangerouslySetInnerHTML={{ __html: line.text }} />
        </div>
      </div>
    )
  }

  // 일반 대사
  return (
    <div className={`flex gap-3 mb-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {line.speaker?.charAt(0) || '?'}
      </div>

      <div className={`max-w-[75%]`}>
        <div className={`mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
          <span className="text-xs font-medium" style={{ color }}>
            {line.speaker}
          </span>
        </div>
        
        <div
          className={`px-4 py-3 rounded-2xl ${isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={{ backgroundColor: `${color}15` }}
        >
          {hasImages && (
            <div className="mb-2 relative">
              <img 
                src={images[currentImageIndex]} 
                alt={`${line.speaker}의 이미지`}
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick && onImageClick(currentImageIndex)}
              />
              
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
                    }}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    ←
                  </button>
                  <span className="text-white/60 text-xs">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                    }}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
          
          {line.text && (
            <p className="text-white/80 text-sm font-accent leading-relaxed tracking-[-0.02em] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line.text }} />
          )}
        </div>
      </div>
    </div>
  )
}

// 섹션 카드 컴포넌트 (기존 역극용)
function SectionCard({
  section,
  onClick,
}: {
  section: Section
  onClick: () => void
}) {
  const previewLines = section.lines.slice(0, 2)

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.04] hover:border-[#ff99bb]/30 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-accent text-lg text-white/80 group-hover:text-[#ff99bb] transition-colors">
          {section.title}
        </h3>
      </div>
      <div className="space-y-2">
        {previewLines.map((line) => (
          <div key={line.id} className="text-sm truncate">
            <span className={`font-medium mr-2 ${
              line.speaker.includes('딜런') ? 'text-[#8888aa]' :
              line.speaker.includes('마농') ? 'text-[#ff99bb]' : 'text-white/50'
            }`}>
              {line.speaker}
            </span>
            <span className="text-white/40">
              {line.text ? (line.text.length > 30 ? line.text.slice(0, 30) + '...' : line.text) : (line.images ? '(이미지)' : '')}
            </span>
          </div>
        ))}
        {section.lines.length > 2 && (
          <p className="text-white/25 text-xs mt-2 pt-2 border-t border-white/5">+{section.lines.length - 2}개 더보기</p>
        )}
      </div>
    </button>
  )
}

// TRPG 세션 카드 컴포넌트
function TRPGSessionCard({
  session,
  onClick,
}: {
  session: TRPGSession
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.04] hover:border-[#ff99bb]/30 transition-all group overflow-hidden"
    >
      {session.coverImage && (
        <div className="aspect-[16/9] overflow-hidden">
          <img 
            src={session.coverImage} 
            alt={session.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-accent text-lg text-white/80 group-hover:text-[#ff99bb] transition-colors mb-1">
          {session.title}
        </h3>
        {session.date && (
          <p className="text-white/30 text-xs mb-2">{session.date}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {session.characters.slice(0, 4).map((char, i) => (
            <span 
              key={i} 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${char.color}20`, color: char.color }}
            >
              {char.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

// 섹션 상세 모달 (기존 역극용)
function SectionModal({
  section,
  onClose,
  onImageClick,
}: {
  section: Section
  onClose: () => void
  onImageClick: (lineIndex: number, imageIndex: number) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1A1614] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="shrink-0 bg-[#1A1614] border-b border-white/10 p-5 flex items-center justify-between">
          <h2 className="font-accent text-xl text-white/90">{section.title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0D0B0A]">
          {section.lines.length === 0 ? (
            <p className="text-white/40 text-center py-10">대사가 없습니다.</p>
          ) : (
            <div className="space-y-1">
              {section.lines.map((line, index) => (
                <DialogueBubble 
                  key={line.id} 
                  line={line}
                  onImageClick={(imageIndex) => onImageClick(index, imageIndex)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// TRPG 세션 상세 모달
function TRPGSessionModal({
  session,
  onClose,
  onImageClick,
}: {
  session: TRPGSession
  onClose: () => void
  onImageClick: (lineIndex: number, imageIndex: number) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1A1614] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="shrink-0 bg-[#1A1614] border-b border-white/10 p-5 flex items-center justify-between">
          <div>
            <h2 className="font-accent text-xl text-white/90">{session.title}</h2>
            {session.date && <p className="text-white/40 text-sm mt-1">{session.date}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0D0B0A]">
          {session.lines.length === 0 ? (
            <p className="text-white/40 text-center py-10">로그가 없습니다.</p>
          ) : (
            <div className="space-y-1">
              {session.lines.map((line, index) => (
                <TRPGBubble 
                  key={line.id} 
                  line={line}
                  characters={session.characters}
                  onImageClick={(imageIndex) => onImageClick(index, imageIndex)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecordPage() {
  // 탭 상태
  const [activeMainTab, setActiveMainTab] = useState<'roleplay' | 'trpg'>('roleplay')
  
  // 기존 역극 상태
  const [records, setRecords] = useState<DialogueRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  
  // TRPG 상태
  const [trpgSessions, setTrpgSessions] = useState<TRPGSession[]>([])
  const [selectedTRPGSession, setSelectedTRPGSession] = useState<TRPGSession | null>(null)
  
  const [loading, setLoading] = useState(true)
  
  // 갤러리 상태
  const [galleryImages, setGalleryImages] = useState<{ src: string; speaker?: string }[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    fetchRecords()
    fetchTRPGSessions()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records', { cache: 'no-store' })
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setRecords(data)
        if (data.length > 0) {
          setSelectedRecord(data[0])
          if (data[0].phases.length > 0) {
            setSelectedPhase(data[0].phases[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTRPGSessions = async () => {
    try {
      const res = await fetch('/api/trpg', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data)) {
        setTrpgSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch TRPG sessions:', error)
    }
  }

  const handleRecordChange = (record: DialogueRecord) => {
    setSelectedRecord(record)
    if (record.phases.length > 0) {
      setSelectedPhase(record.phases[0])
    } else {
      setSelectedPhase(null)
    }
  }

  const handlePhaseChange = (phase: Phase) => {
    setSelectedPhase(phase)
  }

  const handleImageClick = (section: Section, lineIndex: number, imageIndex: number) => {
    const allImages: { src: string; speaker?: string }[] = []
    let clickedGlobalIndex = 0
    let currentGlobalIndex = 0
    
    section.lines.forEach((line, lIdx) => {
      if (line.images) {
        line.images.forEach((img, imgIdx) => {
          allImages.push({ src: img, speaker: line.speaker })
          if (lIdx === lineIndex && imgIdx === imageIndex) {
            clickedGlobalIndex = currentGlobalIndex
          }
          currentGlobalIndex++
        })
      }
    })
    
    setGalleryImages(allImages)
    setGalleryIndex(clickedGlobalIndex)
    setShowGallery(true)
  }

  const handleTRPGImageClick = (session: TRPGSession, lineIndex: number, imageIndex: number) => {
    const allImages: { src: string; speaker?: string }[] = []
    let clickedGlobalIndex = 0
    let currentGlobalIndex = 0
    
    session.lines.forEach((line, lIdx) => {
      if (line.images) {
        line.images.forEach((img, imgIdx) => {
          allImages.push({ src: img, speaker: line.speaker })
          if (lIdx === lineIndex && imgIdx === imageIndex) {
            clickedGlobalIndex = currentGlobalIndex
          }
          currentGlobalIndex++
        })
      }
    })
    
    setGalleryImages(allImages)
    setGalleryIndex(clickedGlobalIndex)
    setShowGallery(true)
  }

  return (
    <div className="min-h-screen bg-[#0D0B0A] text-white">
      <header className="bg-gradient-to-br from-[#2D1F1A] via-[#5C0D24] to-[#ff99bb] p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
        <div className="relative z-10">
          <span className="text-xs text-white/40 tracking-wider block mb-2">03</span>
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.1em] mt-2">
            Record
          </h1>
          <p className="font-accent text-white/45 mt-2">기록</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 메인 탭 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveMainTab('roleplay')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeMainTab === 'roleplay'
                ? 'bg-[#ff99bb] text-white'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            러닝 중 역극
          </button>
          <button
            onClick={() => setActiveMainTab('trpg')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeMainTab === 'trpg'
                ? 'bg-[#ff99bb] text-white'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            TRPG
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#ff99bb]/30 border-t-[#ff99bb] rounded-full animate-spin" />
          </div>
        ) : activeMainTab === 'roleplay' ? (
          // 기존 역극 탭 내용
          records.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
              <p className="text-white/40 font-accent">아직 기록이 없습니다.</p>
              <p className="text-white/25 text-sm mt-2">어드민에서 대화 기록을 추가해주세요.</p>
            </div>
          ) : (
            <>
              {records.length > 1 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {records.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => handleRecordChange(record)}
                      className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition-all border ${
                        selectedRecord?.id === record.id
                          ? 'bg-[#ff99bb] text-white border-[#ff99bb]'
                          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      {record.title}
                    </button>
                  ))}
                </div>
              )}

              {selectedRecord && (
                <div className="animate-fade-in">
                  <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
                    {selectedRecord.phases.map((phase) => (
                      <button
                        key={phase.id}
                        onClick={() => handlePhaseChange(phase)}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                          selectedPhase?.id === phase.id
                            ? 'text-[#ff99bb]'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {phase.name}
                        {selectedPhase?.id === phase.id && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff99bb]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedPhase && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPhase.sections.map((section) => (
                          <SectionCard
                            key={section.id}
                            section={section}
                            onClick={() => setSelectedSection(section)}
                          />
                        ))}
                      </div>

                      {selectedPhase.sections.length === 0 && (
                        <div className="text-center py-16 bg-white/[0.02] rounded-lg">
                          <p className="text-white/30">이 차수에는 기록이 없습니다.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )
        ) : (
          // TRPG 탭 내용
          trpgSessions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
              <p className="text-white/40 font-accent">아직 TRPG 기록이 없습니다.</p>
              <p className="text-white/25 text-sm mt-2">어드민에서 Roll20 로그를 업로드해주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trpgSessions.map((session) => (
                <TRPGSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedTRPGSession(session)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* 모달들 */}
      {selectedSection && (
        <SectionModal 
          section={selectedSection} 
          onClose={() => setSelectedSection(null)}
          onImageClick={(lineIndex, imageIndex) => handleImageClick(selectedSection, lineIndex, imageIndex)}
        />
      )}

      {selectedTRPGSession && (
        <TRPGSessionModal
          session={selectedTRPGSession}
          onClose={() => setSelectedTRPGSession(null)}
          onImageClick={(lineIndex, imageIndex) => handleTRPGImageClick(selectedTRPGSession, lineIndex, imageIndex)}
        />
      )}

      {showGallery && galleryImages.length > 0 && (
        <ImageGalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
        />
      )}

      <footer className="py-12 text-center border-t border-white/[0.04] mt-12 bg-[#0D0B0A]">
        <span className="font-display text-sm text-[#ff99bb] tracking-[0.15em]">✦ Sombre</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2">
          딜런 눈 × 마농 아우렐리우스
        </p>
      </footer>
    </div>
  )
}