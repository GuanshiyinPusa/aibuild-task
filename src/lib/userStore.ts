// Simple in-memory user store (will be replaced with database later)
interface User {
    id: string;
    username: string;
    password: string; // In real app, this would be hashed
}

let users: User[] = [
    // Default demo users
    { id: '1', username: 'admin', password: 'admin123' },
    { id: '2', username: 'demo', password: 'demo123' },
    { id: '3', username: 'user', password: 'password' }
];

export const userStore = {
    findByUsername: (username: string) => {
        return users.find(user => user.username === username);
    },

    createUser: (username: string, password: string) => {
        const newUser: User = {
            id: (users.length + 1).toString(),
            username,
            password // In real app, hash this with bcrypt
        };
        users.push(newUser);
        return newUser;
    },

    validateCredentials: (username: string, password: string) => {
        const user = userStore.findByUsername(username);
        return user && user.password === password ? user : null;
    }
};
