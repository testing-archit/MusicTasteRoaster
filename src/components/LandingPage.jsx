import { motion } from 'framer-motion';

const LandingPage = () => {
    const handleSpotifyLogin = () => {
        window.location.href = '/api/login';
    };

    const handleAppleMusicLogin = () => {
        window.location.href = '/apple-auth';
    };

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
                style={{ textAlign: 'center' }}
            >
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
                    Music Taste Roaster 🔥
                </motion.h1>

                <motion.p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                        marginBottom: '3rem',
                        maxWidth: '500px',
                        lineHeight: 1.6,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    Ready to get your music taste brutally roasted?
                    <br />
                    <span style={{ color: 'var(--text-muted)' }}>
                        (Warning: AI has no chill 😈)
                    </span>
                </motion.p>

                {/* Service Selection Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Spotify Button */}
                    <motion.button
                        className="btn btn-spotify"
                        onClick={handleSpotifyLogin}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                        Spotify
                    </motion.button>

                    {/* Apple Music Button */}
                    <motion.button
                        className="btn btn-apple"
                        onClick={handleAppleMusicLogin}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.8.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81.84-.553 1.472-1.287 1.88-2.208.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.785-.455-2.105-1.245-.047-.116-.082-.237-.12-.357-.022-.07-.016-.152.01-.22.157-.395.438-.7.81-.923.255-.15.53-.275.812-.385.38-.148.775-.262 1.156-.41.246-.096.448-.245.596-.478.096-.152.142-.32.145-.5.008-.54.003-1.082.003-1.623V9.357c0-.168-.042-.262-.2-.3-.33-.078-.658-.17-.987-.254l-1.7-.435c-.553-.142-1.107-.282-1.66-.423-.162-.04-.256.016-.276.182-.007.057-.01.117-.01.175v7.644c0 .36-.037.716-.175 1.054-.18.443-.465.803-.875 1.057-.34.21-.71.348-1.104.404-.256.037-.515.064-.773.06-.718-.013-1.36-.216-1.86-.755-.324-.352-.498-.77-.527-1.243-.034-.566.12-1.077.506-1.506.376-.42.85-.697 1.392-.86.328-.1.664-.16 1.002-.2.313-.04.627-.056.942-.06.148-.003.227-.063.227-.21v-5.97c0-.262.04-.514.182-.74.12-.19.29-.32.5-.39.18-.06.365-.09.556-.1z" />
                        </svg>
                        Apple Music
                    </motion.button>
                </div>

                <motion.p
                    style={{
                        marginTop: '2rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    We analyze your top artists, tracks, playlists & listening history. No spam, no BS.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default LandingPage;
