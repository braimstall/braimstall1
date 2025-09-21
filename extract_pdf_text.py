#!/usr/bin/env python3
import re

def extract_text_from_pdf_manually(file_path):
    """Extract text from PDF by parsing the raw content"""
    with open(file_path, 'rb') as f:
        pdf_content = f.read()
    
    # Convert to string, ignoring decode errors
    text_content = pdf_content.decode('latin-1', errors='ignore')
    
    # Look for text between stream and endstream markers
    text_parts = []
    stream_pattern = re.compile(r'stream\s*(.*?)\s*endstream', re.DOTALL)
    
    for match in stream_pattern.finditer(text_content):
        stream_content = match.group(1)
        # Extract readable text
        readable_text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', stream_content)
        # Clean up excessive whitespace
        readable_text = re.sub(r'\s+', ' ', readable_text).strip()
        if len(readable_text) > 20:  # Only keep substantial text
            text_parts.append(readable_text)
    
    # Look for text in specific patterns that appear in the PDF
    # Based on the structure I saw, let me extract the actual content
    full_text = '\n'.join(text_parts)
    
    # Try to extract user stories and requirements
    lines = []
    current_section = ""
    
    # Process the extracted text to find user stories
    for part in text_parts:
        if "User Stor" in part or "CUSTOMER JOURNEY" in part:
            current_section = part
        if any(keyword in part for keyword in ["As a", "I want", "So that", "Given", "When", "Then"]):
            lines.append(part)
    
    return '\n'.join(lines) if lines else full_text

# Extract text
pdf_text = extract_text_from_pdf_manually('/workspace/User Stories CUSTOMER JOURNEY MANAGEMENT.pdf')
print(pdf_text)