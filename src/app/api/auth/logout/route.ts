import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/sessionManager';

export async function POST(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('session')?.value;

        if (sessionToken) {
            sessionManager.deleteSession(sessionToken);
        }

        const response = NextResponse.json({ success: true });
        response.cookies.delete('session');

        return response;
    } catch {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
