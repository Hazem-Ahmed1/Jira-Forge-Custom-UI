import React from 'react';

export default function AlreadySubmitted({ existingAssessmentId, onViewList, onViewSubmission }) {
  return (
    <div className="flex flex-col w-full max-w-[900px] flex-1 gap-6 sm:gap-8 items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200 dark:border-amber-800 shadow-lg p-8 text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-3xl text-amber-500"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          You've Already Submitted
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You have already submitted a security assessment for this project.
          Only one submission per user is allowed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onViewList}
            className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-list mr-2"></i>
            View All Assessments
          </button>
          {existingAssessmentId && (
            <button
              type="button"
              onClick={() => onViewSubmission(existingAssessmentId)}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <i className="fas fa-eye mr-2"></i>
              View Your Submission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
