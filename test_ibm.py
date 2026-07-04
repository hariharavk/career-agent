import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        # IBM example job URL (I'll just get one from DB)
        import sqlite3
        conn = sqlite3.connect('jobs.db')
        cur = conn.cursor()
        cur.execute("SELECT url FROM jobs WHERE company='IBM' LIMIT 1")
        row = cur.fetchone()
        url = row[0] if row else "https://www.ibm.com/in-en/careers/search"
        print(f"Testing URL: {url}")
        
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(4000)
        
        # Check text
        text = await page.locator("body").inner_text()
        print("LENGTH:", len(text))
        print("PREVIEW:", text[:500])
        await browser.close()

asyncio.run(main())
