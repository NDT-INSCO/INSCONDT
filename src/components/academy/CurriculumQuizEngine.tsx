import React from 'react';
import { Language } from '../../types';

interface CurriculumQuizEngineProps {
  language: Language;
  quizTarget?: { disciplineId?: string; levelId?: string; moduleId?: string; moduleTitle?: { ar: string; en: string } } | null;
  /** Deep-link target fields used by the academy container. */
  initialDisciplineId?: string;
  initialLevelId?: string;
  initialModuleId?: string;
  initialModuleTitle?: { ar: string; en: string };
  onCloseTargetedQuiz?: () => void;
  onNavigateToDiscipline?: () => void;
  onOpenLeaderboard?: () => void;
}

export const CurriculumQuizEngine: React.FC<CurriculumQuizEngineProps> = ({ language }) => {
  const isAr = language === 'ar';
  return (
    <div className="rounded-2xl border border-indigo-400/25 bg-[#10132b] p-5">
      <h3 className="text-xl font-bold text-white mb-3">
        {isAr ? 'محرك الاختبارات' : 'Quiz Engine'}
      </h3>
      <p className="text-slate-300 text-sm">
        {isAr ? 'اختبر معلوماتك.' : 'Test your knowledge.'}
      </p>
    </div>
  );
};