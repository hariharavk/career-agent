from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    company: str
    title: str
    url: str

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class Job(JobBase):
    id: int
    status: str
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    created_at: datetime
    applied_at: Optional[datetime] = None

    class Config:
        from_attributes = True
