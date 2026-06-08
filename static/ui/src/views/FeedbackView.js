import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import '../App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SECTIONS, SECTION_CONFIG } from '../constants/sections';
import { getSeverityColor } from '../utils/severityUtils';
import { getFileIcon, formatFileSize } from '../utils/fileUtils';

const SEVERITIES = ['information', 'low', 'medium', 'high', 'critical'];

function FeedbackView({ feedbackData, onBackToForm, isDarkMode, assessmentId }) {
  const [commentInputs, setCommentInputs] = useState({});
  const [sectionComments, setSectionComments] = useState({});
  const [sectionExpanded, setSectionExpanded] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    invoke('getCurrentUser').then(result => {
      if (result.success) setCurrentUser(result.user);
    });
    if (assessmentId) {
      loadAllComments();
      loadAttachments();
    }
  }, [assessmentId]);

  const loadAttachments = async () => {
    try {
      const assessmentResult = await invoke('getAssessment', { assessmentId });
      if (assessmentResult.success && assessmentResult.assessment?.issueKey) {
        const result = await invoke('getIssueAttachments', { issueKey: assessmentResult.assessment.issueKey });
        setAttachments(result.success && result.attachments ? result.attachments : []);
      } else {
        setAttachments([]);
      }
    } catch (e) {
      console.error('Error loading attachments:', e);
      setAttachments([]);
    }
  };

  const downloadFile = async (attachmentId, filename) => {
    setDownloadingFile(filename);
    try {
      const result = await invoke('downloadAttachment', { attachmentId });
      if (result.success && result.content) {
        const byteCharacters = atob(result.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.mimeType || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download file: ' + result.error);
      }
    } catch (e) {
      console.error('Download error:', e);
      alert('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  const loadAllComments = async () => {
    setIsLoadingComments(true);
    const allComments = {};
    for (const section of SECTIONS) {
      try {
        const result = await invoke('getComments', { assessmentId, section });
        if (result.success) allComments[section] = result.comments || [];
      } catch (e) {
        console.error(`Error loading comments for ${section}:`, e);
      }
    }
    try {
      const gitlabResult = await invoke('getComments', { assessmentId, section: 'gitlab' });
      if (gitlabResult.success) allComments.gitlab = gitlabResult.comments || [];
      const sysdigResult = await invoke('getComments', { assessmentId, section: 'sysdig' });
      if (sysdigResult.success) allComments.sysdig = sysdigResult.comments || [];
    } catch (e) {
      console.error('Error loading container subsection comments:', e);
    }
    setSectionComments(allComments);
    setIsLoadingComments(false);
  };

  const addComment = async (section) => {
    const commentText = commentInputs[section];
    if (!commentText || !commentText.trim()) return;
    try {
      const result = await invoke('addComment', {
        assessmentId,
        section,
        comment: commentText.trim(),
        userName: currentUser?.displayName || 'Anonymous',
      });
      if (result.success) {
        setSectionComments(prev => ({ ...prev, [section]: result.allComments || [] }));
        setCommentInputs(prev => ({ ...prev, [section]: '' }));
      }
    } catch (e) {
      console.error('Error adding comment:', e);
    }
  };

  const updateCommentInput = (section, value) => {
    setCommentInputs(prev => ({ ...prev, [section]: value }));
  };

  const toggleSection = (section) => {
    setSectionExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!feedbackData) return null;

  const mainStatus = feedbackData.mainStatus;
  const sectionData = feedbackData.sections || {};

  return (
    <div className="flex flex-col w-full max-w-[900px] flex-1 gap-6 sm:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[#0d141b] dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
          Response / Feedback
        </h1>
        <button
          type="button"
          onClick={onBackToForm}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Form
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-2">
        <div className="mt-2 sm:mt-4 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border-2 border-primary/20 shadow-sm opacity-90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/8444/8444096.png"
                alt="Security"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              Are there any security issues or vulnerabilities?
            </h2>
            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              <span className={`text-lg font-bold ${mainStatus === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
                {mainStatus === 'yes' ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {mainStatus === 'yes' && (
        <div className="flex flex-col gap-4">
          {SECTIONS.map(section => {
            const c = SECTION_CONFIG[section];
            const d = sectionData[section] || {};
            const expanded = sectionExpanded[section];
            if (d.status !== 'yes') return null;

            return (
              <div key={section} className={c.sectionCard}>
                <div
                  className="section-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 cursor-pointer"
                  onClick={() => toggleSection(section)}
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
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full border border-white dark:border-slate-700">
                      <span className="text-sm font-bold text-red-600">Yes</span>
                    </div>
                    <button
                      type="button"
                      className={`accordion-toggle p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${expanded ? 'rotated' : ''}`}
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                </div>

                <div className={`accordion-content px-4 sm:px-6 ${expanded ? 'expanded' : ''}`}>
                  <div className={`bg-white dark:bg-slate-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border ${c.innerBorder} space-y-6 shadow-sm opacity-90`}>
                    {section !== 'container' ? (
                      <>
                        {d.severities && d.severities.length > 0 && (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Severity</label>
                            <div className="flex flex-wrap gap-3">
                              {d.severities.map(sev => (
                                <span key={sev} className={`px-3 py-2 rounded-lg border ${getSeverityColor(sev)}`}>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {d.links && d.links.length > 0 && (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              <i className="fas fa-link text-sm"></i> Links
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {d.links.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tag hover:bg-primary/10">
                                  <i className="fas fa-external-link-alt text-xs mr-1"></i>
                                  <span className="max-w-[200px] truncate" title={url}>
                                    {url.length > 40 ? url.slice(0, 37) + '...' : url}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {d.files && d.files.length > 0 && (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              <i className="fas fa-paperclip text-sm"></i> Files Attached
                            </label>
                            <div className="space-y-2">
                              {d.files.map((file, i) => {
                                const jiraAttachment = attachments.find(att =>
                                  att.filename?.toLowerCase() === file.name?.toLowerCase()
                                );
                                return (
                                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                      <i className={`fas ${getFileIcon(file.name)} text-slate-400`}></i>
                                      <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                      </div>
                                    </div>
                                    {jiraAttachment && jiraAttachment.id ? (
                                      <button
                                        onClick={() => downloadFile(jiraAttachment.id, jiraAttachment.filename)}
                                        disabled={downloadingFile === jiraAttachment.filename}
                                        className="px-3 py-1.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <i className={`fas ${downloadingFile === jiraAttachment.filename ? 'fa-spinner fa-spin' : 'fa-download'} text-xs`}></i>
                                        Download
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">Loading...</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {d.summary && (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              <i className="fas fa-align-left text-sm"></i> Summary
                            </label>
                            <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-sm text-slate-700 dark:text-slate-300">
                              {d.summary}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        {d.gitlabEnabled && (
                          <div className="border border-rose-200 dark:border-rose-800 rounded-xl p-4 bg-rose-50/20 dark:bg-rose-950/20">
                            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-3">Container Scanning (Static) – GitLab CI</h4>
                            {d.gitlabSeverities && d.gitlabSeverities.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Severity</label>
                                <div className="flex flex-wrap gap-2">
                                  {d.gitlabSeverities.map(sev => (
                                    <span key={sev} className={`px-2 py-1 rounded-lg border text-xs ${getSeverityColor(sev)}`}>
                                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {d.gitlabLinks && d.gitlabLinks.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Links</label>
                                <div className="flex flex-wrap gap-2">
                                  {d.gitlabLinks.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tag text-xs hover:bg-rose-200">
                                      <i className="fas fa-external-link-alt text-xs mr-1"></i>
                                      {url.length > 30 ? url.slice(0, 27) + '...' : url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {d.gitlabFiles && d.gitlabFiles.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Files</label>
                                <div className="space-y-2">
                                  {d.gitlabFiles.map((file, i) => {
                                    const jiraAttachment = attachments.find(att => att.filename === file.name);
                                    return (
                                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded text-xs">
                                        <div className="flex items-center gap-2">
                                          <i className={`fas ${getFileIcon(file.name)} text-rose-500`}></i>
                                          <span>{file.name}</span>
                                        </div>
                                        {jiraAttachment && jiraAttachment.id && (
                                          <button
                                            onClick={() => downloadFile(jiraAttachment.id, jiraAttachment.filename)}
                                            disabled={downloadingFile === jiraAttachment.filename}
                                            className="px-2 py-1 bg-primary hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                                          >
                                            <i className={`fas ${downloadingFile === jiraAttachment.filename ? 'fa-spinner fa-spin' : 'fa-download'} text-xs`}></i>
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {d.gitlabSummary && (
                              <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Summary</label>
                                <div className="p-2 bg-white dark:bg-slate-900 rounded text-xs text-slate-700 dark:text-slate-300">
                                  {d.gitlabSummary}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {d.sysdigEnabled && (
                          <div className="border border-rose-200 dark:border-rose-800 rounded-xl p-4 bg-rose-50/20 dark:bg-rose-950/20">
                            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-3">Sysdig Scanning (Runtime + Registry)</h4>
                            {d.sysdigSeverities && d.sysdigSeverities.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Severity</label>
                                <div className="flex flex-wrap gap-2">
                                  {d.sysdigSeverities.map(sev => (
                                    <span key={sev} className={`px-2 py-1 rounded-lg border text-xs ${getSeverityColor(sev)}`}>
                                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {d.sysdigLinks && d.sysdigLinks.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Links</label>
                                <div className="flex flex-wrap gap-2">
                                  {d.sysdigLinks.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tag text-xs hover:bg-rose-200">
                                      <i className="fas fa-external-link-alt text-xs mr-1"></i>
                                      {url.length > 30 ? url.slice(0, 27) + '...' : url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {d.sysdigFiles && d.sysdigFiles.length > 0 && (
                              <div className="mb-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Files</label>
                                <div className="space-y-2">
                                  {d.sysdigFiles.map((file, i) => {
                                    const jiraAttachment = attachments.find(att => att.filename === file.name);
                                    return (
                                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 rounded text-xs">
                                        <div className="flex items-center gap-2">
                                          <i className={`fas ${getFileIcon(file.name)} text-rose-500`}></i>
                                          <span>{file.name}</span>
                                        </div>
                                        {jiraAttachment && jiraAttachment.id && (
                                          <button
                                            onClick={() => downloadFile(jiraAttachment.id, jiraAttachment.filename)}
                                            disabled={downloadingFile === jiraAttachment.filename}
                                            className="px-2 py-1 bg-primary hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                                          >
                                            <i className={`fas ${downloadingFile === jiraAttachment.filename ? 'fa-spinner fa-spin' : 'fa-download'} text-xs`}></i>
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {d.sysdigSummary && (
                              <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Summary</label>
                                <div className="p-2 bg-white dark:bg-slate-900 rounded text-xs text-slate-700 dark:text-slate-300">
                                  {d.sysdigSummary}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="flex flex-col gap-3 pt-4 border-t-2 border-primary/20">
                      <label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                        <i className="fas fa-comments text-sm"></i> Comments & Feedback
                      </label>
                      {sectionComments[section] && sectionComments[section].length > 0 && (
                        <div className="space-y-3 mb-4">
                          {sectionComments[section].map(comment => (
                            <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <i className="fas fa-user text-primary text-xs"></i>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{comment.userName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(comment.timestamp)}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 ml-10">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Type your comment and press Enter..."
                          value={commentInputs[section] || ''}
                          onChange={e => updateCommentInput(section, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addComment(section); } }}
                          className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => addComment(section)}
                          className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <i className="fas fa-plus text-sm"></i> Add
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">Press Enter or click Add to post your comment.</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-3 sm:gap-4 pt-4 pb-12 sm:pb-20">
        <button
          type="button"
          onClick={onBackToForm}
          className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}

export default FeedbackView;
