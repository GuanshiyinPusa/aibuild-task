import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionManager } from '@/lib/sessionManager';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        if (username.length < 3) {
            return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        // Create session
        const sessionToken = sessionManager.createSession(newUser.id, newUser.username);

        const response = NextResponse.json({
            success: true,
            user: { id: newUser.id, username: newUser.username }
        });

        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
            path: '/'
        });

        console.log('User registered successfully:', username);
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
