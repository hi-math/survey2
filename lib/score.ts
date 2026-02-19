import type { SurveyData } from "@/types/survey";
import { MATRIX_ROWS } from "@/lib/survey-data";

export type ScoreGrade = "high" | "mid" | "low";

export interface ScoreResult {
  total: number;       // 합산 점수 (0~60)
  maxScore: number;    // 만점 (60)
  grade: ScoreGrade;
  title: string;
  description: string;
}

export function calcScienceAttitudeScore(data: SurveyData): ScoreResult {
  const attitude = data.science_attitude ?? {};
  let total = 0;

  for (const row of MATRIX_ROWS) {
    const val = attitude[row.value as keyof typeof attitude];
    total += val ? parseInt(val, 10) : 0;
  }

  const maxScore = MATRIX_ROWS.length * 4; // 60

  let grade: ScoreGrade;
  let title: string;
  let description: string;

  if (total >= 50) {
    grade = "high";
    title = "AI 동행자";
    description =
      "AI와 이미 잘 어울려 일상과 학습에 활용하고 계시네요. 답변을 꼼꼼히 확인하고, 피드백이나 형식·스타일까지 요구하는 등 자신만의 기준으로 쓰고 있습니다. 이번 강의에서 그 경험을 나누고 더 깊이 써보는 시간이 되길 바랍니다.";
  } else if (total >= 40) {
    grade = "mid";
    title = "AI 탐색자";
    description =
      "AI에 관심이 있고 조금씩 써 보신 경험이 있습니다. 아직 모든 기능까지는 쓰지 않았지만, 도움이 된다는 걸 느끼고 있는 단계예요. 이번 강의에서 다양한 활용법을 탐색해 보시면 좋겠습니다.";
  } else {
    grade = "low";
    title = "AI 관찰자";
    description =
      "AI는 아직 조금 낯설거나 막연하게 느껴질 수 있습니다. 괜찮아요. 이번 강의에서 단계적으로 활용법을 익히고, 직접 써 보며 산출물을 만드는 경험을 해 보시면 한걸음 가까워질 거예요.";
  }

  return { total, maxScore, grade, title, description };
}
