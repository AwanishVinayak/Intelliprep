# IntelliPrep

Smart Academic + Coding Analytics Platform for students, faculty, and recruiters.

## Local Setup Instructions

To run this project on your computer, follow these steps:

### 1. Prerequisites
- Install [Node.js](https://nodejs.org/) (v18 or higher recommended).
- A Firebase project (if you want to use your own database).

### 2. Installation
1. Download or clone this project to your machine.
2. Open your terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Firebase configuration (if applicable) or other environment variables from `.env.example`.

**Note for Local Login:**
If Google Login is not working on `localhost:3000`:
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Authentication** > **Settings** > **Authorized domains**.
4. Add `localhost` to the list if it's not already there.

### 4. Running the App
Start the development server:
```bash
npm run dev
```

The application will be available at 
 Features
- **Student Dashboard**: Track GitHub commits, LeetCode progress, and watch learning content.
- **Faculty Dashboard**: Manage attendance, payroll, and view student analytics.
- **Recruiter View**: Discover top technical talent based on verified coding metrics.
- **Admin Console**: System-wide configuration and global overviews.

Tech Stack Used:
Frontend: React 18, Vite (for blazing-fast builds)
Styling: Tailwind CSS (brutalist/modern UI architecture)
Data Visualization: Recharts (dynamic progress tracking)
Animations: Motion (smooth state transitions)
Backend: Node.js & Express
Database & Auth: Firebase / Firestore (real-time data & high security)
Icons: Lucide-React
