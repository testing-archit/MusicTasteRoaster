import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
    "Connecting to Apple Music...",
    "Analyzing your library...",
    "Judging your taste...",
    "Preparing savage roast...",
    "Loading brutal honesty...",
];

const AppleMusicAuth = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('initializing');
    const [error, setError] = useState(null);
    const [messageIndex, setMessageIndex] = useState(0);
    const [musicUserToken, setMusicUserToken] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        initializeMusicKit();
    }, []);

    const initializeMusicKit = async () => {
        try {
            setStatus('fetching-token');

            // Get developer token from our server
            const tokenResponse = await fetch('/api/apple/token');
            if (!tokenResponse.ok) {
                throw new Error('Failed to get Apple Music token. Make sure Apple credentials are configured.');
            }
            const { developerToken } = await tokenResponse.json();

            // Wait for MusicKit to be available
            if (typeof window.MusicKit === 'undefined') {
                // Wait a bit for MusicKit to load
                await new Promise((resolve) => {
                    const checkMusicKit = setInterval(() => {
                        if (typeof window.MusicKit !== 'undefined') {
                            clearInterval(checkMusicKit);
                            resolve();
                        }
                    }, 100);
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        clearInterval(checkMusicKit);
                        resolve();
                    }, 10000);
                });
            }

            if (typeof window.MusicKit === 'undefined') {
                throw new Error('MusicKit failed to load. Please refresh and try again.');
            }

            setStatus('configuring');

            // Configure MusicKit
            await window.MusicKit.configure({
                developerToken: developerToken,
                app: {
                    name: 'Music Taste Roaster',
                    build: '1.0.0',
                },
            });

            const music = window.MusicKit.getInstance();

            setStatus('authorizing');

            // Request authorization
            const userToken = await music.authorize();
            setMusicUserToken(userToken);

            setStatus('fetching-data');

            // Fetch user's music data
            await fetchMusicData(music);

        } catch (err) {
            console.error('Apple Music Error:', err);
            setError(err.message || 'Failed to connect to Apple Music');
            setStatus('error');
        }
    };

    const fetchMusicData = async (music) => {
        try {
            // Fetch various data from Apple Music
            const [recentlyPlayed, heavyRotation, libraryPlaylists, librarySongs] = await Promise.all([
                music.api.music('/v1/me/recent/played', { limit: 30 }).catch(() => ({ data: { data: [] } })),
                music.api.music('/v1/me/history/heavy-rotation', { limit: 20 }).catch(() => ({ data: { data: [] } })),
                music.api.music('/v1/me/library/playlists', { limit: 25 }).catch(() => ({ data: { data: [] } })),
                music.api.music('/v1/me/library/songs', { limit: 50 }).catch(() => ({ data: { data: [] } })),
            ]);

            // Process the data
            const processedData = {
                recentlyPlayed: (recentlyPlayed?.data?.data || []).map(item => ({
                    name: item.attributes?.name || 'Unknown',
                    artist: item.attributes?.artistName || 'Unknown',
                    type: item.type,
                })),
                heavyRotation: (heavyRotation?.data?.data || []).map(item => ({
                    name: item.attributes?.name || 'Unknown',
                    artist: item.attributes?.artistName || item.attributes?.curatorName || 'Unknown',
                    type: item.type,
                })),
                playlists: (libraryPlaylists?.data?.data || []).map(item => ({
                    name: item.attributes?.name || 'Unknown',
                    trackCount: item.attributes?.trackCount || 0,
                })),
                librarySongs: (librarySongs?.data?.data || []).map(item => ({
                    name: item.attributes?.name || 'Unknown',
                    artist: item.attributes?.artistName || 'Unknown',
                    album: item.attributes?.albumName || 'Unknown',
                })),
            };

            console.log('Apple Music Data:', processedData);

            // Send to server for roasting
            const roastResponse = await fetch('/api/apple/roast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            if (!roastResponse.ok) {
                throw new Error('Failed to generate roast');
            }

            const { roast, dataSummary } = await roastResponse.json();

            // Navigate to roast display
            navigate('/roast', {
                state: { roast, dataSummary, service: 'apple' }
            });

        } catch (err) {
            console.error('Error fetching Apple Music data:', err);
            setError('Failed to fetch your music library');
            setStatus('error');
        }
    };

    if (status === 'error') {
        return (
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍎❌</div>
                    <h1 style={{ marginBottom: '1rem' }}>Apple Music Error</h1>
                    <div style={{
                        background: 'rgba(252, 60, 68, 0.1)',
                        border: '1px solid rgba(252, 60, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        maxWidth: '500px',
                    }}>
                        <p style={{ color: '#fc3c44' }}>{error}</p>
                    </div>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ← Try Again
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="loader">
                <motion.div
                    style={{ fontSize: '4rem' }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    🍎
                </motion.div>

                <div className="loader-dots">
                    <div className="loader-dot" style={{ background: '#fc3c44' }} />
                    <div className="loader-dot" style={{ background: '#fc3c44' }} />
                    <div className="loader-dot" style={{ background: '#fc3c44' }} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            textAlign: 'center',
                        }}
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AppleMusicAuth;
