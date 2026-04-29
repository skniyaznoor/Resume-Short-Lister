import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "DocIntel AI - Legal Document Simplifier"
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")
    
    # Model configuration
    MAX_INPUT_CHARS: int = 15000

settings = Settings()
