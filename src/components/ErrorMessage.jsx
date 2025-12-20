import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ErrorMessage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get message from URL params or navigation state
    const urlMessage = searchParams.get('message');
    const message = urlMessage || 'Something went wrong!';

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                style={{
                    textAlign: 'center',
                    maxWidth: '500px',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <motion.div
                    style={{ fontSize: '4rem', marginBottom: '1.5rem' }}
                    animate={{
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        delay: 0.3,
                    }}
                >
                    😵
                </motion.div>

                <h1
                    style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        color: 'var(--text-primary)',
                    }}
                >
                    Oops! Something went wrong
                </h1>

                <div
                    className="card"
                    style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        borderColor: 'rgba(255, 68, 68, 0.3)',
                        marginBottom: '2rem',
                    }}
                >
                    <p
                        style={{
                            color: '#ff6666',
                            fontSize: '1rem',
                            lineHeight: 1.6,
                        }}
                    >
                        {decodeURIComponent(message)}
                    </p>
                </div>

                <motion.button
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ← Try Again
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default ErrorMessage;
