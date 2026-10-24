import React from 'react';
import { Language } from '../../types';

interface CurriculumLevelProgressTrackerProps {
  language: Language;
  onNavigate?: (disciplineId: string, levelIdx: number, moduleId?: string) => void;
  onNavigateToModule?: (disciplineId: string, levelIdx: number, moduleId?: string) => void;
  onNavigateToCertificates?: () => void;
  onLaunchQuiz?: (disciplineId: string, levelId?: string, moduleId?: string, moduleTitle?: { ar: string; en: string }) => void;
}

export const CurriculumLevelProgressTracker: React.FC<CurriculumLevelProgressTrackerProps> = ({ language }) => {
  const isAr = language === 'ar';
  return (
    <div className="rounded-2xl border border-rose-400/25 bg-[#10132b] p-5">
      <h3 className="text-xl font-bold text-white mb-3">
        {isAr ? 'تتبع التقدم' : 'Progress Tracker'}
      </h3>
      <p className="text-slate-300 text-sm">
        {isAr ? 'تتبع تقدمك في المنهج.' : 'Track your curriculum progress.'}
      </p>
    </div>
  );
};