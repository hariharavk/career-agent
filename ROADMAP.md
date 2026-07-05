# CareerAgent Roadmap & Upcoming Features

This document tracks upcoming features, infrastructure improvements, and production-grade monitoring capabilities planned for CareerAgent.

## 1. Production-Grade Monitoring & Observability
- **Error Tracking (Sentry)**: Integrate Sentry into the FastAPI backend to catch unhandled exceptions (e.g., Playwright scraping failures, LLM API timeouts) and trace performance bottlenecks.
- **Application Metrics (Prometheus + Grafana)**: Expose a `/metrics` endpoint in FastAPI to track:
  - Scraper success/failure rates.
  - Average LLM response times.
  - Number of jobs processed per day.
- **Telegram Health Alerts**: Implement the backend Python logic to use the encrypted `telegram_bot_token` to send push notifications when a high-match job is found or a scraper fails.

## 2. Chrome Extension Improvements
- **Batch Processing & Multi-Save**: Allow users to queue up multiple jobs from a search results page (e.g., LinkedIn Jobs page) and send them to the backend in a single batch for parallel AI processing.
- **Automated DOM Parsing**: Improve the content script to automatically extract the Job Title, Company, and full Job Description from LinkedIn/Indeed/Naukri without requiring the user to highlight text.
- **One-Click Inject**: Ability to click a button in the extension to automatically populate the company's application form (Workday/Greenhouse) using data from the local SQLite database.
- **Sync Status**: Show the Kanban status (e.g., "Already Applied") directly on the LinkedIn job posting via the extension.

## 3. Advanced AI & Scraping Features
- **CAPTCHA Bypass**: Implement sophisticated stealth mechanisms (e.g., rotating proxies, undetected-chromedriver) to bypass Cloudflare/DataDome protection on strict ATS portals.
- **Multi-Resume Support**: Allow users to upload multiple base resumes (e.g., one for Backend, one for DevOps) and have the AI dynamically select the best base template before tailoring it to the specific JD.
- **Automated Email Follow-ups**: A background cron job that checks the database for jobs in the "Applied" column older than 7 days, and automatically drafts a polite follow-up email.

## 4. Architectural & Codebase Health
- **Database Concurrency (SQLite WAL)**: Enable `PRAGMA journal_mode=WAL;` to allow simultaneous reads and writes from the API, APScheduler, and Playwright scrapers without hitting database locks.
- **Robust Rate Limit Handling**: Implement exponential backoff and a dead-letter queue for AI evaluations. If a strict `429 Too Many Requests` is hit, the job should be gracefully queued for retry rather than failing completely.
- **LaTeX Compilation Safety**: Build a robust sanitization pipeline to escape special LaTeX characters (like `%`, `&`, `_`, `$`) from the AI-generated text before injecting it into the `.tex` file to prevent `pdflatex` compilation crashes.

## 5. Security & Privacy
- **Secure Secret Management**: Migrate the master Fernet encryption key out of the local `.secret.key` file in the volume and require it to be injected securely via Docker `.env` variables at runtime.
- **Dependency Scanning**: Integrate Dependabot or Snyk to track and automatically update outdated Python and Node.js packages.
- **Browser Sandboxing**: Harden the Playwright browser context by stripping unnecessary permissions (geolocation, camera) and enforcing strict sandboxing to protect against malicious scripts on third-party job boards.

## 6. Open Source Standards & Testing
- **GitHub Issue Templates**: Add standard templates for users to easily report broken job board scrapers.
- **Automated Test Suite**: Build a comprehensive `pytest` test suite covering core backend logic, specifically mocking LLM responses and validating the LaTeX text-sanitization pipeline.
- **CI/CD Validation**: Set up GitHub Actions workflows to run `eslint`/`tsc` on the React frontend and `pytest` on the FastAPI backend automatically on every Pull Request.
