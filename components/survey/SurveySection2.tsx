"use client";

import type { SurveyData } from "@/types/survey";
import type { ScienceAttitudeRow } from "@/types/survey";
import {
  SECTION2_TITLE,
  MATRIX_COLUMNS,
  MATRIX_ROWS,
} from "@/lib/survey-data";

interface SurveySection2Props {
  data: SurveyData;
  onChange: (data: Partial<SurveyData>) => void;
  errors?: Record<string, string>;
}

export default function SurveySection2({
  data,
  onChange,
  errors = {},
}: SurveySection2Props) {
  const attitude = data.science_attitude ?? {};

  const setRow = (row: ScienceAttitudeRow, value: string) => {
    onChange({
      science_attitude: { ...attitude, [row]: value as "1" | "2" | "3" | "4" },
    });
  };

  const unansweredRows = MATRIX_ROWS.filter(
    (r) => !attitude[r.value as ScienceAttitudeRow]
  ).map((r) => r.value);

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg px-4 py-3 mb-4 font-semibold text-base text-white"
        style={{ background: "var(--question-bar)" }}
      >
        {SECTION2_TITLE}
      </div>

      <div className="overflow-x-auto py-4" style={{ background: "var(--bg-main)" }}>
        <table className="w-full max-w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th
                className="text-center p-2 rounded-tl-xl font-medium align-middle w-[38%] max-w-[200px] text-xs text-white"
                style={{
                  backgroundColor: "var(--table-header-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                문항
              </th>
              {MATRIX_COLUMNS.map((col, i) => (
                <th
                  key={col.value}
                  className={`p-1.5 text-center font-medium text-xs align-middle text-white ${i === MATRIX_COLUMNS.length - 1 ? "rounded-tr-xl" : ""}`}
                  style={{
                    backgroundColor: "var(--table-header-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="block leading-tight whitespace-pre-line">{col.display}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_ROWS.map((row) => {
              const value = attitude[row.value as ScienceAttitudeRow];
              const isUnanswered = !value;
              return (
                <tr
                  key={row.value}
                  className={isUnanswered ? "matrix-row-unanswered" : ""}
                  style={{
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td
                    className="p-2 align-middle text-xs leading-snug break-words"
                    style={{
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card-bg)",
                    }}
                  >
                    {row.text}
                  </td>
                  {MATRIX_COLUMNS.map((col) => (
                    <td
                      key={col.value}
                      className="p-1.5 text-center align-middle"
                      style={{
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--card-bg)",
                      }}
                    >
                      <label className="inline-flex items-center justify-center cursor-pointer w-full h-full min-h-[40px] rounded-xl hover:bg-black/5">
                        <input
                          type="radio"
                          name={row.value}
                          value={col.value}
                          checked={value === col.value}
                          onChange={() => setRow(row.value as ScienceAttitudeRow, col.value)}
                          className="matrix-radio"
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {errors.science_attitude && (
          <p className="mt-2 text-sm" style={{ color: "var(--primary)" }}>
            {errors.science_attitude}
          </p>
        )}
      </div>
    </div>
  );
}
