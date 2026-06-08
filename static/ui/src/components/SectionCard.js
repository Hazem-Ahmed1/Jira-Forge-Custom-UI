import React from 'react';
import { SEVERITIES } from '../constants/sections';
import { getSeverityColor, getSeverityCheckboxClass } from '../utils/severityUtils';
import { getFileIcon, formatFileSize } from '../utils/fileUtils';
import ContainerScanners from './ContainerScanners';

export default function SectionCard({
  section,
  config,
  data,
  error,
  linkInput,
  onStatusChange,
  onSeverityToggle,
  onSummaryChange,
  onLinkInputChange,
  onAddLink,
  onRemoveLink,
  onFilesAdd,
  onRemoveFile,
  onToggleExpand,
  // Container-specific (only used when section === 'container'):
  containerProps,
}) {
  const c = config;
  const d = data;

  return (
    <div className={`${c.sectionCard} ${error ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
      {/* Section Header */}
      <div
        className="section-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 cursor-pointer"
        onClick={() => onToggleExpand()}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={c.iconBox}>
            {c.iconImg ? (
              <img src={c.iconImg} alt={c.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            ) : (
              <i className={`fas fa-${c.icon} ${c.iconColor} block text-xl sm:text-2xl`}></i>
            )}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{c.name}</h3>
            <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-300/70">{c.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
          <div className="radio-container flex items-center gap-3 sm:gap-4 bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-full px-3 sm:px-4 border border-white dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${section}_status`}
                value="yes"
                checked={d.status === 'yes'}
                onChange={() => onStatusChange('yes')}
                className={`w-4 h-4 border-slate-300 ${c.radioAccent}`}
              />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${section}_status`}
                value="no"
                checked={d.status === 'no'}
                onChange={() => onStatusChange('no')}
                className={`w-4 h-4 border-slate-300 ${c.radioAccent}`}
              />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">No</span>
            </label>
          </div>
          {d.status === 'yes' && (
            <button
              type="button"
              className={`accordion-toggle p-2 rounded-lg transition-colors ${c.accordionHover} ${d.expanded ? 'rotated' : ''}`}
              onClick={e => { e.stopPropagation(); onToggleExpand(); }}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          )}
        </div>
      </div>

      {/* Accordion Content */}
      {d.status === 'yes' && (
        <div className={`accordion-content px-4 sm:px-6 ${d.expanded ? 'expanded' : ''}`}>
          <div className={`bg-white dark:bg-slate-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border ${c.innerBorder} space-y-6 shadow-sm`}>
            {section === 'container' ? (
              <ContainerScanners {...containerProps} />
            ) : (
              <>
                {/* Severity */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Severity</label>
                  <div className="flex flex-wrap gap-3">
                    {SEVERITIES.map(sev => (
                      <label
                        key={sev}
                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${
                          d.severities.includes(sev) ? getSeverityColor(sev) : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={d.severities.includes(sev)}
                          onChange={() => onSeverityToggle(sev)}
                          className={`rounded ${getSeverityCheckboxClass(sev)}`}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i className="fas fa-link text-sm"></i> Links (Max 15)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Type URL and press Enter..."
                      value={linkInput || ''}
                      onChange={e => onLinkInputChange(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onAddLink(); } }}
                      className={`flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm ${c.focusRing}`}
                    />
                    <button
                      type="button"
                      onClick={onAddLink}
                      className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${c.addBtn}`}
                    >
                      <i className="fas fa-plus text-sm"></i> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {d.links.map((url, i) => (
                      <span key={i} className="tag">
                        <span className="max-w-[200px] truncate" title={url}>
                          {url.length > 40 ? url.slice(0, 37) + '...' : url}
                        </span>
                        <button type="button" onClick={() => onRemoveLink(i)}>
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Press Enter or click Add. Maximum 15 links allowed.</p>
                </div>

                {/* File Upload */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i className="fas fa-paperclip text-sm"></i> Files Attach (Max 5)
                  </label>
                  <div
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/20 hover:border-sky-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById(`${section}-file-input`).click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                    onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); onFilesAdd(e.dataTransfer.files); }}
                  >
                    <input
                      type="file"
                      id={`${section}-file-input`}
                      className="hidden"
                      multiple
                      accept=".json,.pdf,.doc,.docx"
                      onChange={e => onFilesAdd(e.target.files)}
                    />
                    <i className="fas fa-cloud-upload-alt text-2xl text-slate-400"></i>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">Max 5 files (JSON, PDF, DOC, DOCX) - 5MB each</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(d.files || []).filter(f => f && f.name).map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <i className={`fas ${getFileIcon(file.name)} text-slate-400`}></i>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name || 'Unknown file'}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveFile(i)}
                          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <i className="fas fa-trash text-slate-400 hover:text-red-500"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <i className="fas fa-align-left text-sm"></i> Summary
                  </label>
                  <textarea
                    placeholder={`Provide a detailed description of the ${c.name} findings...`}
                    value={d.summary}
                    onChange={e => onSummaryChange(e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[100px] p-3 text-sm ${c.focusRing}`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 pb-4">
          <p className="text-red-500 text-sm font-medium flex items-center gap-1">
            <i className="fas fa-exclamation-circle text-sm"></i>
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  );
}
