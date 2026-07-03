# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.0-beta] - Initial Beta Release

Welcome to the first public beta release of **CareerAgent**! 🎉

This release introduces the core automation engine and UI dashboard designed to help ambitious IT professionals automate the most exhausting parts of their job hunt.

### ✨ Key Features
- **Automated Playwright Scraper**: Silently scrapes job boards and ATS platforms (Greenhouse, Lever, etc.) in the background via cron.
- **Bring Your Own AI (BYOK)**: Supports OpenAI, Anthropic, and Google Gemini. We natively handle Google's free tier rate limits (Gemma 4 & Gemini Flash) so you can automate your search for $0!
- **AI Match Evaluation**: Cross-references raw Job Descriptions against your base profile to generate a definitive 0-100 fit score.
- **ATS-Optimized Resumes**: Dynamically injects missing keywords and natively compiles pristine LaTeX PDF resumes on the fly using `pdflatex`.
- **Kanban Dashboard**: A sleek, drag-and-drop pipeline UI for tracking New, Applied, and Interviewing roles.

### 🐳 Quick Start (Docker)
We highly recommend running CareerAgent via our pre-built GitHub Container Registry (GHCR) images. You don't need to install Node or Python!

```bash
# 1. Download the docker-compose file
curl -O https://raw.githubusercontent.com/koteshrv/career-agent/main/docker-compose.yml

# 2. Start the application in the background
docker compose up -d
```

*For manual developer installation instructions, please refer to the [README](https://github.com/koteshrv/career-agent).*
