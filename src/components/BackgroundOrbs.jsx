import { motion } from 'framer-motion';

const BackgroundOrbs = () => {
    return (
        <>
            <motion.div
                className="orb orb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1 }}
            />
            <motion.div
                className="orb orb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1, delay: 0.2 }}
            />
            <motion.div
                className="orb orb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1, delay: 0.4 }}
            />
        </>
    );
};

export default BackgroundOrbs;
