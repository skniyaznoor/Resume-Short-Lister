# 📄 DocIntel AI - Legal Document Simplifier

A powerful multi-modal, multilingual document analysis tool that simplifies complex legal and official documents using state-of-the-art AI models.

## 🚀 Features

- **Multi-Format Extraction**: Supports text extraction from Images (JPEG/PNG), PDFs (text-based and scanned), and Word Documents (DOCX).
- **Advanced OCR**: Utilizes Microsoft's `trocr-base-printed` for high-accuracy text recognition from images and scanned PDFs.
- **Multilingual Support**: Detects over 100 languages using `xlm-roberta-base-language-detection` and translates to/from English using Facebook's `nllb-200-distilled-600M`.
- **Intelligent Summarization**: Generates concise, easy-to-understand summaries using Google's `flan-t5-base`.
- **Document Classification**: Automatically categorizes documents (e.g., Invoice, Legal Document, Receipt) via zero-shot classification with `bart-large-mnli`.

## 📁 Project Structure

```text
legal-document-simplifier/
├── backend/            # FastAPI Backend
│   ├── app/
│   │   ├── api/        # API Routes
│   │   ├── core/       # Configuration
│   │   └── services/   # Business Logic (DocumentService)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # Next.js Frontend
│   ├── src/
│   │   ├── app/        
│   │   └── components/ # Reusable UI components
│   └── Dockerfile
└── FLOW.md             # Detailed System Flow Diagram
```

## 🛠️ Setup & Installation

### 1. System Dependencies (Required for OCR and PDF processing)
On Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y poppler-utils tesseract-ocr
```
On macOS:
```bash
brew install poppler tesseract
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 🐳 Docker Setup
```bash
docker-compose up --build
```

## 🧠 How it Works

1. **Input**: User uploads a document (PDF, DOCX, or Image).
2. **Text Extraction**: The system extracts text using direct parsing (PyMuPDF/python-docx) or OCR (TrOCR/pdf2image).
3. **Language Detection & Translation**: Detects the source language. If non-English, it translates it to English for processing.
4. **Summarization & Classification**: Analyzes the English text to generate a summary and determine document type.
5. **Output**: The summary is translated back to the original language (if applicable) and returned alongside the extracted text and document type.

## ⚖️ License
MIT
