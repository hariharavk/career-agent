import asyncio
from backend.database import SessionLocal
from backend.main import save_from_extension, ExtensionPayload

db = SessionLocal()
payload = ExtensionPayload(
    url="http://example.com/job999",
    page_title="Example Title",
    description="Example description",
    company="Example Company",
    title="Example Job"
)
try:
    result = save_from_extension(payload, db)
    print("Result:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
