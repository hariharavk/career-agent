from backend.database import SessionLocal
from backend.crud import get_job, update_job_status
from backend.scraper_core import record_job
db = SessionLocal()
job = record_job(db, "Test Company", "Test Title", "http://test.com", "Test Loc")
db.commit()
db.refresh(job)
print("job.id:", job.id)
db_job = get_job(db, job.id)
print("db_job:", db_job)
