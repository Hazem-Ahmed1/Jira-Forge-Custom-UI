# Security Code & App Infrastructure Review - Forge App (Production)

**Environment:** Production  
**Version:** 2.2.0  
**Deployed:** January 28, 2026

---

## 📋 Quick Links

- **[Client Setup Guide](CLIENT_SETUP_GUIDE.md)** - Complete installation guide for new users
- **[Troubleshooting](#troubleshooting)** - Common issues and solutions
- **[Admin Guide](#admin-guide-production-management)** - Deployment and management

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Key Changes from Previous Version](#key-changes-from-previous-version)
4. [How to Access](#how-to-access)
5. [Usage Guide](#usage-guide)
6. [Architecture](#architecture)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Admin Guide](#admin-guide)

---

## Overview

The **Security Code & App Infrastructure Review** is an Atlassian Forge application that provides a comprehensive security assessment workflow. It enables teams to document, track, and manage security findings across multiple security testing categories.

### What This App Does

- Provides a structured form for security assessments
- **Creates Jira issues in the backlog** with all assessment details
- **Attaches files to Jira issues** for easy access and download
- Limits each user to **one submission per project**
- Allows users to delete and resubmit their own assessments
- Supports dark mode for better accessibility
- Auto-saves drafts every 2 seconds

### Installation

**New Users:** See the **[Client Setup Guide](CLIENT_SETUP_GUIDE.md)** for complete installation instructions from scratch.

**Administrators:** See the **[Admin Guide](#admin-guide-production-management)** below for deployment and management instructions.

---

## Features

### ✅ Jira Integration (Version 2.2)

**Creates Jira Issues in Backlog:**
- Automatically creates a Jira issue when assessment is submitted
- Issue title: "Security Assessment: [Status Summary]"
- Full assessment details in issue description (simplified - files only)
- Priority based on highest severity found
- Files attached to the Jira issue
- Issue appears in project backlog for tracking

### 📎 File Attachments

**Files Stored in Jira:**
- All uploaded files are attached to the created Jira issue
- Download buttons in feedback view for each file
- Supports up to 5 files per section (5MB each)
- Files persist with the Jira issue

### 🔒 User-Scoped Submissions

**One Assessment Per User Per Project:**
- Each user can submit ONE assessment per project
- Users can view all assessments
- Users can only delete their own assessments
- After deletion, users can resubmit

### Security Assessment Categories

1. **SAST** - Static Application Security Testing
2. **SCA** - Software Composition Analysis (Vulnerable Dependencies)
3. **IaC** - Infrastructure as Code Security
4. **Secret Detection** - Secrets and Credentials Scanning
5. **Container Security** - Including:
   - GitLab CI Container Scanning (Static)
   - Sysdig Scanning (Runtime + Registry)

### For Each Category, You Can Document:

- **Status**: Whether issues were found (Yes/No)
- **Severity Levels**: Critical, High, Medium, Low, Information
- **Links**: Up to 15 reference URLs
- **Files**: Up to 5 file attachments (100KB max each, JSON files are parsed)
- **Summary**: Detailed description of findings

### Additional Features

- **Auto-save Drafts**: Work-in-progress is automatically saved every 2 seconds
- **Custom Del2 Changes (January 28, 2026)

#### ✨ What's New

1. **Jira Issues Created in Backlog**
   - Old: Stored in Forge Storage only
   - New: Creates Jira issue with files attached

2. **File Attachments to Jira**
   - All files uploaded in the form are attached to the Jira issue
   - Download buttons available in feedback view
   - Files stored permanently with the issue

3. **Simplified Issue Descriptions**
   - Jira issue shows only section names and file lists
   - Clean, focused format for easy scanning
   - Example:
     ```
     SAST (Static Application Security Testing)
     Attached Files (1):
     1. Booking.pdf (80KB)
     ```

4. **One Submission Per User Per Project** (unchanged)
   - Users can still delete only their own assessments
   - After deletion, can resubmit

5. **Unique Assessment IDs** (unchanged)
   - Format: `ASM-{PROJECT}-{timestamp}-{random}`
   - Links to the created Jira issue

#### 🔄 What Changed

- ✅ Added: `createAssessmentIssue` - Creates Jira issue with attachments
- ✅ Added: `getIssueAttachments` - Fetches file list from Jira
- ✅ Added: `downloadAttachment` - Downloads files from Jira
- 🔄 Modified: `buildConsolidatedDescription` - Simplified to show only files
- 🔄 Modified: Issue descriptions now file-focused (no severity, links, or summaries)
   - Removed unnecessary scopes
   - Read-only Jira access
   - Storage-based data management

#### 🗑️ What Was Removed

- Jira issue creation
- File attachment to Jira issues
- Unlimited submissions per user
- Browser confirm() dialogs

---

## How to Access

### For End Users

1. Log in to your Jira Cloud site
2. Navigate to any Jira project
3. Look for **"Secure Code & App Infrastructure Review"** in the project sidebar
4. Click to open the assessment form

# Or extract from zip file and navigate to the folder
cd App-infra
```

### Step 2: Login to Forge

```bash
forge login
```

This will open a browser window. Log in with your Atlassian account and authorize Forge CLI.

### Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd static/hello-world
npm install
cd ../..
```

### Step 4: Build the Frontend

```bash
cd static/hello-world
npm run build
cd ../..
```

### Step 5: Register the App (First Time Only)

If this is a fresh installation and you need to register a new app:

```bash
forge register
```

Follow the prompts to name your app.

### Step 6: Deploy the App

```bash
forge deploy
```

This uploads the app to Atlassian's cloud infrastructure.

### Step 7: Install on Your Jira Site

```bash
forge install
```

When prompted:
- Select **Jira** as the product
- Enter your site URL (e.g., `yourcompany.atlassian.net`)
- Select the environment (development/production)

Alternatively, install directly:

```bash
forge install --site yourcompany.atlassian.net --product jira --environment development
```

### Step 8: Verify Installation

1. Open your Jira Cloud site
2. Go to any project
3. Open an issue
4. Look for the **"RS"** (Security Review) panel in the issue view

---

## Configuration

### App Permissions

The app requires these permissions (defined in `manifest.yml`):

| Permission | Purpose |
|------------|---------|
| `read:jira-work` | Read project and issue information |
| `write:jira-work` | Create issues from assessments |
| `read:jira-user` | Get current user information |
| `storage:app` | Store assessments and drafts |

### Customizing the App

#### Changing App Name

Edit `manifest.yml`:

```yaml
app:
  id: ari:cloud:ecosystem::app/your-app-id
  name: Your Custom App Name
```
jira:projectPage:
    - key: app-infra-project-page
      resource: main
      resolver:
        function: resolver
      title: Security Review Form (title)
#### Modifying Security Categories

Edit `static/hello-world/src/App.js` - Look for `SECTION_CONFIG` and `SECTIONS` constants.

---

## Usage Guide

### Submitting Your First Assessment

#### Step 1: Access the Form

1. Log in to your Jira Cloud site
2. Open any Jira project
3. Click **"Secure Code & App Infrastructure Review"** in the sidebar

#### Step 2: Check Submission Status

- If you've already submitted: You'll see a message with options to view assessments
- If you haven't submitted: The form will be available

#### Step 3: Answer the Main Question

- "Are there any security issues or vulnerabilities?" - Select Yes or No
- If No, you can submit immediately
- If Yes, the security category sections will appear

#### Step 4: Fill Out Security Categories

For each category where issues were found:

1. Select **"Yes"** for that category
2. Click to expand the section
3. Fill in the details:
   - ✅ **Severity Levels**: Check all that apply (Critical, High, Medium, Low, Information)
   - 🔗 **Links**: Type URL and press Enter or click Add (max 15)
   - 📎 **File Attachments**: Drag & drop or click to upload (max 5 files, 5MB each)
   - 📝 **Summary**: Describe the findings

#### Step 5: Submit

1. Click **"Submit"** button
2. Review your submission in the modal
3. Click **"Confirm & Submit"**
4. Your assessment ID will be generated (e.g., `ASM-KAN-mkrh5m00-2AV5`)

#### Step 6: View Confirmation

- Success message will appear
- You'll be redirected to the assessment list
- Your submission is marked as "Your submission"

### Viewing All Assessments

1. Click the **list icon** (📋) in the app header
2. See all assessments for the current project:
   - Assessment ID
   - Submitter name
   - Submission date/time
   - Number of issues
3. Click any assessment to view full details

### Viewing Assessment Details

1. Select an assessment from the list
2. View all sections with findings
3. See severity levels, links, files, and summaries
4. Add comments/feedback on each section
5. Click "Back to List" to return

### Deleting Your Assessment

**Important:** You can only delete your own assessments

1. In the assessment list, find your submission (marked "Your submission")
2. Click the **delete icon** (🗑️)
3. A clean modal will appear asking for confirmation
4. Click **"Delete"** to confirm
5. After deletion, you can submit a new assessment

### Adding Comments (Feedback)

1. Open any assessment details
2. Scroll to a specific security section
3. Find the "Comments & Feedback" area at the bottom
4. Type your comment
5. Press **Enter** or click **"Add"**
6. Your comment appears with your name and timestamp

### Using Dark Mode

Click the **sun/moon icon** in the header to toggle between light and dark themes. Your preference is saved locally.

---

## Architecture

### Project Structure

```
App-infra/
├── manifest.yml              # Forge app configuration
├── package.json              # Node.js dependencies
├── src/
│   └── index.js              # Backend resolvers (Forge functions)
└── static/
    └── hello-world/
        ├── package.json      # Frontend dependencies
        ├── public/
        │   └── index.html
        └── src/
            ├── App.js              # Main form component
            ├── App.css             # Styles
            ├── FeedbackView.js     # Assessment detail view
            ├── AssessmentListView.js # List of assessments
            └── index.js            # React entry point
```

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React UI      │────▶│  Forge Bridge    │────▶│  Forge Backend  │
│ (hello-world)   │     │  (invoke API)    │     │  (resolvers)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────┐
                        │                                │                │
                        ▼                                ▼                ▼
                ┌─────────────2)

**Assessment Storage Key**: `assessment_${assessmentId}`
```json
{
  "assessmentId": "ASM-KAN-mkrh5m00-2AV5",
  "projectKey": "KAN",
  "issueKey": "SCRUM-10",
  "issueId": "10042",
  "formData": {
    "mainStatus": "yes",
    "sections": {
      "sast": { 
        "status": "yes", 
        "severities": ["high", "critical"], 
        "links": [], 
        "files": [
          { "name": "Booking.pdf", "size": 81920, "type": "application/pdf" }
        ], 
        "summary": "..." 
      },
      "sca": { "status": "no", ... },
      "container": {
        "status": "yes",
        "gitlabEnabled": true,
        "gitlabSeverities": ["medium"],
        "gitlabLinks": [...],
        "gitlabFiles": [
          { "name": "report.json", "size": 45120, "type": "application/json" }
        ],
        "sysdigEnabled": false,
        ...
      }
    }
  },
  "submittedBy": "557058:f6e7d1d2-1234-5678-90ab-cdef12345678",
  "submitterName": "John Doe",
  "submittedAt": "2026-01-28T10:30:00.000Z",
  "summary": "3 Issue(s) - HIGH",
  "highestSeverity": "high"
}
```

**Note:** File data (base64 c8T10:30:00.000Z",
    "submittedBy": "557058:f6e7d1d2-1234-5678-90ab-cdef12345678",
    "submitterName": "John Doe",
    "issueKey": "SCRUM-100:30:00.000Z",
  "summary": "3 Issue(s) - HIGH",
  "highestSeverity": "high"
}
```

**Assessment List Key**: `assessment_list`
```json
[
  {
    "assessmentId": "ASM-KAN-mkrh5m00-2AV5",
    "projectKey": "KAN",
    "summary": "3 Issue(s) - HIGH",
    "submittedAt": "2026-01-24T10:30:00.000Z",
    "submittedBy": "557058:f6e7d1d2-1234-5678-90ab-cdef12345678",
    "submitterName": "John Doe"
  }
]
```

**Draft Storage Key**: `draft_${projectKey}_${accountId}`
```json
{
  "data": {
    "mainStatus": "yes",
    "sectionData": { ... },
    "gitlabData": { ... },
    "sysdigData": { ... }
  },
  "savedAt": "2026-01-24T10:25:00.000Z"
}
```

**Comments Storage Key**: `comments_${assessmentId}_${section}`
```json
[
  {
    "id": "1706088600000",
    "text": "This needs urgent attention",
    "userName": "Jane Smith",
    "userId": "557058:a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "timestamp": "2026-01-24T10:30:00.000Z"
  }
]
```

---creates Jira issue) | `{ formData }` | `{ success, assessment: { id, summary, issueKey } }` |
| `getAllAssessments` | Get all assessments for current project | - | `{ success, assessments[], currentUserId }` |
| `getAssessment` | Get assessment by ID | `{ assessmentId }` | `{ success, assessment, canDelete }` |
| `deleteAssessment` | Delete own assessment | `{ assessmentId }` | `{ success, message }` |

### File Management

| Resolver | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `getIssueAttachments` | Get file list from Jira issue | `{ issueKey }` | `{ success, attachments[] }` |
| `downloadAttachment` | Download file from Jira | `{ attachmentId }` | `{ success, filename, mimeType, size, content
### User & Project Information

| Resolver | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `getProjectInfo` | Get current project details | - | `{ success, project: { key, name, id } }` |
| `getCurrentUser` | Get current user info | - | `{ success, user: { displayName, email, accountId } }` |

### Assessment Management

| Resolver | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `checkUserSubmission` | Check if user already submitted | - | `{ success, hasSubmitted, existingAssessment }` |
| `submitAssessment` | Submit assessment (once per user per project) | `{ formData }` | `{ success, assessment: { id, summary } }` |
| `getAllAssessments` | Get all assessments for current project | - | `{ success, assessments[], currentUserId }` |
| `getAssessment` | Get assessment by ID | `{ assessmentId }` | `{ success, assessment, canDelete }` |
| `deleteAssessment` | Delete own assessment | `{ assessmentId }` | `{ success, message }` |

### Draft Management

| Resolver | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `saveDraft` | Auto-save draft (every 2 sec) | `{ draftData }` | `{ success }` |
| `loadDraft` | Load saved draft | - | `{ success, draft, savedAt }` |
| `clearDraft` | Clear draft after submit | - | `{ success }` |
2

- ✅ Added: `createAssessmentIssue` - Creates Jira issue with file attachments
- ✅ Added: `getIssueAttachments` - Fetches attachments from Jira issue
- ✅ Added: `downloadAttachment` - Downloads file content from Jira
- 🔄 Modified: `submitAssessment` - Now creates Jira issue and stores issueKey
- 🔄 Modified: `buildConsolidatedDescription` - Simplified to show only files
- 🔄 Modified: File data stripped from storage (stored in Jira insteaduccess, comments[] }` |

### Key Changes in Version 2.0

- ❌ Removed: `downloadAttachment` (no Jira attachments)
- ✅ Added: `checkUserSubmission` (enforce one-per-user)
- ✅ Added: `deleteAssessment` (delete own submission)
- 🔄 Modified: `submitAssessment` (now checks for existing submissions)
- 🔄 Modified: `getAllAssessments` (filters by project, includes canDelete flag)

---

## Troubleshooting

### Common Issues

#### "You've already submitted an assessment"

**Cause**: You already submitted one assessment for this project (limit: 1 per user per project).

**Solution**:
1. View your existing submission in the list
2. Delete your submission if you want to resubmit
3. After deletion, you can submit a new assessment

#### "Failed to load assessments"

**Cause**: Storage not initialized or network issue.

**Solution**:
1. Refresh the page
2. Check browser console for errors
- Deleting an assessment does NOT delete the Jira issue (issue remains in backlog)

#### Cannot download files

**Cause**: Files not attached to Jira issue or network error.

**Solution**:
1. Check that the Jira issue exists (look in backlog)
2. Open the Jira issue directly and verify attachments are there
3. Refresh the page
4. Check browser console for errors
5. Contact admin if issue persists

#### Jira issue created but files missing

**Cause**: File upload failed during submission.

**Solution**:
1. Check the Jira issue in the backlog
2. Manually attach files to the Jira issue if needed
3. Check forge logs for upload errors: `forge logs -e production`
3. Contact admin if issue persists

#### Cannot delete an assessment

**Cause**: You can only delete assessments that YOU submitted.

**Solution**:
- Only your own submissions show the delete button
- Other users' assessments cannot be deleted

#### Form data lost

**Cause**: Browser closed before auto-save or draft cleared.

**Solution**:
- App auto-saves every 2 seconds
- Drafts are per user per project
- Reopen the app to restore your draft
- Drafts are cleared after successful submission

#### App not visible in project sidebar

**Cause**: App not installed or permissions issue.

**Solution**:
1. Verify installation: Contact admin
2. Check project access: Ensure you have project access
3. Refresh the browser
4. Try a different project

#### "Failed to submit assessment"

**Cause**: Missing permissions, validation failure, or storage error.

**Solution**:
1. Ensure you haven't already submitted (1 per user per project limit)
2. Check all required fields are filled
3. Check browser console for errors
4. Contact admin if issue persists

#### App Not Appearing in Jira

**Cause**: App not installed on production site.

**Solution**:
- Contact your administrator to install the app
- Ensure you have project access to your Jira site

#### Build Errors (Admins Only)

**Cause**: Missing dependencies or syntax errors.

**Solution**:
```powershell
cd static/hello-world
RemoInstallation for New Clients

**Complete installation guide available:** See **[CLIENT_SETUP_GUIDE.md](CLIENT_SETUP_GUIDE.md)**

The client setup guide covers:
- Installing Node.js and Forge CLI from scratch
- Extracting and building the app
- Deploying to production
- Installing on Jira site
- Updating the app
- Deleting/uninstalling the app
- Troubleshooting common issues

### Deployment Process (For Existing Installations)Force node_modules
npm install
npm run build
```

### Admin Troubleshooting

#### Viewing Logs (Production)

```powershell
forge logs -e production -n 50
```

#### Checking Deployment Status

```powershell
forge deploy -e productisrc/index.js):
   - Edit files
   - Deploy: `forge deploy -e production`
   - No rebuild needed

3. **Manifest Changes** (manifest.yml):
   - Edit manifest
   - Deploy: `forge deploy -e production`
   - Reinstall: `forge install --upgrade` (required for permission changes)

### Deleting/Uninstalling the App

**Uninstall from Jira:**
```powershell
forge uninstall --site your-site-name.atlassian.net --product jira -e production
```

**Or via Jira Admin Panel:**
1. Go to ⚙️ Settings → Apps → Manage apps
2. Find the app
3. Click "Uninstall"

**Delete from Developer Console:**
1. Go to httpsrc/index.js):
- `generateAssessmentId()` - Creates unique assessment IDs
- `checkUserSubmission()` - Validates one-per-user rule
- `createAssessmentIssue()` - Creates Jira issue with file attachments
- `submitAssessment()` - Stores assessment + creates Jira issue
- `getIssueAttachments()` - Fetches file list from Jira
- `downloadAttachment()` - Downloads file content from Jira
- `deleteAssessment()` - Deletes user's own assessment
- `getAllAssessments()` - Retrieves assessments with permissions
- `buildConsolidatedDescription()` - Builds simplified Jira issue description
- Draft & comment management resolvers

**Frontend**:
- App.js - Main form component
- AssessmentListView.js - List view with delete functionality
- FeedbackView.js - Read-only assessment view with download button
---

## Admin Guide (Production Management)

###**New Users:** Check the **[Client Setup Guide](CLIENT_SETUP_GUIDE.md)**
2. **All Users:** Check the [Troubleshooting](#troubleshooting) section
3. Contact your administrator
4. Review Forge logs (admins): `forge logs -e production`
5. Consult [Atlassian Forge Documentation](https://developer.atlassian.com/platform/forge/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2.0 | 2026-01-28 | **Production Release**: Creates Jira issues with file attachments, download functionality, simplified issue descriptions (files only) |
| 2.0.0 | 2026-01-24 | Storage-based architecture, one-per-user submission limit, delete own assessments |
| 3.5.0 | 2026-01-20 | Fixed assessment loading, improved error handling |
| 3.4.0 | 2026-01-20 | Error messages per section, only show "Yes" sections in feedback |
| 3.3.0 | 2026-01-20 | Added assessment list view, navigation |
| 3.2.0 | 2026-01-20 | Added comment system with multi-user support |

---

**Last Updated**: January 28, 2026  
**Environment**: Production  
**App Version**: 2.2.0  
**Runtime**: Node.js 24.x

Note: Forge resolvers won't work in local mode.

### Adding New Sections

1. Add section key to `SECTIONS` array in `App.js`
2. Add configuration to `SECTION_CONFIG` object
3. Add initial state in `sectionData` useState
4. Update `FeedbackView.js` if needed

### Creating New Resolvers

In `src/index.js`:

```javascript
resolver.define('myNewResolver', async (req) => {
  try {
    const { param1, param2 } = req.payload;
    // Your logic here
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
```

### Testing

```bash
# Lint the app
forge lint

# Check for issues
forge deploy --dry-run
```

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. View Forge logs: `forge logs`
3. Consult Atlassian Forge documentation: https://developer.atlassian.com/platform/forge/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.5.0 | 2026-01-20 | Fixed assessment loading, improved error handling |
| 3.4.0 | 2026-01-20 | Error messages per section, only show "Yes" sections in feedback |
| 3.3.0 | 2026-01-20 | Added assessment list view, navigation |
| 3.2.0 | 2026-01-20 | Added comment system with multi-user support |
| 3.1.0 | 2026-01-20 | Colored severity badges, feedback preview |
| 3.0.0 | 2026-01-20 | Major refactor with improved UX |

---

## License

Internal use only. © 2026

