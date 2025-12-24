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

// Helper function to make Spotify API calls with error handling
const spotifyFetch = async (url, accessToken) => {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Check if response is OK
        if (!response.ok) {
            console.error(`Spotify API Error for ${url}: ${response.status} ${response.statusText}`);
            // Return object with error info so we can distinguish error types
            return { _error: true, status: response.status, statusText: response.statusText };
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`Spotify API returned non-JSON response for ${url}`);
            return { _error: true, status: 'non-json' };
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
        return { _error: true, status: 'network', message: error.message };
    }
};

// API Routes
app.get("/api/login", (req, res) => {
    // Comprehensive scopes for full music taste analysis
    const scope = "user-follow-read user-top-read user-read-recently-played playlist-read-private user-library-read";
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

        const accessToken = token.access_token;

        // Fetch all data in parallel for comprehensive roasting
        console.log("\n📊 Fetching comprehensive Spotify data...\n");

        const [
            followedArtists,
            topArtistsShort,
            topArtistsMedium,
            topArtistsLong,
            topTracksShort,
            topTracksMedium,
            topTracksLong,
            recentlyPlayed,
            playlists,
            savedTracks
        ] = await Promise.all([
            spotifyFetch("https://api.spotify.com/v1/me/following?type=artist&limit=20", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=15", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=15", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=15", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/player/recently-played?limit=30", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/playlists?limit=20", accessToken),
            spotifyFetch("https://api.spotify.com/v1/me/tracks?limit=30", accessToken)
        ]);

        // Check if all API calls failed with 403 (user not on allowlist)
        const allResults = [followedArtists, topArtistsShort, topArtistsMedium, topArtistsLong,
            topTracksShort, topTracksMedium, topTracksLong, recentlyPlayed, playlists, savedTracks];
        const forbiddenCount = allResults.filter(r => r?._error && r?.status === 403).length;

        if (forbiddenCount >= 5) {
            // Most/all APIs returned 403 - user not on allowlist
            console.error("❌ Most API calls returned 403 Forbidden - user likely not on Spotify app allowlist");
            return res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent("Access denied! The Spotify app is in Development Mode. Your Spotify email needs to be added to the app's allowlist in the Spotify Developer Dashboard.")}`);
        }

        // Helper to safely extract data (ignore error objects)
        const safeData = (data) => (data?._error ? null : data);

        // Process followed artists
        const followedArtistsList = (safeData(followedArtists)?.artists?.items || []).map(a => ({
            name: a.name,
            genres: a.genres?.slice(0, 3).join(", ") || "Unknown",
            popularity: a.popularity || 0
        }));

        // Process top artists by time range
        const processTopArtists = (data) => (safeData(data)?.items || []).map(a => ({
            name: a.name,
            genres: a.genres?.slice(0, 2).join(", ") || "Unknown",
            popularity: a.popularity || 0
        }));

        const topArtistsShortList = processTopArtists(topArtistsShort);
        const topArtistsMediumList = processTopArtists(topArtistsMedium);
        const topArtistsLongList = processTopArtists(topArtistsLong);

        // Process top tracks by time range
        const processTopTracks = (data) => (safeData(data)?.items || []).map(t => ({
            name: t.name,
            artist: t.artists?.[0]?.name || "Unknown",
            popularity: t.popularity || 0
        }));

        const topTracksShortList = processTopTracks(topTracksShort);
        const topTracksMediumList = processTopTracks(topTracksMedium);
        const topTracksLongList = processTopTracks(topTracksLong);

        // Process recently played
        const recentlyPlayedList = (safeData(recentlyPlayed)?.items || []).map(item => ({
            name: item.track?.name || "Unknown",
            artist: item.track?.artists?.[0]?.name || "Unknown"
        }));

        // Get unique recent artists (for pattern detection)
        const recentArtists = [...new Set(recentlyPlayedList.map(t => t.artist))].slice(0, 10);

        // Process playlists (names reveal a lot about taste!)
        const playlistNames = (safeData(playlists)?.items || [])
            .filter(p => p.name) // Filter out null names
            .map(p => ({
                name: p.name,
                trackCount: p.tracks?.total || 0,
                isPublic: p.public
            }));

        // Process saved/liked tracks
        const savedTracksList = (safeData(savedTracks)?.items || []).map(item => ({
            name: item.track?.name || "Unknown",
            artist: item.track?.artists?.[0]?.name || "Unknown"
        }));

        // Log data summary
        console.log("📈 Data Summary:");
        console.log(`   - Followed Artists: ${followedArtistsList.length}`);
        console.log(`   - Top Artists (Recent): ${topArtistsShortList.length}`);
        console.log(`   - Top Artists (6 months): ${topArtistsMediumList.length}`);
        console.log(`   - Top Artists (All time): ${topArtistsLongList.length}`);
        console.log(`   - Top Tracks (Recent): ${topTracksShortList.length}`);
        console.log(`   - Top Tracks (6 months): ${topTracksMediumList.length}`);
        console.log(`   - Top Tracks (All time): ${topTracksLongList.length}`);
        console.log(`   - Recently Played: ${recentlyPlayedList.length}`);
        console.log(`   - Playlists: ${playlistNames.length}`);
        console.log(`   - Saved Tracks: ${savedTracksList.length}\n`);

        // Check if we have enough data to roast
        const totalDataPoints = followedArtistsList.length +
            topArtistsShortList.length + topArtistsMediumList.length + topArtistsLongList.length +
            topTracksShortList.length + topTracksMediumList.length + topTracksLongList.length +
            recentlyPlayedList.length + playlistNames.length + savedTracksList.length;

        if (totalDataPoints === 0) {
            return res.redirect(`${CLIENT_URL}/error?message=${encodeURIComponent("You don't have enough listening history on Spotify. Listen to more music first!")}`);
        }

        // Build comprehensive prompt for AI
        const prompt = `You are the most savage, brutally honest music critic from India. Roast this person's music taste without mercy. Be sarcastic, use creative insults, mix Hindi and English (Hinglish), and don't hold back. Use desi references and slang. You can use bad words like chutiya, bkl, etc. Make it personal based on the data. Keep it around 200-300 words.Dont forget to add that its made by your friend/hater whatever you wanna call "Archit"

Here's everything about their music taste:

🎯 TOP ARTISTS RIGHT NOW (Last 4 weeks - what they're OBSESSED with):
${topArtistsShortList.length > 0 ? topArtistsShortList.map((a, i) => `${i + 1}. ${a.name} (${a.genres})`).join("\n") : "No recent top artists (suspicious...)"}

🎯 TOP ARTISTS (Last 6 months):
${topArtistsMediumList.length > 0 ? topArtistsMediumList.map((a, i) => `${i + 1}. ${a.name} (${a.genres})`).join("\n") : "No data"}

🎯 TOP ARTISTS ALL TIME (Their true colors):
${topArtistsLongList.length > 0 ? topArtistsLongList.map((a, i) => `${i + 1}. ${a.name} (${a.genres})`).join("\n") : "No data"}

🎵 TOP SONGS RIGHT NOW (What they can't stop playing):
${topTracksShortList.length > 0 ? topTracksShortList.slice(0, 10).map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}`).join("\n") : "No recent top tracks"}

🎵 ALL-TIME FAVORITE SONGS (The songs that define them):
${topTracksLongList.length > 0 ? topTracksLongList.slice(0, 10).map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}`).join("\n") : "No data"}

⏱️ RECENTLY PLAYED (Last few hours - caught red-handed):
${recentlyPlayedList.length > 0 ? recentlyPlayedList.slice(0, 10).map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}`).join("\n") : "No recent plays"}

📁 THEIR PLAYLISTS (Names tell everything):
${playlistNames.length > 0 ? playlistNames.slice(0, 15).map(p => `- "${p.name}" (${p.trackCount} tracks${!p.isPublic ? ", hidden from public 👀" : ""})`).join("\n") : "No playlists (doesn't even curate music, just vibes randomly)"}

💚 SAVED/LIKED SONGS (What they think are bangers):
${savedTracksList.length > 0 ? savedTracksList.slice(0, 10).map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}`).join("\n") : "No saved tracks (doesn't even commit to liking songs)"}

👥 ARTISTS THEY FOLLOW:
${followedArtistsList.length > 0 ? followedArtistsList.map(a => a.name).join(", ") : "Follows nobody (too cool to commit?)"}

Now DESTROY their music taste. Point out embarrassing patterns, guilty pleasures, basic choices, weird combinations, or anything roast-worthy. Be creative and brutal!`;

        let roast;
        try {
            const aiResponse = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            // Try to get text from response - the SDK structure can vary
            if (typeof aiResponse.text === 'string') {
                roast = aiResponse.text;
            } else if (aiResponse.response?.text) {
                roast = typeof aiResponse.response.text === 'function'
                    ? aiResponse.response.text()
                    : aiResponse.response.text;
            } else if (aiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
                roast = aiResponse.candidates[0].content.parts[0].text;
            } else {
                console.log("AI Response structure:", JSON.stringify(aiResponse, null, 2));
                roast = "Bhai, AI thoda confuse ho gaya, but tera taste toh bekar hai hi! 😂";
            }
        } catch (aiError) {
            console.error("AI Error:", aiError.message);
            roast = "Bhai, tere taste itna bekar hai ki AI bhi speechless ho gaya! 😂";
        }

        console.log("\n🔥🔥🔥 MUSIC TASTE ROAST 🔥🔥🔥\n");
        console.log(roast);
        console.log("\n🔥🔥🔥 END 🔥🔥🔥\n");

        // Prepare summary data for frontend display
        const dataSummary = {
            topArtists: topArtistsShortList.slice(0, 5),
            topTracks: topTracksShortList.slice(0, 5),
            recentlyPlayed: recentlyPlayedList.slice(0, 5),
            playlists: playlistNames.slice(0, 5).map(p => p.name),
            followedArtists: followedArtistsList.slice(0, 10),
            stats: {
                totalTopArtists: topArtistsShortList.length + topArtistsMediumList.length + topArtistsLongList.length,
                totalTopTracks: topTracksShortList.length + topTracksMediumList.length + topTracksLongList.length,
                totalPlaylists: playlistNames.length,
                totalRecentlyPlayed: recentlyPlayedList.length,
                totalSavedTracks: savedTracksList.length,
                followedCount: followedArtistsList.length
            }
        };

        // Encode roast data as base64 and pass via URL
        const roastData = JSON.stringify({ roast, dataSummary });
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

// ==================== APPLE MUSIC ENDPOINTS ====================

// Apple Music credentials (optional)
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Generate Apple Music Developer Token (JWT)
app.get("/api/apple/token", async (req, res) => {
    if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
        return res.status(500).json({
            error: "Apple Music not configured",
            message: "Please add APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY to .env"
        });
    }

    try {
        // Create JWT for Apple Music
        const now = Math.floor(Date.now() / 1000);
        const header = {
            alg: 'ES256',
            kid: APPLE_KEY_ID
        };
        const payload = {
            iss: APPLE_TEAM_ID,
            iat: now,
            exp: now + (60 * 60 * 24 * 180), // 180 days (max allowed)
        };

        // Base64url encode
        const base64url = (obj) => Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const headerEncoded = base64url(header);
        const payloadEncoded = base64url(payload);
        const signatureInput = `${headerEncoded}.${payloadEncoded}`;

        // Sign with ES256
        const sign = crypto.createSign('SHA256');
        sign.update(signatureInput);
        const signature = sign.sign(APPLE_PRIVATE_KEY, 'base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const developerToken = `${signatureInput}.${signature}`;

        res.json({ developerToken });
    } catch (error) {
        console.error("Apple Token Error:", error);
        res.status(500).json({ error: "Failed to generate Apple Music token" });
    }
});

// Generate roast from Apple Music data
app.post("/api/apple/roast", async (req, res) => {
    try {
        const { recentlyPlayed, heavyRotation, playlists, librarySongs } = req.body;

        console.log("\n🍎 Processing Apple Music data...\n");
        console.log("📈 Data Summary:");
        console.log(`   - Recently Played: ${recentlyPlayed?.length || 0}`);
        console.log(`   - Heavy Rotation: ${heavyRotation?.length || 0}`);
        console.log(`   - Playlists: ${playlists?.length || 0}`);
        console.log(`   - Library Songs: ${librarySongs?.length || 0}\n`);

        const totalDataPoints = (recentlyPlayed?.length || 0) + (heavyRotation?.length || 0) +
            (playlists?.length || 0) + (librarySongs?.length || 0);

        if (totalDataPoints === 0) {
            return res.status(400).json({ error: "No music data found in your Apple Music library" });
        }

        // Build prompt for Apple Music data
        const prompt = `You are the most savage, brutally honest music critic from India. Roast this person's Apple Music taste without mercy. Be sarcastic, use creative insults, mix Hindi and English (Hinglish), and don't hold back. Use desi references and slang. You can use bad words like chutiya, bkl, etc. Make it personal based on the data. Keep it around 200-300 words. Dont forget to add that its made by your friend/hater whatever you wanna call "Archit"

Here's everything about their Apple Music taste:

🔥 HEAVY ROTATION (What they're obsessed with):
${heavyRotation?.length > 0 ? heavyRotation.slice(0, 15).map((item, i) => `${i + 1}. "${item.name}" ${item.artist ? `by ${item.artist}` : ''}`).join("\n") : "Nothing in heavy rotation (doesn't even listen much?)"}

⏱️ RECENTLY PLAYED:
${recentlyPlayed?.length > 0 ? recentlyPlayed.slice(0, 15).map((item, i) => `${i + 1}. "${item.name}" by ${item.artist}`).join("\n") : "No recent plays"}

📁 THEIR PLAYLISTS:
${playlists?.length > 0 ? playlists.slice(0, 15).map(p => `- "${p.name}" (${p.trackCount} tracks)`).join("\n") : "No playlists (doesn't even curate music)"}

🎵 LIBRARY SONGS (What they've saved):
${librarySongs?.length > 0 ? librarySongs.slice(0, 20).map((s, i) => `${i + 1}. "${s.name}" by ${s.artist}`).join("\n") : "Empty library"}

Now DESTROY their music taste. Point out embarrassing patterns, guilty pleasures, basic choices, or anything roast-worthy. Be creative and brutal!`;

        let roast;
        try {
            const aiResponse = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            if (typeof aiResponse.text === 'string') {
                roast = aiResponse.text;
            } else if (aiResponse.response?.text) {
                roast = typeof aiResponse.response.text === 'function'
                    ? aiResponse.response.text()
                    : aiResponse.response.text;
            } else if (aiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
                roast = aiResponse.candidates[0].content.parts[0].text;
            } else {
                roast = "Bhai, AI thoda confuse ho gaya, but tera Apple Music taste toh bekar hai hi! 😂";
            }
        } catch (aiError) {
            console.error("AI Error:", aiError.message);
            roast = "Bhai, tere taste itna bekar hai ki AI bhi speechless ho gaya! 😂";
        }

        console.log("\n🔥🔥🔥 APPLE MUSIC ROAST 🔥🔥🔥\n");
        console.log(roast);
        console.log("\n🔥🔥🔥 END 🔥🔥🔥\n");

        // Prepare summary data for frontend
        const dataSummary = {
            topArtists: heavyRotation?.slice(0, 5) || [],
            topTracks: recentlyPlayed?.slice(0, 5) || [],
            playlists: playlists?.slice(0, 5).map(p => p.name) || [],
            stats: {
                totalHeavyRotation: heavyRotation?.length || 0,
                totalRecentlyPlayed: recentlyPlayed?.length || 0,
                totalPlaylists: playlists?.length || 0,
                totalLibrarySongs: librarySongs?.length || 0,
            },
            service: 'apple'
        };

        res.json({ roast, dataSummary });

    } catch (error) {
        console.error("Apple Roast Error:", error);
        res.status(500).json({ error: "Failed to generate roast" });
    }
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🎵 Music Taste Roaster API is running!\n`);
    console.log(`   Local:   http://127.0.0.1:${PORT}`);
    console.log(`   Network: http://${LOCAL_IP}:${PORT}\n`);
    console.log(`   Services: Spotify${APPLE_TEAM_ID ? ' + Apple Music' : ''}`);
    console.log(`   Spotify Redirect URI: ${REDIRECT_URI}`);
    console.log(`   (Make sure this is added to your Spotify app settings)\n`);
});
