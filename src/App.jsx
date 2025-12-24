import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Callback from './components/Callback';
import LoadingScreen from './components/LoadingScreen';
import RoastDisplay from './components/RoastDisplay';
import ErrorMessage from './components/ErrorMessage';
import BackgroundOrbs from './components/BackgroundOrbs';
import AppleMusicAuth from './components/AppleMusicAuth';

function App() {
    return (
        <div className="app">
            <BackgroundOrbs />
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/callback" element={<Callback />} />
                    <Route path="/loading" element={<LoadingScreen />} />
                    <Route path="/roast" element={<RoastDisplay />} />
                    <Route path="/error" element={<ErrorMessage />} />
                    <Route path="/apple-auth" element={<AppleMusicAuth />} />
                </Routes>
            </AnimatePresence>
        </div>
    );
}

export default App;

