import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/sessionManager';

export async function GET(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('session')?.value;

        console.log('Checking auth for token:', sessionToken);

        if (!sessionToken) {
            return NextResponse.json({ error: 'No session token' }, { status: 401 });
        }

        const session = sessionManager.getSession(sessionToken);

        if (!session) {
            console.log('No valid session found');
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        console.log('Valid session found for user:', session.username);
        return NextResponse.json({ user: session });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
    }
}
