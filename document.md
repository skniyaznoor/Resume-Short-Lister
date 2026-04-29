# 🔧 Project: Multi-Modal Multilingual Document Analyzer

## 🧠 What your system will do

1. Upload document image (bill, handwritten note, form)
2. Extract text using OCR
3. Detect language
4. Translate (if needed)
5. Summarize content
6. Classify document type

---

# 🏗️ Architecture (Simple but solid)

```
Image → OCR → Text → Language Detection
                        ↓
               Translation (optional)
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
 Summarization                 Classification
```

---

# 🤖 Models you’ll use from Hugging Face

### 1. OCR (Image → Text)

* `microsoft/trocr-base-handwritten` (for notes)
* `microsoft/trocr-base-printed` (for bills/forms)

---

### 2. Language Detection

* `papluca/xlm-roberta-base-language-detection`

---

### 3. Translation (important for Hindi & Odia)

* Use multilingual models:

  * `facebook/nllb-200-distilled-600M` (supports many Indian languages)

👉 This is key for Odia support (not all models support it)

---

### 4. Summarization

* `google/flan-t5-base` (flexible + works with instructions)

---

### 5. Classification

* `distilbert-base-uncased` (fine-tuned or zero-shot)
* Or easier: `facebook/bart-large-mnli` (zero-shot classification)

Example labels:

* Invoice
* Receipt
* Personal Note
* Official Document

---

# 🌍 Multilingual Flow (Important Part)

### Case 1: English input

→ OCR → Summarize → Classify

### Case 2: Hindi/Odia input

→ OCR → Detect language
→ Translate → English
→ Summarize + classify
→ Translate output back

---

# 💻 Implementation Plan

## Step 1: Install dependencies

```bash
pip install transformers gradio pillow torch
```

---

## Step 2: OCR pipeline

```python
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image

processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

def extract_text(image):
    pixel_values = processor(images=image, return_tensors="pt").pixel_values
    generated_ids = model.generate(pixel_values)
    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text
```

---

## Step 3: Language detection

```python
from transformers import pipeline

lang_detector = pipeline("text-classification",
                         model="papluca/xlm-roberta-base-language-detection")

def detect_lang(text):
    return lang_detector(text)[0]['label']
```

---

## Step 4: Translation

```python
translator = pipeline("translation",
                      model="facebook/nllb-200-distilled-600M")

def translate(text, target_lang="eng_Latn"):
    return translator(text, tgt_lang=target_lang)[0]['translation_text']
```

Language codes:

* English → `eng_Latn`
* Hindi → `hin_Deva`
* Odia → `ory_Orya`

---

## Step 5: Summarization

```python
summarizer = pipeline("text2text-generation",
                      model="google/flan-t5-base")

def summarize(text):
    prompt = f"Summarize this document: {text}"
    return summarizer(prompt, max_length=150)[0]['generated_text']
```

---

## Step 6: Classification (Zero-shot)

```python
classifier = pipeline("zero-shot-classification",
                      model="facebook/bart-large-mnli")

labels = ["Invoice", "Receipt", "Form", "Letter", "Notes"]

def classify(text):
    result = classifier(text, labels)
    return result['labels'][0]
```

---

## Step 7: Combine everything

```python
def process_document(image):
    text = extract_text(image)
    
    lang = detect_lang(text)

    if lang != "en":
        text_en = translate(text, "eng_Latn")
    else:
        text_en = text

    summary = summarize(text_en)
    doc_type = classify(text_en)

    # translate back if needed
    if lang == "hi":
        summary = translate(summary, "hin_Deva")
    elif lang == "or":
        summary = translate(summary, "ory_Orya")

    return text, summary, doc_type, lang
```

---

## Step 8: UI using Gradio

```python
import gradio as gr

gr.Interface(
    fn=process_document,
    inputs=gr.Image(type="pil"),
    outputs=["text", "text", "text", "text"],
    title="Multilingual Document Analyzer"
).launch()
```

---

# ✨ Features you can add (to level it up)

* Highlight key fields (amount, date, name)
* Download extracted text as PDF
* Confidence score
* Multi-page document support
* Store history (mini dashboard)

---

# ⚠️ Real-world challenges (good to mention in viva)

* OCR errors on low-quality images
* Odia support may be slightly weaker
* Translation inaccuracies
* Long documents need chunking

---

# 🎯 Final Result

You’ll have:

* Image → Text → Language → Summary → Type
* Supports **English + Hindi + Odia**
* Hosted for free on Hugging Face Spaces

---

Good call—handling **PDFs and DOC/DOCX files** turns this from a demo into a *real-world document pipeline*. Let’s extend your system cleanly without making it messy.

---

# 🔧 Updated Project: Multi-Modal Multilingual Document Analyzer

**Now supports:**

* 🖼️ Images (JPG, PNG)
* 📄 PDFs
* 📝 DOC / DOCX

---

# 🧠 Updated Flow

```text
        ┌───────────────┐
        │ File Upload   │
        └──────┬────────┘
               ↓
   ┌────────────┼────────────┐
   ↓            ↓            ↓
 Image        PDF         DOC/DOCX
   ↓            ↓            ↓
  OCR     PDF Text/OCR   Direct Text
   └────────────┬────────────┘
                ↓
        Language Detection
                ↓
        Translation (if needed)
                ↓
     Summarization + Classification
```

---

# 📦 New Libraries You’ll Need

```bash
pip install pdf2image pytesseract python-docx pymupdf
```

---

# 📄 1. Handling PDFs

Two cases:

* **Text-based PDF** → extract directly
* **Scanned PDF** → convert to images → OCR

### Option A: Fast + Smart (Recommended)

```python
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_file):
    doc = fitz.open(pdf_file)
    text = ""
    
    for page in doc:
        text += page.get_text()
    
    return text
```

👉 If text is empty → fallback to OCR

---

### Option B: OCR for scanned PDFs

```python
from pdf2image import convert_from_path

def pdf_to_images(pdf_path):
    return convert_from_path(pdf_path)

def extract_text_from_scanned_pdf(pdf_path):
    images = pdf_to_images(pdf_path)
    full_text = ""
    
    for img in images:
        full_text += extract_text(img)
    
    return full_text
```

---

# 📝 2. Handling DOC / DOCX

```python
from docx import Document

def extract_text_from_docx(file):
    doc = Document(file)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text
```

---

# 🧠 3. Unified File Handler

This is where your project becomes **clean and professional**:

```python
import os

def extract_text_from_file(file):
    filename = file.name.lower()

    if filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_text(Image.open(file))

    elif filename.endswith(".pdf"):
        text = extract_text_from_pdf(file.name)
        
        if len(text.strip()) < 20:
            return extract_text_from_scanned_pdf(file.name)
        return text

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    else:
        return "Unsupported file format"
```

---

# 🌍 Updated Multilingual Pipeline

```python
def process_document(file):
    text = extract_text_from_file(file)

    lang = detect_lang(text)

    # Normalize language codes
    lang_map = {
        "en": "eng_Latn",
        "hi": "hin_Deva",
        "or": "ory_Orya"
    }

    if lang != "en":
        text_en = translate(text, "eng_Latn")
    else:
        text_en = text

    summary = summarize(text_en)
    doc_type = classify(text_en)

    # Translate back
    if lang in lang_map and lang != "en":
        summary = translate(summary, lang_map[lang])

    return text, summary, doc_type, lang
```

---

# 🖥️ Updated UI using Gradio

```python
import gradio as gr

gr.Interface(
    fn=process_document,
    inputs=gr.File(),
    outputs=[
        gr.Textbox(label="Extracted Text"),
        gr.Textbox(label="Summary"),
        gr.Textbox(label="Document Type"),
        gr.Textbox(label="Detected Language")
    ],
    title="Multilingual Document Analyzer (Image + PDF + DOCX)"
).launch()
```

---

# ✨ Strong Upgrades (Highly Recommended)

### 🔹 1. Multi-page preview (for PDFs)

Show page-wise summaries

### 🔹 2. Key Information Extraction

* Total amount
* Date
* Names
  (use regex or NER)

---

### 🔹 3. Download Results

* Export summary as `.txt` or PDF

---

### 🔹 4. Language Toggle

Let user choose:

* Output language manually
  instead of auto-detect only

---

# ⚠️ Real Challenges (Mention in Viva)

* Scanned PDFs → slower (OCR heavy)
* Mixed-language documents (common in India)
* Odia OCR accuracy may vary
* Large PDFs → need chunking before summarization

---

# 🚀 What You’ve Built Now

This is no longer a simple project. It’s a:

> **Full document intelligence pipeline**

* Multi-format ingestion
* OCR + text extraction
* Multilingual processing
* AI summarization + classification



==================================
microsoft
/
trocr-base-handwritten 

like
491

Follow
Microsoft
19.5k
Image-to-Text
Transformers
PyTorch
Safetensors
vision-encoder-decoder
image-text-to-text
trocr

arxiv:
2109.10282

License:
mit
Model card
Files and versions
xet
Community
19
TrOCR (base-sized model, fine-tuned on IAM)
TrOCR model fine-tuned on the IAM dataset. It was introduced in the paper TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models by Li et al. and first released in this repository.

Disclaimer: The team releasing TrOCR did not write a model card for this model so this model card has been written by the Hugging Face team.

Model description
The TrOCR model is an encoder-decoder model, consisting of an image Transformer as encoder, and a text Transformer as decoder. The image encoder was initialized from the weights of BEiT, while the text decoder was initialized from the weights of RoBERTa.

Images are presented to the model as a sequence of fixed-size patches (resolution 16x16), which are linearly embedded. One also adds absolute position embeddings before feeding the sequence to the layers of the Transformer encoder. Next, the Transformer text decoder autoregressively generates tokens.

Intended uses & limitations
You can use the raw model for optical character recognition (OCR) on single text-line images. See the model hub to look for fine-tuned versions on a task that interests you.

How to use
Here is how to use this model in PyTorch:

from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import requests

# load image from the IAM database
url = 'https://fki.tic.heia-fr.ch/static/img/a01-122-02-00.jpg'
image = Image.open(requests.get(url, stream=True).raw).convert("RGB")

processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
pixel_values = processor(images=image, return_tensors="pt").pixel_values

generated_ids = model.generate(pixel_values)
generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

BibTeX entry and citation info
@misc{li2021trocr,
      title={TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models}, 
      author={Minghao Li and Tengchao Lv and Lei Cui and Yijuan Lu and Dinei Florencio and Cha Zhang and Zhoujun Li and Furu Wei},
      year={2021},
      eprint={2109.10282},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
=============================
microsoft
/
trocr-base-printed 

like
205

Follow
Microsoft
19.5k
Image-to-Text
Transformers
PyTorch
Safetensors
vision-encoder-decoder
image-text-to-text
trocr

arxiv:
2109.10282
Model card
Files and versions
xet
Community
15
TrOCR (base-sized model, fine-tuned on SROIE)
TrOCR model fine-tuned on the SROIE dataset. It was introduced in the paper TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models by Li et al. and first released in this repository.

Disclaimer: The team releasing TrOCR did not write a model card for this model so this model card has been written by the Hugging Face team.

Model description
The TrOCR model is an encoder-decoder model, consisting of an image Transformer as encoder, and a text Transformer as decoder. The image encoder was initialized from the weights of BEiT, while the text decoder was initialized from the weights of RoBERTa.

Images are presented to the model as a sequence of fixed-size patches (resolution 16x16), which are linearly embedded. One also adds absolute position embeddings before feeding the sequence to the layers of the Transformer encoder. Next, the Transformer text decoder autoregressively generates tokens.

Intended uses & limitations
You can use the raw model for optical character recognition (OCR) on single text-line images. See the model hub to look for fine-tuned versions on a task that interests you.

How to use
Here is how to use this model in PyTorch:

from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import requests

# load image from the IAM database (actually this model is meant to be used on printed text)
url = 'https://fki.tic.heia-fr.ch/static/img/a01-122-02-00.jpg'
image = Image.open(requests.get(url, stream=True).raw).convert("RGB")

processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-printed')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-printed')
pixel_values = processor(images=image, return_tensors="pt").pixel_values

generated_ids = model.generate(pixel_values)
generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

BibTeX entry and citation info
@misc{li2021trocr,
      title={TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models}, 
      author={Minghao Li and Tengchao Lv and Lei Cui and Yijuan Lu and Dinei Florencio and Cha Zhang and Zhoujun Li and Furu Wei},
      year={2021},
      eprint={2109.10282},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
========================================
papluca
/
xlm-roberta-base-language-detection 

like
375
Text Classification
Transformers
PyTorch
TensorFlow
Safetensors

papluca/language-identification

21 languages

doi:10.57967/hf/2064
xlm-roberta
Generated from Trainer
text-embeddings-inference

arxiv:
1911.02116

License:
mit
Model card
Files and versions
xet
Community
18
xlm-roberta-base-language-detection
This model is a fine-tuned version of xlm-roberta-base on the Language Identification dataset.

Model description
This model is an XLM-RoBERTa transformer model with a classification head on top (i.e. a linear layer on top of the pooled output). For additional information please refer to the xlm-roberta-base model card or to the paper Unsupervised Cross-lingual Representation Learning at Scale by Conneau et al.

Intended uses & limitations
You can directly use this model as a language detector, i.e. for sequence classification tasks. Currently, it supports the following 20 languages:

arabic (ar), bulgarian (bg), german (de), modern greek (el), english (en), spanish (es), french (fr), hindi (hi), italian (it), japanese (ja), dutch (nl), polish (pl), portuguese (pt), russian (ru), swahili (sw), thai (th), turkish (tr), urdu (ur), vietnamese (vi), and chinese (zh)

Training and evaluation data
The model was fine-tuned on the Language Identification dataset, which consists of text sequences in 20 languages. The training set contains 70k samples, while the validation and test sets 10k each. The average accuracy on the test set is 99.6% (this matches the average macro/weighted F1-score being the test set perfectly balanced). A more detailed evaluation is provided by the following table.

Language	Precision	Recall	F1-score	support
ar	0.998	0.996	0.997	500
bg	0.998	0.964	0.981	500
de	0.998	0.996	0.997	500
el	0.996	1.000	0.998	500
en	1.000	1.000	1.000	500
es	0.967	1.000	0.983	500
fr	1.000	1.000	1.000	500
hi	0.994	0.992	0.993	500
it	1.000	0.992	0.996	500
ja	0.996	0.996	0.996	500
nl	1.000	1.000	1.000	500
pl	1.000	1.000	1.000	500
pt	0.988	1.000	0.994	500
ru	1.000	0.994	0.997	500
sw	1.000	1.000	1.000	500
th	1.000	0.998	0.999	500
tr	0.994	0.992	0.993	500
ur	1.000	1.000	1.000	500
vi	0.992	1.000	0.996	500
zh	1.000	1.000	1.000	500
Benchmarks
As a baseline to compare xlm-roberta-base-language-detection against, we have used the Python langid library. Since it comes pre-trained on 97 languages, we have used its .set_languages() method to constrain the language set to our 20 languages. The average accuracy of langid on the test set is 98.5%. More details are provided by the table below.

Language	Precision	Recall	F1-score	support
ar	0.990	0.970	0.980	500
bg	0.998	0.964	0.981	500
de	0.992	0.944	0.967	500
el	1.000	0.998	0.999	500
en	1.000	1.000	1.000	500
es	1.000	0.968	0.984	500
fr	0.996	1.000	0.998	500
hi	0.949	0.976	0.963	500
it	0.990	0.980	0.985	500
ja	0.927	0.988	0.956	500
nl	0.980	1.000	0.990	500
pl	0.986	0.996	0.991	500
pt	0.950	0.996	0.973	500
ru	0.996	0.974	0.985	500
sw	1.000	1.000	1.000	500
th	1.000	0.996	0.998	500
tr	0.990	0.968	0.979	500
ur	0.998	0.996	0.997	500
vi	0.971	0.990	0.980	500
zh	1.000	1.000	1.000	500
How to get started with the model
The easiest way to use the model is via the high-level pipeline API:

from transformers import pipeline

text = [
    "Brevity is the soul of wit.",
    "Amor, ch'a nullo amato amar perdona."
]

model_ckpt = "papluca/xlm-roberta-base-language-detection"
pipe = pipeline("text-classification", model=model_ckpt)
pipe(text, top_k=1, truncation=True)

Or one can proceed with the tokenizer and model separately:

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

text = [
    "Brevity is the soul of wit.",
    "Amor, ch'a nullo amato amar perdona."
]

model_ckpt = "papluca/xlm-roberta-base-language-detection"
tokenizer = AutoTokenizer.from_pretrained(model_ckpt)
model = AutoModelForSequenceClassification.from_pretrained(model_ckpt)

inputs = tokenizer(text, padding=True, truncation=True, return_tensors="pt")

with torch.no_grad():
    logits = model(**inputs).logits

preds = torch.softmax(logits, dim=-1)

# Map raw predictions to languages
id2lang = model.config.id2label
vals, idxs = torch.max(preds, dim=1)
{id2lang[k.item()]: v.item() for k, v in zip(idxs, vals)}

Training procedure
Fine-tuning was done via the Trainer API. Here is the Colab notebook with the training code.

Training hyperparameters
The following hyperparameters were used during training:

learning_rate: 2e-05
train_batch_size: 64
eval_batch_size: 128
seed: 42
optimizer: Adam with betas=(0.9,0.999) and epsilon=1e-08
lr_scheduler_type: linear
num_epochs: 2
mixed_precision_training: Native AMP
Training results
The validation results on the valid split of the Language Identification dataset are summarised here below.

Training Loss	Epoch	Step	Validation Loss	Accuracy	F1
0.2492	1.0	1094	0.0149	0.9969	0.9969
0.0101	2.0	2188	0.0103	0.9977	0.9977
In short, it achieves the following results on the validation set:

Loss: 0.0101
Accuracy: 0.9977
F1: 0.9977
Framework versions
Transformers 4.12.5
Pytorch 1.10.0+cu111
Datasets 1.15.1
Tokenizers 0.10.3
===================================================

facebook
/
nllb-200-distilled-600M 

like
887

Follow
AI at Meta
12.4k
Translation
Transformers
PyTorch

flores-200

196 languages
m2m_100
text2text-generation
nllb

License:
cc-by-nc-4.0
Model card
Files and versions
xet
Community
49
NLLB-200
This is the model card of NLLB-200's distilled 600M variant.

Here are the metrics for that particular checkpoint.

Information about training algorithms, parameters, fairness constraints or other applied approaches, and features. The exact training algorithm, data and the strategies to handle data imbalances for high and low resource languages that were used to train NLLB-200 is described in the paper.
Paper or other resource for more information NLLB Team et al, No Language Left Behind: Scaling Human-Centered Machine Translation, Arxiv, 2022
License: CC-BY-NC
Where to send questions or comments about the model: https://github.com/facebookresearch/fairseq/issues
Intended Use
Primary intended uses: NLLB-200 is a machine translation model primarily intended for research in machine translation, - especially for low-resource languages. It allows for single sentence translation among 200 languages. Information on how to - use the model can be found in Fairseq code repository along with the training code and references to evaluation and training data.
Primary intended users: Primary users are researchers and machine translation research community.
Out-of-scope use cases: NLLB-200 is a research model and is not released for production deployment. NLLB-200 is trained on general domain text data and is not intended to be used with domain specific texts, such as medical domain or legal domain. The model is not intended to be used for document translation. The model was trained with input lengths not exceeding 512 tokens, therefore translating longer sequences might result in quality degradation. NLLB-200 translations can not be used as certified translations.
Metrics
• Model performance measures: NLLB-200 model was evaluated using BLEU, spBLEU, and chrF++ metrics widely adopted by machine translation community. Additionally, we performed human evaluation with the XSTS protocol and measured the toxicity of the generated translations.

Evaluation Data
Datasets: Flores-200 dataset is described in Section 4
Motivation: We used Flores-200 as it provides full evaluation coverage of the languages in NLLB-200
Preprocessing: Sentence-split raw text data was preprocessed using SentencePiece. The SentencePiece model is released along with NLLB-200.
Training Data
• We used parallel multilingual data from a variety of sources to train the model. We provide detailed report on data selection and construction process in Section 5 in the paper. We also used monolingual data constructed from Common Crawl. We provide more details in Section 5.2.

Ethical Considerations
• In this work, we took a reflexive approach in technological development to ensure that we prioritize human users and minimize risks that could be transferred to them. While we reflect on our ethical considerations throughout the article, here are some additional points to highlight. For one, many languages chosen for this study are low-resource languages, with a heavy emphasis on African languages. While quality translation could improve education and information access in many in these communities, such an access could also make groups with lower levels of digital literacy more vulnerable to misinformation or online scams. The latter scenarios could arise if bad actors misappropriate our work for nefarious activities, which we conceive as an example of unintended use. Regarding data acquisition, the training data used for model development were mined from various publicly available sources on the web. Although we invested heavily in data cleaning, personally identifiable information may not be entirely eliminated. Finally, although we did our best to optimize for translation quality, mistranslations produced by the model could remain. Although the odds are low, this could have adverse impact on those who rely on these translations to make important decisions (particularly when related to health and safety).

Caveats and Recommendations
• Our model has been tested on the Wikimedia domain with limited investigation on other domains supported in NLLB-MD. In addition, the supported languages may have variations that our model is not capturing. Users should make appropriate assessments.

Carbon Footprint Details
• The carbon dioxide (CO2e) estimate is reported in Section 8.8.
==========================================
google
/
flan-t5-base 

like
1.07k

Follow
Google
52.9k
Transformers
PyTorch
TensorFlow
JAX
Safetensors

10 datasets

5 languages
t5
text2text-generation
text-generation-inference

arxiv:
2210.11416

arxiv:
1910.09700

License:
apache-2.0
Model card
Files and versions
xet
Community
41
Model Card for FLAN-T5 base
drawing

Table of Contents
TL;DR
Model Details
Usage
Uses
Bias, Risks, and Limitations
Training Details
Evaluation
Environmental Impact
Citation
Model Card Authors
TL;DR
If you already know T5, FLAN-T5 is just better at everything. For the same number of parameters, these models have been fine-tuned on more than 1000 additional tasks covering also more languages. As mentioned in the first few lines of the abstract :

 Flan-PaLM 540B achieves state-of-the-art performance on several benchmarks, such as 75.2% on five-shot MMLU. We also publicly release Flan-T5 checkpoints,1 which achieve strong few-shot performance even compared to much larger models, such as PaLM 62B. Overall, instruction finetuning is a general method for improving the performance and usability of pretrained language models.

Disclaimer: Content from this model card has been written by the Hugging Face team, and parts of it were copy pasted from the T5 model card.

Model Details
Model Description
Model type: Language model
Language(s) (NLP): English, Spanish, Japanese, Persian, Hindi, French, Chinese, Bengali, Gujarati, German, Telugu, Italian, Arabic, Polish, Tamil, Marathi, Malayalam, Oriya, Panjabi, Portuguese, Urdu, Galician, Hebrew, Korean, Catalan, Thai, Dutch, Indonesian, Vietnamese, Bulgarian, Filipino, Central Khmer, Lao, Turkish, Russian, Croatian, Swedish, Yoruba, Kurdish, Burmese, Malay, Czech, Finnish, Somali, Tagalog, Swahili, Sinhala, Kannada, Zhuang, Igbo, Xhosa, Romanian, Haitian, Estonian, Slovak, Lithuanian, Greek, Nepali, Assamese, Norwegian
License: Apache 2.0
Related Models: All FLAN-T5 Checkpoints
Original Checkpoints: All Original FLAN-T5 Checkpoints
Resources for more information:
Research paper
GitHub Repo
Hugging Face FLAN-T5 Docs (Similar to T5)
Usage
Find below some example scripts on how to use the model in transformers:

Using the Pytorch model
Running the model on a CPU
Click to expand
Running the model on a GPU
Click to expand
Running the model on a GPU using different precisions
FP16
Click to expand
INT8
Click to expand
Uses
Direct Use and Downstream Use
The authors write in the original paper's model card that:

The primary use is research on language models, including: research on zero-shot NLP tasks and in-context few-shot learning NLP tasks, such as reasoning, and question answering; advancing fairness and safety research, and understanding limitations of current large language models

See the research paper for further details.

Out-of-Scope Use
More information needed.

Bias, Risks, and Limitations
The information below in this section are copied from the model's official model card:

Language models, including Flan-T5, can potentially be used for language generation in a harmful way, according to Rae et al. (2021). Flan-T5 should not be used directly in any application, without a prior assessment of safety and fairness concerns specific to the application.

Ethical considerations and risks
Flan-T5 is fine-tuned on a large corpus of text data that was not filtered for explicit content or assessed for existing biases. As a result the model itself is potentially vulnerable to generating equivalently inappropriate content or replicating inherent biases in the underlying data.

Known Limitations
Flan-T5 has not been tested in real world applications.

Sensitive Use:
Flan-T5 should not be applied for any unacceptable use cases, e.g., generation of abusive speech.

Training Details
Training Data
The model was trained on a mixture of tasks, that includes the tasks described in the table below (from the original paper, figure 2):

table.png

Training Procedure
According to the model card from the original paper:

These models are based on pretrained T5 (Raffel et al., 2020) and fine-tuned with instructions for better zero-shot and few-shot performance. There is one fine-tuned Flan model per T5 model size.

The model has been trained on TPU v3 or TPU v4 pods, using t5x codebase together with jax.

Evaluation
Testing Data, Factors & Metrics
The authors evaluated the model on various tasks covering several languages (1836 in total). See the table below for some quantitative evaluation:
image.png
For full details, please check the research paper.

Results
For full results for FLAN-T5-Base, see the research paper, Table 3.

Environmental Impact
Carbon emissions can be estimated using the Machine Learning Impact calculator presented in Lacoste et al. (2019).

Hardware Type: Google Cloud TPU Pods - TPU v3 or TPU v4 | Number of chips ≥ 4.
Hours used: More information needed
Cloud Provider: GCP
Compute Region: More information needed
Carbon Emitted: More information needed
Citation
BibTeX:

@misc{https://doi.org/10.48550/arxiv.2210.11416,
  doi = {10.48550/ARXIV.2210.11416},
  
  url = {https://arxiv.org/abs/2210.11416},
  
  author = {Chung, Hyung Won and Hou, Le and Longpre, Shayne and Zoph, Barret and Tay, Yi and Fedus, William and Li, Eric and Wang, Xuezhi and Dehghani, Mostafa and Brahma, Siddhartha and Webson, Albert and Gu, Shixiang Shane and Dai, Zhuyun and Suzgun, Mirac and Chen, Xinyun and Chowdhery, Aakanksha and Narang, Sharan and Mishra, Gaurav and Yu, Adams and Zhao, Vincent and Huang, Yanping and Dai, Andrew and Yu, Hongkun and Petrov, Slav and Chi, Ed H. and Dean, Jeff and Devlin, Jacob and Roberts, Adam and Zhou, Denny and Le, Quoc V. and Wei, Jason},
  
  keywords = {Machine Learning (cs.LG), Computation and Language (cs.CL), FOS: Computer and information sciences, FOS: Computer and information sciences},
  
  title = {Scaling Instruction-Finetuned Language Models},
  
  publisher = {arXiv},
  
  year = {2022},
  
  copyright = {Creative Commons Attribution 4.0 International}
}

Model Recycling
Evaluation on 36 datasets using google/flan-t5-base as a base model yields average score of 77.98 in comparison to 68.82 by google/t5-v1_1-base.

The model is ranked 1st among all tested models for the google/t5-v1_1-base architecture as of 06/02/2023 Results:

20_newsgroup	ag_news	amazon_reviews_multi	anli	boolq	cb	cola	copa	dbpedia	esnli	financial_phrasebank	imdb	isear	mnli	mrpc	multirc	poem_sentiment	qnli	qqp	rotten_tomatoes	rte	sst2	sst_5bins	stsb	trec_coarse	trec_fine	tweet_ev_emoji	tweet_ev_emotion	tweet_ev_hate	tweet_ev_irony	tweet_ev_offensive	tweet_ev_sentiment	wic	wnli	wsc	yahoo_answers
86.2188	89.6667	67.12	51.9688	82.3242	78.5714	80.1534	75	77.6667	90.9507	85.4	93.324	72.425	87.2457	89.4608	62.3762	82.6923	92.7878	89.7724	89.0244	84.8375	94.3807	57.2851	89.4759	97.2	92.8	46.848	80.2252	54.9832	76.6582	84.3023	70.6366	70.0627	56.338	53.8462	73.4

========================================
