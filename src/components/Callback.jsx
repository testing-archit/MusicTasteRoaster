import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                navigate('/error', {
                    state: { message: `Spotify authorization failed: ${error}` }
                });
                return;
            }

            if (!code) {
                navigate('/error', {
                    state: { message: 'No authorization code received from Spotify' }
                });
                return;
            }

            // Navigate to loading page with the code
            navigate('/loading', { state: { code } });
        };

        handleCallback();
    }, [navigate, searchParams]);

    return (
        <div className="container">
            <div className="loader">
                <div className="loader-icon">🎵</div>
                <p style={{ color: 'var(--text-secondary)' }}>Authorizing...</p>
            </div>
        </div>
    );
};

export default Callback;
