'use client'

import { useState, useEffect } from 'react'
import { DialogueRecord, Phase, Section, DialogueLine } from '@/lib/parseDialogue'

// 말풍선 컴포넌트
function DialogueBubble({ line }: { line: DialogueLine }) {
  const isSadham = line.speaker.includes('사드함')
  const isMedia = line.speaker.includes('메디아')
  const isRight = isSadham // 사드함은 오른쪽 배치

  return (
    <div className={`flex gap-3 mb-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 아바타 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
          isSadham
            ? 'bg-[#A0522D]/20 text-[#A0522D]' // 🟤 사드함: 갈색
            : isMedia
            ? 'bg-[#8B1538]/20 text-[#8B1538]' // 🔴 메디아: 붉은색
            : 'bg-white/10 text-white/50'
        }`}
      >
        {isSadham ? '眼' : isMedia ? '毒' : '?'}
      </div>

      {/* 말풍선 */}
      <div className={`max-w-[75%]`}>
        <div className={`mb-1 ${isRight ? 'text-right' : 'text-left'}`}>
          <span
            className={`text-xs font-medium ${
              isSadham ? 'text-[#A0522D]' : isMedia ? 'text-[#C94A6E]' : 'text-white/50'
            }`}
          >
            {line.speaker}
          </span>
        </div>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isRight
              ? 'bg-[#A0522D]/15 rounded-tr-sm' // 🟤 말풍선 배경도 갈색 틴트
              : isMedia
              ? 'bg-[#8B1538]/15 rounded-tl-sm'
              : 'bg-white/10 rounded-tl-sm'
          }`}
        >
          <p className="text-white/80 text-sm font-accent leading-relaxed tracking-[-0.02em] whitespace-pre-wrap">
            {line.text}
          </p>
        </div>
      </div>
    </div>
  )
}

// 섹션 카드 컴포넌트 (목록에서 보이는 카드)
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
      className="w-full text-left p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.04] hover:border-[#8B1538]/30 transition-all group"
    >
      <h3 className="font-accent text-lg text-white/80 mb-3 group-hover:text-[#C94A6E] transition-colors">
        {section.title}
      </h3>
      <div className="space-y-2">
        {previewLines.map((line) => (
          <div key={line.id} className="text-sm truncate">
            <span className={`font-medium mr-2 ${
              line.speaker.includes('사드함') ? 'text-[#A0522D]' : // 🟤 미리보기 이름 갈색
              line.speaker.includes('메디아') ? 'text-[#C94A6E]' : 'text-white/50'
            }`}>
              {line.speaker}
            </span>
            <span className="text-white/40">
              {line.text.length > 30 ? line.text.slice(0, 30) + '...' : line.text}
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

// 섹션 상세 모달 (클릭하면 뜨는 팝업)
function SectionModal({
  section,
  onClose,
}: {
  section: Section
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 클릭시 닫힘 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* 모달 내용 */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1A1614] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
        {/* 헤더 */}
        <div className="shrink-0 bg-[#1A1614] border-b border-white/10 p-5 flex items-center justify-between z-10">
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

        {/* 대화 내용 (스크롤 영역) */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0D0B0A]">
          {section.lines.length === 0 ? (
            <p className="text-white/40 text-center py-10">대사가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {section.lines.map((line) => (
                <DialogueBubble key={line.id} line={line} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecordPage() {
  const [records, setRecords] = useState<DialogueRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<DialogueRecord | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      // ⭐️ 중요: cache: 'no-store'를 추가하여 항상 최신 데이터를 가져옴
      const res = await fetch('/api/records', { cache: 'no-store' })
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setRecords(data)
        // 가장 최신 기록 자동 선택
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

  const handleRecordChange = (record: DialogueRecord) => {
    setSelectedRecord(record)
    // 기록을 바꾸면 첫 번째 차수를 자동 선택
    if (record.phases.length > 0) {
      setSelectedPhase(record.phases[0])
    } else {
      setSelectedPhase(null)
    }
  }

  const handlePhaseChange = (phase: Phase) => {
    setSelectedPhase(phase)
  }

  return (
    <div className="min-h-screen bg-[#0D0B0A] text-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#2D1F1A] via-[#5C0D24] to-[#8B1538] p-10 md:p-16 relative overflow-hidden">
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
        <div className="relative z-10">
          <span className="text-xs text-white/40 tracking-widest block mb-2">ARCHIVE</span>
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.1em]">
            RECORDS
          </h1>
          <p className="font-accent text-white/50 mt-3 text-sm tracking-wide">
            기억의 파편들
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#8B1538]/30 border-t-[#8B1538] rounded-full animate-spin" />
            <p className="mt-4 text-white/30 text-sm">기록을 불러오는 중...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-lg">
            <p className="text-white/40 font-accent text-lg">아직 기록된 대화가 없습니다.</p>
            <p className="text-white/25 text-sm mt-2">관리자 페이지에서 첫 번째 기록을 남겨보세요.</p>
          </div>
        ) : (
          <>
            {/* 1. 기록 선택 탭 (여러 개일 때만 표시) */}
            {records.length > 1 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => handleRecordChange(record)}
                    className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition-all border ${
                      selectedRecord?.id === record.id
                        ? 'bg-[#8B1538] text-white border-[#8B1538]'
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
                {/* 2. 차수(Phase) 선택 탭 */}
                <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
                  {selectedRecord.phases.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => handlePhaseChange(phase)}
                      className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                        selectedPhase?.id === phase.id
                          ? 'text-[#C94A6E]'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {phase.name}
                      {/* 활성화된 탭 밑줄 */}
                      {selectedPhase?.id === phase.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C94A6E]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 3. 소제목(Section) 카드 그리드 */}
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
                        <p className="text-white/30">이 분류에는 아직 내용이 없습니다.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 모달 (대화 상세 보기) */}
      {selectedSection && (
        <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/[0.04] mt-12 bg-[#0D0B0A]">
        <span className="font-display text-sm text-[#8B1538] tracking-[0.15em]">⟡ SAME</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2">
          사드함 눈 × 메디아 아우렐리우스
        </p>
      </footer>
    </div>
  )
}