import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/userStore';
import { sessionManager } from '@/lib/sessionManager';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const user = userStore.validateCredentials(username, password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        // Create session
        const sessionToken = sessionManager.createSession(user.id, user.username);

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username }
        });

        // Set session cookie
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: false, // false for localhost
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
            path: '/'
        });

        console.log('Login successful, created session:', sessionToken);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
