'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Dashboard,
    PersonAdd,
    Login as LoginIcon,
} from '@mui/icons-material';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // Memoize checkAuthStatus to avoid useEffect dependency warning
    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                router.push('/dashboard');
            }
        } catch {
            // Not logged in, stay on login page
        }
    }, [router]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
            }}
        >
            <Container maxWidth="sm">
                {/* Header */}
                <Box textAlign="center" mb={4}>
                    <Dashboard sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                    <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        Analytics Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Sign in to access your product data
                    </Typography>
                </Box>

                {/* Login Form */}
                <Paper elevation={8} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box textAlign="center" mb={3}>
                            <Typography variant="h4" component="h2" gutterBottom color="primary" fontWeight="bold">
                                {isRegistering ? 'Create Account' : 'Welcome Back'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {isRegistering ? 'Sign up for a new account' : 'Please sign in to your account'}
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                margin="normal"
                                required
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonAdd color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                variant="outlined"
                                margin="normal"
                                required
                                type={showPassword ? 'text' : 'password'}
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LoginIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    py: 1.5,
                                    mb: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                {isLoading ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <CircularProgress size={20} color="inherit" />
                                        {isRegistering ? 'Creating Account...' : 'Signing In...'}
                                    </Box>
                                ) : (
                                    isRegistering ? 'Create Account' : 'Sign In'
                                )}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box textAlign="center">
                            <Button
                                onClick={() => setIsRegistering(!isRegistering)}
                                color="primary"
                                sx={{ fontWeight: 'medium' }}
                            >
                                {isRegistering
                                    ? 'Already have an account? Sign in'
                                    : "Don't have an account? Sign up"
                                }
                            </Button>
                        </Box>
                    </CardContent>
                </Paper>

                {/* Demo Credentials */}
                <Card sx={{ mt: 3, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                            🔑 Demo Credentials:
                        </Typography>
                        <Box sx={{ color: 'rgba(255,255,255,0.9)', typography: 'body2' }}>
                            <Typography>• <strong>admin</strong> / admin123</Typography>
                            <Typography>• <strong>demo</strong> / demo123</Typography>
                            <Typography>• <strong>user</strong> / password</Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Box textAlign="center" mt={4}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                        ← Back to Home
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}
