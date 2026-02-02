import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';

const resolver = new Resolver();

// Section display names
const sectionNames = {
  sast: 'SAST (Static Application Security Testing)',
  sca: 'Vulnerable Dependencies - SCA (Software Composition Analysis)',
  iac: 'Infrastructure as Code (IaC Configuration)',
  secret: 'Secret Detection (Sensitive Info/Data Exposure)',
  container: 'Container Images Scanning (Image & Runtime Security)'
};

/**
 * Map severity to Jira priority
 */
function mapPriority(severity) {
  const mapping = {
    'critical': 'Highest',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'information': 'Lowest'
  };
  return mapping[severity?.toLowerCase()] || 'Medium';
}

/**
 * Get section title
 */
function getSectionTitle(section) {
  const titles = {
    'sast': 'SAST (Static Application Security Testing)',
    'sca': 'SCA (Software Composition Analysis)',
    'iac': 'IaC (Infrastructure as Code)',
    'secret': 'Secret Detection',
    'container': 'Container Image Scanning'
  };
  return titles[section] || section.toUpperCase();
}

/**
 * Build plain text description for a single section
 */
function buildSectionDescription(section, data) {
  const status = data.status === 'yes' ? '🔴 Issues Found' : '🟢 No Issues';
  let desc = `\n=== ${getSectionTitle(section)} ===\nStatus: ${status}\n`;
  
  if (data.status === 'yes') {
    if (data.severities && data.severities.length > 0) {
      desc += `Severity: ${data.severities.map(s => s.toUpperCase()).join(', ')}\n`;
    }
    
    if (data.summary) {
      desc += `\nSummary:\n${data.summary}\n`;
    }
    
    if (data.links && data.links.length > 0) {
      desc += `\nRelated Links:\n`;
      data.links.forEach((link, i) => {
        desc += `${i + 1}. ${link}\n`;
      });
    }
    
    // Include attached files info
    if (data.files && data.files.length > 0) {
      desc += `\nAttached Files (${data.files.length}):\n`;
      data.files.forEach((file, i) => {
        const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
        desc += `${i + 1}. ${file.name} (${sizeKB}KB)\n`;
      });
    }
    
    // Container section scanning tools
    if (section === 'container') {
      if (data.gitlabEnabled || data.sysdigEnabled) {
        desc += `\nScanning Tools:\n`;
        if (data.gitlabEnabled) {
          const gitlabSeverities = data.gitlabSeverities && data.gitlabSeverities.length > 0 
            ? data.gitlabSeverities.map(s => s.toUpperCase()).join(', ') 
            : 'None selected';
          desc += `\n📦 Container Scanning (GitLab CI)\n`;
          desc += `  Severity: ${gitlabSeverities}\n`;
          if (data.gitlabLinks && data.gitlabLinks.length > 0) {
            desc += `  Links:\n`;
            data.gitlabLinks.forEach((link, i) => {
              desc += `    ${i + 1}. ${link}\n`;
            });
          }
          if (data.gitlabFiles && data.gitlabFiles.length > 0) {
            desc += `  Attached Files (${data.gitlabFiles.length}):\n`;
            data.gitlabFiles.forEach((file, i) => {
              const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
              desc += `    ${i + 1}. ${file.name} (${sizeKB}KB)\n`;
            });
          }
          if (data.gitlabSummary) {
            desc += `  Summary: ${data.gitlabSummary}\n`;
          }
        }
        if (data.sysdigEnabled) {
          const sysdigSeverities = data.sysdigSeverities && data.sysdigSeverities.length > 0 
            ? data.sysdigSeverities.map(s => s.toUpperCase()).join(', ') 
            : 'None selected';
          desc += `\n🔍 Sysdig Scanning\n`;
          desc += `  Severity: ${sysdigSeverities}\n`;
          if (data.sysdigLinks && data.sysdigLinks.length > 0) {
            desc += `  Links:\n`;
            data.sysdigLinks.forEach((link, i) => {
              desc += `    ${i + 1}. ${link}\n`;
            });
          }
          if (data.sysdigFiles && data.sysdigFiles.length > 0) {
            desc += `  Attached Files (${data.sysdigFiles.length}):\n`;
            data.sysdigFiles.forEach((file, i) => {
              const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
              desc += `    ${i + 1}. ${file.name} (${sizeKB}KB)\n`;
            });
          }
          if (data.sysdigSummary) {
            desc += `  Summary: ${data.sysdigSummary}\n`;
          }
        }
      }
    }
  }
  
  return desc;
}

/**
 * Build consolidated description for all sections
 * Simplified version showing only section names and attached files
 */
function buildConsolidatedDescription(formData) {
  const mainStatus = formData.mainStatus;
  const sections = formData.sections || {};
  const sectionKeys = ['sast', 'sca', 'iac', 'secret', 'container'];
  
  let desc = ` Secure Code & App Infrastructure Review \n\n`;
  
  if (mainStatus === 'no') {
    desc += `✅ Main Assessment: No Security Issues or Vulnerabilities Found\n`;
    desc += `📅 Assessment Date: ${new Date().toLocaleString()}\n`;
    desc += `\n---\nGenerated by Security Review Form (Forge App) on ${new Date().toISOString()}`;
    return desc;
  }
  
  const issueCount = sectionKeys.filter(s => sections[s]?.status === 'yes').length;
  
  desc += `Security Issues or Vulnerabilities Found\n`;
  desc += `Summary: ${issueCount} section(s) with issues\n`;
  desc += `Date: ${new Date().toLocaleString()}\n`;
  desc += `\n${'─'.repeat(50)}\n`;
  
  sectionKeys.forEach(section => {
    const sectionData = sections[section];
    if (sectionData && sectionData.status === 'yes') {
      // Only show section name and files
      desc += `\n${getSectionTitle(section)}\n`;
      
      // Regular files
      if (sectionData.files && sectionData.files.length > 0) {
        desc += `Attached Files (${sectionData.files.length}):\n`;
        sectionData.files.forEach((file, i) => {
          const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
          desc += `${i + 1}. ${file.name} (${sizeKB}KB)\n`;
        });
      }
      
      // Container section - gitlab files
      if (section === 'container' && sectionData.gitlabEnabled) {
        if (sectionData.gitlabFiles && sectionData.gitlabFiles.length > 0) {
          desc += `\nContainer Scanning (GitLab CI) - Attached Files (${sectionData.gitlabFiles.length}):\n`;
          sectionData.gitlabFiles.forEach((file, i) => {
            const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
            desc += `${i + 1}. ${file.name} (${sizeKB}KB)\n`;
          });
        }
      }
      
      // Container section - sysdig files
      if (section === 'container' && sectionData.sysdigEnabled) {
        if (sectionData.sysdigFiles && sectionData.sysdigFiles.length > 0) {
          desc += `\nSysdig Scanning - Attached Files (${sectionData.sysdigFiles.length}):\n`;
          sectionData.sysdigFiles.forEach((file, i) => {
            const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
            desc += `${i + 1}. ${file.name} (${sizeKB}KB)\n`;
          });
        }
      }
      
      desc += `\n${'─'.repeat(50)}\n`;
    }
  });
  
  desc += `\n---\nGenerated by Security Review Form on ${new Date().toISOString()}`;
  
  return desc;
}

/**
 * Convert plain text to Atlassian Document Format
 */
function textToADF(text) {
  const lines = text.split('\n');
  const content = lines.map(line => ({
    type: 'paragraph',
    content: line ? [{ type: 'text', text: line }] : []
  }));
  
  return {
    type: 'doc',
    version: 1,
    content: content
  };
}

/**
 * Fetch labels for current issue (keeping original functionality)
 */
resolver.define('fetchLabels', async (req) => {
  const key = req.context.extension.issue?.key;
  
  if (!key) {
    return [];
  }

  const res = await api.asApp().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);
  const data = await res.json();
  const label = data.fields?.labels;
  
  if (label === undefined) {
    console.warn(`${key}: Failed to find labels`);
    return [];
  }

  return label;
});

/**
 * Get current project info
 */
resolver.define('getProjectInfo', async (req) => {
  const projectKey = req.context.extension.project?.key;
  
  if (!projectKey) {
    return { success: false, error: 'No project context' };
  }
  
  try {
    const res = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`);
    const data = await res.json();
    
    return {
      success: true,
      project: {
        key: data.key,
        name: data.name,
        id: data.id
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get current user info
 * Using asUser() here so we get the actual logged-in user's details for comments
 */
resolver.define('getCurrentUser', async (req) => {
  try {
    const res = await api.asUser().requestJira(route`/rest/api/3/myself`);
    const data = await res.json();
    
    return {
      success: true,
      user: {
        displayName: data.displayName,
        email: data.emailAddress,
        accountId: data.accountId
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get available issue types for the current project.
 * This helps identify what issue types can be used in this project.
 */
resolver.define('getProjectIssueTypes', async (req) => {
  const projectKey = req.context.extension.project?.key;
  
  if (!projectKey) {
    return { success: false, error: 'No project context' };
  }
  
  try {
    // Fetch project metadata to get available issue types
    const res = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`);
    const data = await res.json();
    
    // Also get createmeta to see what issue types we can actually create
    const metaRes = await api.asApp().requestJira(
      route`/rest/api/3/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes`
    );
    const metaData = await metaRes.json();
    
    const issueTypes = metaData.projects?.[0]?.issuetypes || [];
    
    return {
      success: true,
      projectKey: projectKey,
      projectName: data.name,
      projectType: data.projectTypeKey, // 'software', 'business', 'service_desk'
      style: data.style, // 'classic' or 'next-gen' (team-managed)
      issueTypes: issueTypes.map(it => ({
        id: it.id,
        name: it.name,
        subtask: it.subtask
      }))
    };
  } catch (error) {
    console.error('Error fetching project issue types:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Helper function to find a suitable issue type for the project.
 * Prefers Task, then Story, then any non-subtask type.
 */
async function findSuitableIssueType(projectKey) {
  try {
    const metaRes = await api.asApp().requestJira(
      route`/rest/api/3/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes`
    );
    const metaData = await metaRes.json();
    
    const issueTypes = metaData.projects?.[0]?.issuetypes || [];
    
    // Filter out subtask types - we want standard issue types
    const standardTypes = issueTypes.filter(it => !it.subtask);
    
    if (standardTypes.length === 0) {
      return { name: 'Task' }; // Fallback to Task if nothing found
    }
    
    // Preference order: Task > Story > Bug > any other standard type
    const preferredNames = ['Task', 'Story', 'Bug', 'Issue'];
    
    for (const preferred of preferredNames) {
      const found = standardTypes.find(it => it.name.toLowerCase() === preferred.toLowerCase());
      if (found) {
        console.log(`Using issue type: ${found.name} (id: ${found.id})`);
        return { id: found.id, name: found.name };
      }
    }
    
    // If none of the preferred types exist, use the first available standard type
    const firstType = standardTypes[0];
    console.log(`Using first available issue type: ${firstType.name} (id: ${firstType.id})`);
    return { id: firstType.id, name: firstType.name };
    
  } catch (error) {
    console.error('Error finding suitable issue type:', error);
    return { name: 'Task' }; // Fallback
  }
}

/**
 * Create a Jira issue for the security assessment and attach files
 * Returns the created issue key
 */
async function createAssessmentIssue(projectKey, formData, summary, highestSeverity) {
  try {
    // Find suitable issue type for this project
    const issueType = await findSuitableIssueType(projectKey);
    
    // Build the description
    const description = buildConsolidatedDescription(formData);
    const descriptionADF = textToADF(description);
    
    // Map severity to priority
    const priority = mapPriority(highestSeverity);
    
    // Create the issue payload
    const issuePayload = {
      fields: {
        project: { key: projectKey },
        summary: `Security Assessment: ${summary}`,
        description: descriptionADF,
        issuetype: issueType,
        priority: { name: priority },
        labels: ['security-assessment', 'forge-app']
      }
    };
    
    // Create the Jira issue
    console.log('Creating Jira issue for assessment...');
    const createRes = await api.asApp().requestJira(route`/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issuePayload)
    });
    
    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('Failed to create issue:', errorText);
      throw new Error(`Failed to create Jira issue: ${errorText}`);
    }
    
    const issueData = await createRes.json();
    const issueKey = issueData.key;
    const issueId = issueData.id;
    
    console.log(`Created Jira issue: ${issueKey}`);
    
    // Collect all files from all sections
    const allFiles = [];
    const sections = formData.sections || {};
    const sectionKeys = ['sast', 'sca', 'iac', 'secret', 'container'];
    
    for (const section of sectionKeys) {
      const sectionData = sections[section];
      if (sectionData?.status === 'yes') {
        // Regular files
        if (sectionData.files && Array.isArray(sectionData.files)) {
          sectionData.files.forEach(file => {
            if (file.data) {
              allFiles.push({ file, section, subsection: null });
            }
          });
        }
        
        // Container section - gitlab files
        if (section === 'container' && sectionData.gitlabEnabled) {
          if (sectionData.gitlabFiles && Array.isArray(sectionData.gitlabFiles)) {
            sectionData.gitlabFiles.forEach(file => {
              if (file.data) {
                allFiles.push({ file, section: 'container', subsection: 'gitlab' });
              }
            });
          }
        }
        
        // Container section - sysdig files
        if (section === 'container' && sectionData.sysdigEnabled) {
          if (sectionData.sysdigFiles && Array.isArray(sectionData.sysdigFiles)) {
            sectionData.sysdigFiles.forEach(file => {
              if (file.data) {
                allFiles.push({ file, section: 'container', subsection: 'sysdig' });
              }
            });
          }
        }
      }
    }
    
    // Upload all files as attachments to the Jira issue
    console.log(`Uploading ${allFiles.length} file(s) to issue ${issueKey}...`);
    
    for (const { file, section, subsection } of allFiles) {
      try {
        // Convert base64 to binary
        const base64Data = file.data.split(',')[1] || file.data;
        const binaryData = Buffer.from(base64Data, 'base64');
        
        // Upload the file as an attachment
        const attachRes = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/attachments`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'X-Atlassian-Token': 'no-check'
          },
          body: binaryData,
          // Add filename in the request
          // Note: The Jira API expects multipart/form-data, but Forge handles this differently
        });
        
        // For proper file upload, we need to use FormData
        // Creating a proper multipart request
        const boundary = '----ForgeAppBoundary' + Date.now();
        const multipartBody = [
          `--${boundary}`,
          `Content-Disposition: form-data; name="file"; filename="${file.name}"`,
          `Content-Type: ${file.type || 'application/octet-stream'}`,
          '',
          binaryData.toString('binary'),
          `--${boundary}--`
        ].join('\r\n');
        
        const attachmentRes = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/attachments`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'X-Atlassian-Token': 'no-check'
          },
          body: Buffer.from(multipartBody, 'binary')
        });
        
        if (attachmentRes.ok) {
          console.log(`Uploaded file: ${file.name} to ${issueKey}`);
        } else {
          const errorText = await attachmentRes.text();
          console.error(`Failed to upload file ${file.name}:`, errorText);
        }
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        // Continue with other files even if one fails
      }
    }
    
    return { success: true, issueKey, issueId };
    
  } catch (error) {
    console.error('Error creating assessment issue:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to strip file data from form data to reduce storage size.
 * Files are uploaded to Jira as attachments, so we don't need to keep them in storage.
 * We keep file metadata (name, size, type) for display purposes.
 */
function stripFileData(formData) {
  if (!formData || !formData.sections) return formData;
  
  const strippedData = JSON.parse(JSON.stringify(formData)); // Deep clone
  
  // Strip file data from each section
  Object.keys(strippedData.sections || {}).forEach(sectionKey => {
    const section = strippedData.sections[sectionKey];
    
    if (section.files && Array.isArray(section.files)) {
      section.files = section.files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
        // Remove 'data' property which contains base64 content
      }));
    }
    
    // Handle container section's gitlab and sysdig files
    if (section.gitlabFiles && Array.isArray(section.gitlabFiles)) {
      section.gitlabFiles = section.gitlabFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
    }
    
    if (section.sysdigFiles && Array.isArray(section.sysdigFiles)) {
      section.sysdigFiles = section.sysdigFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
    }
  });
  
  return strippedData;
}

/**
 * Generate a unique assessment ID for storage
 * Format: ASM-{projectKey}-{timestamp}-{random}
 */
function generateAssessmentId(projectKey) {
  const timestamp = Date.now().toString(36); // Base36 timestamp for shorter string
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ASM-${projectKey}-${timestamp}-${random}`;
}

/**
 * Check if user has already submitted an assessment for this project
 */
resolver.define('checkUserSubmission', async (req) => {
  const projectKey = req.context.extension.project?.key;
  const accountId = req.context.accountId;
  
  if (!projectKey || !accountId) {
    return { success: false, error: 'Missing context' };
  }
  
  try {
    // Get assessment list and check if user already has a submission for this project
    const assessmentList = await storage.get('assessment_list') || [];
    
    const existingSubmission = assessmentList.find(
      a => a.projectKey === projectKey && a.submittedBy === accountId
    );
    
    return { 
      success: true, 
      hasSubmitted: !!existingSubmission,
      existingAssessment: existingSubmission || null
    };
  } catch (error) {
    console.error('Check user submission error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Submit security assessment - stores in Forge storage (no Jira issue created)
 * Each user can only submit ONE assessment per project
 */
resolver.define('submitAssessment', async (req) => {
  const { formData } = req.payload;
  const projectKey = req.context.extension.project?.key;
  const accountId = req.context.accountId;
  
  if (!projectKey) {
    return { success: false, error: 'No project context available' };
  }
  
  if (!accountId) {
    return { success: false, error: 'No user context available' };
  }
  
  // Check if user already has a submission for this project
  const assessmentList = await storage.get('assessment_list') || [];
  const existingSubmission = assessmentList.find(
    a => a.projectKey === projectKey && a.submittedBy === accountId
  );
  
  if (existingSubmission) {
    return { 
      success: false, 
      error: 'You have already submitted an assessment for this project. Only one submission per user is allowed.',
      existingAssessment: existingSubmission
    };
  }
  
  const mainStatus = formData.mainStatus;
  const sections = formData.sections || {};
  const sectionKeys = ['sast', 'sca', 'iac', 'secret', 'container'];
  
  // Calculate highest severity among all sections with issues
  const severityOrder = ['critical', 'high', 'medium', 'low', 'information'];
  let highestSeverity = 'information';
  
  if (mainStatus === 'yes') {
    for (const section of sectionKeys) {
      const sectionData = sections[section];
      if (sectionData?.status === 'yes') {
        if (sectionData.severities && sectionData.severities.length > 0) {
          for (const sev of sectionData.severities) {
            if (severityOrder.indexOf(sev) < severityOrder.indexOf(highestSeverity)) {
              highestSeverity = sev;
            }
          }
        }
        
        // For container section, also check scanning tool severities
        if (section === 'container') {
          if (sectionData.gitlabEnabled && sectionData.gitlabSeverities && sectionData.gitlabSeverities.length > 0) {
            for (const sev of sectionData.gitlabSeverities) {
              if (severityOrder.indexOf(sev) < severityOrder.indexOf(highestSeverity)) {
                highestSeverity = sev;
              }
            }
          }
          if (sectionData.sysdigEnabled && sectionData.sysdigSeverities && sectionData.sysdigSeverities.length > 0) {
            for (const sev of sectionData.sysdigSeverities) {
              if (severityOrder.indexOf(sev) < severityOrder.indexOf(highestSeverity)) {
                highestSeverity = sev;
              }
            }
          }
        }
      }
    }
  }
  
  // Determine assessment status
  const issueCount = sectionKeys.filter(s => sections[s]?.status === 'yes').length;
  let statusLabel;
  
  if (mainStatus === 'no') {
    statusLabel = 'All Clear - No Issues';
  } else {
    statusLabel = issueCount > 0 
      ? `${issueCount} Issue(s) - ${highestSeverity.toUpperCase()}` 
      : 'All Clear';
  }
  
  try {
    // Get submitter's display name for the record
    // Using asUser() here so we get the actual user who submitted the form
    let submitterName = 'Unknown User';
    try {
      const userRes = await api.asUser().requestJira(route`/rest/api/3/myself`);
      if (userRes.ok) {
        const userData = await userRes.json();
        submitterName = userData.displayName || 'Unknown User';
      }
    } catch (userError) {
      console.error('Failed to get user info:', userError);
    }
    
    // Generate unique assessment ID (not a Jira issue)
    const assessmentId = generateAssessmentId(projectKey);
    
    // Create Jira issue in the backlog with file attachments
    console.log('Creating Jira issue for security assessment...');
    const issueResult = await createAssessmentIssue(projectKey, formData, statusLabel, highestSeverity);
    
    if (!issueResult.success) {
      console.error('Failed to create Jira issue:', issueResult.error);
      // Continue anyway and save assessment without issue key
    }
    
    // Strip file data from form data to reduce storage size
    // Files are now stored as Jira attachments
    const strippedFormData = stripFileData(formData);
    
    // Create assessment record
    const assessmentData = {
      assessmentId: assessmentId,
      projectKey: projectKey,
      formData: strippedFormData,
      submittedBy: accountId,
      submitterName: submitterName,
      submittedAt: new Date().toISOString(),
      summary: statusLabel,
      highestSeverity: mainStatus === 'yes' && issueCount > 0 ? highestSeverity : null,
      // Store the Jira issue key for file retrieval
      issueKey: issueResult.success ? issueResult.issueKey : null,
      issueId: issueResult.success ? issueResult.issueId : null
    };
    
    // Save assessment data to Forge storage
    await storage.set(`assessment_${assessmentId}`, assessmentData);
    
    // Add to assessment list (with project key for filtering)
    assessmentList.push({
      assessmentId: assessmentId,
      projectKey: projectKey,
      summary: statusLabel,
      submittedAt: assessmentData.submittedAt,
      submittedBy: accountId,
      submitterName: submitterName,
      issueKey: issueResult.success ? issueResult.issueKey : null
    });
    await storage.set('assessment_list', assessmentList);
    
    return {
      success: true,
      message: issueResult.success 
        ? `Security assessment submitted successfully. Jira issue ${issueResult.issueKey} created.`
        : 'Security assessment submitted successfully (Jira issue creation failed)',
      assessment: {
        id: assessmentId,
        summary: statusLabel,
        issueKey: issueResult.success ? issueResult.issueKey : null
      }
    };
  } catch (error) {
    console.error('Error saving assessment:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Delete an assessment - only allowed by the original submitter
 */
resolver.define('deleteAssessment', async (req) => {
  const { assessmentId } = req.payload;
  const accountId = req.context.accountId;
  
  if (!assessmentId) {
    return { success: false, error: 'Assessment ID is required' };
  }
  
  if (!accountId) {
    return { success: false, error: 'User authentication required' };
  }
  
  try {
    // Get the assessment to check ownership
    const assessment = await storage.get(`assessment_${assessmentId}`);
    
    if (!assessment) {
      return { success: false, error: 'Assessment not found' };
    }
    
    // Check if the current user is the submitter
    if (assessment.submittedBy !== accountId) {
      return { 
        success: false, 
        error: 'You can only delete assessments that you submitted' 
      };
    }
    
    // Delete the assessment data
    await storage.delete(`assessment_${assessmentId}`);
    
    // Remove from assessment list
    const assessmentList = await storage.get('assessment_list') || [];
    const updatedList = assessmentList.filter(a => a.assessmentId !== assessmentId);
    await storage.set('assessment_list', updatedList);
    
    // Also delete any comments associated with this assessment
    const sectionKeys = ['sast', 'sca', 'iac', 'secret', 'container'];
    for (const section of sectionKeys) {
      try {
        await storage.delete(`comments_${assessmentId}_${section}`);
      } catch (e) {
        // Ignore errors for comments that don't exist
      }
    }
    
    return { 
      success: true, 
      message: 'Assessment deleted successfully' 
    };
  } catch (error) {
    console.error('Delete assessment error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Save draft to Forge storage
 */
resolver.define('saveDraft', async (req) => {
  const { draftData } = req.payload;
  const projectKey = req.context.extension.project?.key;
  const accountId = req.context.accountId;
  
  if (!projectKey || !accountId) {
    return { success: false, error: 'Missing context' };
  }
  
  const storageKey = `draft_${projectKey}_${accountId}`;
  
  try {
    // Strip file data to stay under 250KB storage limit
    // Files are temporarily stored in browser until submission
    const strippedData = stripFileData(draftData);
    
    await storage.set(storageKey, {
      data: strippedData,
      savedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Save draft error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Load draft from Forge storage
 */
resolver.define('loadDraft', async (req) => {
  const projectKey = req.context.extension.project?.key;
  const accountId = req.context.accountId;
  
  if (!projectKey || !accountId) {
    return { success: false, error: 'Missing context' };
  }
  
  const storageKey = `draft_${projectKey}_${accountId}`;
  
  try {
    const draft = await storage.get(storageKey);
    
    if (draft) {
      return { success: true, draft: draft.data, savedAt: draft.savedAt };
    }
    
    return { success: true, draft: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Clear draft from Forge storage
 */
resolver.define('clearDraft', async (req) => {
  const projectKey = req.context.extension.project?.key;
  const accountId = req.context.accountId;
  
  if (!projectKey || !accountId) {
    return { success: false, error: 'Missing context' };
  }
  
  const storageKey = `draft_${projectKey}_${accountId}`;
  
  try {
    await storage.delete(storageKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get a submitted assessment by ID
 */
resolver.define('getAssessment', async (req) => {
  try {
    const { assessmentId } = req.payload;
    
    if (!assessmentId) {
      return { success: false, error: 'Assessment ID is required' };
    }
    
    const assessment = await storage.get(`assessment_${assessmentId}`);
    
    if (!assessment) {
      return { success: false, error: 'Assessment not found' };
    }
    
    // Add current user info for permission checks on frontend
    assessment.currentUserId = req.context.accountId;
    assessment.canDelete = assessment.submittedBy === req.context.accountId;
    
    return { success: true, assessment };
  } catch (e) {
    console.error('Get assessment error:', e);
    return { success: false, error: e.message };
  }
});

/**
 * Add a comment to a section
 */
resolver.define('addComment', async (req) => {
  try {
    const { assessmentId, section, comment, userName } = req.payload;
    if (!assessmentId || !section || !comment) {
      return { success: false, error: 'Assessment ID, section, and comment are required' };
    }
    
    const commentKey = `comments_${assessmentId}_${section}`;
    const existingComments = await storage.get(commentKey) || [];
    
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      userName: userName || 'Anonymous',
      userId: req.context.accountId,
      timestamp: new Date().toISOString()
    };
    
    existingComments.push(newComment);
    await storage.set(commentKey, existingComments);
    
    return { success: true, comment: newComment, allComments: existingComments };
  } catch (e) {
    console.error('Add comment error:', e);
    return { success: false, error: e.message };
  }
});

/**
 * Get all comments for a section
 */
resolver.define('getComments', async (req) => {
  try {
    const { assessmentId, section } = req.payload;
    if (!assessmentId || !section) {
      return { success: false, error: 'Assessment ID and section are required' };
    }
    
    const commentKey = `comments_${assessmentId}_${section}`;
    const comments = await storage.get(commentKey) || [];
    
    return { success: true, comments };
  } catch (e) {
    console.error('Get comments error:', e);
    return { success: false, error: e.message };
  }
});

/**
 * Get all submitted assessments list for the current project
 */
resolver.define('getAllAssessments', async (req) => {
  try {
    const projectKey = req.context.extension.project?.key;
    const currentUserId = req.context.accountId;
    
    const assessmentList = await storage.get('assessment_list') || [];
    
    // Filter assessments to only show those from the current project
    const projectAssessments = assessmentList.filter(a => a.projectKey === projectKey);
    
    // Add canDelete flag for each assessment
    const assessmentsWithPermissions = projectAssessments.map(a => ({
      ...a,
      canDelete: a.submittedBy === currentUserId
    }));
    
    return { 
      success: true, 
      assessments: assessmentsWithPermissions,
      currentUserId: currentUserId
    };
  } catch (e) {
    console.error('Get all assessments error:', e);
    return { success: false, error: e.message };
  }
});

/**
 * Get attachments from a Jira issue
 * Returns list of attachments with their IDs for downloading
 */
resolver.define('getIssueAttachments', async (req) => {
  try {
    const { issueKey } = req.payload;
    
    if (!issueKey) {
      return { success: false, error: 'Issue key is required' };
    }
    
    // Fetch issue with attachments field
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}?fields=attachment`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch issue attachments:', errorText);
      return { success: false, error: 'Failed to fetch attachments' };
    }
    
    const issueData = await res.json();
    const attachments = issueData.fields?.attachment || [];
    
    // Return simplified attachment info
    const attachmentList = attachments.map(att => ({
      id: att.id,
      filename: att.filename,
      size: att.size,
      mimeType: att.mimeType,
      created: att.created,
      author: att.author?.displayName
    }));
    
    return { 
      success: true, 
      attachments: attachmentList
    };
  } catch (e) {
    console.error('Get issue attachments error:', e);
    return { success: false, error: e.message };
  }
});

/**
 * Download a specific attachment from Jira
 * Returns the file content as base64
 */
resolver.define('downloadAttachment', async (req) => {
  try {
    const { attachmentId } = req.payload;
    
    if (!attachmentId) {
      return { success: false, error: 'Attachment ID is required' };
    }
    
    // Get attachment metadata first
    const metaRes = await api.asApp().requestJira(route`/rest/api/3/attachment/${attachmentId}`);
    
    if (!metaRes.ok) {
      return { success: false, error: 'Failed to fetch attachment metadata' };
    }
    
    const metadata = await metaRes.json();
    
    console.log(`Downloading attachment ${attachmentId}: ${metadata.filename}`);
    
    // Use the attachment content endpoint - this is the proper way to download via Forge
    const fileRes = await api.asApp().requestJira(route`/rest/api/3/attachment/content/${attachmentId}`, {
      headers: {
        'Accept': '*/*'
      }
    });
    
    if (!fileRes.ok) {
      console.error('Failed to download file, status:', fileRes.status);
      return { success: false, error: `Failed to download file: ${fileRes.status}` };
    }
    
    // Get the file as buffer and convert to base64
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');
    
    console.log(`Downloaded ${metadata.filename}: ${buffer.length} bytes`);
    
    return {
      success: true,
      filename: metadata.filename,
      mimeType: metadata.mimeType,
      size: metadata.size,
      content: base64Content
    };
  } catch (e) {
    console.error('Download attachment error:', e);
    return { success: false, error: e.message };
  }
});

export const handler = resolver.getDefinitions();
