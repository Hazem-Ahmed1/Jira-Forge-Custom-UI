import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@forge/bridge';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import FeedbackView from './FeedbackView';
import AssessmentListView from './AssessmentListView';

const MAX_LINKS = 15;
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - Increased for better file support
const SECTIONS = ['sast', 'sca', 'iac', 'secret', 'container'];

const SECTION_CONFIG = {
  sast: {
    name: 'SAST',
    fullName: 'SAST (Static Application Security Testing)',
    subtitle: 'Static Application Security Testing',
    icon: 'code',
    sectionCard: 'bg-pastel-blue dark:bg-sky-950/30 rounded-xl sm:rounded-2xl border border-sky-100 dark:border-sky-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-sky-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-sky-600 dark:text-sky-300',
    radioAccent: 'text-sky-600 focus:ring-sky-500',
    addBtn: 'bg-sky-500 hover:bg-sky-600',
    focusRing: 'focus:ring-2 focus:ring-sky-500 focus:border-transparent',
    innerBorder: 'border-sky-100 dark:border-sky-800',
    accordionHover: 'hover:bg-sky-200 dark:hover:bg-sky-800',
  },
  sca: {
    name: 'Vulnerable Dependencies - Software Composition Analysis',
    fullName: 'Vulnerable Dependencies - SCA (Software Composition Analysis)',
    subtitle: 'SCA',
    icon: null,
    iconImg: 'https://res.cloudinary.com/db8xljlgy/image/upload/v1768903645/dependencies_zn1pt1.png',
    sectionCard: 'bg-pastel-green dark:bg-emerald-950/30 rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-emerald-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    radioAccent: 'text-emerald-600 focus:ring-emerald-500',
    addBtn: 'bg-emerald-500 hover:bg-emerald-600',
    focusRing: 'focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
    innerBorder: 'border-emerald-100 dark:border-emerald-800',
    accordionHover: 'hover:bg-emerald-200 dark:hover:bg-emerald-800',
  },
  iac: {
    name: 'Infrastructure as Code - Infrastructure Configuration',
    fullName: 'Infrastructure as Code (IaC Configuration)',
    subtitle: 'IaC',
    icon: 'cube',
    iconImg: null,
    sectionCard: 'bg-pastel-yellow dark:bg-amber-950/30 rounded-xl sm:rounded-2xl border border-amber-100 dark:border-amber-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-amber-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-amber-600 dark:text-amber-300',
    radioAccent: 'text-amber-600 focus:ring-amber-500',
    addBtn: 'bg-amber-500 hover:bg-amber-600',
    focusRing: 'focus:ring-2 focus:ring-amber-500 focus:border-transparent',
    innerBorder: 'border-amber-100 dark:border-amber-800',
    accordionHover: 'hover:bg-amber-200 dark:hover:bg-amber-800',
  },
  secret: {
    name: 'Secret Detection',
    fullName: 'Secret Detection (Sensitive Info/Data Exposure)',
    subtitle: 'Sensitive Info/Data Exposure',
    icon: 'key',
    sectionCard: 'bg-pastel-purple dark:bg-violet-950/30 rounded-xl sm:rounded-2xl border border-violet-100 dark:border-violet-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-violet-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-violet-600 dark:text-violet-300',
    radioAccent: 'text-violet-600 focus:ring-violet-500',
    addBtn: 'bg-violet-500 hover:bg-violet-600',
    focusRing: 'focus:ring-2 focus:ring-violet-500 focus:border-transparent',
    innerBorder: 'border-violet-100 dark:border-violet-800',
    accordionHover: 'hover:bg-violet-200 dark:hover:bg-violet-800',
  },
  container: {
    name: 'Container Images Scanning',
    fullName: 'Container Images Scanning (Image & Runtime Security)',
    subtitle: 'Image & Runtime Security',
    icon: null,
    iconImg: 'https://res.cloudinary.com/db8xljlgy/image/upload/v1768903705/Container_Icon_ybjfyo.png',
    sectionCard: 'bg-pastel-red dark:bg-rose-950/30 rounded-xl sm:rounded-2xl border border-rose-100 dark:border-rose-900 transition-all shadow-sm overflow-hidden',
    iconBox: 'bg-white dark:bg-rose-900 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm',
    iconColor: 'text-rose-600 dark:text-rose-300',
    radioAccent: 'text-rose-600 focus:ring-rose-500',
    addBtn: 'bg-rose-500 hover:bg-rose-600',
    focusRing: 'focus:ring-2 focus:ring-rose-500 focus:border-transparent',
    innerBorder: 'border-rose-100 dark:border-rose-800',
    accordionHover: 'hover:bg-rose-200 dark:hover:bg-rose-800',
  },
};

const SEVERITIES = ['information', 'low', 'medium', 'high', 'critical'];

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

function App() {
  const [viewMode, setViewMode] = useState('form'); // 'form', 'list', or 'feedback'
  const [feedbackData, setFeedbackData] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [comments, setComments] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') === 'true'));
  const [mainStatus, setMainStatus] = useState(null);
  const [sectionData, setSectionData] = useState({
    sast: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
    sca: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
    iac: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
    secret: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
    container: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
  });
  const [gitlabData, setGitlabData] = useState({ enabled: false, severities: [], links: [], files: [], summary: '', expanded: false });
  const [sysdigData, setSysdigData] = useState({ enabled: false, severities: [], links: [], files: [], summary: '', expanded: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkInputs, setLinkInputs] = useState({ sast: '', sca: '', iac: '', secret: '', container: '', gitlab: '', sysdig: '' });
  // Track if user has already submitted an assessment for this project
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        const [projectResult, userResult, draftResult, submissionCheckResult] = await Promise.all([
          invoke('getProjectInfo'),
          invoke('getCurrentUser'),
          invoke('loadDraft'),
          invoke('checkUserSubmission'), // Check if user already submitted
        ]);
        if (projectResult.success) setProjectInfo(projectResult.project);
        if (userResult.success) setUserInfo(userResult.user);
        
        // Check if user has already submitted
        if (submissionCheckResult.success && submissionCheckResult.hasSubmitted) {
          setHasExistingSubmission(true);
          setExistingAssessmentId(submissionCheckResult.existingAssessment?.assessmentId);
          // If user has already submitted, show the list view
          setViewMode('list');
        } else if (draftResult.success && draftResult.draft) {
          loadDraftData(draftResult.draft);
          showToast('Draft restored', 'info');
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(() => saveDraft(), 2000);
    return () => clearTimeout(t);
  }, [mainStatus, sectionData, gitlabData, sysdigData, isLoading]);

  const loadDraftData = (draft) => {
    if (draft.mainStatus) setMainStatus(draft.mainStatus);
    if (draft.sectionData) {
      // Ensure files arrays exist and filter out invalid file objects for backward compatibility
      const normalizedData = {};
      Object.keys(draft.sectionData).forEach(key => {
        const files = (draft.sectionData[key].files || []).filter(f => f && f.name);
        normalizedData[key] = {
          ...draft.sectionData[key],
          files: files
        };
      });
      setSectionData(normalizedData);
    }
    if (draft.gitlabData) {
      const files = (draft.gitlabData.files || []).filter(f => f && f.name);
      setGitlabData({ ...draft.gitlabData, files });
    }
    if (draft.sysdigData) {
      const files = (draft.sysdigData.files || []).filter(f => f && f.name);
      setSysdigData({ ...draft.sysdigData, files });
    }
  };

  const saveDraft = async () => {
    try {
      await invoke('saveDraft', { draftData: { mainStatus, sectionData, gitlabData, sysdigData } });
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark', next);
    setIsDarkMode(next);
  };

  const updateSectionStatus = (section, status) => {
    setSectionData(prev => ({
      ...prev,
      [section]: { ...prev[section], status, expanded: status === 'yes' },
    }));
    clearError(section);
  };

  const updateSectionSeverity = (section, severity) => {
    setSectionData(prev => {
      const cur = prev[section].severities;
      const next = cur.includes(severity) ? cur.filter(s => s !== severity) : [...cur, severity];
      return { ...prev, [section]: { ...prev[section], severities: next } };
    });
  };

  const updateSectionSummary = (section, summary) => {
    setSectionData(prev => ({ ...prev, [section]: { ...prev[section], summary } }));
  };

  const updateGitlabSummary = (summary) => {
    setGitlabData(prev => ({ ...prev, summary }));
  };

  const updateSysdigSummary = (summary) => {
    setSysdigData(prev => ({ ...prev, summary }));
  };

  const toggleSectionExpanded = (section) => {
    if (sectionData[section].status === 'yes') {
      setSectionData(prev => ({ ...prev, [section]: { ...prev[section], expanded: !prev[section].expanded } }));
    }
  };

  const addLink = (section, isSubSection = false) => {
    const raw = linkInputs[section];
    if (!raw || !raw.trim()) {
      showToast('Please enter a URL', 'error');
      return;
    }
    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try {
      new URL(url);
    } catch {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    if (isSubSection) {
      const data = section === 'gitlab' ? gitlabData : sysdigData;
      const set = section === 'gitlab' ? setGitlabData : setSysdigData;
      if (data.links.length >= MAX_LINKS) {
        showToast(`Maximum ${MAX_LINKS} links allowed`, 'error');
        return;
      }
      set(prev => ({ ...prev, links: [...prev.links, url] }));
    } else {
      if (sectionData[section].links.length >= MAX_LINKS) {
        showToast(`Maximum ${MAX_LINKS} links allowed`, 'error');
        return;
      }
      setSectionData(prev => ({
        ...prev,
        [section]: { ...prev[section], links: [...prev[section].links, url] },
      }));
    }
    setLinkInputs(prev => ({ ...prev, [section]: '' }));
  };

  const removeLink = (section, index, isSubSection = false) => {
    if (isSubSection) {
      const set = section === 'gitlab' ? setGitlabData : setSysdigData;
      set(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
    } else {
      setSectionData(prev => ({
        ...prev,
        [section]: { ...prev[section], links: prev[section].links.filter((_, i) => i !== index) },
      }));
    }
  };

  // File upload handlers
  const handleFiles = (section, files, isSubSection = false) => {
    const allowedTypes = ['.json', '.pdf', '.doc', '.docx'];
    const mimeTypes = ['application/json', 'application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    Array.from(files).forEach(file => {
      const targetData = isSubSection 
        ? (section === 'gitlab' ? gitlabData : sysdigData)
        : sectionData[section];
      
      if ((targetData.files || []).length >= MAX_FILES) {
        showToast(`Maximum ${MAX_FILES} files allowed for ${section.toUpperCase()}`, 'error');
        return;
      }
      
      const isValidType = mimeTypes.includes(file.type) || 
        allowedTypes.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        showToast(`Invalid file type: ${file.name}. Allowed: JSON, PDF, DOC, DOCX`, 'error');
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File too large: ${file.name}. Maximum size is 5MB`, 'error');
        return;
      }
      
      if ((targetData.files || []).some(f => f.name === file.name)) {
        showToast(`File already added: ${file.name}`, 'error');
        return;
      }
      
      // Read file and convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        const fileObj = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64Data // base64 encoded content
        };
        
        if (isSubSection) {
          const setData = section === 'gitlab' ? setGitlabData : setSysdigData;
          setData(prev => ({ ...prev, files: [...(prev.files || []), fileObj] }));
        } else {
          setSectionData(prev => ({
            ...prev,
            [section]: { ...prev[section], files: [...(prev[section].files || []), fileObj] }
          }));
        }
        showToast(`File added: ${file.name}`, 'success');
      };
      reader.onerror = () => {
        showToast(`Failed to read file: ${file.name}`, 'error');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (section, index, isSubSection = false) => {
    if (isSubSection) {
      const setData = section === 'gitlab' ? setGitlabData : setSysdigData;
      setData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
    } else {
      setSectionData(prev => ({
        ...prev,
        [section]: { ...prev[section], files: prev[section].files.filter((_, i) => i !== index) }
      }));
    }
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

  const validateForm = () => {
    const next = {};
    if (!mainStatus) next['main-question'] = 'Please select Yes or No';
    if (mainStatus === 'yes') {
      SECTIONS.forEach(s => {
        if (!sectionData[s].status) next[s] = 'Please select Yes or No';
      });
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearError = (key) => {
    setErrors(prev => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) setShowModal(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    setIsSubmitting(true);
    try {
      const formData = { mainStatus, sections: {} };
      if (mainStatus === 'yes') {
        SECTIONS.forEach(s => {
          formData.sections[s] = {
            status: sectionData[s].status,
            severities: sectionData[s].severities,
            links: sectionData[s].links,
            files: (sectionData[s].files || []).map(f => ({ name: f.name, size: f.size, type: f.type, data: f.data })),
            summary: sectionData[s].summary,
          };
          if (s === 'container') {
            formData.sections[s].gitlabEnabled = gitlabData.enabled;
            formData.sections[s].gitlabSeverities = gitlabData.severities;
            formData.sections[s].gitlabLinks = gitlabData.links;
            formData.sections[s].gitlabFiles = (gitlabData.files || []).map(f => ({ name: f.name, size: f.size, type: f.type, data: f.data }));
            formData.sections[s].gitlabSummary = gitlabData.summary;
            formData.sections[s].sysdigEnabled = sysdigData.enabled;
            formData.sections[s].sysdigSeverities = sysdigData.severities;
            formData.sections[s].sysdigLinks = sysdigData.links;
            formData.sections[s].sysdigFiles = (sysdigData.files || []).map(f => ({ name: f.name, size: f.size, type: f.type, data: f.data }));
            formData.sections[s].sysdigSummary = sysdigData.summary;
          }
        });
      }
      const result = await invoke('submitAssessment', { formData });
      if (result.success) {
        showToast(`Assessment submitted! ID: ${result.assessment.id}`, 'success');
        await invoke('clearDraft');
        
        // Mark that user now has a submission
        setHasExistingSubmission(true);
        setExistingAssessmentId(result.assessment.id);
        
        // Switch to list view to see all assessments
        setViewMode('list');
        
        // Reset the form
        resetForm();
      } else {
        showToast(result.error || 'Failed to submit assessment', 'error');
      }
    } catch (e) {
      console.error('Submit error', e);
      showToast('Failed to submit assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMainStatus(null);
    setSectionData({
      sast: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
      sca: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
      iac: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
      secret: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
      container: { status: null, severities: [], links: [], files: [], summary: '', expanded: false },
    });
    setGitlabData({ enabled: false, severities: [], links: [], files: [], summary: '', expanded: false });
    setSysdigData({ enabled: false, severities: [], links: [], files: [], summary: '', expanded: false });
    setLinkInputs({ sast: '', sca: '', iac: '', secret: '', container: '', gitlab: '', sysdig: '' });
    setErrors({});
  };

  /**
   * Handle selecting an assessment to view its details
   * Now uses assessmentId instead of issueKey since we no longer create Jira issues
   */
  const handleSelectAssessment = async (assessmentId) => {
    try {
      const result = await invoke('getAssessment', { assessmentId });
      if (result.success && result.assessment) {
        setAssessmentId(assessmentId);
        setFeedbackData({
          mainStatus: result.assessment.formData.mainStatus,
          sections: result.assessment.formData.sections,
          submitterName: result.assessment.submitterName,
          submittedAt: result.assessment.submittedAt,
          canDelete: result.assessment.canDelete
        });
        setViewMode('feedback');
      } else {
        showToast('Failed to load assessment', 'error');
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
      showToast('Failed to load assessment', 'error');
    }
  };

  /**
   * Refresh the submission status after a deletion
   * This allows user to submit again if they deleted their assessment
   */
  const refreshSubmissionStatus = async () => {
    try {
      const result = await invoke('checkUserSubmission');
      if (result.success) {
        setHasExistingSubmission(result.hasSubmitted);
        setExistingAssessmentId(result.existingAssessment?.assessmentId || null);
      }
    } catch (e) {
      console.error('Error checking submission status:', e);
    }
  };

  const handleDiscard = async () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      resetForm();
      await invoke('clearDraft');
      showToast('Form has been reset', 'info');
    }
  };

  const generateSummary = () => {
    // If no issues found, show green message
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
    
    const out = [];
    if (mainStatus === 'yes') {
      SECTIONS.forEach(s => {
        const d = sectionData[s];
        const c = SECTION_CONFIG[s];
        out.push(
          <div key={s} className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{c.fullName}</h4>
            <p className={`font-bold ${d.status === 'yes' ? 'text-red-600' : 'text-green-600'}`}>
              {d.status === 'yes' ? 'Yes - Issues Found' : 'No Issues'}
            </p>
            {d.status === 'yes' && (
              <div className="mt-2 ml-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {d.severities.length > 0 && <p><strong>Severity:</strong> {d.severities.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(', ')}</p>}
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
    return out;
  };

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#0d141b] dark:text-slate-200 transition-colors duration-200 flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-[#0d141b] dark:text-slate-200 transition-colors duration-200">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4 text-primary">
          <img src="https://harestechnology.com/images/services/code-review.png" alt="Secure Code" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          <h2 className="text-[#0d141b] dark:text-white text-base sm:text-lg font-bold leading-tight tracking-tight">
            Secure Code & App Infrastructure Review
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Show New Assessment button only if user hasn't submitted yet */}
          {(viewMode === 'list' || viewMode === 'feedback') && !hasExistingSubmission && (
            <button 
              onClick={() => setViewMode('form')}
              className="p-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
              title="New Assessment"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
          {(viewMode === 'form' || viewMode === 'feedback') && (
            <button 
              onClick={() => { setViewMode('list'); refreshSubmissionStatus(); }}
              className="p-2 rounded-lg transition-colors bg-slate-500 hover:bg-slate-600 text-white"
              title="View Assessments"
            >
              <i className="fas fa-list"></i>
            </button>
          )}
          <button type="button" onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl text-slate-600 dark:text-slate-300`}></i>
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        {viewMode === 'list' ? (
          <AssessmentListView 
            onSelectAssessment={handleSelectAssessment}
            isDarkMode={isDarkMode}
            showToast={showToast}
            onDeleteSuccess={refreshSubmissionStatus}
          />
        ) : viewMode === 'feedback' ? (
          <FeedbackView 
            feedbackData={feedbackData} 
            assessmentId={assessmentId}
            onBackToForm={() => { setViewMode('list'); refreshSubmissionStatus(); }} 
            isDarkMode={isDarkMode}
          />
        ) : hasExistingSubmission ? (
          /* Show message if user has already submitted */
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
                  onClick={() => setViewMode('list')}
                  className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-list mr-2"></i>
                  View All Assessments
                </button>
                {existingAssessmentId && (
                  <button
                    type="button"
                    onClick={() => handleSelectAssessment(existingAssessmentId)}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    View Your Submission
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[900px] flex-1 gap-6 sm:gap-8">
          <div className="flex flex-col gap-3 sm:gap-4 mb-2">
            <h1 className="text-[#0d141b] dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-center">
              Secure Code & App Infrastructure Review
            </h1>
            {/* Main Question */}
            <div className={`mt-2 sm:mt-4 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border-2 ${errors['main-question'] ? 'border-red-500' : 'border-primary/20'} shadow-sm`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                  <img src="https://cdn-icons-png.flaticon.com/512/8444/8444096.png" alt="Security" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                  Are there any security issues or vulnerabilities?
                </h2>
                <div className="radio-container flex items-center gap-3 sm:gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-full px-4 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="main_status" value="yes" checked={mainStatus === 'yes'} onChange={() => { setMainStatus('yes'); clearError('main-question'); }} className="w-5 h-5 text-primary focus:ring-primary border-slate-300" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="main_status" value="no" checked={mainStatus === 'no'} onChange={() => { setMainStatus('no'); clearError('main-question'); }} className="w-5 h-5 text-primary focus:ring-primary border-slate-300" />
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

          {/* Subtasks */}
          {mainStatus === 'yes' && (
            <div className="flex flex-col gap-4">
              {SECTIONS.map(section => {
                const c = SECTION_CONFIG[section];
                const d = sectionData[section];
                return (
                  <div key={section} className={`${c.sectionCard} ${errors[section] ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
                    <div className="section-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 cursor-pointer" onClick={() => toggleSectionExpanded(section)}>
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
                            <input type="radio" name={`${section}_status`} value="yes" checked={d.status === 'yes'} onChange={() => updateSectionStatus(section, 'yes')} className={`w-4 h-4 border-slate-300 ${c.radioAccent}`} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`${section}_status`} value="no" checked={d.status === 'no'} onChange={() => updateSectionStatus(section, 'no')} className={`w-4 h-4 border-slate-300 ${c.radioAccent}`} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">No</span>
                          </label>
                        </div>
                        {d.status === 'yes' && (
                          <button type="button" className={`accordion-toggle p-2 rounded-lg transition-colors ${c.accordionHover} ${d.expanded ? 'rotated' : ''}`} onClick={e => { e.stopPropagation(); toggleSectionExpanded(section); }}>
                            <i className="fas fa-chevron-down"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Accordion content: always in DOM when status=yes, visibility via .accordion-content.expanded */}
                    {d.status === 'yes' && (
                      <div className={`accordion-content px-4 sm:px-6 ${d.expanded ? 'expanded' : ''}`}>
                        <div className={`bg-white dark:bg-slate-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border ${c.innerBorder} space-y-6 shadow-sm`}>
                          {/* Container: GitLab & Sysdig sub-accordions - NO regular inputs for container */}
                          {section === 'container' ? (
                            <div className="space-y-4">
                              {/* GitLab */}
                              <div className="border border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/30">
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={gitlabData.enabled} onChange={e => { const on = e.target.checked; setGitlabData(prev => ({ ...prev, enabled: on, expanded: on, ...(on ? {} : { severities: [], links: [], summary: '' }) })); if (!on) setLinkInputs(prev => ({ ...prev, gitlab: '' })); }} className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-5 h-5" />
                                    <div>
                                      <span className="text-sm font-bold text-rose-900 dark:text-rose-100">Container Scanning (Static) – GitLab CI</span>
                                      <p className="text-xs text-rose-600/70 dark:text-rose-300/60">Static container image analysis</p>
                                    </div>
                                  </label>
                                  {gitlabData.enabled && (
                                    <button type="button" className={`accordion-toggle p-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors ${gitlabData.expanded ? 'rotated' : ''}`} onClick={() => setGitlabData(prev => ({ ...prev, expanded: !prev.expanded }))}>
                                      <i className="fas fa-chevron-down"></i>
                                    </button>
                                  )}
                                </div>
                                {gitlabData.enabled && (
                                  <div className={`sub-accordion-content border-t border-rose-200 dark:border-rose-800 ${gitlabData.expanded ? 'expanded' : ''}`}>
                                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900/30">
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Severity</label>
                                        <div className="flex flex-wrap gap-3">
                                          {SEVERITIES.map(sev => (
                                            <label key={sev} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${gitlabData.severities.includes(sev) ? getSeverityColor(sev) : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                              <input type="checkbox" checked={gitlabData.severities.includes(sev)} onChange={() => setGitlabData(prev => ({ ...prev, severities: prev.severities.includes(sev) ? prev.severities.filter(x => x !== sev) : [...prev.severities, sev] }))} className={`rounded ${sev === 'critical' ? 'text-red-600 focus:ring-red-500' : sev === 'high' ? 'text-orange-600 focus:ring-orange-500' : sev === 'medium' ? 'text-yellow-600 focus:ring-yellow-500' : sev === 'low' ? 'text-blue-600 focus:ring-blue-500' : 'text-gray-600 focus:ring-gray-500'}`} />
                                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i className="fas fa-link text-sm"></i> Links (Max 15)</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <input 
                                            type="text" 
                                            placeholder="Type URL and press Enter..." 
                                            value={linkInputs.gitlab || ''} 
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setLinkInputs(prev => ({ ...prev, gitlab: val }));
                                            }} 
                                            onKeyDown={(e) => { 
                                              if (e.key === 'Enter') { 
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                addLink('gitlab', true); 
                                              } 
                                            }} 
                                            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
                                          />
                                          <button type="button" onClick={() => addLink('gitlab', true)} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1 whitespace-nowrap"> <i className="fas fa-plus text-sm"></i> Add </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[20px]">
                                          {gitlabData.links.map((url, i) => (
                                            <span key={i} className="tag"><span className="max-w-[200px] truncate" title={url}>{url.length > 40 ? url.slice(0, 37) + '...' : url}</span><button type="button" onClick={() => removeLink('gitlab', i, true)}><i className="fas fa-times text-xs"></i></button></span>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                          <i className="fas fa-paperclip text-sm"></i> Files Attach (Max 5)
                                        </label>
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors"
                                          onClick={() => document.getElementById('gitlab-file-input').click()}
                                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-rose-400', 'bg-rose-50/50'); }}
                                          onDragLeave={(e) => { e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50/50'); }}
                                          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50/50'); handleFiles('gitlab', e.dataTransfer.files, true); }}
                                        >
                                          <input type="file" id="gitlab-file-input" className="hidden" multiple accept=".json,.pdf,.doc,.docx" onChange={(e) => handleFiles('gitlab', e.target.files, true)} />
                                          <i className="fas fa-cloud-upload-alt text-2xl text-slate-400"></i>
                                          <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-500">Max 5 files (JSON, PDF, DOC, DOCX) - 5MB each</p>
                                          </div>
                                        </div>
                                        {(gitlabData.files || []).filter(file => file && file.name).map((file, i) => (
                                          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <i className={`fas ${getFileIcon(file.name)} text-rose-500`}></i>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name || 'Unknown file'}</p>
                                                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                              </div>
                                            </div>
                                            <button type="button" onClick={() => removeFile('gitlab', i, true)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                                              <i className="fas fa-trash text-sm text-red-500"></i>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i className="fas fa-align-left text-sm"></i> Summary</label>
                                        <textarea placeholder="Describe the GitLab CI findings..." value={gitlabData.summary} onChange={e => updateGitlabSummary(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[80px] p-3 text-sm focus:ring-rose-500 focus:border-rose-500" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Sysdig */}
                              <div className="border border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/30">
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={sysdigData.enabled} onChange={e => { const on = e.target.checked; setSysdigData(prev => ({ ...prev, enabled: on, expanded: on, ...(on ? {} : { severities: [], links: [], summary: '' }) })); if (!on) setLinkInputs(prev => ({ ...prev, sysdig: '' })); }} className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-5 h-5" />
                                    <div>
                                      <span className="text-sm font-bold text-rose-900 dark:text-rose-100">Sysdig Scanning (Runtime + Registry)</span>
                                      <p className="text-xs text-rose-600/70 dark:text-rose-300/60">Runtime and registry scanning</p>
                                    </div>
                                  </label>
                                  {sysdigData.enabled && (
                                    <button type="button" className={`accordion-toggle p-2 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors ${sysdigData.expanded ? 'rotated' : ''}`} onClick={() => setSysdigData(prev => ({ ...prev, expanded: !prev.expanded }))}>
                                      <i className="fas fa-chevron-down"></i>
                                    </button>
                                  )}
                                </div>
                                {sysdigData.enabled && (
                                  <div className={`sub-accordion-content border-t border-rose-200 dark:border-rose-800 ${sysdigData.expanded ? 'expanded' : ''}`}>
                                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900/30">
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Severity</label>
                                        <div className="flex flex-wrap gap-3">
                                          {SEVERITIES.map(sev => (
                                            <label key={sev} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${sysdigData.severities.includes(sev) ? getSeverityColor(sev) : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                              <input type="checkbox" checked={sysdigData.severities.includes(sev)} onChange={() => setSysdigData(prev => ({ ...prev, severities: prev.severities.includes(sev) ? prev.severities.filter(x => x !== sev) : [...prev.severities, sev] }))} className={`rounded ${sev === 'critical' ? 'text-red-600 focus:ring-red-500' : sev === 'high' ? 'text-orange-600 focus:ring-orange-500' : sev === 'medium' ? 'text-yellow-600 focus:ring-yellow-500' : sev === 'low' ? 'text-blue-600 focus:ring-blue-500' : 'text-gray-600 focus:ring-gray-500'}`} />
                                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i className="fas fa-link text-sm"></i> Links (Max 15)</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <input 
                                            type="text" 
                                            placeholder="Type URL and press Enter..." 
                                            value={linkInputs.sysdig || ''} 
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setLinkInputs(prev => ({ ...prev, sysdig: val }));
                                            }} 
                                            onKeyDown={(e) => { 
                                              if (e.key === 'Enter') { 
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                addLink('sysdig', true); 
                                              } 
                                            }} 
                                            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
                                          />
                                          <button type="button" onClick={() => addLink('sysdig', true)} className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1 whitespace-nowrap"> <i className="fas fa-plus text-sm"></i> Add </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[20px]">
                                          {sysdigData.links.map((url, i) => (
                                            <span key={i} className="tag"><span className="max-w-[200px] truncate" title={url}>{url.length > 40 ? url.slice(0, 37) + '...' : url}</span><button type="button" onClick={() => removeLink('sysdig', i, true)}><i className="fas fa-times text-xs"></i></button></span>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                          <i className="fas fa-paperclip text-sm"></i> Files Attach (Max 5)
                                        </label>
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors"
                                          onClick={() => document.getElementById('sysdig-file-input').click()}
                                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-rose-400', 'bg-rose-50/50'); }}
                                          onDragLeave={(e) => { e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50/50'); }}
                                          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50/50'); handleFiles('sysdig', e.dataTransfer.files, true); }}
                                        >
                                          <input type="file" id="sysdig-file-input" className="hidden" multiple accept=".json,.pdf,.doc,.docx" onChange={(e) => handleFiles('sysdig', e.target.files, true)} />
                                          <i className="fas fa-cloud-upload-alt text-2xl text-slate-400"></i>
                                          <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-500">Max 5 files (JSON, PDF, DOC, DOCX) - 5MB each</p>
                                          </div>
                                        </div>
                                        {(sysdigData.files || []).filter(file => file && file.name).map((file, i) => (
                                          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                              <i className={`fas ${getFileIcon(file.name)} text-rose-500`}></i>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name || 'Unknown file'}</p>
                                                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                              </div>
                                            </div>
                                            <button type="button" onClick={() => removeFile('sysdig', i, true)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                                              <i className="fas fa-trash text-sm text-red-500"></i>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><i className="fas fa-align-left text-sm"></i> Summary</label>
                                        <textarea placeholder="Describe the Sysdig findings..." value={sysdigData.summary} onChange={e => updateSysdigSummary(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[80px] p-3 text-sm focus:ring-rose-500 focus:border-rose-500" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Regular section inputs for non-container sections */
                            <>
                              <div className="flex flex-col gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">Severity</label>
                                <div className="flex flex-wrap gap-3">
                                  {SEVERITIES.map(sev => (
                                    <label key={sev} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border transition-all ${d.severities.includes(sev) ? getSeverityColor(sev) : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                      <input type="checkbox" checked={d.severities.includes(sev)} onChange={() => updateSectionSeverity(section, sev)} className={`rounded ${sev === 'critical' ? 'text-red-600 focus:ring-red-500' : sev === 'high' ? 'text-orange-600 focus:ring-orange-500' : sev === 'medium' ? 'text-yellow-600 focus:ring-yellow-500' : sev === 'low' ? 'text-blue-600 focus:ring-blue-500' : 'text-gray-600 focus:ring-gray-500'}`} />
                                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                  <i className="fas fa-link text-sm"></i> Links (Max 15)
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Type URL and press Enter..." 
                                    value={linkInputs[section] || ''} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setLinkInputs(prev => ({ ...prev, [section]: val }));
                                    }} 
                                    onKeyDown={(e) => { 
                                      if (e.key === 'Enter') { 
                                        e.preventDefault(); 
                                        e.stopPropagation();
                                        addLink(section); 
                                      } 
                                    }} 
                                    className={`flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 text-sm ${c.focusRing}`} 
                                  />
                                  <button type="button" onClick={() => addLink(section)} className={`px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${c.addBtn}`}>
                                    <i className="fas fa-plus text-sm"></i> Add
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[24px]">
                                  {d.links.map((url, i) => (
                                    <span key={i} className="tag">
                                      <span className="max-w-[200px] truncate" title={url}>{url.length > 40 ? url.slice(0, 37) + '...' : url}</span>
                                      <button type="button" onClick={() => removeLink(section, i)}><i className="fas fa-times text-xs"></i></button>
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
                                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                                    handleFiles(section, e.dataTransfer.files, false);
                                  }}
                                >
                                  <input 
                                    type="file" 
                                    id={`${section}-file-input`}
                                    className="hidden" 
                                    multiple 
                                    accept=".json,.pdf,.doc,.docx"
                                    onChange={(e) => handleFiles(section, e.target.files, false)}
                                  />
                                  <i className="fas fa-cloud-upload-alt text-2xl text-slate-400"></i>
                                  <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500">Max 5 files (JSON, PDF, DOC, DOCX) - 5MB each</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {(d.files || []).filter(file => file && file.name).map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <div className="flex items-center gap-3">
                                        <i className={`fas ${getFileIcon(file.name)} text-slate-400`}></i>
                                        <div>
                                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name || 'Unknown file'}</p>
                                          <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                        </div>
                                      </div>
                                      <button type="button" onClick={() => removeFile(section, i, false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        <i className="fas fa-trash text-slate-400 hover:text-red-500"></i>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                  <i className="fas fa-align-left text-sm"></i> Summary
                                </label>
                                <textarea placeholder={`Provide a detailed description of the ${c.name} findings...`} value={d.summary} onChange={e => updateSectionSummary(section, e.target.value)} className={`w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[100px] p-3 text-sm ${c.focusRing}`} />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error message for this section */}
                    {errors[section] && (
                      <div className="px-4 pb-4">
                        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                          <i className="fas fa-exclamation-circle text-sm"></i>
                          <span>{errors[section]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 pb-12 sm:pb-20">
            <button type="button" onClick={handleDiscard} className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm sm:text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Discard Draft
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-primary text-white font-black text-sm sm:text-base shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (<><span className="spinner small" />Submitting...</>) : 'Submit'}
            </button>
          </div>
        </form>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <i className="fas fa-eye text-primary"></i>
                Review Your Submission
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i className="fas fa-times text-slate-400 hover:text-slate-600"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-slate-600 dark:text-slate-300 mb-4">Please review the data you entered before submitting:</p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 max-h-[50vh] overflow-y-auto space-y-4">{generateSummary()}</div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="button" onClick={confirmSubmit} className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-colors">Confirm & Submit</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default App;
