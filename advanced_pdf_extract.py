#!/usr/bin/env python3
import re
import sys
import os

def extract_text_from_pdf(pdf_path):
    """Advanced PDF text extraction"""
    try:
        with open(pdf_path, 'rb') as file:
            content = file.read()
        
        # Look for text streams and extract them
        text_content = []
        
        # Method 1: Look for text between BT and ET markers
        bt_et_pattern = rb'BT\s+(.*?)\s+ET'
        matches = re.findall(bt_et_pattern, content, re.DOTALL)
        
        for match in matches:
            # Extract text from parentheses
            text_matches = re.findall(rb'\(([^)]+)\)', match)
            for text in text_matches:
                try:
                    decoded = text.decode('utf-8', errors='ignore')
                    if len(decoded.strip()) > 2:
                        text_content.append(decoded.strip())
                except:
                    pass
        
        # Method 2: Look for text in streams
        stream_pattern = rb'stream\s+(.*?)\s+endstream'
        stream_matches = re.findall(stream_pattern, content, re.DOTALL)
        
        for stream in stream_matches:
            # Try to find readable text in streams
            text_matches = re.findall(rb'[A-Za-z\s]{10,}', stream)
            for text in text_matches:
                try:
                    decoded = text.decode('utf-8', errors='ignore')
                    if len(decoded.strip()) > 5 and any(c.isalpha() for c in decoded):
                        text_content.append(decoded.strip())
                except:
                    pass
        
        # Method 3: Look for specific patterns that might be user stories
        story_patterns = [
            rb'As\s+a\s+([^,]+)',
            rb'I\s+want\s+([^,]+)',
            rb'So\s+that\s+([^,]+)',
            rb'Given\s+([^,]+)',
            rb'When\s+([^,]+)',
            rb'Then\s+([^,]+)',
            rb'Step\s+(\d+)',
            rb'User\s+Story',
            rb'Customer\s+Journey',
            rb'Management'
        ]
        
        for pattern in story_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                try:
                    if isinstance(match, bytes):
                        decoded = match.decode('utf-8', errors='ignore')
                    else:
                        decoded = str(match)
                    if len(decoded.strip()) > 2:
                        text_content.append(decoded.strip())
                except:
                    pass
        
        return text_content
        
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    pdf_path = "/workspace/User Stories CUSTOMER JOURNEY MANAGEMENT.pdf"
    if os.path.exists(pdf_path):
        text_content = extract_text_from_pdf(pdf_path)
        print("Extracted text content:")
        print("=" * 50)
        for i, text in enumerate(text_content):
            print(f"{i+1}: {text}")
    else:
        print("PDF file not found")