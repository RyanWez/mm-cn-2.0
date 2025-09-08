# Myanmar-Chinese Chat Assistant

This is an AI-powered chat translation application designed to assist customer service agents by providing real-time, context-aware translations between Burmese and Chinese. It's specifically optimized for phrases common in online betting customer service.

## Core Features

- **Real-time Translation**: Instantly translate text between Burmese and Chinese. The AI model is fine-tuned to understand the nuances of customer service conversations in the online betting industry.
- **Bidirectional Translation**: Easily switch the translation direction from Burmese-to-Chinese to Chinese-to-Burmese.
- **Common Phrases**: Access a curated list of frequently used phrases, categorized for quick access (e.g., Greetings, Deposits, Withdrawals).
- **Copy to Clipboard**: A one-click button to copy the translated text, streamlining the workflow.
- **Cooldown Timer**: A 30-second cooldown after each translation to manage API usage and ensure fair access.
- **Dark/Light Mode**: A theme-switcher for user comfort in different lighting conditions.
- **Responsive Design**: A clean, card-based layout that works seamlessly on both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI/Backend**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini Pro model
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/RyanWez/Live-Translator.git
    cd Live-Translator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    You need to get an API key for the Gemini model from [Google AI Studio](https://aistudio.google.com/app/apikey).

    Create a `.env.local` file in the root of the project and add your API key:
    ```env
    GEMINI_API_KEY=your_google_ai_studio_api_key
    ```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment on Vercel

This application is ready to be deployed on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

1.  **Push your code** to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import your project** into Vercel.
3.  **Configure Environment Variables**:
    - During the import process, Vercel will ask for environment variables. Add the `GEMINI_API_KEY` with the value you obtained from Google AI Studio.
4.  **Deploy**: Vercel will automatically detect that this is a Next.js project, build it, and deploy it.
