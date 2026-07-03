# CareerAgent - Feature Checklist

CareerAgent is an open-source, AI-powered job search automation platform built specifically for software engineers and IT professionals looking to make their next big career switch. It automates the most time-consuming parts of the job hunt—finding matching roles, tailoring ATS-friendly resumes, and writing personalized referral emails—saving you hours after a long shift. Below is the comprehensive list of features currently supported by the platform.

## 1. Automated Job Discovery & Scraping
- **Headless Browser Scraping**: Uses Playwright to render and scrape dynamic JavaScript-heavy ATS platforms (Greenhouse, Lever, Workday).
- **Background Cron Scheduler**: Configurable recurring scraping intervals (e.g., every 12 or 24 hours) running entirely in the background.
- **Companion Chrome Extension**: A lightweight browser extension allowing 1-click job saving directly from job boards like LinkedIn and Indeed directly into your pipeline.

## 2. Enterprise-Grade AI Engine
- **Bring Your Own Keys (Free or Paid)**: Use any AI you prefer! Bring your own OpenAI or Anthropic keys, or use **100% Free AI Processing** with a Google AI Studio key. CareerAgent natively manages Google's strict free tier rate limits (**15 RPM / 1500 RPD for Gemma 4**, **15 RPM / 500 RPD for Gemini 3.1 Flash Lite**, **5 RPM / 20 RPD for Gemini 3.5 Flash**) so you can automate your search for $0. *(Disclaimer: Google uses free tier data for training. For complete privacy, run Ollama locally!)*
- **Multi-LLM Support**: Fully agnostic backend supporting Google Gemini (1.5 Pro, 2.5 Flash), OpenAI/Anthropic (planned), and 100% local, private execution via **Ollama**.
- **Model Fallbacks & Rate Limiting**: Intelligent error handling that automatically falls back to secondary models if an API rate limit (429) is hit.
- **Telemetry Tracking**: Built-in dashboard to monitor API token usage and request limits.

## 3. Intelligent Match Evaluation
- **Resume Alignment**: The AI reads the raw Job Description (JD) and cross-references it against your exact resume qualifications.
- **Match Scoring**: Generates a definitive 0-100 `match_score` for every job.
- **Match Reason**: Provides a 1-2 sentence breakdown of *why* the job is or isn't a fit.
- **Smart Extraction**: Automatically pulls out the External Job ID (Req ID) and Expected Years of Experience (YOE) from the raw JD text.

## 4. 1-Click Application Materials
- **Tailored LaTeX Resumes**: The AI identifies missing keywords from the JD and dynamically injects them into your `resume.tex` file, which is then natively compiled into a pristine, highly-ATS-compatible PDF.
- **Custom Cover Letters**: Generates a highly personalized, confident 3-paragraph cover letter tailored to the specific role and company (with strict instructions to avoid generic placeholders).
- **Cold Email / LinkedIn DMs**: Generates a punchy, under-200-word cold outreach message with a strong hook designed for recruiters. Includes a 1-click "Open in Email" button that launches your browser's Gmail client with pre-filled subject and body text.

## 5. Visual Pipeline Management (UI)
- **Kanban Board**: Drag-and-drop interface to track jobs across various statuses (`NEW`, `APPLIED`, `INTERVIEWING`, `REJECTED`, `IGNORED`).
- **Detailed Job Modal**: A unified view for each job containing location, post date, Job ID, YOE, notes, and the AI-generated materials.
- **Soft Deletes**: "Trash" state for jobs with a configurable retention policy (e.g., permanently delete after 30 days) to keep your pipeline clean.

## 6. Real-time Notifications & Integrations
- **Telegram Push Alerts**: Connect a custom Telegram bot to instantly receive push notifications on your phone whenever a high-match job is discovered by the background scraper.

## 7. Security & Privacy
- **Encrypted Secrets**: Sensitive credentials (like Gemini API keys and Telegram Bot tokens) are encrypted at rest in the SQLite database using Fernet symmetric encryption.
- **100% Data Ownership**: All job pipelines, resumes, and scraping data are stored locally in your own SQLite database.
