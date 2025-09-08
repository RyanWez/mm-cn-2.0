# Live Translator V2 - Gemini & Firebase Edition

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

An advanced, real-time translation web application featuring a modern glassmorphism UI, intelligent caching, and a streaming typewriter effect powered by Google's Gemini and Firebase.

---

### ✨ **[Insert a GIF of the app in action here!]** ✨
*(Recommendation: Record a short GIF showcasing the glassmorphism UI, the streaming typewriter effect for both a new translation and a cached one. This is the best way to showcase the project.)*

---

## 🚀 Key Features

This project has been significantly upgraded with a focus on modern aesthetics and a robust user experience.

- **Real-time Streaming Translation**: Utilizes Google Gemini's streaming capabilities to display translations as they are generated, creating a live typewriter effect.
- **Intelligent Caching**: All translations are saved to a user-specific history in Firestore. Before calling the AI, the app first checks for a cached result to reduce API calls and improve response time.
- **Seamless User Authentication**: Leverages Firebase Anonymous Authentication to provide each user with a unique, persistent identity without requiring a traditional login. 
- **Modern Glassmorphism UI**: A complete UI overhaul featuring a blurred, transparent glass-like card effect, enhanced with subtle gradients and shadows.
- **Dynamic Animations**: Built with `framer-motion` to provide fluid and satisfying micro-interactions, including component fade-ins, button effects, and the text reveal animations.
- **Persistent Cooldown Timer**: A 15-second cooldown between new AI translations is enforced and persists across page reloads using `localStorage`.
- **Dark/Light Mode**: A theme-switcher for user comfort.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Anonymous Authentication, Firestore)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## ⚙️ Getting Started

Follow these instructions to get a local copy up and running.

### 1. Firebase Project Setup

This project requires a Firebase project to handle authentication and the database.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication**: 
    - In your project, go to the **Authentication** section.
    - Click the **Sign-in method** tab.
    - Select **Anonymous** from the provider list and **Enable** it.
3.  **Set up Firestore Database**:
    - Go to the **Firestore Database** section and create a new database.
    - Start in **Production mode**.
    - **Security Rules**: Go to the **Rules** tab and replace the default rules with the following to allow users to read/write their own data:
      ```javascript
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /translations/{userId}/history/{docId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
      ```
4.  **Get Web App Config**: 
    - Go to **Project Settings** (the gear icon).
    - In the **General** tab, scroll down to "Your apps".
    - Click the **Web** icon (`</>`) to create a new web app.
    - Give it a name and register the app. You will be shown your `firebaseConfig` object. You will need these values for the environment variables.

### 2. Local Environment Setup

- **Prerequisites**: Node.js (v18 or later recommended)

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

    Create a `.env.local` file in the root of the project. You will need two sets of keys:

    - **Gemini API Key**: Get this from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - **Firebase Config Keys**: Get these from the Firebase project setup (Step 1.4).

    ```env
    # Google Gemini API Key
    GEMINI_API_KEY=your_google_ai_studio_api_key

    # Firebase Public Keys
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
    ```

### 3. Create Firestore Index

The app uses a specific query that requires a composite index in Firestore.

1.  Run the app locally (`npm run dev`).
2.  Open your browser's **Developer Tools** (F12) and go to the **Console** tab.
3.  Translate a word that is **not** in your history database.
4.  You will see a `FirebaseError` in the console. This is expected. The error message will contain a **long URL** to create the required index.
5.  **Click that URL**. It will take you to the Firebase console with the index fields pre-filled.
6.  Click **Create Index**. It will take a few minutes to build.

### 4. Running the Development Server

Once the index is enabled, you are ready to go!

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.