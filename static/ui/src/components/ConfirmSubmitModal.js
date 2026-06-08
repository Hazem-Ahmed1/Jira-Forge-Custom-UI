import React from 'react';
import { SECTIONS, SECTION_CONFIG } from '../constants/sections';

function generateSummary(mainStatus, sectionData, gitlabData, sysdigData) {
  if (mainStatus === 'no') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <i className="fas fa-check-circle text-3xl text-green-500"></i>
          </div>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">No Issues Found</h3>
        </div>
      </div>
    );
  }

  if (mainStatus !== 'yes') return null;

  return SECTIONS.map(s => {
    const d = sectionData[s];
    const c = SECTION_CONFIG[s];
    return (
      <div key={s} className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{c.fullName}</h4>
        <p className={`font-bold ${d.status === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
          {d.status === 'yes' ? 'Yes - Issues Found' : 'No Issues'}
        </p>
        {d.status === 'yes' && (
          <div className="mt-2 ml-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {d.severities.length > 0 && (
              <p><strong>Severity:</strong> {d.severities.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(', ')}</p>
            )}
            {d.links.length > 0 && <p><strong>Links:</strong> {d.links.length} link(s)</p>}
            {d.summary && <p><strong>Summary:</strong> {d.summary}</p>}
            {s === 'container' && (
              <>
                {gitlabData.enabled && (
                  <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Container Scanning (GitLab CI)</p>
                    {gitlabData.severities.length > 0 && <p className="text-xs">Severity: {gitlabData.severities.join(', ')}</p>}
                    {gitlabData.links.length > 0 && <p className="text-xs">Links: {gitlabData.links.length} link(s)</p>}
                    {gitlabData.summary && <p className="text-xs">{gitlabData.summary}</p>}
                  </div>
                )}
                {sysdigData.enabled && (
                  <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Sysdig Scanning</p>
                    {sysdigData.severities.length > 0 && <p className="text-xs">Severity: {sysdigData.severities.join(', ')}</p>}
                    {sysdigData.links.length > 0 && <p className="text-xs">Links: {sysdigData.links.length} link(s)</p>}
                    {sysdigData.summary && <p className="text-xs">{sysdigData.summary}</p>}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  });
}

export default function ConfirmSubmitModal({ mainStatus, sectionData, gitlabData, sysdigData, onClose, onConfirm, isSubmitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <i className="fas fa-eye text-primary"></i>
            Review Your Submission
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="fas fa-times text-slate-400 hover:text-slate-600"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-slate-600 dark:text-slate-300 mb-4">Please review the data you entered before submitting:</p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 max-h-[50vh] overflow-y-auto space-y-4">
            {generateSummary(mainStatus, sectionData, gitlabData, sysdigData)}
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
