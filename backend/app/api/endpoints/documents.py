from fastapi import APIRouter, HTTPException, UploadFile, File
import shutil
import os
import uuid
from app.services.document_service import document_service

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_ext = file.filename.split(".")[-1]
    temp_file_name = f"{uuid.uuid4()}.{file_ext}"
    temp_file_path = os.path.join(UPLOAD_DIR, temp_file_name)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = await document_service.process_document(temp_file_path, file.filename)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/health")
async def health():
    return {"status": "ok", "service": "Document Analyzer"}
