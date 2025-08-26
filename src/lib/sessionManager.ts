interface Session {
    userId: string;
    username: string;
    createdAt: number;
}

class SessionManager {
    private sessions = new Map<string, Session>();

    createSession(userId: string, username: string): string {
        const sessionToken = `session_${userId}_${Date.now()}_${Math.random()}`;
        this.sessions.set(sessionToken, {
            userId,
            username,
            createdAt: Date.now()
        });
        return sessionToken;
    }

    getSession(token: string): Session | null {
        const session = this.sessions.get(token);

        // Check if session is expired (24 hours)
        if (session && Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
            this.sessions.delete(token);
            return null;
        }

        return session || null;
    }

    deleteSession(token: string): void {
        this.sessions.delete(token);
    }

    // Debug method
    getAllSessions() {
        return Array.from(this.sessions.entries());
    }
}

// Create a singleton instance
export const sessionManager = new SessionManager();
