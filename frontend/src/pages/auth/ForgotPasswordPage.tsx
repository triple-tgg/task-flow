import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { authApi } from '../../api/auth';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError('');
        try {
            await authApi.forgotPassword(data.email);
            setSuccess(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Something went wrong. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
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
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '2px solid var(--info)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}
                        >
                            <Mail size={32} color="var(--info)" />
                        </div>
                        <h1 className="auth-form-title">Check your email</h1>
                        <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                            If an account exists with this email, you'll receive a password
                            reset link shortly.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-full">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                    <Link
                        to="/login"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>

                    <h1 className="auth-form-title">Forgot password?</h1>
                    <p className="auth-form-subtitle">
                        No worries, we'll send you a reset link.
                    </p>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="name@company.com"
                                autoComplete="email"
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className="form-error">{errors.email.message}</span>
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
                                    <Mail size={18} />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
