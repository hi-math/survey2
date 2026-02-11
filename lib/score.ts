import type { SurveyData } from "@/types/survey";
import { MATRIX_ROWS } from "@/lib/survey-data";

export type ScoreGrade = "high" | "mid" | "low";

export interface ScoreResult {
  total: number;       // 합산 점수 (0~40)
  maxScore: number;    // 만점 (40)
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

  const maxScore = MATRIX_ROWS.length * 4; // 40

  let grade: ScoreGrade;
  let title: string;
  let description: string;

  if (total >= 30) {
    grade = "high";
    title = "과학에 대한 자신감 뿜뿜형";
    description =
      "당신은 과학에 대한 자신감과 흥미가 매우 높습니다! 과학적 사고방식이 이미 일상에 깊이 스며들어 있으며, 새로운 과학 지식을 배우는 것에 큰 즐거움을 느끼고 있습니다. 이번 강의를 통해 그 열정을 더욱 깊이 있게 발전시켜 보세요.";
  } else if (total >= 20) {
    grade = "mid";
    title = "과학에 대한 관심 친화형";
    description =
      "당신은 과학에 대해 적당한 관심과 호기심을 가지고 있습니다. 아직 깊이 빠져들진 않았지만, 과학이 일상과 연결되어 있다는 것을 느끼고 있죠. 이번 강의가 과학과 더 가까워지는 좋은 계기가 될 것입니다.";
  } else {
    grade = "low";
    title = "과학은 아직은 가까이 하기엔 너무 먼 당신형";
    description =
      "과학이 아직은 조금 낯설고 어렵게 느껴질 수 있습니다. 하지만 걱정 마세요! 누구나 처음은 있는 법이니까요. 이번 강의를 통해 과학이 생각보다 재미있고 우리 생활에 밀접하다는 것을 발견하게 될 거예요.";
  }

  return { total, maxScore, grade, title, description };
}
