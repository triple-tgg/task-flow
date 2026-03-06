import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
        .regex(/[0-9]/, 'Must contain at least 1 number')
        .regex(/[!@#$%^&*]/, 'Must contain at least 1 special character (!@#$%^&*)'),
    confirmPassword: z.string(),
}).refine((data) => data.password !== data.email, {
    message: 'Password cannot be the same as email',
    path: ['password'],
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRules = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'One uppercase letter (A-Z)', regex: /[A-Z]/ },
    { label: 'One number (0-9)', regex: /[0-9]/ },
    { label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*]/ },
];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { register: registerUser, isLoading, error, clearError } = useAuthStore();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const passwordValue = watch('password', '');

    const passwordStrength = useMemo(() => {
        const passed = passwordRules.filter((r) => r.regex.test(passwordValue)).length;
        if (passed === 0) return { level: '', label: '', percent: 0 };
        if (passed === 1) return { level: 'weak', label: 'Weak', percent: 25 };
        if (passed === 2) return { level: 'fair', label: 'Fair', percent: 50 };
        if (passed === 3) return { level: 'good', label: 'Good', percent: 75 };
        return { level: 'strong', label: 'Strong', percent: 100 };
    }, [passwordValue]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const message = await registerUser(data.name, data.email, data.password);
            setSuccessMessage(message);
        } catch {
            // Error handled by store
        }
    };

    if (successMessage) {
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
                        <h1 className="auth-form-title">Check your email</h1>
                        <p className="auth-form-subtitle" style={{ marginBottom: '2rem' }}>
                            {successMessage}
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

    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">TaskFlow</div>
                    <p className="auth-brand-tagline">
                        Streamline your workflow with intelligent task management.
                        Organize, collaborate, and deliver — effortlessly.
                    </p>
                </div>
            </div>

            <div className="auth-form-section">
                <div className="auth-form-container">
                    <h1 className="auth-form-title">Create your account</h1>
                    <p className="auth-form-subtitle">
                        Start managing tasks like a pro
                    </p>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} onChange={clearError}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="John Doe"
                                autoComplete="name"
                                {...register('name')}
                            />
                            {errors.name && (
                                <span className="form-error">{errors.name.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
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

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    {...register('password')}
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
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {passwordValue && (
                                <div className="password-strength">
                                    <div className="password-strength-bar">
                                        <div
                                            className={`password-strength-fill ${passwordStrength.level}`}
                                        />
                                    </div>
                                    <div
                                        className="password-strength-text"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span>Password strength</span>
                                        <span
                                            style={{
                                                color:
                                                    passwordStrength.level === 'strong'
                                                        ? 'var(--success)'
                                                        : passwordStrength.level === 'good'
                                                            ? 'var(--info)'
                                                            : passwordStrength.level === 'fair'
                                                                ? 'var(--warning)'
                                                                : 'var(--error)',
                                            }}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>

                                    {/* Rules checklist */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {passwordRules.map((rule) => {
                                            const passes = rule.regex.test(passwordValue);
                                            return (
                                                <div
                                                    key={rule.label}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        fontSize: '0.78rem',
                                                        color: passes
                                                            ? 'var(--success)'
                                                            : 'var(--text-muted)',
                                                        marginBottom: '0.15rem',
                                                    }}
                                                >
                                                    {passes ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <X size={14} />
                                                    )}
                                                    {rule.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <span className="form-error">{errors.password.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                placeholder="Confirm your password"
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
                                    <UserPlus size={18} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-links">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
