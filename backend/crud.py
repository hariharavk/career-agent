from sqlalchemy.orm import Session
from . import models, schemas

def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Job).offset(skip).limit(limit).all()

def get_job(db: Session, job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def create_job(db: Session, job: schemas.JobCreate):
    # Check if exists
    db_job = db.query(models.Job).filter(models.Job.url == job.url).first()
    if db_job:
        return db_job
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job_status(db: Session, job_id: int, job_update: schemas.JobUpdate):
    db_job = get_job(db, job_id)
    if db_job:
        update_data = job_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_job, key, value)
        db.commit()
        db.refresh(db_job)
    return db_job
