from backend.database import SessionLocal
from backend.models import Job
db = SessionLocal()
db.query(Job).filter(Job.url == 'http://example.com/job999').delete()
db.commit()
