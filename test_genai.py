import os
from google import genai

key = os.environ.get("GEMINI_API_KEY")
print(f"Key: {key[:5]}...")

client = genai.Client(api_key=key)
print("Client initialized")
try:
    response = client.models.generate_content(model="gemini-2.5-flash", contents="hello")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
