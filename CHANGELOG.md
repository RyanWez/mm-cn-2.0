# Changelog

## [2.1.0] - 2025-10-18

### ✨ Added
- **Vercel KV Cache Integration**
  - Persistent cache across deployments
  - Automatic fallback to in-memory cache for local development
  - 70-80% reduction in API calls
  - Cache expires after 24 hours

- **Enhanced Error Handling**
  - Specific error messages for different scenarios:
    - Model errors
    - Timeout errors
    - Quota/limit errors
    - Network errors
    - Authentication errors
  - Better user feedback in both Burmese and Chinese

- **Input Validation**
  - Maximum input length: 2000 characters
  - Minimum input length: 1 character
  - Basic XSS prevention
  - Suspicious pattern detection

### 🔧 Improved
- **Logging System**
  - Development-only detailed logs
  - Production logs are minimal (errors only)
  - Structured log format with prefixes: `[Cache]`, `[Error]`, `[Retry]`, `[Fallback]`
  - No sensitive data in production logs

- **Cache System**
  - KV-based persistent cache (production)
  - In-memory fallback (local development)
  - Cooldown tracking moved to KV
  - Better error handling for cache operations

- **Code Quality**
  - Better TypeScript types
  - Improved error handling
  - More maintainable code structure
  - Added comprehensive documentation

### 📚 Documentation
- Added `VERCEL-KV-SETUP.md` - Complete KV setup guide
- Added `DEPLOYMENT.md` - Vercel deployment guide
- Added `IMPROVEMENTS.md` - Future improvement suggestions
- Updated `.env.local.example` with KV variables

### 🐛 Fixed
- Fixed cache not persisting across Vercel cold starts
- Fixed generic error messages
- Fixed potential XSS vulnerabilities
- Fixed missing input validation

### 🔒 Security
- Added input sanitization
- Added suspicious pattern detection
- Removed sensitive data from logs
- Better error message handling

---

## [2.0.0] - 2025-10-18

### ✨ Added
- **Ollama Cloud Integration**
  - Replaced Gemini API with Ollama Cloud
  - Using `deepseek-v3.1:671b-cloud` model
  - Works in Myanmar without VPN
  - Streaming translation support

### 🔧 Changed
- Simplified translation provider (Ollama only)
- Removed Gemini dependencies from main code
- Updated environment variables

### 📚 Documentation
- Added `README-TRANSLATION-SETUP.md`
- Updated setup instructions

---

## [1.0.0] - Initial Release

### Features
- Burmese ↔ Chinese translation
- Google Gemini AI integration
- Real-time streaming translations
- Translation history (localStorage)
- Dark/Light theme support
- Responsive design
- Customer service focused prompts
