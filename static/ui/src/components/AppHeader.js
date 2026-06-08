import React from 'react';

export default function AppHeader({ isDarkMode, onToggleDarkMode, viewMode, hasExistingSubmission, onNewAssessment, onViewList }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4 text-primary">
        <img
          src="https://harestechnology.com/images/services/code-review.png"
          alt="Secure Code"
          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
        />
        <h2 className="text-[#0d141b] dark:text-white text-base sm:text-lg font-bold leading-tight tracking-tight">
          Secure Code & App Infrastructure Review
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {(viewMode === 'list' || viewMode === 'feedback') && !hasExistingSubmission && (
          <button
            onClick={onNewAssessment}
            className="p-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
            title="New Assessment"
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
        {(viewMode === 'form' || viewMode === 'feedback') && (
          <button
            onClick={onViewList}
            className="p-2 rounded-lg transition-colors bg-slate-500 hover:bg-slate-600 text-white"
            title="View Assessments"
          >
            <i className="fas fa-list"></i>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl text-slate-600 dark:text-slate-300`}></i>
        </button>
      </div>
    </header>
  );
}
