# Job Scraper Roadmap

This document outlines planned features and architectural changes for future versions of the Job Scraper.

## v3.0: Personal ATS & Web Dashboard (Planned)
The primary goal of v3.0 is to evolve the script from a background daemon into a full-fledged Personal Applicant Tracking System (ATS) with a dynamic frontend.

### 1. Web Dashboard & UI
- **Tech Stack**: Next.js or Vite (React), styled with Tailwind CSS and Framer Motion for a premium, dynamic feel.
- **Home Dashboard**: 
  - Charts showing scraping metrics (jobs found per day, conversion rates).
  - High-level overview of application statuses.
- **Kanban Board**: Drag-and-drop columns for managing job applications: `New` ➡️ `Applied` ➡️ `Interviewing` ➡️ `Rejected/Ghosted`.
- **Target Management**: Web UI to easily add/remove companies from `targets.json` and toggle keywords without touching the code.

### 2. Backend & Database Enhancements
- **API Layer**: Wrap the existing Python scraper logic in a lightweight API (e.g., FastAPI or Flask).
- **Database Upgrade**: Expand `jobs.db` from a simple notification log to a relational DB tracking:
  - `status` (New, Applied, Ignored)
  - `date_applied`
  - `notes` (Interview feedback, recruiter names)
- **Real-time Notifications**: Transition from pure Telegram batching to WebSockets/Server-Sent Events for instant UI updates when jobs are discovered.

### 3. AI Integrations
- **LLM API Integration**: Connect the dashboard to standard LLM APIs (OpenAI/Gemini).
- **Auto-Tailored Cover Letters**: One-click generation of tailored cover letters by feeding the scraped Job Description and base Resume to the LLM.
- **Resume Tailoring**: AI highlights specific keywords and skills to emphasize during interviews based on the scraped JD.

---

## Future Considerations (v4.0+)
- **Automated Applying**: Investigate Playwright scripts to automatically submit applications for low-barrier ATS platforms (e.g., Lever/Greenhouse).
- **Cloud Deployment**: Containerize the web app and database for deployment on AWS/Azure, moving completely off the local cron setup.
