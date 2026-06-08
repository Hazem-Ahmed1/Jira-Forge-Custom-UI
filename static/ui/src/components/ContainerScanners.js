import React from 'react';
import { SEVERITIES } from '../constants/sections';
import { getSeverityColor, getSeverityCheckboxClass } from '../utils/severityUtils';
import { getFileIcon, formatFileSize } from '../utils/fileUtils';

function SubScannerSection({
  label,
  sublabel,
  data,
  linkInput,
  onDataChange,
  onLinkInputChange,
  onAddLink,
  onRemoveLink,
  onFilesAdd,
  onRemoveFile,
  fileInputId,
  accentColor, // 'rose'
}) {
  const accent = accentColor || 'rose';

  const toggleSeverity = (sev) => {
    onDataChange(prev => ({
      ...prev,
      severities: prev.severities.includes(sev)
        ? prev.severities.filter(x => x !== sev)
        : [...prev.severities, sev],
    }));
  };

  return (
    <div className={`p-4 space-y-4 bg-white dark:bg-slate-900/30`}>
      {/* Severity */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Severity</label>
        <div className="flex flex-wrap gap-3">
          {SEVERITIES.map(sev => (
            <label
              key={sev}
              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${
                data.severities.includes(sev) ? getSeverityColor(sev) : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={data.severities.includes(sev)}
                onChange={() => toggleSeverity(sev)}
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
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <i className="fas fa-link text-sm"></i> Links (Max 15)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Type URL and press Enter..."
            value={linkInput || ''}
            onChange={e => onLinkInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onAddLink(); } }}
            className={`flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-${accent}-500 focus:border-transparent`}
          />
          <button
            type="button"
            onClick={onAddLink}
            className={`px-3 py-2 bg-${accent}-500 hover:bg-${accent}-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1 whitespace-nowrap`}
          >
            <i className="fas fa-plus text-sm"></i> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[20px]">
          {data.links.map((url, i) => (
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
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <i className="fas fa-paperclip text-sm"></i> Files Attach (Max 5)
        </label>
        <div
          className={`border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-${accent}-400 dark:hover:border-${accent}-500 hover:bg-${accent}-50/50 dark:hover:bg-${accent}-900/20 transition-colors`}
          onClick={() => document.getElementById(fileInputId).click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(`border-${accent}-400`, `bg-${accent}-50/50`); }}
          onDragLeave={e => { e.currentTarget.classList.remove(`border-${accent}-400`, `bg-${accent}-50/50`); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(`border-${accent}-400`, `bg-${accent}-50/50`); onFilesAdd(e.dataTransfer.files); }}
        >
          <input
            type="file"
            id={fileInputId}
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
        {(data.files || []).filter(f => f && f.name).map((file, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <i className={`fas ${getFileIcon(file.name)} text-${accent}-500`}></i>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name || 'Unknown file'}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveFile(i)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <i className="fas fa-trash text-sm text-red-500"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <i className="fas fa-align-left text-sm"></i> Summary
        </label>
        <textarea
          placeholder={`Describe the ${label} findings...`}
          value={data.summary}
          onChange={e => onDataChange(prev => ({ ...prev, summary: e.target.value }))}
          className={`w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[80px] p-3 text-sm focus:ring-${accent}-500 focus:border-${accent}-500`}
        />
      </div>
    </div>
  );
}

export default function ContainerScanners({
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
}) {
  return (
    <div className="space-y-4">
      {/* GitLab CI */}
      <div className="border border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gitlabData.enabled}
              onChange={e => {
                const on = e.target.checked;
                onGitlabDataChange(prev => ({
                  ...prev,
                  enabled: on,
                  expanded: on,
                  ...(on ? {} : { severities: [], links: [], summary: '' }),
                }));
                if (!on) onLinkInputChange('gitlab', '');
              }}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-5 h-5"
            />
            <div>
              <span className="text-sm font-bold text-rose-900 dark:text-rose-100">Container Scanning (Static) – GitLab CI</span>
              <p className="text-xs text-rose-600/70 dark:text-rose-300/60">Static container image analysis</p>
            </div>
          </label>
          {gitlabData.enabled && (
            <button
              type="button"
              className={`accordion-toggle p-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors ${gitlabData.expanded ? 'rotated' : ''}`}
              onClick={() => onGitlabDataChange(prev => ({ ...prev, expanded: !prev.expanded }))}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          )}
        </div>
        {gitlabData.enabled && (
          <div className={`sub-accordion-content border-t border-rose-200 dark:border-rose-800 ${gitlabData.expanded ? 'expanded' : ''}`}>
            <SubScannerSection
              label="GitLab CI"
              data={gitlabData}
              linkInput={linkInputs.gitlab}
              onDataChange={onGitlabDataChange}
              onLinkInputChange={val => onLinkInputChange('gitlab', val)}
              onAddLink={() => onAddLink('gitlab', true)}
              onRemoveLink={i => onRemoveLink('gitlab', i, true)}
              onFilesAdd={files => onFilesAdd('gitlab', files, true)}
              onRemoveFile={i => onRemoveFile('gitlab', i, true)}
              fileInputId="gitlab-file-input"
              accentColor="rose"
            />
          </div>
        )}
      </div>

      {/* Sysdig */}
      <div className="border border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sysdigData.enabled}
              onChange={e => {
                const on = e.target.checked;
                onSysdigDataChange(prev => ({
                  ...prev,
                  enabled: on,
                  expanded: on,
                  ...(on ? {} : { severities: [], links: [], summary: '' }),
                }));
                if (!on) onLinkInputChange('sysdig', '');
              }}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-5 h-5"
            />
            <div>
              <span className="text-sm font-bold text-rose-900 dark:text-rose-100">Sysdig Scanning (Runtime + Registry)</span>
              <p className="text-xs text-rose-600/70 dark:text-rose-300/60">Runtime and registry scanning</p>
            </div>
          </label>
          {sysdigData.enabled && (
            <button
              type="button"
              className={`accordion-toggle p-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors ${sysdigData.expanded ? 'rotated' : ''}`}
              onClick={() => onSysdigDataChange(prev => ({ ...prev, expanded: !prev.expanded }))}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          )}
        </div>
        {sysdigData.enabled && (
          <div className={`sub-accordion-content border-t border-rose-200 dark:border-rose-800 ${sysdigData.expanded ? 'expanded' : ''}`}>
            <SubScannerSection
              label="Sysdig"
              data={sysdigData}
              linkInput={linkInputs.sysdig}
              onDataChange={onSysdigDataChange}
              onLinkInputChange={val => onLinkInputChange('sysdig', val)}
              onAddLink={() => onAddLink('sysdig', true)}
              onRemoveLink={i => onRemoveLink('sysdig', i, true)}
              onFilesAdd={files => onFilesAdd('sysdig', files, true)}
              onRemoveFile={i => onRemoveFile('sysdig', i, true)}
              fileInputId="sysdig-file-input"
              accentColor="rose"
            />
          </div>
        )}
      </div>
    </div>
  );
}
