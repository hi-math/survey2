'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserInfoFormProps {
  userId: string;
  onComplete: () => void;
}

export default function UserInfoForm({ userId, onComplete }: UserInfoFormProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ studentId?: string; name?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { studentId?: string; name?: string } = {};
    if (!studentId.trim()) {
      newErrors.studentId = '학번을 입력하세요';
    }
    if (!name.trim()) {
      newErrors.name = '이름을 입력하세요';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setIsLoading(true);
      setErrors({});
      await updateDoc(doc(db, 'users', userId), {
        studentId: studentId.trim(),
        displayName: name.trim(),
        updatedAt: new Date(),
      });
      onComplete();
    } catch (err) {
      console.error('Error updating user info:', err);
      setErrors({ studentId: '정보 저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] p-4 pb-10" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="page-frame space-y-4">
        {/* 상단 헤더 카드 */}
        <div className="screen-header text-center">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            추가 정보 입력
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            설문 진행을 위해 학번과 이름을 입력해주세요.
          </p>
        </div>

        {/* 입력 폼 카드 */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userinfo-studentId" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>학번</label>
              <input
                type="text"
                id="userinfo-studentId"
                value={studentId}
                onChange={(e) => { setStudentId(e.target.value); setErrors((prev) => ({ ...prev, studentId: undefined })); }}
                style={{
                  borderColor: errors.studentId ? "#f87171" : "var(--border)",
                  backgroundColor: errors.studentId ? "rgba(254,226,226,0.4)" : "var(--card-bg)",
                }}
                className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                placeholder="학번을 입력하세요"
                disabled={isLoading}
              />
              {errors.studentId && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.studentId}</p>}
            </div>
            <div>
              <label htmlFor="userinfo-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>이름</label>
              <input
                type="text"
                id="userinfo-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                style={{
                  borderColor: errors.name ? "#f87171" : "var(--border)",
                  backgroundColor: errors.name ? "rgba(254,226,226,0.4)" : "var(--card-bg)",
                }}
                className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                placeholder="이름을 입력하세요"
                disabled={isLoading}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              className="w-full font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? '저장 중...' : '계속하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
