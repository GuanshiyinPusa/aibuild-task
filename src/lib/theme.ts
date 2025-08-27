'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb', // Blue-600 (similar to our Tailwind blue)
            light: '#3b82f6',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#10b981', // Green-500 
            light: '#34d399',
            dark: '#059669',
        },
        background: {
            default: '#f9fafb', // Gray-50
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray-900
            secondary: '#6b7280', // Gray-500
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.25rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '1.875rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Disable uppercase
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
});
