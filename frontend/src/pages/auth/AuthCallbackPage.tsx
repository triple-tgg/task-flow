import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { setAccessToken } from '../../api/axios';

/**
 * Handles the OAuth callback redirect from the backend.
 * The backend redirects here with ?token=<accessToken>
 * This page saves the token and redirects to dashboard.
 */
export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshAuth } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Authentication failed. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            // Set the access token and refresh auth to load user data
            setAccessToken(token);
            refreshAuth().then(() => {
                navigate('/dashboard', { replace: true });
            }).catch(() => {
                // If refresh fails, just navigate with the token set
                navigate('/dashboard', { replace: true });
            });
        } else {
            setError('No authentication token received.');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate, refreshAuth]);

    return (
        <div className="auth-layout">
            <div className="auth-form-section" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="auth-form-container" style={{ textAlign: 'center' }}>
                    {error ? (
                        <>
                            <h1 className="auth-form-title" style={{ color: 'var(--error)' }}>
                                Authentication Error
                            </h1>
                            <p className="auth-form-subtitle">{error}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Redirecting to login...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                            <h1 className="auth-form-title">Signing you in...</h1>
                            <p className="auth-form-subtitle">Please wait while we authenticate your account.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
