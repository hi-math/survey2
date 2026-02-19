export const SECTION2_TITLE = "※ 다음은 AI 활용에 대한 현재 자신의 태도·경험을 알아보는 문항입니다.";

export type MatrixColumn = { value: string; text: string; display: string };

export const MATRIX_COLUMNS: readonly MatrixColumn[] = [
  { value: "1", text: "전혀 그렇지 않다", display: "전혀\n그렇지 않다" },
  { value: "2", text: "그렇지 않은 편이다", display: "그렇지\n않은\n편이다." },
  { value: "3", text: "그런 편이다", display: "그런\n편이다" },
  { value: "4", text: "매우 그렇다", display: "매우\n그렇다" },
];

export const MATRIX_ROWS = [
  { value: "q1", text: "1. AI와 관련된 이슈에 대한 관심이 평소 매우 높다." },
  { value: "q2", text: "2. AI에 대해 배우는 것은 일상생활을 하는데 많은 도움을 줄 것이다." },
  { value: "q3", text: "3. AI와 관련된 공부나 활동을 하는 것이 즐겁다." },
  { value: "q4", text: "4. AI를 활용법을 익히는 것이 일상생활에 도움이 된다고 생각한다." },
  { value: "q5", text: "5. AI 활용법을 배우는 것은 내게 더 많은 직업 선택의 기회를 줄 것이라 생각한다." },
  { value: "q6", text: "6. AI 활용법 배우는 것은 과학기술 미래 시대에서 적응하기 위해 매우 중요하다고 생각한다." },
  { value: "q7", text: "7. AI가 응답해준 답변이나 산출물의 정확성이나 근거를 꼼꼼히 확인하는 편이다." },
  { value: "q8", text: "8. AI의 답변이 마음에 들지 않으면 구체적으로 피드백하거나 재질문하는 경우가 많다." },
  { value: "q9", text: "9. AI에게 답변의 형식(예: 마크다운, 표, 목차 등)이나 톤, 언어 스타일을 세밀하게 요청한 적이 있다." },
  { value: "q10", text: "10. AI의 다양한 기능(예: 코드 실행, 번역, 맞춤법, 요약, 통계 등)을 적극적으로 활용한다." },
  { value: "q11", text: "11. AI의 답변이 자신의 기대에 못 미치면, 직접 추가 정보를 검색하거나, 다른 종류의 AI와 비교해본 적이 있다." },
  { value: "q12", text: "12. AI와의 대화에서 자신만의 특별한 기준(예: 예의, 논리성, 창의성 등)을 중요하게 여긴다." },
  { value: "q13", text: "13. AI 사용 중 발생할 수 있는 다양한 부정적인 영향을 걱정하고 있다." },
  { value: "q14", text: "14. AI 사용이 학습 윤리를 위반할 가능성이 있다고 우려하고 있다." },
  { value: "q15", text: "15. AI 가 만든 산출물도 개인의 역량을 반영하는 것이라고 생각한다." },
] as const;
