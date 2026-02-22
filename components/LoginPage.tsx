'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, signInAnonymously, setPersistence, browserSessionPersistence, getRedirectResult, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const isInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|FBAN|FBAV|Instagram|NAVER|Line|DaumApps/i.test(ua);
};

const openExternalBrowser = (silent = false) => {
  const url = window.location.href;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isAndroid) {
    const noScheme = url.replace(/^https?:\/\//, '');
    window.location.href = `intent://${noScheme}#Intent;scheme=https;package=com.android.chrome;end`;
    return;
  }
  if (isIOS) {
    window.open(url, '_blank');
    if (!silent) {
      alert('카카오톡 브라우저에서는 로그인할 수 없습니다. Safari에서 열어주세요.');
    }
    return;
  }
  window.open(url, '_blank');
};

const COURSE_OPTIONS = [
  { value: 'history', label: '인물로 보는 과학의 역사' },
  { value: 'thinking', label: '과학적 사고와 상상력' },
  { value: 'other', label: '기타' },
] as const;

interface LoginPageProps {
  initialError?: string | null;
  onClearError?: () => void;
}

export default function LoginPage({ initialError = null, onClearError }: LoginPageProps) {
  const [course, setCourse] = useState<string>(COURSE_OPTIONS[0].value);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const displayError = error || initialError || '';

  // 인앱 브라우저(카카오톡 등)에서는 버튼 없이 자동으로 외부 브라우저 열기 시도
  useEffect(() => {
    if (typeof window === 'undefined' || !isInAppBrowser()) return;
    const t = setTimeout(() => openExternalBrowser(true), 400);
    return () => clearTimeout(t);
  }, []);

  // redirect 폴백 결과 처리
  useEffect(() => {
    if (typeof window === 'undefined' || !auth) return;
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('[구글 로그인] redirect 성공:', result.user.uid);
          // 사용자에게 학번/이름을 입력받은 뒤에 Firestore에 저장하도록 대기 상태로 전환
          setPendingGoogleUser(result.user);
          setName(result.user.displayName ?? '');
          setStudentId('');
        }
      })
      .catch((err) => {
        const code = err?.code;
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.error('[구글 로그인] redirect 결과 오류:', { code, message });
        if (code && code !== 'auth/popup-closed-by-user') {
          setError(`구글 로그인 실패. [${code}] ${message}`);
        }
      });
  }, []);

  // Vercel 등 배포 환경에서 로그인 실패 원인 파악용 (F12 → Console)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.log('[구글 로그인] 환경 확인:', {
      origin: window.location.origin,
      authDomain설정됨: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId설정됨: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      apiKey설정됨: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isInAppBrowser()) return;
    try {
      setIsLoading(true);
      setError('');
      onClearError?.();
      await setPersistence(auth, browserSessionPersistence);

      // 모든 환경에서 signInWithPopup 사용 (signInWithRedirect는 최신 브라우저에서 third-party cookie 차단으로 실패함)
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        // 바로 저장하지 말고 학번/이름 입력을 요청
        setPendingGoogleUser(result.user);
        setName(result.user.displayName ?? '');
        setStudentId('');
      }
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined;
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[구글 로그인] 오류:', { err, code, message });

      // 팝업 차단 또는 팝업 관련 실패 시 redirect 방식으로 폴백
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        console.log('[구글 로그인] 팝업 실패, redirect 방식으로 전환');
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error('[구글 로그인] redirect도 실패:', redirectErr);
        }
      }

      const detail = code ? `[${code}] ${message}` : message;
      setError(`구글 로그인 실패. ${detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingGoogleUser) return;
    if (!studentId.trim() || !name.trim()) {
      setError('학번과 이름을 모두 입력해주세요.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const courseLabel = COURSE_OPTIONS.find((o) => o.value === course)?.label ?? course;
      await setDoc(doc(db, 'users', pendingGoogleUser.uid), {
        uid: pendingGoogleUser.uid,
        email: pendingGoogleUser.email,
        displayName: name.trim(),
        photoURL: pendingGoogleUser.photoURL,
        studentId: studentId.trim(),
        loginMethod: 'google',
        course: courseLabel,
        createdAt: new Date(),
      });
      setPendingGoogleUser(null);
      setStudentId('');
    } catch (err) {
      console.error('[구글 로그인] 정보 저장 오류:', err);
      setError('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim()) {
      setError('학번과 이름을 모두 입력해주세요.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInAnonymously(auth);
      const courseLabel = COURSE_OPTIONS.find((o) => o.value === course)?.label ?? course;
      await setDoc(doc(db, 'users', result.user.uid), {
        studentId: studentId.trim(),
        displayName: name.trim(),
        loginMethod: 'manual',
        course: courseLabel,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Manual login error:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-10" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* 휴대폰에서도 에러 확인 가능: 상단 고정 오류 배너 (콘솔 없이 확인용) */}
      {displayError && (
        <div
          className="sticky top-0 z-10 mb-4 p-4 rounded-xl text-sm shadow-md"
          style={{ backgroundColor: 'rgba(239,68,68,0.95)', color: '#fff' }}
        >
          <p className="font-semibold m-0 mb-1">로그인 오류</p>
          <p className="m-0 break-all text-xs">{displayError}</p>
          <p className="m-0 mt-2 text-xs opacity-90">
            휴대폰에서는 이 메시지를 캡처해 관리자에게 전달하세요.
          </p>
        </div>
      )}
      <div className="page-frame space-y-4">
        {/* 상단 타이틀: 강조 */}
        <div className="text-center py-2">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            강의 전 설문
          </h1>
        </div>

        {/* 안내 및 개인정보: 구분되는 카드 */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'var(--info-card-bg)',
            color: 'var(--info-card-text)',
          }}
        >
          <p className="text-sm leading-relaxed text-center m-0" style={{ color: 'var(--info-card-text)' }}>
            본 강의 시간에는 간단한 AI를 활용하여 다양한 산출물을 만들어보는 기회를 제공하고 있습니다. 그런 활동의 제공 수준을 결정하기 위하여 여러분의 현재 상황을 알아보고자 합니다. 응답에 따른 불이익은 전혀 없습니다.
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="card">
          {/* 강의 선택 토글 */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>수강 강의</p>
            <div className="flex flex-col gap-2">
              {COURSE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer rounded-xl p-3 border-2 transition-colors hover:bg-black/5"
                  style={{
                    borderColor: course === opt.value ? 'var(--secondary)' : 'var(--border)',
                    backgroundColor: course === opt.value ? 'rgba(212, 165, 169, 0.12)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="course"
                    value={opt.value}
                    checked={course === opt.value}
                    onChange={() => setCourse(opt.value)}
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--secondary)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text)' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {displayError && (
            <div className="mb-4 p-3 rounded-xl text-sm space-y-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#b91c1c' }}>
              <p className="m-0">{displayError}</p>
              <p className="m-0 text-xs opacity-90">
                PC: 브라우저 <kbd className="px-1 rounded bg-black/10">F12</kbd> → Console에서 상세 로그 확인
              </p>
              {typeof window !== 'undefined' && (
                <p className="m-0 text-xs opacity-90 break-all">
                  현재 주소: <strong>{window.location.origin}</strong>
                  <br />
                  배포 시: Firebase Console → 인증 → 설정 → 승인된 도메인에 위 주소 추가
                </p>
              )}
            </div>
          )}

          {pendingGoogleUser ? (
            <form onSubmit={handleGoogleInfoSubmit} className="space-y-4">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                <p className="m-0 mb-2">구글 계정으로 로그인되었습니다:</p>
                <p className="m-0 mb-3 font-medium">{pendingGoogleUser.email}</p>
              </div>
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>학번</label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                  placeholder="학번을 입력하세요"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>이름</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signOut(auth);
                    } catch (e) {
                      console.warn('signOut failed', e);
                    }
                    setPendingGoogleUser(null);
                    setStudentId('');
                    setName('');
                    setError('');
                  }}
                  className="flex-1 font-semibold py-3 px-6 rounded-xl border-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)', backgroundColor: 'var(--card-bg)' }}
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                  className="flex-1 font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '정보 제출'}
                </button>
              </div>
            </form>
          ) : !showManualLogin ? (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>학번</label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                  placeholder="학번을 입력하세요"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>이름</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
                  className="w-full px-4 py-3 border-2 rounded-xl outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowManualLogin(false); setError(''); setStudentId(''); setName(''); }}
                  className="flex-1 font-semibold py-3 px-6 rounded-xl border-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)', backgroundColor: 'var(--card-bg)' }}
                  disabled={isLoading}
                >
                  뒤로
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                  className="flex-1 font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
