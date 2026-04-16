# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Zenith — Your Mind is a Sanctuary
Zenith is a gentle, modern mental wellness platform designed to help users cultivate a daily practice of awareness. It combines intentional journaling, mood tracking, and AI-driven reflection to create a digital space for grace and emotional clarity.

# Overview
Zenith isn't a destination; it’s a daily practice. Built for the "modern soul," the platform moves away from cluttered interfaces toward a minimal, calming experience. Users can log their daily emotional intensity, receive AI-generated journaling prompts, and store reflections in a private, secure "Sanctuary."

# Features
**The Sanctuary (Authentication)**
Secure Entry: Private user signup and login powered by Firebase Authentication.

Personalized Experience: Each user’s journey is isolated, ensuring reflections remain private.

**Mood Logger**
Emotional Intensity: Log daily moods using a 1-10 intensity scale and a curated set of high-quality emojis.

AI Reflection: Features a "Zenith Reflection" tool that uses AI to provide a warm, empathetic response based on your current mood and notes.

CRUD Operations: Users can create, view, edit, and delete past mood entries.

**Intentional Journaling**
Guided Writing: Don't know where to start? Use the AI Prompt Generator to receive a warm, open-ended prompt (under 15 words) to spark reflection.

Free Writing: A clean, distraction-free environment for capturing the "whisper of your thoughts."

Persistent History: All journals are stored in Firestore and organized by date.

**Mood Board**
Aesthetic Clarity: A space to curate goals and inspirations that align with your mental peace.

# Tech Stack
Frontend: React.js, Tailwind CSS (for the "Sanctuary" aesthetic)
Routing: React Router DOM
Backend/BaaS: Firebase (Authentication & Firestore)
Intelligence: OpenAI API 
Deployment: Vercel

# Running the Project Locally

 1. Clone the Sanctuary

Bash

git clone https://github.com/your-username/zenith-wellness.git

cd zenith-wellness 

2. Install the Foundation

Bash

npm install

3. Setup the Atmosphere (Environment Variables)

Create a .env file in the root directory. Note: All variables must start with VITE_ for the build tool to recognize them.

'''Code snippet
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_OPENAI_API_KEY=your_openai_api_key
Ensure .env is added to your .gitignore to protect your keys.

4. Firebase Configuration

Enable Email/Password in the Firebase Auth tab.

Create a Firestore Database and set rules to allow access only to authenticated users:

JavaScript

allow read, write: if request.auth != null;

5. Awaken the App

Bash

npm run dev

Open http://localhost:5173 to begin your journey.


# Live Demo
https://zenith-ebon-rho.vercel.app/
