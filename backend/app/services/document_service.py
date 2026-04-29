import os
import fitz  # PyMuPDF
from PIL import Image
from docx import Document
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, pipeline
import torch
from pdf2image import convert_from_path
import io
from fastapi.concurrency import run_in_threadpool
from fastapi import HTTPException

class DocumentService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._ocr_processor = None
        self._ocr_model = None
        self._lang_detector = None
        self._translator = None
        self._summarizer = None
        self._classifier = None
        
        self.classification_labels = ["Invoice", "Receipt", "Form", "Letter", "Notes", "Official Document", "Legal Document"]
        
        self.lang_map = {
            "en": "eng_Latn",
            "hi": "hin_Deva",
            "or": "ory_Orya",
            "ar": "arb_Arab",
            "fr": "fra_Latn",
            "es": "spa_Latn",
            "de": "deu_Latn",
            "it": "ita_Latn",
            "pt": "por_Latn",
            "ru": "rus_Cyrl",
            "ja": "jpn_Jpan",
            "zh": "zho_Hans"
        }
        
        self.MAX_INPUT_CHARS = 15000 

    def preload_models(self):
        """Preload all models to avoid first-request latency."""
        print("Preloading models...")
        _ = self.ocr_processor
        _ = self.ocr_model
        _ = self.lang_detector
        _ = self.translator
        _ = self.summarizer
        _ = self.classifier
        print("Models preloaded successfully.")

    @property
    def ocr_processor(self):
        if self._ocr_processor is None:
            print("Loading OCR Processor...")
            self._ocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
        return self._ocr_processor

    @property
    def ocr_model(self):
        if self._ocr_model is None:
            print("Loading OCR Model...")
            self._ocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed").to(self.device)
        return self._ocr_model

    @property
    def lang_detector(self):
        if self._lang_detector is None:
            print("Loading Language Detector...")
            self._lang_detector = pipeline("text-classification", 
                                         model="papluca/xlm-roberta-base-language-detection",
                                         device=0 if self.device == "cuda" else -1)
        return self._lang_detector

    @property
    def translator(self):
        if self._translator is None:
            print("Loading Translator (NLLB)...")
            model_kwargs = {"load_in_8bit": True} if self.device == "cuda" else {}
            device_args = {"device_map": "auto"} if self.device == "cuda" else {"device": -1}
            self._translator = pipeline("translation", 
                                      model="facebook/nllb-200-distilled-600M",
                                      **device_args,
                                      model_kwargs=model_kwargs)
        return self._translator

    @property
    def summarizer(self):
        if self._summarizer is None:
            print("Loading Summarizer...")
            model_kwargs = {"load_in_8bit": True} if self.device == "cuda" else {}
            device_args = {"device_map": "auto"} if self.device == "cuda" else {"device": -1}
            self._summarizer = pipeline("text2text-generation", 
                                      model="google/flan-t5-base",
                                      **device_args,
                                      model_kwargs=model_kwargs)
        return self._summarizer

    @property
    def classifier(self):
        if self._classifier is None:
            print("Loading Classifier...")
            model_kwargs = {"load_in_8bit": True} if self.device == "cuda" else {}
            device_args = {"device_map": "auto"} if self.device == "cuda" else {"device": -1}
            self._classifier = pipeline("zero-shot-classification", 
                                      model="facebook/bart-large-mnli",
                                      **device_args,
                                      model_kwargs=model_kwargs)
        return self._classifier

    def chunk_text(self, text, max_words=350):
        """Splits text into smaller chunks to avoid model token limits."""
        words = text.split()
        return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]

    def clean_text(self, text):
        """Removes excessive newlines and whitespace."""
        return " ".join(text.split()).strip()

    def extract_text_from_image(self, image):
        pixel_values = self.ocr_processor(images=image, return_tensors="pt").pixel_values.to(self.device)
        generated_ids = self.ocr_model.generate(pixel_values)
        text = self.ocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return self.clean_text(text)

    def extract_text_from_pdf(self, pdf_path):
        text = ""
        try:
            with fitz.open(pdf_path) as doc:
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    page_text = page.get_text()
                    
                    if len(page_text.strip()) < 50:
                        images = convert_from_path(pdf_path, first_page=page_num+1, last_page=page_num+1)
                        if images:
                            page_text = self.extract_text_from_image(images[0])
                    
                    text += page_text + "\n"
        except Exception as e:
            print(f"PDF Processing Error: {e}")
            raise HTTPException(status_code=500, detail="Error processing PDF file.")
        
        return self.clean_text(text)

    def extract_text_from_docx(self, docx_path):
        try:
            doc = Document(docx_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            return self.clean_text(text)
        except Exception as e:
            print(f"DOCX Processing Error: {e}")
            raise HTTPException(status_code=500, detail="Error processing DOCX file.")

    def detect_lang(self, text):
        sample = text[:1000]
        result = self.lang_detector(sample, truncation=True)
        return result[0]['label']

    def translate_long_text(self, text, src_lang, tgt_lang):
        chunks = self.chunk_text(text)
        translated_chunks = []
        for chunk in chunks:
            result = self.translator(chunk, src_lang=src_lang, tgt_lang=tgt_lang, max_length=512, truncation=True)
            translated_chunks.append(result[0]['translation_text'])
        return " ".join(translated_chunks)

    def summarize_long_text(self, text):
        chunks = self.chunk_text(text)
        
        chunk_summaries = []
        for chunk in chunks:
            prompt = f"Summarize this document segment: {chunk}"
            result = self.summarizer(prompt, max_length=150, truncation=True)
            chunk_summaries.append(result[0]['generated_text'])
            
        if len(chunk_summaries) > 1:
            combined_summary = " ".join(chunk_summaries)
            if len(combined_summary.split()) > 400:
                combined_summary = " ".join(combined_summary.split()[:400])
            
            final_prompt = f"Summarize these key points into a final summary: {combined_summary}"
            result = self.summarizer(final_prompt, max_length=200, truncation=True)
            return result[0]['generated_text']
        
        return chunk_summaries[0] if chunk_summaries else ""

    def classify_document(self, text):
        chunks = self.chunk_text(text)
        if not chunks:
            return "Unknown"
        
        result = self.classifier(chunks[0], self.classification_labels, truncation=True)
        return result['labels'][0]

    async def process_document(self, file_path, filename):
        ext = filename.lower().split('.')[-1]
        
        if ext in ['jpg', 'jpeg', 'png']:
            try:
                def process_image():
                    img = Image.open(file_path).convert("RGB")
                    return self.extract_text_from_image(img)
                text = await run_in_threadpool(process_image)
            except Exception as e:
                raise HTTPException(status_code=500, detail="Error processing image file.")
        elif ext == 'pdf':
            text = await run_in_threadpool(self.extract_text_from_pdf, file_path)
        elif ext == 'docx':
            text = await run_in_threadpool(self.extract_text_from_docx, file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")

        if len(text) > self.MAX_INPUT_CHARS:
            text = text[:self.MAX_INPUT_CHARS]

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the document.")

        detected_lang_code = await run_in_threadpool(self.detect_lang, text)
        src_nllb_lang = self.lang_map.get(detected_lang_code, "eng_Latn")
        
        text_en = text
        if detected_lang_code != "en":
            text_en = await run_in_threadpool(self.translate_long_text, text, src_nllb_lang, "eng_Latn")

        summary_en = await run_in_threadpool(self.summarize_long_text, text_en)
        doc_type = await run_in_threadpool(self.classify_document, text_en)

        summary = summary_en
        if detected_lang_code != "en" and detected_lang_code in self.lang_map:
            summary = await run_in_threadpool(self.translate_long_text, summary_en, "eng_Latn", src_nllb_lang)

        return {
            "extracted_text": text,
            "summary": summary,
            "document_type": doc_type,
            "detected_language": detected_lang_code,
            "status": "success"
        }

document_service = DocumentService()
