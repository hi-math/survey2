'use client';

import CheckCircleIcon from '@/components/icons/CheckCircleIcon';
import type { ScoreResult } from '@/lib/score';

interface SurveyCompletePageProps {
  scoreResult?: ScoreResult | null;
  onEditSurvey: () => void;
  onStartOver: () => void;
}

const gradeColors: Record<string, { bg: string; border: string; accent: string }> = {
  high: { bg: '#EEF7EE', border: '#4CAF50', accent: '#2E7D32' },
  mid:  { bg: '#FFF8E1', border: '#FFB300', accent: '#F57F17' },
  low:  { bg: '#FDE8E8', border: '#E57373', accent: '#C62828' },
};

const gradeEmoji: Record<string, string> = {
  high: '🔬',
  mid:  '🌱',
  low:  '🚀',
};

const gradeImage: Record<string, string> = {
  high: '/image/1 (2).png',
  mid:  '/image/2 (2).png',
  low:  '/image/3 (3).png',
};

export default function SurveyCompletePage({ scoreResult, onEditSurvey, onStartOver }: SurveyCompletePageProps) {
  const colors = scoreResult ? gradeColors[scoreResult.grade] : null;
  const emoji = scoreResult ? gradeEmoji[scoreResult.grade] : '';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 pb-10" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="page-frame w-full max-w-md">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon size={56} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            설문이 완료되었습니다!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            소중한 의견 감사드립니다.
          </p>

          {/* 점수 결과 카드 */}
          {scoreResult && colors && (
            <div
              className="rounded-2xl p-5 mb-6 text-left"
              style={{
                backgroundColor: colors.bg,
                border: `2px solid ${colors.border}`,
              }}
            >
              {/* 점수 표시 (15문항, 만점 60) */}
              <div className="text-center mb-4">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  AI 활용 태도 점수 (15문항)
                </p>
                <p className="text-4xl font-black" style={{ color: colors.accent }}>
                  {scoreResult.total}<span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}> / {scoreResult.maxScore}</span>
                </p>
              </div>

              {/* 점수 바 */}
              <div className="w-full h-3 rounded-full mb-4" style={{ backgroundColor: '#e0e0e0' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(scoreResult.total / scoreResult.maxScore) * 100}%`,
                    backgroundColor: colors.border,
                  }}
                />
              </div>

              {/* 유형 타이틀 */}
              <div className="text-center mb-3">
                <span className="text-3xl">{emoji}</span>
                <h3 className="text-lg font-bold mt-1" style={{ color: colors.accent }}>
                  {scoreResult.title}
                </h3>
              </div>

              {/* 유형 이미지 */}
              <div className="w-full rounded-[2rem] mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={gradeImage[scoreResult.grade]}
                  alt={scoreResult.title}
                  className="w-full h-auto rounded-[2rem]"
                  style={{ maxHeight: '280px', objectFit: 'contain' }}
                />
              </div>

              {/* 설명 */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {scoreResult.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onEditSurvey}
              className="w-full font-semibold py-3.5 px-6 rounded-xl border-2 transition-opacity hover:opacity-90"
              style={{
                borderColor: 'var(--secondary)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--secondary)',
              }}
            >
              설문 수정하기
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="w-full font-semibold py-3.5 px-6 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              처음으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
