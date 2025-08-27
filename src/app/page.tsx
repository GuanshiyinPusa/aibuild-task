'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    Dashboard,
    Login,
} from '@mui/icons-material';

export default function HomePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Loading...
                </Typography>
            </Box>
        );
    }

    // Homepage
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="md">
                <Box textAlign="center">
                    <Dashboard sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                    <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        Analytics Dashboard
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 6 }}>
                        Visualize your procurement, sales, and inventory data with interactive charts
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Login />}
                        onClick={() => router.push('/login')}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            px: 6,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                            },
                        }}
                    >
                        Get Started
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
