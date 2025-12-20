import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";
import { networkInterfaces } from "os";

const app = express();
const PORT = process.env.PORT || 3000;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !GOOGLE_API_KEY) {
    console.error("❌ Missing environment variables. Please check .env file.");
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

const genAI = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

const escapeHtml = (str) => {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
    * { box-sizing: border-box; }
    body {
        background-color: #050505;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        margin: 0;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
    }
    .container {
        max-width: 800px;
        width: 100%;
        text-align: center;
    }
    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #ff4b1f, #ff9068);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 2rem;
    }
    .btn {
        background: #1DB954;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.2rem;
        transition: transform 0.2s, background 0.2s;
        display: inline-block;
    }
    .btn:hover {
        transform: scale(1.05);
        background: #1ed760;
    }
    .error-box {
        background: #2a1515;
        border: 1px solid #ff4444;
        border-radius: 12px;
        padding: 2rem;
        margin-top: 2rem;
    }
    .roast-card {
        background: #111;
        border: 1px solid #333;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
        text-align: left;
    }
    .roast-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #ff4b1f, #ff9068);
    }
    .roast-text {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #e0e0e0;
    }
    .artists-section {
        margin-top: 2rem;
        text-align: left;
    }
    h2 {
        font-size: 1.2rem;
        color: #888;
        border-bottom: 1px solid #333;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
    }
    .artist-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }
    .artist-pill {
        background: #1a1a1a;
        border: 1px solid #333;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        color: #bbb;
        transition: all 0.2s;
    }
    .artist-pill:hover {
        border-color: #ff9068;
        color: #fff;
        transform: translateY(-2px);
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.6s ease-out; }
`;

app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotify Music Roaster</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container fade-in">
        <h1>Ready to be judged?</h1>
        <p style="color:#888; margin-bottom:2rem;">archit ko bohot hasi aane wali h hahaahahahahh...</p>
        <a href="/login" class="btn">🎵 Login with Spotify</a>
    </div>
</body>
</html>
    `);
});

app.get("/login", (req, res) => {
    const scope = "user-follow-read";
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    res.redirect(authUrl.toString());
});

app.get("/callback", async (req, res) => {
    try {
        const code = req.query.code;

        if (!code) {
            throw new Error("No authorization code received from Spotify");
        }

        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET
            })
        });

        const token = await tokenRes.json();

        if (token.error) {
            throw new Error(`Spotify Auth Error: ${token.error_description || token.error}`);
        }

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
            return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No Artists Found</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container fade-in">
        <h1>😅 No artists found!</h1>
        <p style="color:#888;">You don't follow any artists on Spotify. Follow some artists first, then come back!</p>
        <a href="/" class="btn" style="margin-top:2rem;">← Try Again</a>
    </div>
</body>
</html>
            `);
        }

        const artists = artistItems.map(a => ({
            name: a.name,
            genres: a.genres?.join(", ") || "Unknown",
            popularity: a.popularity || 0,
            followers: a.followers?.total || 0
        }));

        const prompt = `Roast my music taste brutally. Be sarcastic. No compliments. Use hindi as well. It should be very desi. It can be brutal as well and use bad words like chutiya.

Here are the artists I follow:

${artists.map((a, i) => `${i + 1}. ${a.name} (Genres: ${a.genres}, Popularity: ${a.popularity}, Followers: ${a.followers})`).join("\n")}

Give me a brutal roast in a mix of Hindi and English.`;

        const aiResponse = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const roast = aiResponse.text || "Bhai, tere taste itna bekar hai ki AI bhi speechless ho gaya! 😂";

        console.log("\n🔥🔥🔥 MUSIC TASTE ROAST 🔥🔥🔥\n");
        console.log(roast);
        console.log("\n🔥🔥🔥 END 🔥🔥🔥\n");

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Roast is Ready 🔥</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container fade-in">
        <h1>Your Music Taste Roast 🔥</h1>
        <p style="color:#666; margin-bottom:2rem;">(archit ko bohot hasi aane wali h hahaahahahahh...)</p>
        
        <div class="roast-card">
            <div class="roast-text">${escapeHtml(roast).replace(/\n/g, "<br>")}</div>
        </div>

        <div class="artists-section">
            <h2>Based on these ${artists.length} artists you follow:</h2>
            <div class="artist-grid">
                ${artists.map(a => `<span class="artist-pill">${escapeHtml(a.name)}</span>`).join("")}
            </div>
        </div>
        
        <a href="/" class="btn" style="margin-top:2rem;">🔄 Roast Someone Else</a>
    </div>
</body>
</html>
        `);

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container fade-in">
        <h1>😵 Something went wrong!</h1>
        <div class="error-box">
            <p style="color:#ff6666;">${escapeHtml(err.message)}</p>
        </div>
        <a href="/" class="btn" style="margin-top:2rem;">← Try Again</a>
    </div>
</body>
</html>
        `);
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🎵 Spotify Music Roaster is running!\n`);
    console.log(`   Local:   http://127.0.0.1:${PORT}`);
    console.log(`   Network: http://${LOCAL_IP}:${PORT}\n`);
    console.log(`   Redirect URI: ${REDIRECT_URI}`);
    console.log(`   (Make sure this is added to your Spotify app settings)\n`);
});
