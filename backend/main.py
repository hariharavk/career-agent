from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging

from . import models, schemas, crud
from .database import engine, get_db
from .scraper_core import run_scraper

logger = logging.getLogger(__name__)

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Scraper ATS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def bg_scrape_task(db: Session):
    try:
        new_jobs = run_scraper(db)
        logger.info(f"Background scrape complete! Found {len(new_jobs)} new jobs.")
    except Exception as e:
        logger.error(f"Background scrape failed: {e}")

@app.post("/api/run-scraper")
def trigger_scraper(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    background_tasks.add_task(bg_scrape_task, db)
    return {"message": "Scraper job started in the background."}

@app.get("/api/jobs", response_model=List[schemas.Job])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = crud.get_jobs(db, skip=skip, limit=limit)
    return jobs

@app.put("/api/jobs/{job_id}", response_model=schemas.Job)
def update_job(job_id: int, job_update: schemas.JobUpdate, db: Session = Depends(get_db)):
    db_job = crud.update_job_status(db, job_id, job_update)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job
