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

## 🧠 Full System Flow

The project is built with a modern Next.js frontend and a high-performance FastAPI backend, working together to provide seamless document analysis.

### 🖥️ Frontend Flow (Next.js React App)
1. **User Interface**: The user accesses the web interface built with React and styled with Tailwind CSS.
2. **File Upload**: The user uploads a document (PDF, DOCX, JPEG, PNG) through the interactive upload area.
3. **API Request**: The frontend sends a `multipart/form-data` POST request with the file to the backend's `/analyze` endpoint.
4. **Loading State**: The UI displays a loading indicator while the backend processes the file.
5. **Results Display**: Upon receiving the response, the UI dynamically renders the Document Type, Detected Language, AI Summary, and Full Extracted Text.
6. **Export**: Users can click "Download" to export the entire analysis as a formatted `.txt` file directly from their browser.

### ⚙️ Backend Flow (FastAPI + Transformers)
1. **Request Handling**: The `/analyze` endpoint receives the file, saves it temporarily to the `uploads/` directory, and invokes the `DocumentService`.
2. **Intelligent Text Extraction**:
   - **Images**: Processed via Microsoft's `trocr-base-printed` for OCR text extraction.
   - **DOCX**: Extracts text directly using `python-docx`.
   - **PDFs**: Attempts direct extraction using `PyMuPDF` (fitz). If a page has minimal text (like scanned PDFs), it converts the page to an image and falls back to TrOCR extraction.
3. **Language Detection**: `xlm-roberta-base-language-detection` analyzes the extracted text to determine the source language.
4. **Translation Pipeline**: If the document is not in English, Facebook's `nllb-200-distilled-600M` translates the text into English to standardize processing.
5. **Summarization & Classification**:
   - **Summarization**: Google's `flan-t5-base` summarizes the English text. Long texts are chunked, summarized individually, and then combined.
   - **Classification**: Facebook's `bart-large-mnli` performs zero-shot classification to categorize the document type (e.g., Form, Letter, Legal Document, Invoice).
6. **Reverse Translation**: If the original document was non-English, the generated summary is translated back into the original language.
7. **Cleanup & Response**: The temporary file is securely deleted, and the backend returns a JSON payload with all the analysis results back to the frontend.

## ⚖️ License
MIT
