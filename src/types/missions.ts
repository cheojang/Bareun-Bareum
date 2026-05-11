// daily-missions API와 DailyMissionsCard 컴포넌트가 공유하는 미션 타입
export type Mission =
  | {
      type: "review";
      reviewScheduleId: string;
      targetWord: string;
      phoneme: string;
      hint: string;
    }
  | {
      type: "weakness";
      phoneme: string;
      errorRate: number;
      hint: string;
    }
  | {
      type: "challenge";
      targetWord: string;
      phoneme: string;
      hint: string;
    };
