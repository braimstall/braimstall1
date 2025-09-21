#!/usr/bin/env python3
import sys
import os

def extract_pdf_text(pdf_path):
    """Try to extract text from PDF using different methods"""
    try:
        # Try with built-in libraries first
        import io
        import re
        
        with open(pdf_path, 'rb') as file:
            content = file.read()
            
        # Look for text patterns in the raw content
        # PDF text is often encoded, let's try to find readable text
        text_patterns = []
        
        # Look for common PDF text markers
        text_matches = re.findall(rb'BT\s+.*?ET', content, re.DOTALL)
        for match in text_matches:
            # Try to extract readable text
            readable = re.findall(rb'[A-Za-z\s]{10,}', match)
            for text in readable:
                try:
                    decoded = text.decode('utf-8', errors='ignore')
                    if len(decoded.strip()) > 5:
                        text_patterns.append(decoded.strip())
                except:
                    pass
        
        # Also look for text between parentheses (common in PDFs)
        paren_matches = re.findall(rb'\(([^)]+)\)', content)
        for match in paren_matches:
            try:
                decoded = match.decode('utf-8', errors='ignore')
                if len(decoded.strip()) > 3 and any(c.isalpha() for c in decoded):
                    text_patterns.append(decoded.strip())
            except:
                pass
                
        return text_patterns
        
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    pdf_path = "/workspace/User Stories CUSTOMER JOURNEY MANAGEMENT.pdf"
    if os.path.exists(pdf_path):
        text_patterns = extract_pdf_text(pdf_path)
        for i, pattern in enumerate(text_patterns[:50]):  # Limit output
            print(f"{i+1}: {pattern}")
    else:
        print("PDF file not found")