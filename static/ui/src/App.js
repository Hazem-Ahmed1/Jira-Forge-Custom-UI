import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@forge/bridge';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { SECTIONS, MAX_LINKS, MAX_FILES, MAX_FILE_SIZE } from './constants/sections';
import AppHeader from './components/AppHeader';
import Toast from './components/Toast';
import AlreadySubmitted from './components/AlreadySubmitted';
import ConfirmSubmitModal from './components/ConfirmSubmitModal';
import FormView from './views/FormView';
import AssessmentListView from './views/AssessmentListView';
import FeedbackView from './views/FeedbackView';

const EMPTY_SECTION = { status: null, severities: [], links: [], files: [], summary: '', expanded: false };
const EMPTY_SCANNER = { enabled: false, severities: [], links: [], files: [], summary: '', expanded: false };
const EMPTY_LINK_INPUTS = { sast: '', sca: '', iac: '', secret: '', container: '', gitlab: '', sysdig: '' };

function buildEmptySectionData() {
  return SECTIONS.reduce((acc, s) => ({ ...acc, [s]: { ...EMPTY_SECTION } }), {});
}

function App() {
  const [viewMode, setViewMode] = useState('form');
  const [feedbackData, setFeedbackData] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('darkMode') === 'true'
  );
  const [mainStatus, setMainStatus] = useState(null);
  const [sectionData, setSectionData] = useState(buildEmptySectionData());
  const [gitlabData, setGitlabData] = useState({ ...EMPTY_SCANNER });
  const [sysdigData, setSysdigData] = useState({ ...EMPTY_SCANNER });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkInputs, setLinkInputs] = useState({ ...EMPTY_LINK_INPUTS });
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState(null);

  // ─── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(savedDarkMode);
        document.documentElement.classList.toggle('dark', savedDarkMode);

        const [draftResult, submissionCheckResult] = await Promise.all([
          invoke('loadDraft'),
          invoke('checkUserSubmission'),
        ]);

        if (submissionCheckResult.success && submissionCheckResult.hasSubmitted) {
          setHasExistingSubmission(true);
          setExistingAssessmentId(submissionCheckResult.existingAssessment?.assessmentId);
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

  // Auto-save draft every 2 seconds after form changes
  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(() => saveDraft(), 2000);
    return () => clearTimeout(t);
  }, [mainStatus, sectionData, gitlabData, sysdigData, isLoading]);

  // ─── Draft ────────────────────────────────────────────────────────────────

  const loadDraftData = (draft) => {
    if (draft.mainStatus) setMainStatus(draft.mainStatus);
    if (draft.sectionData) {
      const normalized = {};
      Object.keys(draft.sectionData).forEach(key => {
        const files = (draft.sectionData[key].files || []).filter(f => f && f.name);
        normalized[key] = { ...draft.sectionData[key], files };
      });
      setSectionData(normalized);
    }
    if (draft.gitlabData) {
      setGitlabData({ ...draft.gitlabData, files: (draft.gitlabData.files || []).filter(f => f && f.name) });
    }
    if (draft.sysdigData) {
      setSysdigData({ ...draft.sysdigData, files: (draft.sysdigData.files || []).filter(f => f && f.name) });
    }
  };

  const saveDraft = async () => {
    try {
      await invoke('saveDraft', { draftData: { mainStatus, sectionData, gitlabData, sysdigData } });
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  // ─── UI Helpers ───────────────────────────────────────────────────────────

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

  const clearError = (key) => {
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ─── Section State Handlers ───────────────────────────────────────────────

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

  const toggleSectionExpanded = (section) => {
    if (sectionData[section].status === 'yes') {
      setSectionData(prev => ({ ...prev, [section]: { ...prev[section], expanded: !prev[section].expanded } }));
    }
  };

  // ─── Link Handlers ────────────────────────────────────────────────────────

  const addLink = (section, isSubSection = false) => {
    const raw = linkInputs[section];
    if (!raw || !raw.trim()) { showToast('Please enter a URL', 'error'); return; }
    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch { showToast('Please enter a valid URL', 'error'); return; }

    if (isSubSection) {
      const data = section === 'gitlab' ? gitlabData : sysdigData;
      const set = section === 'gitlab' ? setGitlabData : setSysdigData;
      if (data.links.length >= MAX_LINKS) { showToast(`Maximum ${MAX_LINKS} links allowed`, 'error'); return; }
      set(prev => ({ ...prev, links: [...prev.links, url] }));
    } else {
      if (sectionData[section].links.length >= MAX_LINKS) { showToast(`Maximum ${MAX_LINKS} links allowed`, 'error'); return; }
      setSectionData(prev => ({ ...prev, [section]: { ...prev[section], links: [...prev[section].links, url] } }));
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

  const handleLinkInputChange = (section, value) => {
    setLinkInputs(prev => ({ ...prev, [section]: value }));
  };

  // ─── File Handlers ────────────────────────────────────────────────────────

  const handleFiles = (section, files, isSubSection = false) => {
    const allowedTypes = ['.json', '.pdf', '.doc', '.docx'];
    const mimeTypes = [
      'application/json',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

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

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileObj = { name: file.name, size: file.size, type: file.type, data: e.target.result };
        if (isSubSection) {
          const setData = section === 'gitlab' ? setGitlabData : setSysdigData;
          setData(prev => ({ ...prev, files: [...(prev.files || []), fileObj] }));
        } else {
          setSectionData(prev => ({
            ...prev,
            [section]: { ...prev[section], files: [...(prev[section].files || []), fileObj] },
          }));
        }
        showToast(`File added: ${file.name}`, 'success');
      };
      reader.onerror = () => showToast(`Failed to read file: ${file.name}`, 'error');
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
        [section]: { ...prev[section], files: prev[section].files.filter((_, i) => i !== index) },
      }));
    }
  };

  // ─── Form Validation & Submission ─────────────────────────────────────────

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
        setHasExistingSubmission(true);
        setExistingAssessmentId(result.assessment.id);
        setViewMode('list');
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
    setSectionData(buildEmptySectionData());
    setGitlabData({ ...EMPTY_SCANNER });
    setSysdigData({ ...EMPTY_SCANNER });
    setLinkInputs({ ...EMPTY_LINK_INPUTS });
    setErrors({});
  };

  // ─── Assessment Navigation ─────────────────────────────────────────────────

  const handleSelectAssessment = async (id) => {
    try {
      const result = await invoke('getAssessment', { assessmentId: id });
      if (result.success && result.assessment) {
        setAssessmentId(id);
        setFeedbackData({
          mainStatus: result.assessment.formData.mainStatus,
          sections: result.assessment.formData.sections,
          submitterName: result.assessment.submitterName,
          submittedAt: result.assessment.submittedAt,
          canDelete: result.assessment.canDelete,
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

  const handleViewList = () => { setViewMode('list'); refreshSubmissionStatus(); };

  // ─── Render ───────────────────────────────────────────────────────────────

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
      <AppHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        viewMode={viewMode}
        hasExistingSubmission={hasExistingSubmission}
        onNewAssessment={() => setViewMode('form')}
        onViewList={handleViewList}
      />

      <main className="flex flex-1 justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        {viewMode === 'list' && (
          <AssessmentListView
            onSelectAssessment={handleSelectAssessment}
            isDarkMode={isDarkMode}
            showToast={showToast}
            onDeleteSuccess={refreshSubmissionStatus}
          />
        )}

        {viewMode === 'feedback' && (
          <FeedbackView
            feedbackData={feedbackData}
            assessmentId={assessmentId}
            onBackToForm={handleViewList}
            isDarkMode={isDarkMode}
          />
        )}

        {viewMode === 'form' && hasExistingSubmission && (
          <AlreadySubmitted
            existingAssessmentId={existingAssessmentId}
            onViewList={handleViewList}
            onViewSubmission={handleSelectAssessment}
          />
        )}

        {viewMode === 'form' && !hasExistingSubmission && (
          <FormView
            mainStatus={mainStatus}
            sectionData={sectionData}
            gitlabData={gitlabData}
            sysdigData={sysdigData}
            errors={errors}
            linkInputs={linkInputs}
            isSubmitting={isSubmitting}
            onMainStatusChange={setMainStatus}
            onSectionStatusChange={updateSectionStatus}
            onSectionSeverityToggle={updateSectionSeverity}
            onSectionSummaryChange={updateSectionSummary}
            onToggleSectionExpand={toggleSectionExpanded}
            onLinkInputChange={handleLinkInputChange}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            onFilesAdd={handleFiles}
            onRemoveFile={removeFile}
            onGitlabDataChange={setGitlabData}
            onSysdigDataChange={setSysdigData}
            clearError={clearError}
            onSubmit={handleSubmit}
            onDiscard={handleDiscard}
          />
        )}
      </main>

      {showModal && (
        <ConfirmSubmitModal
          mainStatus={mainStatus}
          sectionData={sectionData}
          gitlabData={gitlabData}
          sysdigData={sysdigData}
          onClose={() => setShowModal(false)}
          onConfirm={confirmSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default App;
