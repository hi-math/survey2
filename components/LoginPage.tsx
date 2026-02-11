'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, signInAnonymously, setPersistence, browserSessionPersistence, getRedirectResult } from 'firebase/auth';
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

interface LoginPageProps {
  initialError?: string | null;
  onClearError?: () => void;
}

export default function LoginPage({ initialError = null, onClearError }: LoginPageProps) {
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
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
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            loginMethod: 'google',
            createdAt: new Date(),
          });
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
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          loginMethod: 'google',
          createdAt: new Date(),
        });
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
      await setDoc(doc(db, 'users', result.user.uid), {
        studentId: studentId.trim(),
        displayName: name.trim(),
        loginMethod: 'manual',
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
            설문 내용을 바탕으로 수업 내용이 결정되니 솔직한 응답을 부탁드립니다. 설문시 수집한 개인정보는 암호화하여 처리하며 설문이외에 용도로 사용되지 않습니다.
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="card">
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

          {!showManualLogin ? (
            <div className="space-y-4">
              {isInAppBrowser() ? (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>
                    잠시 후 Chrome/Safari로 이동합니다. 이동되지 않으면 아래 버튼을 눌러주세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => openExternalBrowser(false)}
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    className="w-full font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Chrome/Safari로 열기
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }}
                  className="w-full border-2 font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isLoading ? '로그인 중...' : '구글 계정으로 로그인'}
                </button>
              )}

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-sm" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>또는</span>
                </div>
              </div>

              <button
                onClick={() => setShowManualLogin(true)}
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                className="w-full font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                학번과 이름으로 로그인
              </button>
            </div>
          ) : (
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
