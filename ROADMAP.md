# CareerAgent Roadmap & Upcoming Features

This document tracks upcoming features, infrastructure improvements, and production-grade monitoring capabilities planned for CareerAgent.

## 1. Containerization & Deployment
- **Docker Compose Setup**: Containerize the Frontend (Nginx/Vite), Backend (FastAPI), and a Background Worker (Celery/Playwright) into a single `docker-compose.yml` for seamless 1-click deployment.
- **Volume Management**: Ensure SQLite databases (`jobs.db`, `scraper.db`) and user data (LaTeX templates, generated PDFs) are properly mounted to persistent Docker volumes so data survives container restarts.

## 2. Production-Grade Monitoring & Observability
- **Error Tracking (Sentry)**: Integrate Sentry into the FastAPI backend to catch unhandled exceptions (e.g., Playwright scraping failures, LLM API timeouts) and trace performance bottlenecks.
- **Application Metrics (Prometheus + Grafana)**: Expose a `/metrics` endpoint in FastAPI to track:
  - Scraper success/failure rates.
  - Average LLM response times.
  - Number of jobs processed per day.
- **Telegram Health Alerts**: Extend the existing Telegram bot to send critical health alerts (e.g., "⚠️ Scraper failed for Greenhouse - Element not found" or "❌ Gemini API Rate Limit Exceeded").

## 3. Chrome Extension Improvements
- **Batch Processing & Multi-Save**: Allow users to queue up multiple jobs from a search results page (e.g., LinkedIn Jobs page) and send them to the backend in a single batch for parallel AI processing.
- **Automated DOM Parsing**: Improve the content script to automatically extract the Job Title, Company, and full Job Description from LinkedIn/Indeed/Naukri without requiring the user to highlight text.
- **One-Click Inject**: Ability to click a button in the extension to automatically populate the company's application form (Workday/Greenhouse) using data from the local SQLite database.
- **Sync Status**: Show the Kanban status (e.g., "Already Applied") directly on the LinkedIn job posting via the extension.

## 4. Advanced AI & Scraping Features
- **CAPTCHA Bypass**: Implement sophisticated stealth mechanisms (e.g., rotating proxies, undetected-chromedriver) to bypass Cloudflare/DataDome protection on strict ATS portals.
- **Multi-Resume Support**: Allow users to upload multiple base resumes (e.g., one for Backend, one for DevOps) and have the AI dynamically select the best base template before tailoring it to the specific JD.
- **Automated Email Follow-ups**: A background cron job that checks the database for jobs in the "Applied" column older than 7 days, and automatically drafts a polite follow-up email.
