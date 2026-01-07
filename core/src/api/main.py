import logging
import os
from dotenv import load_dotenv

# Try loading from /secrets/.env first (Cloud Run), then fallback to local .env
if os.path.exists('/secrets/.env'):
    load_dotenv('/secrets/.env')
else:
    load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(name)s - %(levelname)s - %(message)s')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import projects

app = FastAPI(title="Scolo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://scolo-bot-*.run.app",  # Cloud Run URLs
        "https://scolo.app",  # Production domain (if you have one)
        "https://www.scolo.app",
        "https://scolo-web-431851425237.us-central1.run.app"  # Production www domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
