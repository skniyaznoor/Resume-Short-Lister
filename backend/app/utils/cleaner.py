import re

def clean_text(text: str) -> str:
    """
    Cleans extracted text by removing extra newlines and spaces.
    """
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
