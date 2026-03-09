import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { setAccessToken } from '../../api/axios';

/**
 * Decodes a JWT and returns the payload (without verifying the signature).
 * Safe for client-side use since the server already verified the token.
 */
function decodeJwt(token: string): Record<string, any> | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Handles the OAuth callback redirect from the backend.
 * The backend redirects here with ?token=<accessToken>
 * This page decodes the JWT to get user info, sets auth state, and redirects to dashboard.
 */
export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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
            // Decode JWT to extract user info
            const payload = decodeJwt(token);

            if (payload && payload.sub) {
                // Set token and user state directly (no refresh call needed)
                setAccessToken(token);
                useAuthStore.setState({
                    user: {
                        id: payload.sub,
                        name: payload.name || '',
                        email: payload.email || '',
                        role: payload.role || 'member',
                    },
                    isAuthenticated: true,
                });
                navigate('/dashboard', { replace: true });
            } else {
                setError('Invalid token received.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setError('No authentication token received.');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

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
