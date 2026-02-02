# Security Code & App Infrastructure Review - Project Overview

## 📋 Table of Contents
1. [Project Summary](#project-summary)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Security Categories](#security-categories)
6. [User Capabilities](#user-capabilities)
7. [Installation & Deployment](#installation--deployment)

---

## Project Summary

**Security Code & App Infrastructure Review** is an Atlassian Forge application designed to streamline security assessment workflows within Jira. The app enables development teams to document, track, and manage security vulnerabilities and compliance issues directly within their Jira projects.

### Purpose
- Centralize security assessment documentation
- Create Jira issues automatically for security findings
- Attach evidence files directly to security issues
- Track security vulnerabilities across multiple categories
- Maintain audit trails for compliance and security reviews

### Target Users
- Security Engineers
- DevOps Teams
- Development Teams
- Compliance Officers
- Project Managers

---

## Key Features

### 🔐 Comprehensive Security Assessment
- **5 Security Categories**: SAST, SCA, IaC, Secret Detection, Container Scanning
- **Severity Tracking**: Critical, High, Medium, Low, Info levels
- **Multi-field Support**: Links (up to 15), File attachments (up to 5 per section), Descriptions

### 📝 Automated Jira Integration
- **Automatic Issue Creation**: Creates Jira issues in project backlog upon submission
- **File Attachments**: Uploads all assessment files as Jira issue attachments
- **Structured Descriptions**: Generates formatted ADF (Atlassian Document Format) descriptions
- **Issue Tracking**: Links assessments to Jira issues for easy reference

### 📎 File Management
- **Multiple File Types**: Supports all file types (PDF, DOC, TXT, PNG, etc.)
- **File Size Limit**: Up to 5MB per file
- **Direct Download**: Download attached files from within the app
- **Jira Storage**: Files stored as native Jira attachments

### 💾 Data Persistence
- **Forge Storage**: Assessment metadata stored in Forge Key-Value Storage
- **Jira Issues**: Full assessment data and files stored in Jira
- **Assessment List**: Centralized view of all project assessments

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Auto-save Drafts**: Saves form data every 2 seconds
- **Assessment List View**: Browse all assessments with filtering options
- **Responsive Design**: Works on desktop and tablet devices

### 🔒 Security & Permissions
- **Jira Permissions**: Respects Jira project permissions
- **User Authentication**: Uses Forge's built-in authentication
- **Scope Management**: Minimal required permissions (read/write Jira, storage)

---

## Technology Stack

### Frontend
- **React 18.3.1**: UI framework for building interactive components
- **Forge React (@forge/react)**: Atlassian's custom React components for Forge
- **Forge Bridge (@forge/bridge)**: Communication layer between frontend and backend
- **Tailwind CSS 3.4.17**: Utility-first CSS framework for styling
- **PostCSS 8.4.49**: CSS transformations and autoprefixing

### Backend
- **Node.js 24.x**: Runtime environment (ARM64 architecture)
- **Forge Resolver (@forge/resolver)**: Backend function handler
- **Forge API (@forge/api)**: Jira REST API integration
- **Forge Storage**: Key-value storage for metadata

### Atlassian Platform
- **Atlassian Forge**: Cloud-based app platform
- **Jira Cloud REST API v3**: Issue creation, attachment management
- **Jira Project Page Module**: App integration point

### Build Tools
- **Create React App**: Frontend build system
- **Webpack 5**: Module bundler
- **Babel**: JavaScript transpiler
- **npm**: Package manager

### File Handling
- **Multipart Form Data**: File upload protocol
- **Base64 Encoding**: File transfer format
- **Blob API**: Browser file download

---

## Architecture

### Application Structure
```
Jira-App/
├── src/
│   └── index.js           # Backend resolvers (Node.js)
├── static/hello-world/
│   ├── src/
│   │   ├── App.js         # Main React app
│   │   ├── AssessmentListView.js  # Assessment list component
│   │   └── FeedbackView.js        # Assessment detail view
│   ├── build/             # Production build
│   └── package.json       # Frontend dependencies
├── manifest.yml           # Forge app configuration
└── package.json           # Backend dependencies
```

### Data Flow
1. **User Input**: User fills assessment form in React frontend
2. **Draft Auto-save**: Form data saved locally every 2 seconds
3. **Submission**: User submits assessment
4. **Backend Processing**: Resolver creates Jira issue with ADF description
5. **File Upload**: Files uploaded as multipart attachments to Jira
6. **Storage**: Assessment metadata stored in Forge Storage
7. **Confirmation**: Success message shown, assessment added to list

### API Integration
- **Frontend → Backend**: Uses `@forge/bridge` invoke() for resolver calls
- **Backend → Jira**: Uses `@forge/api` requestJira() for REST API calls
- **Authentication**: Automatic via Forge platform (.asApp() for system access)

---

## Security Categories

### 1. SAST (Static Application Security Testing)
Track vulnerabilities found through static code analysis tools.

### 2. SCA (Software Composition Analysis)
Document vulnerable dependencies and third-party libraries.

### 3. IaC (Infrastructure as Code)
Report misconfigurations in infrastructure templates (Terraform, CloudFormation, etc.).

### 4. Secret Detection
Track exposed secrets, API keys, passwords, and credentials.

### 5. Container Images Scanning
Document vulnerabilities in Docker images and container registries.

---

## User Capabilities

### For Team Members
- ✅ Submit security assessments for their projects
- ✅ Upload evidence files (reports, screenshots, logs)
- ✅ View all assessments in their project
- ✅ Download attached files
- ✅ Delete their own assessments
- ✅ View assessment details and Jira issue links

### For Project Admins
- ✅ Install/uninstall the app
- ✅ View all project assessments
- ✅ Access Jira issues created by the app
- ✅ Manage app permissions via Jira settings

### For Developers/DevOps
- ✅ Deploy app updates
- ✅ View app logs for debugging
- ✅ Customize app configuration
- ✅ Integrate with CI/CD pipelines

---

## Installation & Deployment

### Prerequisites
- Node.js 20.x or 22.x
- Atlassian Forge CLI
- Jira Cloud admin access
- Atlassian account

### Quick Setup
```powershell
# 1. Install dependencies
npm install
cd static/hello-world
npm install
npm run build
cd ../..

# 2. Deploy to production
forge deploy -e production --non-interactive

# 3. Install on Jira site
forge install --site YOUR-SITE.atlassian.net --product jira -e production --non-interactive
```

### Environments
- **Production**: Live environment for end users
- **Development**: Testing environment for developers
- **Staging**: Optional pre-production environment

---

## Version Information

**Current Version**: 2.2.0  
**Release Date**: January 28, 2026  
**Node.js Runtime**: 24.x (ARM64)  
**Forge API Version**: Latest  

---

## Key Benefits

### For Security Teams
- ✅ Centralized security findings repository
- ✅ Automated documentation workflow
- ✅ Evidence attachment and storage
- ✅ Integration with existing Jira workflows

### For Development Teams
- ✅ Easy-to-use interface
- ✅ No context switching (works within Jira)
- ✅ Automatic Jira issue creation
- ✅ Trackable security tasks in backlog

### For Organizations
- ✅ Compliance audit trail
- ✅ Security metrics and reporting
- ✅ Reduced manual documentation effort
- ✅ Better security visibility across projects

---

## Future Enhancements (Potential)

- 📊 Security metrics dashboard
- 🔔 Notification system for new assessments
- 🔄 Integration with security scanning tools (SonarQube, Snyk, etc.)
- 📈 Trend analysis and reporting
- 🏷️ Custom tags and labels
- 🔍 Advanced search and filtering
- 📤 Export functionality (PDF, CSV)
- 👥 Team collaboration features

---

## Support & Documentation

- **Setup Guide**: [CLIENT_SETUP_GUIDE.md](CLIENT_SETUP_GUIDE.md)
- **Technical Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)
- **Atlassian Forge Docs**: [developer.atlassian.com/platform/forge](https://developer.atlassian.com/platform/forge/)

---

## License & Ownership

**Developed for**: Internal organizational use  
**Platform**: Atlassian Forge Cloud  
**Hosting**: Atlassian Cloud Infrastructure  

---

*Last Updated: January 28, 2026*
