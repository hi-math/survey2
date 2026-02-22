"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import LoginPage from "@/components/LoginPage";
import UserInfoForm from "@/components/UserInfoForm";
import SurveyCompletePage from "@/components/SurveyCompletePage";
import CustomSurvey from "@/components/survey/CustomSurvey";
import type { SurveyData } from "@/types/survey";
import { calcScienceAttitudeScore, type ScoreResult } from "@/lib/score";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [needsUserInfo, setNeedsUserInfo] = useState(false);
  const [userLoginMethod, setUserLoginMethod] = useState<"google" | "manual" | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [initialSurveyData, setInitialSurveyData] = useState<SurveyData | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  // signInWithPopup 방식이므로 onAuthStateChanged만으로 충분
  useEffect(() => {
    if (typeof window === "undefined" || !auth) return;

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("[구글 로그인] USER:", u ? `${u.uid}` : "null");
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : null;
        setNeedsUserInfo(!snap.exists() || !data?.displayName || !data?.studentId);
        setUserLoginMethod(data == null ? null : data.loginMethod === "manual" ? "manual" : "google");
      } catch {
        setNeedsUserInfo(true);
        setUserLoginMethod(null);
      }
    };
    check();
  }, [user]);

  const handleSurveySubmit = async (data: SurveyData) => {
    if (!user) return;
    if (data.studentId?.trim() && data.displayName?.trim()) {
      await updateDoc(doc(db, "users", user.uid), {
        studentId: data.studentId.trim(),
        displayName: data.displayName.trim(),
        updatedAt: new Date(),
      });
    }
    const result = calcScienceAttitudeScore(data);
    setScoreResult(result);
    await setDoc(doc(db, "survey2", user.uid), {
      userId: user.uid,
      completedAt: new Date().toISOString(),
      scoreTotal: result.total,
      scoreGrade: result.grade,
      ...data,
    });
    setSurveyCompleted(true);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: "var(--primary)" }}
          />
          <p className="mt-4" style={{ color: "var(--text)" }}>
            로딩 중...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage initialError={loginError} onClearError={() => setLoginError(null)} />;
  }

  if (needsUserInfo) {
    return (
      <UserInfoForm
        userId={user.uid}
        onComplete={() => setNeedsUserInfo(false)}
      />
    );
  }

  if (surveyCompleted) {
    return (
      <SurveyCompletePage
        scoreResult={scoreResult}
        onEditSurvey={async () => {
          if (!user) return;
          try {
            const snap = await getDoc(doc(db, "survey2", user.uid));
            if (snap.exists()) {
              const raw = snap.data();
              const { userId: _u, completedAt: _t, ...surveyData } = raw;
              setInitialSurveyData(surveyData as SurveyData);
              setSurveyCompleted(false);
            }
          } catch (e) {
            console.error("Failed to load survey for edit:", e);
          }
        }}
        onStartOver={() => {
          setInitialSurveyData(null);
          setSurveyCompleted(false);
        }}
      />
    );
  }

  return (
    <div
      className="min-h-[60vh] w-full max-w-full box-border"
      style={{ padding: "8px" }}
    >
      <CustomSurvey
        key={initialSurveyData ? JSON.stringify(initialSurveyData) : "empty"}
        initialData={initialSurveyData}
        onSubmit={handleSurveySubmit}
      />
    </div>
  );
}
