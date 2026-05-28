import re
import unicodedata

def clean_text(text: str) -> str:
    if not text:
        return ""
    
    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", text)
    
    # Strip bullet characters and typical markdown list indicators
    text = re.sub(r'^[•\-\*●▪◦] \s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s*', '', text, flags=re.MULTILINE)
    
    # Replace multiple newlines or whitespaces with single ones
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n', text)
    
    return text.strip()
