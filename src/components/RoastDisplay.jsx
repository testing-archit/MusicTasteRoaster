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
    const [dataSummary, setDataSummary] = useState(location.state?.dataSummary || null);
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
                setDataSummary(data.dataSummary || null);
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

    const [copied, setCopied] = useState(false);

    const handleCopyRoast = () => {
        navigator.clipboard.writeText(roast);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareTwitter = () => {
        const text = `Just got my music taste roasted! 🔥\n\nGet yours at: ${window.location.origin}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleShareWhatsApp = () => {
        const text = `Just got my music taste brutally roasted! 🔥😂\n\nGet yours at: ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleDownloadScreenshot = async () => {
        try {
            // Use html2canvas if available, otherwise show instruction
            if (typeof html2canvas === 'undefined') {
                alert('📸 To download: Take a screenshot using your device (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)');
                return;
            }
            // If html2canvas is loaded, use it
            const element = document.querySelector('.roast-card');
            const canvas = await html2canvas(element);
            const link = document.createElement('a');
            link.download = 'my-music-roast.png';
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            alert('📸 To download: Take a screenshot using your device!');
        }
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

    // Calculate total data points analyzed
    const stats = dataSummary?.stats || {};
    const totalDataPoints = (stats.totalTopArtists || 0) + (stats.totalTopTracks || 0) +
        (stats.totalRecentlyPlayed || 0) + (stats.totalPlaylists || 0) + (stats.followedCount || 0);

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

            {dataSummary && (
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
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}
                    >
                        Roasted based on {totalDataPoints}+ data points
                    </h2>

                    {/* Data Sources Tags */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        {stats.totalTopArtists > 0 && (
                            <span className="data-tag" style={dataTagStyle}>
                                🎯 {stats.totalTopArtists} Top Artists
                            </span>
                        )}
                        {stats.totalTopTracks > 0 && (
                            <span className="data-tag" style={dataTagStyle}>
                                🎵 {stats.totalTopTracks} Top Tracks
                            </span>
                        )}
                        {stats.totalRecentlyPlayed > 0 && (
                            <span className="data-tag" style={dataTagStyle}>
                                ⏱️ {stats.totalRecentlyPlayed} Recent Plays
                            </span>
                        )}
                        {stats.totalPlaylists > 0 && (
                            <span className="data-tag" style={dataTagStyle}>
                                📁 {stats.totalPlaylists} Playlists
                            </span>
                        )}
                        {stats.totalSavedTracks > 0 && (
                            <span className="data-tag" style={dataTagStyle}>
                                💚 {stats.totalSavedTracks} Saved Tracks
                            </span>
                        )}
                    </div>

                    {/* Top Artists Preview */}
                    {dataSummary.topArtists?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                Your current obsessions:
                            </p>
                            <div className="artist-grid">
                                {dataSummary.topArtists.map((artist, index) => (
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
                        </div>
                    )}

                    {/* Top Tracks Preview */}
                    {dataSummary.topTracks?.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                On repeat lately:
                            </p>
                            <div className="artist-grid">
                                {dataSummary.topTracks.slice(0, 5).map((track, index) => (
                                    <motion.span
                                        key={track.name + track.artist}
                                        className="artist-pill"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 + index * 0.05 }}
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        {track.name}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Share Buttons */}
            <motion.div
                style={{
                    marginTop: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <motion.button
                    className="btn"
                    onClick={handleCopyRoast}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                    }}
                >
                    {copied ? '✓ Copied!' : '📋 Copy Roast'}
                </motion.button>

                <motion.button
                    className="btn"
                    onClick={handleShareTwitter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'rgba(29, 161, 242, 0.2)',
                        border: '1px solid rgba(29, 161, 242, 0.4)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                    }}
                >
                    🐦 Share on Twitter
                </motion.button>

                <motion.button
                    className="btn"
                    onClick={handleShareWhatsApp}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'rgba(37, 211, 102, 0.2)',
                        border: '1px solid rgba(37, 211, 102, 0.4)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                    }}
                >
                    💬 Share on WhatsApp
                </motion.button>

                <motion.button
                    className="btn"
                    onClick={handleDownloadScreenshot}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                    }}
                >
                    📸 Screenshot
                </motion.button>
            </motion.div>

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

// Style for data source tags
const dataTagStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
};

export default RoastDisplay;

