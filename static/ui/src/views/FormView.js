import React from 'react';
import { SECTIONS, SECTION_CONFIG } from '../constants/sections';
import SectionCard from '../components/SectionCard';

export default function FormView({
  mainStatus,
  sectionData,
  gitlabData,
  sysdigData,
  errors,
  linkInputs,
  isSubmitting,
  onMainStatusChange,
  onSectionStatusChange,
  onSectionSeverityToggle,
  onSectionSummaryChange,
  onToggleSectionExpand,
  onLinkInputChange,
  onAddLink,
  onRemoveLink,
  onFilesAdd,
  onRemoveFile,
  onGitlabDataChange,
  onSysdigDataChange,
  clearError,
  onSubmit,
  onDiscard,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full max-w-[900px] flex-1 gap-6 sm:gap-8">
      <div className="flex flex-col gap-3 sm:gap-4 mb-2">
        <h1 className="text-[#0d141b] dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-center">
          Secure Code & App Infrastructure Review
        </h1>

        {/* Main Question */}
        <div className={`mt-2 sm:mt-4 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border-2 ${errors['main-question'] ? 'border-red-500' : 'border-primary/20'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/8444/8444096.png"
                alt="Security"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              Are there any security issues or vulnerabilities?
            </h2>
            <div className="radio-container flex items-center gap-3 sm:gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-full px-4 border border-slate-200 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="main_status"
                  value="yes"
                  checked={mainStatus === 'yes'}
                  onChange={() => { onMainStatusChange('yes'); clearError('main-question'); }}
                  className="w-5 h-5 text-primary focus:ring-primary border-slate-300"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="main_status"
                  value="no"
                  checked={mainStatus === 'no'}
                  onChange={() => { onMainStatusChange('no'); clearError('main-question'); }}
                  className="w-5 h-5 text-primary focus:ring-primary border-slate-300"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {errors['main-question'] && (
        <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1">
          <i className="fas fa-exclamation-circle text-sm"></i>
          <span>{errors['main-question']}</span>
        </p>
      )}

      {/* Security Sections */}
      {mainStatus === 'yes' && (
        <div className="flex flex-col gap-4">
          {SECTIONS.map(section => (
            <SectionCard
              key={section}
              section={section}
              config={SECTION_CONFIG[section]}
              data={sectionData[section]}
              error={errors[section]}
              linkInput={linkInputs[section]}
              onStatusChange={status => onSectionStatusChange(section, status)}
              onSeverityToggle={severity => onSectionSeverityToggle(section, severity)}
              onSummaryChange={summary => onSectionSummaryChange(section, summary)}
              onLinkInputChange={value => onLinkInputChange(section, value)}
              onAddLink={() => onAddLink(section)}
              onRemoveLink={index => onRemoveLink(section, index)}
              onFilesAdd={files => onFilesAdd(section, files)}
              onRemoveFile={index => onRemoveFile(section, index)}
              onToggleExpand={() => onToggleSectionExpand(section)}
              containerProps={section === 'container' ? {
                gitlabData,
                sysdigData,
                linkInputs,
                onGitlabDataChange,
                onSysdigDataChange,
                onLinkInputChange,
                onAddLink,
                onRemoveLink,
                onFilesAdd,
                onRemoveFile,
              } : undefined}
            />
          ))}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 pb-12 sm:pb-20">
        <button
          type="button"
          onClick={onDiscard}
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Discard Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-white font-black text-sm sm:text-base shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><span className="spinner small" />Submitting...</>
          ) : 'Submit'}
        </button>
      </div>
    </form>
  );
}
