# 🚀 ApexTask Pro - Full-Stack SaaS Agile Kanban Management

ApexTask Pro is an enterprise-grade, high-fidelity SaaS Kanban workspace designed to streamline agile workflows, map team workloads, and calculate velocity metrics in real-time. Built with a modern tech stack (React 19, Express, Tailwind CSS v4, and MongoDB), it features a highly polished user experience tailored for recruiters and portfolio displays.

---

## ✨ Key Professional Features

*   **🛡️ Dynamic Hybrid Database Adapter:** Auto-detects its environment. Connects seamlessly to a cloud-based **MongoDB Atlas** database when `MONGODB_URI` is present, and gracefully falls back to a zero-config local **JSON File Database (`db.json`)** for instant offline local development.
*   **📊 Interactive Agile Analytics & Velocity Dashboard:** Includes live workload capacity tracking per developer, agile story points completion ratios, tag distribution breakdowns, and active developer overload warning indicators.
*   **🎉 Premium Visual Experience:** Implemented with smooth dark/light theme switching, custom glassmorphic interfaces, interactive Framer Motion modal scales, and high-performance **Confetti Explosions** upon shifting cards into the completed state.
*   **📥 Comprehensive Backup & Excel Reporting Engines:** 
    *   *Workspace Backup (JSON):* Dynamic full-board backup downloads to persist workspaces.
    *   *Excel Report (CSV):* Generates structured spreadsheet reports with subtask ratios, points, and assignees.
*   **⏰ Overdue Notifications System:** Calculates due-date margins and highlights overdue tasks with high-visibility pulsating alert wrappers.
*   **📋 Subtask Checklist Engine:** Interactive nested check-offs with dynamically compiled progression bars on every card.

---

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite 8, Framer Motion 12, Tailwind CSS v4, Lucide Icons.
*   **Backend:** Node.js, Express, Mongoose (MongoDB ODM), Cors, Dotenv.
*   **Database:** MongoDB Atlas (Cloud) / Fallback Local JSON Storage.

---

## 📦 Local Setup & Installation

Getting the application running locally is extremely simple with our unified monorepos scripts:

1.  **Clone or Download the Repository:**
    ```bash
    cd apex-task-manager
    ```

2.  **Install All Dependencies (Unified Command):**
    From the root directory, run:
    ```bash
    npm run install-all
    ```
    *(This automatically installs all package dependencies in both `/frontend` and `/backend` directories)*

3.  **Start Development Servers (Two Terminals):**
    *   **Terminal 1 (Backend):**
        ```bash
        npm run dev-backend
        ```
    *   **Terminal 2 (Frontend):**
        ```bash
        npm run dev-frontend
        ```

4.  **Open Client Interface:**
    Navigate to `http://localhost:5173` in your browser.

---

## 💾 Connecting MongoDB Atlas (Production & Local Cloud Mode)

To persist data permanently in the cloud:
1. Create a free database cluster at [MongoDB Atlas](https://www.mongodb.com).
2. Create a file named `.env` inside the `backend/` directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/apextask?retryWrites=true&w=majority
   PORT=5000
   ```
3. Restart your backend server. It will automatically detect the URI, connect to MongoDB Atlas, and log:
   `🔌 Connected successfully to MongoDB Atlas Cloud Database!`

---

## 🚀 Unified Deployment Guide (Render / Railway)

Because the project is structured with a unified production server, you can deploy both frontend and backend as **one single service** on Render!

1.  **Push the Code to GitHub:**
    Initialize git, commit all files, and push to a new public or private repository. (The root `.gitignore` will keep all local databases, node_modules, and `.env` credentials secure).
2.  **Create a New Web Service on Render:**
    *   Connect your GitHub repository.
    *   Set **Runtime** to `Node`.
    *   Set **Build Command** to:
        ```bash
        npm run install-all && npm run build-frontend
        ```
    *   Set **Start Command** to:
        ```bash
        npm start
        ```
3.  **Configure Environment Variables:**
    Under the **Environment** tab in Render, add:
    *   `MONGODB_URI` = *(Your MongoDB Atlas cluster URI string)*
    *   `NODE_ENV` = `production`
4.  **Deploy!** Render will install all dependencies, build the static optimized React app, and serve it directly from the Express API port. Zero CORS configurations required!
