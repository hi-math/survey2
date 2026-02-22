"use client";

import { useState, useCallback } from "react";
import type { SurveyData } from "@/types/survey";
import { MATRIX_ROWS } from "@/lib/survey-data";
import SurveySection2 from "./SurveySection2";

interface CustomSurveyProps {
  initialData?: SurveyData | null;
  onSubmit: (data: SurveyData) => Promise<void>;
}

export default function CustomSurvey({
  initialData,
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
    if (!validateSection2()) return;
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-frame pb-10">
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
