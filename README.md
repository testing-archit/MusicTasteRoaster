# 🔥 Music Taste Roaster (v2.0)

A brutally honest AI-powered app that roasts your Spotify music taste using Google's Gemini AI.

This app connects to your Spotify account, analyzes your listening habits (top artists, tracks, playlists, etc.), and uses Google's Gemini AI to generate a savage, personalized roast in a mix of Hindi and English.

## ✨ Features

- **🎵 Spotify Integration** - Connects to your Spotify account to analyze your music taste.
- **🤖 AI-Powered Roasts** - Uses Google Gemini to generate unique, personalized roasts.
- **🇮🇳 Desi Style** - Roasts come in a mix of Hindi and English (Hinglish) for that extra burn.
- **📊 Data Summary** - Shows you the data that was used to generate your roast.
- **🌐 Shareable Results** - A clean, simple UI makes it easy to screenshot and share your roast.
- **🎨 Modern UI** - A beautiful dark-mode interface with smooth animations.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router, Framer Motion
- **Backend:** Node.js (Bun runtime), Express
- **APIs:** Spotify Web API, Google Gemini AI
- **Authentication:** OAuth 2.0
- **Runtime:** Bun

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/testing-archit/MusicTasteRoaster.git
cd MusicTasteRoaster
```

### 2. Install dependencies

This project uses Bun for package management and runtime.

```bash
bun install
```

### 3. Create a `.env` file

Create a file named `.env` in the root of the project and add the following environment variables.

```env
# --- REQUIRED ---
# Get your Gemini API key from Google AI Studio
GEMINI_API_KEY="your_gemini_api_key"

# --- SPOTIFY SETUP ---
# 1. Go to https://developer.spotify.com/dashboard
# 2. Create a new app.
# 3. Add a redirect URI: http://127.0.0.1:3000/callback
# 4. Copy your Client ID and Client Secret here.
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
```

### 4. Run the development server

This command will start both the React frontend and the Bun backend concurrently.

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

## 🤔 How It Works

### Spotify Flow
1. User clicks "Continue with Spotify".
2. The app redirects to Spotify for authentication (OAuth 2.0).
3. After authorization, Spotify redirects back to the server.
4. The server fetches a comprehensive set of the user's music data (top tracks/artists, recently played, etc.).
5. This data is sent to the Gemini AI with a carefully crafted "roast" prompt.
6. The AI generates a brutal, personalized roast.
7. The server redirects the user to the frontend, where the roast is displayed.

---

Made with ❤️ and a lot of sarcasm by **Archit**.