# 🔥 Music Taste Roaster

A brutally honest AI-powered app that roasts your music taste based on the artists you follow on Spotify. Built with Node.js, Express, Spotify API, and Google's Gemini AI.

## Features

- 🎵 **Spotify Integration** - Connects to your Spotify account to fetch followed artists
- 🤖 **AI-Powered Roasts** - Uses Google Gemini to generate savage, personalized roasts
- 🇮🇳 **Desi Style** - Roasts come in a mix of Hindi and English for that extra burn
- 🌐 **Network Access** - Share with friends on the same WiFi to roast their taste too
- 🎨 **Beautiful UI** - Dark mode interface with smooth animations

## Tech Stack

- **Backend:** Node.js, Express
- **APIs:** Spotify Web API, Google Gemini AI
- **Auth:** OAuth 2.0 (Spotify)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/testing-archit/MusicTasteRoaster.git
cd MusicTasteRoaster
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
GEMINI_API_KEY="your_gemini_api_key"
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
```

### 4. Configure Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://YOUR_LOCAL_IP:3000/callback`
4. Copy Client ID and Secret to your `.env` file

### 5. Run the app

```bash
node main.js
```

Open the URL shown in terminal and prepare to be roasted! 🔥

## How It Works

1. User clicks "Login with Spotify"
2. App fetches followed artists from Spotify API
3. Artist data is sent to Gemini AI with a roast prompt
4. AI generates a brutal, personalized roast
5. Roast is displayed with the list of artists

## Screenshots

Coming soon...

## Contributing

Feel free to fork and submit PRs. Let's make the roasts even more savage! 💀

## License

MIT

---

Made with ❤️ and a lot of sarcasm
