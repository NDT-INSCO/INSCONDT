import React from 'react';
import { Language } from '../../types';

interface DisciplineCurriculumViewProps {
  language: Language;
  disciplineId?: string;
  levelIdx?: number;
  moduleId?: string;
  /** Deep-link target names used by the academy container. */
  targetDisciplineId?: string;
  targetLevelIdx?: number;
  targetModuleId?: string;
  onLaunchFlashcards?: (disciplineId: string, moduleId?: string) => void;
  onLaunchQuiz?: (disciplineId: string, levelId?: string, moduleId?: string, moduleTitle?: { ar: string; en: string }) => void;
}

export const DisciplineCurriculumView: React.FC<DisciplineCurriculumViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-[#10132b] p-5">
      <h3 className="text-xl font-bold text-white mb-3">
        {isAr ? 'عرض المنهج' : 'Curriculum View'}
      </h3>
      <p className="text-slate-300 text-sm">
        {isAr ? 'اختر تخصصاً لعرض المنهج.' : 'Select a discipline to view curriculum.'}
      </p>
    </div>
  );
};