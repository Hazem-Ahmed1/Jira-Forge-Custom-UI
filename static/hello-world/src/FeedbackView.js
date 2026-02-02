import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SECTIONS = ['sast', 'sca', 'iac', 'secret', 'container'];
const SEVERITIES = ['information', 'low', 'medium', 'high', 'critical'];

const SECTION_CONFIG = {
  sast: {
    name: 'SAST',
    fullName: 'SAST (Static Application Security Testing)',
    subtitle: 'Static Application Security Testing',
    icon: 'code',
    sectionCard: 'bg-pastel-blue dark:bg-sky-950/30 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-sky-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-sky-600 dark:text-sky-300',
    innerBorder: 'border-sky-100 dark:border-sky-800',
  },
  sca: {
    name: 'Vulnerable Dependencies - Software Composition Analysis',
    fullName: 'Vulnerable Dependencies - SCA (Software Composition Analysis)',
    subtitle: 'SCA',
    iconImg: 'https://res.cloudinary.com/db8xljlgy/image/upload/v1768903645/dependencies_zn1pt1.png',
    sectionCard: 'bg-pastel-green dark:bg-emerald-950/30 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-emerald-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    innerBorder: 'border-emerald-100 dark:border-emerald-800',
  },
  iac: {
    name: 'Infrastructure as Code - Infrastructure Configuration',
    fullName: 'Infrastructure as Code (IaC Configuration)',
    subtitle: 'IaC',
    icon: 'cube',
    sectionCard: 'bg-pastel-yellow dark:bg-amber-950/30 rounded-xl sm:rounded-2xl border border-amber-100 dark:border-amber-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-amber-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-amber-600 dark:text-amber-300',
    innerBorder: 'border-amber-100 dark:border-amber-800',
  },
  secret: {
    name: 'Secret Detection',
    fullName: 'Secret Detection (Sensitive Info/Data Exposure)',
    subtitle: 'Sensitive Info/Data Exposure',
    icon: 'key',
    sectionCard: 'bg-pastel-purple dark:bg-violet-950/30 rounded-xl sm:rounded-2xl border border-violet-100 dark:border-violet-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-violet-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-violet-600 dark:text-violet-300',
    innerBorder: 'border-violet-100 dark:border-violet-800',
  },
  container: {
    name: 'Container Images Scanning',
    fullName: 'Container Images Scanning (Image & Runtime Security)',
    subtitle: 'Image & Runtime Security',
    iconImg: 'https://res.cloudinary.com/db8xljlgy/image/upload/v1768903705/Container_Icon_ybjfyo.png',
    sectionCard: 'bg-pastel-red dark:bg-rose-950/30 rounded-xl sm:rounded-2xl border border-rose-100 dark:border-rose-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-rose-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-rose-600 dark:text-rose-300',
    innerBorder: 'border-rose-100 dark:border-rose-800',
  },
};

const getSeverityColor = (severity) => {
  const colors = {
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    high: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    low: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    information: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700'
  };
  return colors[severity] || colors.information;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (filename) => {
  if (!filename) return 'fa-file';
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    json: 'fa-file-code',
    pdf: 'fa-file-pdf',
    doc: 'fa-file-word',
    docx: 'fa-file-word'
  };
  return icons[ext] || 'fa-file';
};

function FeedbackView({ feedbackData, onBackToForm, isDarkMode, assessmentId }) {
  const [commentInputs, setCommentInputs] = useState({});
  const [sectionComments, setSectionComments] = useState({});
  const [sectionExpanded, setSectionExpanded] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    // Get current user
    invoke('getCurrentUser').then(result => {
      if (result.success) {
        setCurrentUser(result.user);
      }
    });
    
    // Load all comments for all sections
    if (assessmentId) {
      loadAllComments();
      loadAttachments();
    }
  }, [assessmentId]);

  const loadAttachments = async () => {
    try {
      // First, get the assessment to retrieve the issueKey
      const assessmentResult = await invoke('getAssessment', { assessmentId: assessmentId });
      
      if (assessmentResult.success && assessmentResult.assessment?.issueKey) {
        const issueKey = assessmentResult.assessment.issueKey;
        console.log('Loading attachments from Jira issue:', issueKey);
        
        // Fetch attachments from the Jira issue
        const result = await invoke('getIssueAttachments', { issueKey });
        
        if (result.success && result.attachments) {
          console.log('Attachments from Jira:', result.attachments);
          setAttachments(result.attachments);
        } else {
          console.log('No attachments found or failed to fetch');
          setAttachments([]);
        }
      } else {
        console.log('No Jira issue key found for this assessment');
        setAttachments([]);
      }
    } catch (e) {
      console.error('Error loading attachments:', e);
      setAttachments([]);
    }
  };

  const downloadFile = async (attachmentId, filename) => {
    console.log('downloadFile called with:', { attachmentId, filename });
    setDownloadingFile(filename);
    try {
      const result = await invoke('downloadAttachment', { attachmentId });
      
      if (result.success && result.content) {
        // Convert base64 to blob and trigger download
        const byteCharacters = atob(result.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.mimeType || 'application/octet-stream' });
        
        // Create download link
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
        if (result.success) {
          allComments[section] = result.comments || [];
        }
      } catch (e) {
        console.error(`Error loading comments for ${section}:`, e);
      }
    }
    
    // Load comments for container subsections
    try {
      const gitlabResult = await invoke('getComments', { assessmentId, section: 'gitlab' });
      if (gitlabResult.success) {
        allComments.gitlab = gitlabResult.comments || [];
      }
      const sysdigResult = await invoke('getComments', { assessmentId, section: 'sysdig' });
      if (sysdigResult.success) {
        allComments.sysdig = sysdigResult.comments || [];
      }
    } catch (e) {
      console.error('Error loading container subsection comments:', e);
    }
    
    setSectionComments(allComments);
    setIsLoadingComments(false);
  };

  const addComment = async (section) => {
    const commentText = commentInputs[section];
    if (!commentText || !commentText.trim()) {
      return;
    }

    try {
      const result = await invoke('addComment', {
        assessmentId,
        section,
        comment: commentText.trim(),
        userName: currentUser?.displayName || 'Anonymous'
      });

      if (result.success) {
        // Update local comments
        setSectionComments(prev => ({
          ...prev,
          [section]: result.allComments || []
        }));
        // Clear input
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
      minute: '2-digit'
    });
  };

  if (!feedbackData) {
    return null;
  }

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
        {/* Main Question - Read Only */}
        <div className="mt-2 sm:mt-4 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border-2 border-primary/20 shadow-sm opacity-90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <img src="https://cdn-icons-png.flaticon.com/512/8444/8444096.png" alt="Security" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
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

      {/* Subtasks - Read Only with Comments */}
      {mainStatus === 'yes' && (
        <div className="flex flex-col gap-4">
          {SECTIONS.map(section => {
            const c = SECTION_CONFIG[section];
            const d = sectionData[section] || {};
            const expanded = sectionExpanded[section];

            // Only show sections where status is 'yes'
            if (d.status !== 'yes') {
              return null;
            }

            return (
              <div key={section} className={c.sectionCard}>
                <div className="section-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 cursor-pointer" onClick={() => toggleSection(section)}>
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
                    <button type="button" className={`accordion-toggle p-2 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${expanded ? 'rotated' : ''}`}>
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                </div>

                {/* Accordion content - Read Only */}
                <div className={`accordion-content px-4 sm:px-6 ${expanded ? 'expanded' : ''}`}>
                    <div className={`bg-white dark:bg-slate-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border ${c.innerBorder} space-y-6 shadow-sm opacity-90`}>
                      
                      {section !== 'container' ? (
                        <>
                          {/* Severity - Read Only */}
                          {d.severities && d.severities.length > 0 && (
                            <div className="flex flex-col gap-2 sm:gap-3">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Severity</label>
                              <div className="flex flex-wrap gap-3">
                                {d.severities.map(sev => (
                                  <span key={sev} className={`px-3 py-2 rounded-lg border ${getSeverityColor(sev)}`}>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Links - Read Only */}
                          {d.links && d.links.length > 0 && (
                            <div className="flex flex-col gap-2 sm:gap-3">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-link text-sm"></i> Links
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {d.links.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tag hover:bg-primary/10">
                                    <i className="fas fa-external-link-alt text-xs mr-1"></i>
                                    <span className="max-w-[200px] truncate" title={url}>{url.length > 40 ? url.slice(0, 37) + '...' : url}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Files - Downloadable from Jira */}
                          {d.files && d.files.length > 0 && (
                            <div className="flex flex-col gap-2 sm:gap-3">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <i className="fas fa-paperclip text-sm"></i> Files Attached
                              </label>
                              <div className="space-y-2">
                                {d.files.map((file, i) => {
                                  // Find matching attachment from Jira (case-insensitive match)
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

                          {/* Summary - Read Only */}
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
                        /* Container section - GitLab and Sysdig */
                        <div className="space-y-4">
                          {/* GitLab - Read Only */}
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

                          {/* Sysdig - Read Only */}
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

                      {/* Comment Section */}
                      <div className="flex flex-col gap-3 pt-4 border-t-2 border-primary/20">
                        <label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2">
                          <i className="fas fa-comments text-sm"></i> Comments & Feedback
                        </label>

                        {/* Existing Comments */}
                        {sectionComments[section] && sectionComments[section].length > 0 && (
                          <div className="space-y-3 mb-4">
                            {sectionComments[section].map((comment) => (
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

                        {/* Add Comment Input - Styled like link input */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text"
                            placeholder="Type your comment and press Enter..." 
                            value={commentInputs[section] || ''} 
                            onChange={e => updateCommentInput(section, e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                addComment(section);
                              }
                            }}
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

      {/* Submit Feedback Button */}
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
