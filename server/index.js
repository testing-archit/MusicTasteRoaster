import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";
import { networkInterfaces } from "os";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !GOOGLE_API_KEY) {
    console.error("❌ Missing environment variables. Please check .env file.");
    console.error("   Required: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, GEMINI_API_KEY");
    process.exit(1);
}

const getLocalIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "127.0.0.1";
};

const LOCAL_IP = getLocalIP();
const REDIRECT_URI = "http://127.0.0.1:3000/callback";

// Simple in-memory store for roast results (in production, use Redis or similar)
const roastStore = new Map();

const genAI = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// Cleanup old entries every 5 minutes
setInterval(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of roastStore.entries()) {
        if (value.timestamp < fiveMinutesAgo) {
            roastStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

// API Routes
app.get("/api/login", (req, res) => {
    const scope = "user-follow-read";
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    res.redirect(authUrl.toString());
});

// Spotify callback - handles the entire OAuth flow and generates roast
app.get("/callback", async (req, res) => {
    // Detect client port dynamically from referer or use default
    const clientPort = process.env.CLIENT_PORT || "5173";
    const CLIENT_URL = process.env.NODE_ENV === "production"
        ? `http://127.0.0.1:${PORT}`
        : `http://localhost:${clientPort}`;

    try {
        const code = req.query.code;
        const error = req.query.error;

        if (error) {
            return res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent(error)}`);
        }

        if (!code) {
            return res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent('No authorization code received')}`);
        }

        // Exchange code for token immediately
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }),
        });

        const token = await tokenRes.json();

        if (token.error) {
            throw new Error(`Spotify Auth Error: ${token.error_description || token.error}`);
        }

        // Get followed artists
        const followRes = await fetch(
            "https://api.spotify.com/v1/me/following?type=artist&limit=20",
            { headers: { Authorization: `Bearer ${token.access_token}` } }
        );

        const spotifyData = await followRes.json();

        if (spotifyData.error) {
            throw new Error(`Spotify API Error: ${spotifyData.error.message}`);
        }

        const artistItems = spotifyData?.artists?.items || [];

        if (artistItems.length === 0) {
            return res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent("You don't follow any artists on Spotify. Follow some artists first!")}`);
        }

        const artists = artistItems.map((a) => ({
            name: a.name,
            genres: a.genres?.join(", ") || "Unknown",
            popularity: a.popularity || 0,
            followers: a.followers?.total || 0,
        }));

        const prompt = `Roast my music taste brutally. Be sarcastic. No compliments. Use hindi as well. It should be very desi. It can be brutal as well and use bad words like chutiya.

Here are the artists I follow:

${artists.map((a, i) => `${i + 1}. ${a.name} (Genres: ${a.genres}, Popularity: ${a.popularity}, Followers: ${a.followers})`).join("\n")}

Give me a brutal roast in a mix of Hindi and English.`;

        const aiResponse = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const roast = aiResponse.text || "Bhai, tere taste itna bekar hai ki AI bhi speechless ho gaya! 😂";

        console.log("\n🔥🔥🔥 MUSIC TASTE ROAST 🔥🔥🔥\n");
        console.log(roast);
        console.log("\n🔥🔥🔥 END 🔥🔥🔥\n");

        // Encode roast data as base64 and pass via URL
        const roastData = JSON.stringify({ roast, artists });
        const encoded = Buffer.from(roastData).toString('base64url');

        // Redirect to frontend with encoded data
        res.redirect(`${CLIENT_URL}/roast?data=${encoded}`);

    } catch (err) {
        console.error("Callback Error:", err.message);
        const clientPort = process.env.CLIENT_PORT || "5173";
        const CLIENT_URL = `http://localhost:${clientPort}`;
        res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent(err.message)}`);
    }
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🎵 Spotify Music Roaster API is running!\n`);
    console.log(`   Local:   http://127.0.0.1:${PORT}`);
    console.log(`   Network: http://${LOCAL_IP}:${PORT}\n`);
    console.log(`   Redirect URI: ${REDIRECT_URI}`);
    console.log(`   (Make sure this is added to your Spotify app settings)\n`);
});
