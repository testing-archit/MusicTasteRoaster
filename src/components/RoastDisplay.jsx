import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const RoastDisplay = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [roast, setRoast] = useState(location.state?.roast || '');
    const [artists, setArtists] = useState(location.state?.artists || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Decode roast data from URL if provided
    useEffect(() => {
        const encodedData = searchParams.get('data');

        if (encodedData && !roast) {
            try {
                // Decode base64url data
                const decoded = atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'));
                const data = JSON.parse(decoded);
                setRoast(data.roast);
                setArtists(data.artists || []);
            } catch (err) {
                console.error('Failed to decode roast data:', err);
                setError('Failed to load roast data');
            }
        } else if (!roast && !encodedData) {
            navigate('/error', {
                state: { message: 'No roast data available' }
            });
        }
    }, [searchParams, roast, navigate]);

    // Typewriter effect
    useEffect(() => {
        if (!roast || loading) return;

        let currentIndex = 0;
        setDisplayedText('');
        setIsTyping(true);

        const typeInterval = setInterval(() => {
            if (currentIndex < roast.length) {
                setDisplayedText(roast.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typeInterval);
            }
        }, 20);

        return () => clearInterval(typeInterval);
    }, [roast, loading]);

    const handleRoastAgain = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loader">
                    <div className="loader-icon">🔥</div>
                    <div className="loader-dots">
                        <div className="loader-dot" />
                        <div className="loader-dot" />
                        <div className="loader-dot" />
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading your roast...</p>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
                    <h1>Oops!</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                    <button className="btn btn-secondary" onClick={handleRoastAgain} style={{ marginTop: '2rem' }}>
                        ← Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '2rem' }}
        >
            <motion.h1
                className="gradient-text"
                style={{
                    fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                    fontWeight: 700,
                    marginBottom: '2rem',
                    textAlign: 'center',
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Your Music Taste Roast 🔥
            </motion.h1>

            <motion.div
                className="card roast-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{ width: '100%', maxWidth: '800px' }}
            >
                <div
                    className="typewriter"
                    style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {displayedText}
                    {isTyping && <span className="typewriter-cursor" />}
                </div>
            </motion.div>

            {artists.length > 0 && (
                <motion.div
                    style={{
                        marginTop: '2rem',
                        width: '100%',
                        maxWidth: '800px',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}
                    >
                        Based on {artists.length} artists you follow
                    </h2>
                    <div className="artist-grid">
                        {artists.map((artist, index) => (
                            <motion.span
                                key={artist.name}
                                className="artist-pill"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                            >
                                {artist.name}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            )}

            <motion.button
                className="btn btn-secondary"
                onClick={handleRoastAgain}
                style={{ marginTop: '2rem' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                🔄 Roast Someone Else
            </motion.button>
        </motion.div>
    );
};

export default RoastDisplay;
