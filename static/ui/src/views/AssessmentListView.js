import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';

const AssessmentListView = ({ onSelectAssessment, isDarkMode, showToast, onDeleteSuccess }) => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoke('getAllAssessments');
      if (result.success) {
        const sorted = (result.assessments || []).sort((a, b) =>
          new Date(b.submittedAt) - new Date(a.submittedAt)
        );
        setAssessments(sorted);
      } else {
        setError(result.error || 'Failed to load assessments');
      }
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e, assessment) => {
    e.stopPropagation();
    setDeleteConfirmModal({
      assessmentId: assessment.assessmentId,
      assessmentName: assessment.assessmentId,
    });
  };

  const handleDelete = async () => {
    const assessmentId = deleteConfirmModal.assessmentId;
    setDeleteConfirmModal(null);
    setDeletingId(assessmentId);

    try {
      const result = await invoke('deleteAssessment', { assessmentId });
      if (result.success) {
        setAssessments(prev => prev.filter(a => a.assessmentId !== assessmentId));
        if (showToast) showToast('Assessment deleted successfully', 'success');
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        if (showToast) showToast(result.error || 'Failed to delete assessment', 'error');
        else alert(result.error || 'Failed to delete assessment');
      }
    } catch (err) {
      console.error('Error deleting assessment:', err);
      if (showToast) showToast('Failed to delete assessment', 'error');
      else alert('Failed to delete assessment');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIssueCount = (summary) => {
    const match = summary.match(/(\d+)\s*Issue/i);
    if (match) {
      const count = parseInt(match[1]);
      return { count, text: `${count} ${count === 1 ? 'Issue' : 'Issues'}`, hasIssues: true };
    }
    return { count: 0, text: 'No Issues', hasIssues: false };
  };

  if (isLoading) {
    return (
      <div className={`w-full max-w-6xl mx-auto p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full max-w-6xl mx-auto p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={loadAssessments}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Submitted Security Assessments</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {assessments.length} {assessments.length === 1 ? 'assessment' : 'assessments'} submitted
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
          isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
        }`}>
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">No assessments yet</p>
          <p className="mt-2">Submit a security assessment to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.assessmentId}
              className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-lg ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => onSelectAssessment(assessment.assessmentId)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      isDarkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {assessment.assessmentId}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(assessment.submittedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <i className="fas fa-user mr-1"></i>
                      {assessment.submitterName || 'Unknown User'}
                    </span>
                    {assessment.canDelete && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        Your submission
                      </span>
                    )}
                  </div>
                  {(() => {
                    const issueInfo = getIssueCount(assessment.summary);
                    return (
                      <p className={`font-medium ${issueInfo.hasIssues ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {issueInfo.text}
                      </p>
                    );
                  })()}
                </button>

                <div className="flex items-center gap-2 ml-4">
                  {assessment.canDelete && (
                    <button
                      onClick={(e) => handleDeleteClick(e, assessment)}
                      disabled={deletingId === assessment.assessmentId}
                      className={`p-2 rounded-lg transition-colors ${
                        deletingId === assessment.assessmentId
                          ? 'opacity-50 cursor-not-allowed'
                          : isDarkMode
                            ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400'
                            : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                      }`}
                      title="Delete assessment"
                    >
                      {deletingId === assessment.assessmentId ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onSelectAssessment(assessment.assessmentId)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-600' : 'hover:bg-gray-100 text-gray-400'
                    }`}
                    title="View details"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmModal(null)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-md p-6 ${
            isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold text-center mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete Assessment
            </h3>
            <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete{' '}
              <span className="font-mono font-bold text-red-500">{deleteConfirmModal.assessmentName}</span>?
              <br />
              <span className="text-sm">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-colors ${
                  isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentListView;
