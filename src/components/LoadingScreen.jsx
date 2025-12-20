import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
    "Analyzing your questionable taste...",
    "Judging your life choices...",
    "Consulting the roast gods...",
    "Preparing verbal destruction...",
    "Loading savage mode...",
    "Finding the perfect insults...",
];

const LoadingScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchRoast = async () => {
            const code = location.state?.code;

            if (!code) {
                navigate('/error', {
                    state: { message: 'No authorization code provided' }
                });
                return;
            }

            try {
                const response = await fetch(`/api/roast?code=${encodeURIComponent(code)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to get roast');
                }

                navigate('/roast', {
                    state: {
                        roast: data.roast,
                        artists: data.artists
                    }
                });
            } catch (error) {
                navigate('/error', {
                    state: { message: error.message }
                });
            }
        };

        fetchRoast();
    }, [navigate, location]);

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="loader">
                <motion.div
                    className="loader-icon"
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    🔥
                </motion.div>

                <div className="loader-dots">
                    <div className="loader-dot" />
                    <div className="loader-dot" />
                    <div className="loader-dot" />
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

export default LoadingScreen;
