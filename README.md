# Myanmar-Chinese Chat Assistant (Local Version)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

An advanced, real-time translation web application featuring a modern glassmorphism UI, intelligent caching, and a streaming typewriter effect powered by Google's Gemini AI. **This version runs completely locally without Firebase dependencies.**

---

## 🚀 Key Features

- **Real-time Streaming Translation**: Utilizes Google Gemini's streaming capabilities to display translations as they are generated, creating a live typewriter effect.
- **Local Storage Caching**: All translations are saved to browser localStorage for instant retrieval and offline access.
- **No Authentication Required**: Uses browser-based user identification without requiring login.
- **Modern Glassmorphism UI**: A complete UI overhaul featuring a blurred, transparent glass-like card effect, enhanced with subtle gradients and shadows.
- **Dynamic Animations**: Built with `framer-motion` to provide fluid and satisfying micro-interactions.
- **Persistent Cooldown Timer**: A 15-second cooldown between new AI translations is enforced and persists across page reloads.
- **Common Phrases Library**: Quick access to frequently used customer service phrases.
- **Light Theme**: Clean, professional interface optimized for customer service use.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)
- **Storage**: Browser LocalStorage (no backend required)
- **UI**: [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### 3. Run the Application

**Development mode:**
```bash
npm run dev
```

The app will be available at [http://localhost:9002](http://localhost:9002)

**Production build:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── app/          # Application-specific components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility functions
│   │   ├── storage.ts    # LocalStorage management
│   │   └── utils.ts      # Helper functions
│   └── ai/               # AI translation logic
│       └── translate.ts  # Gemini API integration
├── public/               # Static assets
├── .env.local.example    # Environment variables template
└── package.json          # Dependencies
```

## 🎯 Features Explained

### Translation System
- Uses Google Gemini 2.5 Flash for high-quality translations
- Streaming responses for real-time feedback
- Automatic retry with exponential backoff for reliability
- Fallback translations for common phrases

### Caching & Storage
- Client-side caching in localStorage
- Server-side in-memory cache for repeated queries
- Translation history with pagination
- Automatic cache expiration (24 hours)

### User Experience
- Typewriter effect for translations
- Copy-to-clipboard functionality
- Translation history with search
- Common phrases categorized by topic
- Responsive design for all devices

## 🔧 Configuration

### Cooldown Settings
Edit `src/ai/translate.ts` to change the cooldown duration:
```typescript
const COOLDOWN_SECONDS = 15; // Change this value
```

### Cache Expiry
Edit `src/lib/storage.ts` to change cache duration:
```typescript
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

### History Limit
Edit `src/lib/storage.ts` to change max history items:
```typescript
const MAX_HISTORY_ITEMS = 50; // Maximum number of saved translations
```

## 🚀 Deployment

This app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Connect your Git repository
- **Docker**: Build and run with Docker
- **Self-hosted**: Use `npm run build && npm start`

Remember to set your `GEMINI_API_KEY` environment variable in your deployment platform.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for translation capabilities
- ShadCN/UI for beautiful components
- Radix UI for accessible primitives
- Framer Motion for smooth animations
