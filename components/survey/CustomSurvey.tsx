"use client";

import { useState, useCallback } from "react";
import type { SurveyData } from "@/types/survey";
import { MATRIX_ROWS } from "@/lib/survey-data";
import SurveySection2 from "./SurveySection2";

interface CustomSurveyProps {
  initialData?: SurveyData | null;
  collectStudentInfo?: boolean;
  onSubmit: (data: SurveyData) => Promise<void>;
}

export default function CustomSurvey({
  initialData,
  collectStudentInfo = false,
  onSubmit,
}: CustomSurveyProps) {
  const [data, setData] = useState<SurveyData>(() => ({
    studentId: initialData?.studentId ?? "",
    displayName: initialData?.displayName ?? "",
    science_attitude: initialData?.science_attitude ?? {},
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateData = useCallback((partial: Partial<SurveyData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(partial).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const validateStudentInfo = (): boolean => {
    if (!collectStudentInfo) return true;
    const err: Record<string, string> = {};
    if (!data.studentId?.trim()) err.studentId = "학번을 입력해 주세요.";
    if (!data.displayName?.trim()) err.displayName = "이름을 입력해 주세요.";
    if (Object.keys(err).length > 0) {
      setErrors((prev) => ({ ...prev, ...err }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.studentId;
      delete next.displayName;
      return next;
    });
    return true;
  };

  const validateSection2 = (): boolean => {
    const missing = MATRIX_ROWS.filter(
      (r) => !data.science_attitude?.[r.value as keyof typeof data.science_attitude]
    );
    if (missing.length > 0) {
      setErrors({
        science_attitude: "모든 문항에 응답해 주세요. (미응답 행이 있습니다)",
      });
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.science_attitude;
      return next;
    });
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStudentInfo() || !validateSection2()) return;
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-frame pb-10">
      {collectStudentInfo && (
        <div className="mb-6 p-4 rounded-xl border-2 space-y-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>
            학번·이름 확인
          </p>
          <div>
            <label htmlFor="survey-studentId" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              학번
            </label>
            <input
              id="survey-studentId"
              type="text"
              value={data.studentId ?? ""}
              onChange={(e) => updateData({ studentId: e.target.value })}
              placeholder="학번을 입력하세요"
              className="w-full px-3 py-2.5 rounded-xl border-2 text-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-main)", color: "var(--text)" }}
            />
            {errors.studentId && (
              <p className="mt-1 text-sm" style={{ color: "var(--primary)" }}>{errors.studentId}</p>
            )}
          </div>
          <div>
            <label htmlFor="survey-displayName" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              이름
            </label>
            <input
              id="survey-displayName"
              type="text"
              value={data.displayName ?? ""}
              onChange={(e) => updateData({ displayName: e.target.value })}
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2.5 rounded-xl border-2 text-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--secondary)]"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-main)", color: "var(--text)" }}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm" style={{ color: "var(--primary)" }}>{errors.displayName}</p>
            )}
          </div>
        </div>
      )}

      <SurveySection2
        data={data}
        onChange={updateData}
        errors={errors}
      />

      <div className="flex gap-3 justify-center mt-8 flex-wrap">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {submitting ? "제출 중…" : "제출하기"}
        </button>
      </div>
    </div>
  );
}
