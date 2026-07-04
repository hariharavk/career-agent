<div align="center">
  <img src="frontend/public/favicon.svg" alt="CareerAgent Logo" width="120" />
  
  # CareerAgent
  
  **Your personal AI career agent.**  
  Scrapes job boards, evaluates match scores using AI, and generates tailored ATS-friendly resumes and referral emails.

  [![GitHub Stars](https://img.shields.io/github/stars/hariharavk/career-agent.svg?style=for-the-badge&color=blue)](https://github.com/hariharavk/career-agent/stargazers)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)

</div>

<br/>

CareerAgent is a sophisticated, 100% free automation platform built for ambitious IT professionals. It replaces the exhausting manual job hunt with an intelligent engine that scrapes target companies, evaluates your precise fit using your choice of AI (bring your own OpenAI/Anthropic keys, or use Google Gemini/Gemma for free), and programmatically compiles ATS-optimized LaTeX resumes and personalized referral emails—acting as your personal career agent for $0.

It quietly tracks job boards and company pages in the background, extracts competencies using AI, and compiles professionally formatted LaTeX PDFs designed to be accurately parsed by corporate Applicant Tracking Systems.

---

## 🚀 Why CareerAgent?
Unlike generic AI job wrappers that spam "Easy Apply" buttons, **CareerAgent focuses on quality and precision.** It acts as your personal career agent, ensuring your resume mathematically aligns with the raw Job Description and generating personalized outreach materials that recruiters actually read.

## ✨ Features
*See the full breakdown in our [Features List](features.md).*

- **Automated Job Discovery**: Quietly scrapes job boards and career pages in the background, ensuring you never miss a newly posted position.
- **Kanban Pipeline**: Organize your job search visually. Drag and drop jobs across columns (New, Applied, Interviewing, Rejected) to track your pipeline at a glance.
- **AI Match Scoring**: Instantly evaluates your profile against the job description, providing a definitive match score to help you prioritize your best opportunities.
- **1-Click Application Materials**: Generates tailored cover letters, concise cold emails/LinkedIn DMs, and compiles pristine LaTeX resumes directly into PDFs.
- **Telegram Alerts & Chrome Extension**: Get instant push notifications for high-match jobs, and use the companion browser extension to one-click save jobs directly from LinkedIn and Naukri.
- **Bring Your Own Keys (Free or Paid)**: Use any AI you prefer! Bring your own OpenAI or Anthropic keys, or use **100% Free AI Processing** with a Google AI Studio key. CareerAgent natively manages Google's strict free tier rate limits (**15 RPM / 1500 RPD for Gemma 4**, **15 RPM / 500 RPD for Gemini 3.1 Flash Lite**, **5 RPM / 20 RPD for Gemini 3.5 Flash**) so you can automate your search for $0. *(Disclaimer: Google uses free tier data for training. For complete privacy, run Ollama locally!)*
- **Flexible AI Engine**: Fully agnostic architecture. Route via OpenAI, Anthropic, or Gemini—or run 100% locally and privately with Ollama. The choice is yours.

## 🏢 Supported Companies (43+)

CareerAgent natively integrates with the career portals and ATS systems (Greenhouse, Lever, Zwayam, custom Workday/Oracle SPAs) of the following top-tier companies:

**Big Tech & Unicorns:** Google, Amazon, Microsoft, Apple, Meta, Atlassian, Stripe, Airbnb, Snowflake, Databricks, Coinbase, Figma, Notion  
**Banking & Finance:** JP Morgan Chase, Wells Fargo, Mastercard, Barclays, Citi, Visa  
**Consulting & IT Services:** Accenture, IBM, Deloitte, TCS, Infosys, Cognizant, Capgemini, LTIMindtree, Wipro, HCLTech, Tech Mahindra, Hexaware Technologies, Mphasis, Persistent Systems  
**Indian Tech Giants:** Meesho, PhonePe, Flipkart, Swiggy, Paytm, Cred, Razorpay, Zepto, Zoho  
*(Plus automatic parsing for any generic Greenhouse or Lever job board!)*

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS, Framer Motion, Vite
- **Backend:** Python 3.11, FastAPI, SQLite, Playwright (Headless Scraping)
- **AI Integration:** Google Gemini (1.5 Pro, 2.5 Flash), local Ollama support
- **Infrastructure:** Docker, Docker Compose, GitHub Actions (GHCR)

## 🏗 Architecture Overview
1. **Scraping Engine:** Headless Playwright workers silently scrape ATS portals based on user-defined intervals (via Cron).
2. **AI Evaluation Node:** New jobs are piped to the selected LLM (Gemini/Ollama) to extract required competencies (`System Design`, `gRPC`, etc) and cross-reference them with the user's base qualifications.
3. **LaTeX Compiler:** High-match jobs trigger the ATS generator. The AI injects missing keywords into a strict `.tex` template and natively compiles a pristine PDF using `pdflatex`.
4. **Kanban Pipeline:** Job objects are persisted in local SQLite and surfaced to the React dashboard via REST API.

## 🚀 Getting Started

### Method 1: Docker (Recommended)
The easiest way to run CareerAgent is using our pre-built GitHub Container Registry (GHCR) images. You don't need to install Node or Python!

```bash
# 1. Download the docker-compose file
curl -O https://raw.githubusercontent.com/hariharavk/career-agent/main/docker-compose.yml

# 2. Start the application in the background
docker compose up -d
```
*Visit `http://localhost:5173` to access the dashboard. Your database and files will be safely stored in the local directory via Docker volumes.*

---

### Method 2: Manual Installation (For Developers)

#### Prerequisites
- Node.js (v20+)
- Python (3.11+)
- API Keys (OpenAI, Gemini, Anthropic) or local Ollama running.

#### Setup & Run
First, install the required Python and Node dependencies:

```bash
# 1. Setup Python Backend
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 2. Setup Node Frontend
cd frontend
npm install
cd ..

# 3. Run the full application (Frontend + Backend APIs)
./start.sh

# Or, run the UI in Demo Mode (mocked data, no backend required)
./demo.sh
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/hariharavk/career-agent/issues). Please refer to our [Roadmap](ROADMAP.md) for upcoming features!

## 📄 License
This project is [MIT](https://opensource.org/licenses/MIT) licensed.
