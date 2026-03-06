import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { authApi } from '../../api/auth';

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
            .regex(/[0-9]/, 'Must contain at least 1 number')
            .regex(/[!@#$%^&*]/, 'Must contain at least 1 special character'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setTokenError('No reset token provided');
            setIsValidating(false);
            return;
        }

        authApi
            .validateResetToken(token)
            .then((res) => {
                if (res.data.valid) {
                    setTokenValid(true);
                } else {
                    setTokenError(res.data.message || 'Invalid or expired token');
                }
            })
            .catch(() => {
                setTokenError('Failed to validate token');
            })
            .finally(() => {
                setIsValidating(false);
            });
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        setError('');
        try {
            await authApi.resetPassword({ token, newPassword: data.newPassword });
            setSuccess(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to reset password',
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isValidating) {
        return (
            <div className="auth-layout">
                <div className="auth-form-section">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '2rem auto' }} />
                        <p className="auth-form-subtitle">Validating reset token...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Token invalid
    if (!tokenValid && !success) {
        return (
            <div className="auth-layout">
                <div className="auth-brand">
                    <div className="auth-brand-content">
                        <div className="auth-brand-logo">TaskFlow</div>
                    </div>
                </div>
                <div className="auth-form-section">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '2px solid var(--error)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}
                        >
                            <AlertTriangle size={32} color="var(--error)" />
                        </div>
                        <h1 className="auth-form-title">Invalid Link</h1>
                        <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                            {tokenError}
                        </p>
                        <Link to="/forgot-password" className="btn btn-primary btn-full">
                            Request a New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className="auth-layout">
                <div className="auth-brand">
                    <div className="auth-brand-content">
                        <div className="auth-brand-logo">TaskFlow</div>
                    </div>
                </div>
                <div className="auth-form-section">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '2px solid var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}
                        >
                            <Check size={32} color="var(--success)" />
                        </div>
                        <h1 className="auth-form-title">Password Reset</h1>
                        <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                            Your password has been reset successfully. You can now sign in with
                            your new password.
                        </p>
                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Reset form
    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">TaskFlow</div>
                    <p className="auth-brand-tagline">
                        Streamline your workflow with intelligent task management.
                    </p>
                </div>
            </div>

            <div className="auth-form-section">
                <div className="auth-form-container">
                    <h1 className="auth-form-title">Reset your password</h1>
                    <p className="auth-form-subtitle">
                        Enter your new password below
                    </p>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    {...register('newPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <span className="form-error">
                                    {errors.newPassword.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirm your new password"
                                autoComplete="new-password"
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && (
                                <span className="form-error">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <KeyRound size={18} />
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
