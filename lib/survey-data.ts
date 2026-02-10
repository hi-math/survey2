export const SECTION1_TITLE = "※ 다음은 수강 전 기본사항에 대한 문항입니다.";

export const SECTION1_QUESTIONS = [
  {
    name: "reason",
    title: "1. 이 강의를 수강 신청한 이유는 무엇인가요? (중복 응답 가능)",
    choices: [
      { value: "1", text: "자연과학 분야에 대해 잘 알고 있어서" },
      { value: "2", text: "자연과학 분야에 대해 잘 몰라서" },
      { value: "3", text: "교양강좌로서 꼭 필요한 주제인 것 같아서" },
      { value: "4", text: "내 전공 및 진로분야와 연계성이 있는 것 같아서" },
      { value: "5", text: "강의 시간표 작성에 유리해서" },
    ],
    otherText: "기타",
    otherPlaceholder: "",
  },
  {
    name: "expectation",
    title: "2. 이번 강의를 수강하고 어떤 점을 얻고 싶을까요? (중복 응답 가능)",
    choices: [
      { value: "1", text: "자연과학 분야에 대한 내용 지식 역량을 높이고 싶다" },
      { value: "2", text: "내 일상생활에 과학이 어떻게 연관성이 있는지를 파악하고 싶다" },
      { value: "3", text: "과학기술과 미래 시대 변화의 방향성을 예측하고 싶다" },
      { value: "4", text: "나의 작품 세계에 활용할 수 있는 모티브를 찾고 싶다" },
      { value: "5", text: "쉽게 교양 학점을 채우고 싶다" },
    ],
    otherText: "기타",
    otherPlaceholder: "",
  },
  {
    name: "highschool_science",
    title: "3. 고등학교 시절 수강한 과학교과는 어떤 것이 있을까요? 수강한 것은 모두 표시해주세요.",
    choices: [
      { value: "1", text: "고 1 통합과학" },
      { value: "2", text: "물리학 1" },
      { value: "3", text: "화학 1" },
      { value: "4", text: "생명과학 1" },
      { value: "5", text: "지구과학 1" },
    ],
    otherText: "그 이상 수강한 과목",
    otherPlaceholder: "예: 물리학 2, 화학 2 등",
  },
] as const;

export const SECTION1_COMMENTS = [
  {
    name: "university_courses",
    title: "4. 대학에 들어와서 자연과학과 연계된 강의를 수강한 경험이 있나요?",
    description: "수강한 강좌명을 써주세요. 없으면 '없음'으로 기록해주세요.",
    placeholder: "예: 일반생물학, 일반화학 / 또는 '없음'",
    rows: 3,
  },
  {
    name: "science_interest",
    title: "5. 과학과 관련된 분야 중 어떤 분야에 가장 관심이 있나요?",
    description:
      "(예: 생물학, 물리학, 화학, 천문학 등. 없으면 '없음'으로 기록해주세요.)\n그 분야에 관심이 생긴 계기는 무엇인가요?",
    placeholder: "관심 분야와 계기를 함께 작성해주세요",
    rows: 4,
  },
] as const;

export const SECTION2_TITLE = "※ 다음은 과학에 대한 현재 자신의 태도를 알아보는 문항입니다.";

export type MatrixColumn = { value: string; text: string; display: string };

export const MATRIX_COLUMNS: readonly MatrixColumn[] = [
  { value: "1", text: "전혀 그렇지 않다", display: "전혀\n그렇지 않다" },
  { value: "2", text: "그렇지 않은 편이다", display: "그렇지\n않은\n편이다." },
  { value: "3", text: "그런 편이다", display: "그런\n편이다" },
  { value: "4", text: "매우 그렇다", display: "매우\n그렇다" },
];

export const MATRIX_ROWS = [
  { value: "q1", text: "1. 과학과 관련된 이슈에 대한 관심이 매우 높다." },
  { value: "q2", text: "2. 과학을 배우는 것은 일상생활을 하는데 많은 도움을 줄 것이다." },
  { value: "q3", text: "3. 과학과 관련된 공부나 활동을 하는 것이 즐겁다." },
  { value: "q4", text: "4. 과학을 배우는 것이 일상생활에 도움이 된다고 생각한다." },
  { value: "q5", text: "5. 과학을 배우는 것은 내게 더 많은 직업 선택의 기회를 줄 것이다." },
  { value: "q6", text: "6. 과학을 배우는 것은 과학기술 미래 시대에서 적응하기위해 매우 중요하다." },
  { value: "q7", text: "7. 과학적 이론과 실험 및 연구 결과에 대한 신뢰도가 매우 높다." },
  { value: "q8", text: "8. 학창시절 과학 교과 성적이 우수했다." },
  { value: "q9", text: "9. 과학은 전문가 집단만이 이해할 수 있는 내용으로 구성되어 있다고 생각한다." },
  { value: "q10", text: "10. 과학자와 관련 연구에 대한 국가적인 지원이 더 필요하다고 생각한다." },
] as const;
