# Security Review App - Complete Client Setup Guide (From Scratch)

This comprehensive guide walks you through installing and deploying the Security Code & App Infrastructure Review Forge App **from scratch** - assuming you have NO development tools installed.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Install Required Tools](#part-1-install-required-tools)
3. [Part 2: Prepare the App Files](#part-2-prepare-the-app-files)
4. [Part 3: Build and Deploy](#part-3-build-and-deploy)
5. [Part 4: Install on Jira](#part-4-install-on-jira)
6. [Part 5: Verification](#part-5-verification)
7. [Part 6: Updating the App](#part-6-updating-the-app)
8. [Part 7: Deleting/Uninstalling](#part-7-deletinguninstalling)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Windows** computer (or Mac/Linux - commands will be similar)
- ✅ **Admin access** to your Atlassian Jira Cloud site
- ✅ **Internet connection**
- ✅ **App files** (ZIP or folder provided by your team)

**You DO NOT need:**
- ❌ Node.js (we'll install it)
- ❌ Forge CLI (we'll install it)
- ❌ Any programming knowledge

---

## Part 1: Install Required Tools

### 🟢 Step 1.1: Install Node.js

Node.js is required to run the Forge CLI and build the app.

1. **Download Node.js**:
   - Visit: [https://nodejs.org/](https://nodejs.org/)
   - Click the green button for **LTS (Long Term Support)** version
   - Download the **Windows Installer (.msi)** - usually the 64-bit version

2. **Install Node.js**:
   - Run the downloaded `.msi` file
   - Click **"Next"** through the setup wizard
   - ✅ Make sure **"Add to PATH"** is checked (it should be by default)
   - Click **"Install"**
   - Wait for installation (1-2 minutes)
   - Click **"Finish"**

3. **Verify Installation**:
   - Press `Windows + X` and select **"Windows PowerShell"** or **"Terminal"**
   - Type:
     ```powershell
     # Check Node.js version
     node --version
     
     # Check npm version
     npm --version
     ```
   - You should see something like: `v20.11.0` or `v22.x.x` for Node and `10.2.4` for npm

✅ **If you see version numbers, Node.js is installed correctly!**

---

### 🟢 Step 1.2: Install Atlassian Forge CLI

The Forge CLI is the command-line tool that deploys your app to Atlassian's cloud platform.

1. **Install Forge CLI**:
   - In PowerShell, run:
     ```powershell
     npm install -g @forge/cli
     ```
   - Wait for installation (this may take 1-2 minutes)
   - You'll see progress indicators

2. **Verify Forge CLI**:
   - Type:
     ```powershell
     forge --version
     ```
   - You should see something like: `10.2.0` or higher

✅ **Forge CLI is now installed!**

---

### 🟢 Step 1.3: Log in to Forge

You need to authenticate the Forge CLI with your Atlassian account.

1. **Login Command**:
   - In PowerShell, run:
     ```powershell
     forge login
     ```

2. **What Happens**:
   - Your browser will open automatically
   - You'll see an Atlassian login page
   - Log in with your Atlassian account (the same one that has admin access to your Jira site)
   - Click **"Accept"** to authorize Forge CLI
   - Return to PowerShell - you should see: **"Successfully logged in"**

3. **Verify Login**:
   - Type:
     ```powershell
     forge whoami
     ```
   - You should see your name and email address

✅ **You're now authenticated with Atlassian!**

---

## Part 2: Prepare the App Files

### 🟦 Step 2.1: Extract the App Files

1. **Locate the App Package**:
   - You should have received a ZIP file or folder with the app files
   - Example name: `Jira-App.zip` or `Security-Review-App.zip`

2. **Extract**:
   - **If ZIP**: Right-click the ZIP file → **"Extract All..."** → Choose a location
   - Recommended location: `C:\Forge-Apps\Security-Review-App\`
   - Or: `D:\Projects\Jira-App\`
   - Click **"Extract"**

3. **Note the Path**:
   - Remember where you extracted the files
   - Example: `D:\T\Jira-App\Jira App\`

---

### 🟦 Step 2.2: Navigate to the App Folder

1. **Open PowerShell** (if not already open):
   - Press `Windows + X` → **"Windows PowerShell"** or **"Terminal"**

2. **Change to App Directory**:
   - Type (replace with your actual path):
     ```powershell
     cd "D:\T\Jira-App\Jira App"
     ```
   - Press `Enter`

3. **Verify You're in the Right Folder**:
   - Type:
     ```powershell
     # List files in current directory
     dir
     ```
   - You should see files like:
     - `manifest.yml`
     - `package.json`
     - `README.md`
     - `src` folder
     - `static` folder

✅ **You're in the correct directory!**

---

## Part 3: Build and Deploy

### 🔧 Step 3.1: Install Backend Dependencies

Install the Node.js packages required by the app.

1. **In the app root folder**, run:
   ```powershell
   npm install
   ```

2. **Wait for Completion**:
   - This may take 1-3 minutes
   - You'll see progress bars and package names
   - When done, you'll see a summary

---

### 🔧 Step 3.2: Install Frontend Dependencies

The app has a React frontend that also needs dependencies.

1. **Navigate to Frontend Folder**:
   ```powershell
   cd static\hello-world
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```

3. **Wait for Completion** (2-3 minutes)

---

### 🔧 Step 3.3: Build the Frontend

Compile the React app into production-ready files.

1. **Still in `static\hello-world`**, run:
   ```powershell
   npm run build
   ```

2. **Wait for Build**:
   - This takes 30-60 seconds
   - You'll see "Compiling..." → "Compiled successfully!"
   - File sizes will be displayed

✅ **Frontend is built!**

---

### 🔧 Step 3.4: Return to App Root

1. **Go back to the main app folder**:
   ```powershell
   # Go up two levels to app root
   cd ..\..
   
   # Or use the full path
   cd "D:\T\Jira-App\Jira App"
   
   # Verify you're in the app root
   pwd
   ```
   - Should show the app root path

---

### 🚀 Step 3.5: Deploy to Production

Deploy the app to Atlassian's production cloud environment.

1. **Deploy Command**:
   ```powershell
   forge deploy -e production --non-interactive
   ```

2. **What You'll See**:
   - "Packaging app files..."
   - "Uploading app..."
   - "Deploying to environment: production"
   - **✔ Deployed successfully**

3. **Deployment Time**: 30-60 seconds

✅ **App is deployed to Atlassian's servers!**

---

## Part 4: Install on Jira

### 📥 Step 4.1: Install the App on Your Jira Site

Now install the deployed app on your Jira Cloud site.

1. **Install Command** (replace `YOUR-SITE` with your actual Jira site name):
   ```powershell
   forge install --site YOUR-SITE.atlassian.net --product jira -e production --non-interactive
   ```

2. **Example**:
   ```powershell
   forge install --site acmecompany.atlassian.net --product jira -e production --non-interactive
   ```

3. **What You'll See**:
   - List of permissions the app will request
   - URLs the app will access
   - **✔ Your app in the production environment is now installed in Jira**

✅ **App is installed on your Jira site!**

---

### 📥 Step 4.2: Grant Permissions (if needed)

After installation, verify permissions:

1. **Open Jira in Browser**:
   - Go to: `https://YOUR-SITE.atlassian.net/`

2. **Navigate to Apps**:
   - Click **⚙️ Settings** (gear icon in top right)
   - Select **"Apps"** → **"Manage apps"**

3. **Find Your App**:
   - Look for **"Security Code & App Infrastructure Review"** (or your app name ending in `jjj`)
   - Ensure it's **Enabled**
   - If prompted, grant any additional permissions

---

## Part 5: Verification

### ✅ Step 5.1: Access the App

1. **Navigate to Jira Project**:
   - Go to any Jira project on your site
   - Example: `https://YOUR-SITE.atlassian.net/jira/software/projects/PROJ/board`

2. **Find the App in Sidebar**:
   - Look in the **left sidebar**
   - Find **"Secure Code & App Infrastructure Review"**
   - Click on it

3. **App Should Load**:
   - You should see the security assessment form
   - If you see the form, the app is working!
```powershell
---

### ✅ Step 5.2: Test the App

1. **Fill Out a Test Assessment**:
   - Answer "Yes" to the main question
   - Fill in one section (e.g., SAST):
     - Select severity
     - Add a test link
     - Upload a small test file (e.g., a PDF or text file)
     - Add a summary
   - Click **"Submit"**

2. **Verify Success**:
   - You should see: "Assessment submitted successfully!"
   - Click the **list icon (📋)** in the header
   - You should see your assessment in the list

3. **Check Jira Backlog**:
   - Go to your project's backlog
   - You should see a new issue created (e.g., "Security Assessment - High")
   - Open the issue - it should have your file attached

✅ **App is working correctly!**

---

## Part 6: Updating the App (Future Updates)

When you receive an updated version of the app from your team:

### 🔄 Option A: Fresh Installation (Recommended)

1. **Extract New Files**:
   - Extract the updated app files to a **new folder**
   - Example: `D:\T\Jira-App-v2\`

2. **Navigate to New Folder**:
   ```powershell
   cd "D:\T\Jira-App-v2"
   ```

3. **Install Dependencies and Deploy**:
   ```powershell
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd static\hello-world
   npm install
   
   # Build the frontend
   npm run build
   
   # Return to app root
   cd ..\..
   
   # Deploy the update
   forge deploy -e production --non-interactive
   ```

5. **Done!**:
   - The app automatically updates on your Jira site
   - You do **NOT** need to run `forge install` again (unless permissions changed)

---

### 🔄 Option B: In-Place Update

1. **Backup Current Folder** (optional but recommended):
   - Copy your current app folder to a backup location

2. **Extract Over Existing**:
   - Extract the new files over your existing app folder
   - Overwrite when prompted

3. **Reinstall Dependencies and Deploy**:
   ```powershell
   # Navigate to app root
   cd "D:\T\Jira-App\Jira App"
   
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd static\hello-world
   npm install
   
   # Build the frontend
   npm run build
   
   # Return to app root
   cd ..\..
   
   # Deploy the update
   forge deploy -e production --non-interactive
   ```

---

### 🔄 When to Reinstall (vs. Just Redeploy)

You **ONLY** need to run `forge install` again if:
- ❗ New permissions/scopes were added to `manifest.yml`
- ❗ The app ID changed

Otherwise, just run `forge deploy -e production --non-interactive` for updates.

---

## Part 7: Deleting/Uninstalling

### 🗑️ Uninstall from Jira Site

**Option 1: Via Forge CLI**

```powershell
forge uninstall --site YOUR-SITE.atlassian.net --product jira -e production --non-interactive
```

**Option 2: Via Jira Admin UI**

1. Go to **⚙️ Settings** → **Apps** → **Manage apps**
2. Find **"Security Code & App Infrastructure Review"**
3. Click **"Uninstall"**
4. Confirm

**⚠️ Note**: Uninstalling the app does **NOT** delete Jira issues that were created. Those remain in your project.

---

### 🗑️ Delete App from Forge (Permanently)

**⚠️ Warning**: This permanently deletes the app from Atlassian's servers.

1. Go to: [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Log in with your Atlassian account
3. Find your app in the list
4. Click on the app
5. Go to **Settings** → **Delete app**
6. Confirm deletion

---

## Troubleshooting

### ❌ "Command not found: forge"

**Issue**: Forge CLI is not installed or not in your PATH.

**Solution**:
1. Reinstall Forge CLI:
   ```powershell
   npm install -g @forge/cli
   ```
2. Close PowerShell and open a new window
3. Try again

---

### ❌ "Command not found: npm" or "Command not found: node"

**Issue**: Node.js is not installed or not in your PATH.

**Solution**:
1. Reinstall Node.js from [nodejs.org](https://nodejs.org/)
2. **Make sure "Add to PATH" is checked** during installation
3. Close PowerShell and open a new window
4. Verify:
   ```powershell
   # Check if Node.js is working
   node --version
   
   # Check if npm is working
   npm --version
   ```

---

### ❌ "Permission denied" or "Access denied"

**Issue**: You don't have admin permissions on the Jira site.

**Solution**:
- Contact your Jira administrator
- Ask them to grant you admin access
- Or ask them to install the app for you

---

### ❌ "Deployment failed"

**Issue**: Network error or authentication problem.

**Solution**:
1. Check your internet connection
2. Run these commands:
   ```powershell
   # Verify you're logged in
   forge whoami
   
   # Re-login if needed
   forge login
   
   # Try deploying again with verbose logging
   forge deploy -e production --verbose
   ```

---

### ❌ "Build failed" in frontend

**Issue**: Missing or corrupted dependencies.

**Solution**:
```powershell
# Navigate to frontend folder
cd static\hello-world

# Remove corrupted node_modules
Remove-Item -Recurse -Force node_modules

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Return to app root
cd ..\..
```

---

### ❌ "App not showing in Jira sidebar"

**Issue**: App not installed, or cache issue.

**Solution**:
1. Verify installation:
   ```powershell
   forge install:list -e production
   ```
2. Hard refresh browser:
   - **Windows**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`
3. Clear browser cache
4. Try a different browser
5. Reinstall if needed

---

### ❌ "Manifest validation failed"

**Issue**: `manifest.yml` has syntax errors.

**Solution**:
```powershell
forge lint
```

This will show you exactly what's wrong.

---

### 🔍 View App Logs (for Debugging)

To see what's happening in your app:

```powershell
# View last 50 lines
forge logs -e production -n 50

# View logs from last 30 minutes
forge logs -e production --since 30m

# Follow logs in real-time (like tail -f)
forge logs -e production --tail
```

Press `Ctrl + C` to stop following logs.

---

## Quick Reference

### 📝 Common Commands

| Command | Description |
|---------|-------------|
| `node --version` | Check Node.js version |
| `npm --version` | Check npm version |
| `forge --version` | Check Forge CLI version |
| `forge login` | Authenticate with Atlassian |
| `forge whoami` | Check current login status |
| `npm install` | Install Node.js dependencies |
| `npm run build` | Build React frontend |
| `forge deploy -e production --non-interactive` | Deploy app to production |
| `forge install --site SITE.atlassian.net --product jira -e production --non-interactive` | Install app on Jira |
| `forge install:list -e production` | List all app installations |
| `forge uninstall --site SITE.atlassian.net --product jira -e production --non-interactive` | Uninstall app from Jira |
| `forge logs -e production` | View app logs |
| `forge lint` | Validate `manifest.yml` syntax |

---

### 🎯 Quick Workflow Summary

**First-Time Setup:**
```powershell
# 1. Verify Node.js is installed
node --version

# 2. Install Forge CLI
npm install -g @forge/cli

# 3. Login to Atlassian
forge login
```

**Deploy App:**
```powershell
# 1. Navigate to app folder
cd "D:\T\Jira-App\Jira App"

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies and build
cd static\hello-world
npm install
npm run build
cd ..\..

# 4. Deploy to production
forge deploy -e production --non-interactive

# 5. Install on your Jira site
forge install --site YOUR-SITE.atlassian.net --product jira -e production --non-interactive
```

**Update App:**
```powershell
# 1. Navigate to app folder
cd "D:\T\Jira-App\Jira App"

# 2. Install dependencies
npm install
cd static\hello-world
npm install

# 3. Build frontend
npm run build
cd ..\..

# 4. Deploy update
forge deploy -e production --non-interactive
```

---

## Getting Help

### 📚 Resources

- **Atlassian Forge Documentation**: [developer.atlassian.com/platform/forge](https://developer.atlassian.com/platform/forge/)
- **Forge Community**: [community.developer.atlassian.com](https://community.developer.atlassian.com/)
- **Your Organization's IT/Admin Team**

### 🆘 Support Checklist

If you're stuck, try these steps in order:

1. ✅ Check this guide's [Troubleshooting](#troubleshooting) section
2. ✅ Run `forge logs -e production` to see errors
3. ✅ Verify you're in the correct directory (`pwd`)
4. ✅ Verify you're logged in (`forge whoami`)
5. ✅ Try the command with `--verbose` flag
6. ✅ Contact your Jira administrator or app developer

---

## Important Notes

### 📦 File Limits

- **Max file size per attachment**: 5MB
- **Max files per section**: 5 files
- **Supported file types**: All types (PDF, DOC, TXT, PNG, etc.)

### 💾 Data Storage

- **Assessments create Jira issues** in the project's backlog
- **Files are attached to Jira issues** (not stored in Forge storage)
- **Assessment metadata** is stored in Forge Key-Value Storage

### 🔐 Required Permissions

The app requires these Jira permissions:
- ✅ Read Jira work (view issues/projects)
- ✅ Write Jira work (create issues)
- ✅ Read user information
- ✅ Manage Jira project
- ✅ App storage (for assessment metadata)

These are automatically requested during installation.

### 🌍 Environments

- **Production**: Live environment for all users (use `-e production`)
- **Development**: Testing environment (use `-e development`)
- **Staging**: Optional staging environment (use `-e staging`)

For client deployments, always use `production`.

---

## Appendix: PowerShell Basics

### 🖥️ Opening PowerShell

**Method 1**:
1. Press `Windows + X`
2. Select **"Windows PowerShell"** or **"Terminal"**

**Method 2**:
1. Press `Windows + R`
2. Type `powershell`
3. Press `Enter`

---

### 📂 Navigating Directories

```powershell
# Change to a directory
cd "C:\Path\To\Folder"

# Go up one level
cd ..

# Go to a specific drive
cd D:\

# List files in current directory
dir

# Show current directory path
pwd

# Example: Navigate to app folder
cd "D:\T\Jira-App\Jira App"
```

---

### 📋 Copy & Paste in PowerShell

- **Paste text**: Right-click in PowerShell window
- **Copy text**: Select text with mouse, then right-click
- **Keyboard paste**: `Ctrl + V` (in newer Windows Terminal)

---

### 🔍 Useful Commands

```powershell
# Clear screen
cls

# View command history
Get-History

# Cancel current command
# Press: Ctrl + C

# Exit PowerShell
exit
```

---

## Summary Checklist

Use this checklist to track your progress:

### First-Time Setup
- [ ] Installed Node.js (`node --version` works)
- [ ] Installed Forge CLI (`forge --version` works)
- [ ] Logged in to Forge (`forge whoami` shows your email)

### App Deployment
- [ ] Extracted app files to a folder
- [ ] Navigated to app folder in PowerShell
- [ ] Ran `npm install` in root folder
- [ ] Ran `npm install` in `static\hello-world`
- [ ] Ran `npm run build` in `static\hello-world`
- [ ] Returned to root folder (`cd ..\..`)
- [ ] Deployed app (`forge deploy -e production --non-interactive`)
- [ ] Installed app on Jira site (`forge install...`)

### Verification
- [ ] Opened Jira site in browser
- [ ] Found app in project sidebar
- [ ] Submitted a test assessment
- [ ] Verified Jira issue was created

### Done! 🎉
Your Security Code & App Infrastructure Review app is now live in production!

---

**App Name**: Security Code & App Infrastructure Review  
**Current Version**: 2.2.0  
**Last Updated**: January 28, 2026  
**Production Site**: https://haazm994.atlassian.net/ (or your site)  
**Support**: Contact your Jira administrator or app developer

---

*End of Client Setup Guide*