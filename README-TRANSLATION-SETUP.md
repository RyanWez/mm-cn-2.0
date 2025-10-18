# Translation API Setup Guide

## Current Configuration

This app supports two translation providers:
- **Ollama Cloud** (Default) - Works in Myanmar
- **Google Gemini** (Backup) - Requires VPN or different network location

## Setup Instructions

### 1. Ollama Cloud (Recommended for Myanmar)

1. Get your API key from: https://ollama.com/cloud
2. Add to `.env.local`:
```env
OLLAMA_API_KEY=your_ollama_api_key_here
TRANSLATION_PROVIDER=ollama
```

### 2. Google Gemini (Backup)

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Add to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
TRANSLATION_PROVIDER=gemini
```

**Note:** Gemini API doesn't work in Myanmar without VPN due to location restrictions.

## Switching Between Providers

Change the `TRANSLATION_PROVIDER` in `.env.local`:
- `TRANSLATION_PROVIDER=ollama` - Use Ollama Cloud
- `TRANSLATION_PROVIDER=gemini` - Use Google Gemini

## Model Information

- **Ollama Model:** deepseek-v3.1:671b-cloud
- **Gemini Model:** gemini-2.5-flash-preview-09-2025

## Features

- Automatic language detection (Burmese ↔ Chinese)
- Streaming responses for better UX
- Server-side caching (24 hours)
- Rate limiting (5 seconds cooldown)
- Fallback translations for common terms
- Retry mechanism with exponential backoff
