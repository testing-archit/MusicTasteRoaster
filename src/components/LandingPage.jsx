import { motion } from 'framer-motion';

const LandingPage = () => {
    const handleSpotifyLogin = () => {
        window.location.href = '/api/login';
    };

    const features = [
        { emoji: '🤖', title: 'AI-Powered', desc: 'Google Gemini roasts your taste' },
        { emoji: '🇮🇳', title: 'Desi Style', desc: 'Hinglish roasts with no mercy' },
        { emoji: '📊', title: 'Deep Analysis', desc: 'Top artists, tracks & playlists' },
        { emoji: '🌐', title: 'Shareable', desc: 'Screenshot & share with friends' },
    ];

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ textAlign: 'center', maxWidth: '900px' }}
            >
                {/* Emoji Header */}
                <motion.div
                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    🔥
                </motion.div>

                <motion.h1
                    className="gradient-text"
                    style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Music Taste Roaster
                </motion.h1>

                <motion.p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                        marginBottom: '2rem',
                        lineHeight: 1.6,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    Ready to get your Spotify taste brutally roasted?
                    <br />
                    <span style={{ color: 'var(--text-muted)' }}>
                        (Warning: AI has no chill 😈)
                    </span>
                </motion.p>

                {/* Stats Badges */}
                <motion.div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        marginBottom: '2.5rem',
                        flexWrap: 'wrap',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <div style={{
                        background: 'rgba(29, 185, 84, 0.1)',
                        border: '1px solid rgba(29, 185, 84, 0.3)',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        color: '#1DB954',
                        fontWeight: 600,
                    }}>
                        ✓ Spotify Connected
                    </div>
                    <div style={{
                        background: 'rgba(147, 51, 234, 0.1)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        borderRadius: '20px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        color: '#9333ea',
                        fontWeight: 600,
                    }}>
                        ⚡ Powered by AI
                    </div>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                    className="btn btn-spotify"
                    onClick={handleSpotifyLogin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    style={{
                        fontSize: '1.1rem',
                        padding: '1rem 2.5rem',
                        marginBottom: '3rem',
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    Get Roasted on Spotify
                </motion.button>

                {/* Features Grid */}
                <motion.div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                y: -5,
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                {feature.emoji}
                            </div>
                            <h3 style={{
                                color: 'var(--text-primary)',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                marginBottom: '0.5rem',
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                margin: 0,
                            }}>
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Note */}
                <motion.p
                    style={{
                        marginTop: '2rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                >
                    🔒 We only read your music data. No spam, no BS.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default LandingPage;
