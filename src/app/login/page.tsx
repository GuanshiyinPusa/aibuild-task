'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const router = useRouter();

    // Check if already logged in
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                // Already logged in, redirect to dashboard
                router.push('/dashboard');
            }
        } catch (error) {
            // Not logged in, stay on login page
        }
    };

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
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Sign in to access your product data
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-center text-gray-900">
                            {isRegistering ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-center text-gray-600 mt-2">
                            {isRegistering ? 'Sign up for a new account' : 'Please sign in to your account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isLoading
                                ? (isRegistering ? 'Creating Account...' : 'Signing In...')
                                : (isRegistering ? 'Create Account' : 'Sign In')
                            }
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isRegistering
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"
                            }
                        </button>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</h3>
                        <div className="text-xs text-blue-800 space-y-1">
                            <div><strong>admin</strong> / admin123</div>
                            <div><strong>demo</strong> / demo123</div>
                            <div><strong>user</strong> / password</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600">
                    <Link href="/" className="hover:text-gray-800">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
