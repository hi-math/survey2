'use client';

import { useState, useEffect, useMemo } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import LoginPage from "@/components/LoginPage";
import UserInfoForm from "@/components/UserInfoForm";

const surveyJson = {
  pages: [
    {
      name: "section1",
      title: "※ 다음은 수강 전 기본사항에 대한 문항입니다.",
      elements: [
        {
          type: "checkbox",
          name: "reason",
          title: "1. 이 강의를 수강 신청한 이유는 무엇인가요? (중복 응답 가능)",
          isRequired: true,
          choices: [
            { value: "1", text: "자연과학 분야에 대해 잘 알고 있어서" },
            { value: "2", text: "자연과학 분야에 대해 잘 몰라서" },
            { value: "3", text: "교양강좌로서 꼭 필요한 주제인 것 같아서" },
            { value: "4", text: "내 전공 및 진로분야와 연계성이 있는 것 같아서" },
            { value: "5", text: "강의 시간표 작성에 유리해서" }
          ],
          showOtherItem: true,
          otherText: "기타"
        },
        {
          type: "checkbox",
          name: "expectation",
          title: "2. 이번 강의를 수강하고 어떤 점을 얻고 싶을까요? (중복 응답 가능)",
          isRequired: true,
          choices: [
            { value: "1", text: "자연과학 분야에 대한 내용 지식 역량을 높이고 싶다" },
            { value: "2", text: "내 일상생활에 과학이 어떻게 연관성이 있는지를 파악하고 싶다" },
            { value: "3", text: "과학기술과 미래 시대 변화의 방향성을 예측하고 싶다" },
            { value: "4", text: "나의 작품 세계에 활용할 수 있는 모티브를 찾고 싶다" },
            { value: "5", text: "쉽게 교양 학점을 채우고 싶다" }
          ],
          showOtherItem: true,
          otherText: "기타"
        },
        {
          type: "checkbox",
          name: "highschool_science",
          title: "3. 고등학교 시절 수강한 과학교과는 어떤 것이 있을까요? 수강한 것은 모두 표시해주세요.",
          isRequired: true,
          choices: [
            { value: "1", text: "고 1 통합과학" },
            { value: "2", text: "물리학 1" },
            { value: "3", text: "화학 1" },
            { value: "4", text: "생명과학 1" },
            { value: "5", text: "지구과학 1" }
          ],
          showOtherItem: true,
          otherText: "그 이상 수강한 과목",
          otherPlaceholder: "예: 물리학 2, 화학 2 등"
        },
        {
          type: "comment",
          name: "university_courses",
          title: "4. 대학에 들어와서 자연과학과 연계된 강의를 수강한 경험이 있나요?",
          description: "수강한 강좌명을 써주세요. 없으면 '없음'으로 기록해주세요.",
          isRequired: true,
          rows: 3,
          placeholder: "예: 일반생물학, 일반화학 / 또는 '없음'"
        },
        {
          type: "comment",
          name: "science_interest",
          title: "5. 과학과 관련된 분야 중 어떤 분야에 가장 관심이 있나요?",
          description: "(예: 생물학, 물리학, 화학, 천문학 등. 없으면 '없음'으로 기록해주세요.)\n그 분야에 관심이 생긴 계기는 무엇인가요?",
          isRequired: true,
          rows: 4,
          placeholder: "관심 분야와 계기를 함께 작성해주세요"
        }
      ]
    },
    {
      name: "section2",
      title: "※ 다음은 과학에 대한 현재 자신의 태도를 알아보는 문항입니다.",
      elements: [
        {
          type: "matrix",
          name: "science_attitude",
          titleLocation: "hidden",
          isRequired: true,
          columns: [
            { value: "1", text: "전혀\n그렇지 않다" },
            { value: "2", text: "그렇지 않은\n편이다" },
            { value: "3", text: "그런 편이다" },
            { value: "4", text: "매우\n그렇다" }
          ],
          rows: [
            { value: "q1", text: "1. 과학과 관련된 이슈에 대한 관심이 매우 높다." },
            { value: "q2", text: "2. 과학을 배우는 것은 일상생활을 하는데 많은 도움을 줄 것이다." },
            { value: "q3", text: "3. 과학과 관련된 공부나 활동을 하는 것이 즐겁다." },
            { value: "q4", text: "4. 과학을 배우는 것이 일상생활에 도움이 된다고 생각한다." },
            { value: "q5", text: "5. 과학을 배우는 것은 내게 더 많은 직업 선택의 기회를 줄 것이다." },
            { value: "q6", text: "6. 과학을 배우는 것은 과학기술 미래 시대에서 적응하기위해 매우 중요하다." },
            { value: "q7", text: "7. 과학적 이론과 실험 및 연구 결과에 대한 신뢰도가 매우 높다." },
            { value: "q8", text: "8. 학창시절 과학 교과 성적이 우수했다." },
            { value: "q9", text: "9. 과학은 전문가 집단만이 이해할 수 있는 내용으로 구성되어 있다고 생각한다." },
            { value: "q10", text: "10. 과학자와 관련 연구에 대한 국가적인 지원이 더 필요하다고 생각한다." }
          ]
        }
      ]
    }
  ],
  showQuestionNumbers: "off",
  pageNextText: "다음 섹션으로",
  pagePrevText: "이전 섹션으로",
  completeText: "제출하기",
  completedHtml: "<h3>감사합니다!</h3><p>소중한 의견 감사드립니다.</p>"
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUserInfo, setNeedsUserInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user has studentId
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If logged in with Google and no studentId, need to collect info
          if (userData.loginMethod === 'google' && !userData.studentId) {
            setNeedsUserInfo(true);
          } else {
            setNeedsUserInfo(false);
          }
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const survey = useMemo(() => {
    const surveyModel = new Model(surveyJson);

    // 테마 커스터마이징
    surveyModel.applyTheme({
      "cssVariables": {
        "--sjs-primary-backcolor": "#1E3A63",
        "--sjs-primary-backcolor-dark": "#152a4a",
        "--sjs-primary-backcolor-light": "rgba(30, 58, 99, 0.1)",
        "--sjs-primary-forecolor": "#ffffff",
        "--sjs-general-backcolor": "#ffffff",
        "--sjs-general-forecolor": "#1E3A63",
        "--sjs-secondary-backcolor": "#6B8EA6",
        "--sjs-secondary-backcolor-light": "rgba(107, 142, 166, 0.1)",
        "--sjs-secondary-backcolor-semi-light": "rgba(107, 142, 166, 0.25)",
        "--sjs-border-default": "#6B8EA6",
        "--sjs-border-light": "#d1d5db",
        "--sjs-special-background": "#6B8EA6",
        "--sjs-font-family": "var(--font-nanum-gothic), sans-serif",
        "--sjs-font-size": "12px",
        "--sjs-font-questiontitle-size": "12px",
        "--sjs-font-questiondescription-size": "10px",
        "--sjs-font-editorfont-size": "11px",
        "--sjs-font-pagetitle-size": "14px",
        "--sjs-font-pagedescription-size": "11px",
        "--sjs-font-questiontitle-weight": "600"
      },
      "themeName": "custom",
      "colorPalette": "light"
    });

    // 모바일에서도 매트릭스 테이블 유지 - setIsMobile을 no-op으로 오버라이드
    if (typeof window !== 'undefined') {
      (surveyModel as any).setIsMobile = () => {};
      (surveyModel as any).processResponsiveness = () => {};
    }

    surveyModel.onComplete.add(async (sender) => {
      console.log("Survey results:", sender.data);

      // Save survey results to Firestore
      if (user) {
        try {
          await setDoc(doc(db, 'surveys', user.uid), {
            ...sender.data,
            userId: user.uid,
            completedAt: new Date(),
          });
          alert('설문이 제출되었습니다. 감사합니다!');
        } catch (error) {
          console.error('Error saving survey:', error);
          alert('설문 제출 중 오류가 발생했습니다.');
        }
      }
    });

    return surveyModel;
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E0DDD8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#6B8EA6' }}></div>
          <p className="mt-4" style={{ color: '#1E3A63' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (needsUserInfo) {
    return <UserInfoForm userId={user.uid} onComplete={() => setNeedsUserInfo(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ padding: '8px', boxSizing: 'border-box', width: '100%' }}>
      <div className="w-full bg-white" style={{ padding: '8px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Survey model={survey} />
      </div>
    </div>
  );
}
