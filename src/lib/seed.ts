import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database with demo users...');

    // Create demo users for testing
    const demoUsers = [
        { username: 'admin', password: 'admin123' },
        { username: 'demo', password: 'demo123' },
        { username: 'user', password: 'password' }
    ];

    for (const userData of demoUsers) {
        const existingUser = await prisma.user.findUnique({
            where: { username: userData.username }
        });

        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            await prisma.user.create({
                data: {
                    username: userData.username,
                    password: hashedPassword
                }
            });
            console.log(`✅ Created demo user: ${userData.username}`);
        } else {
            console.log(`ℹ️ User ${userData.username} already exists`);
        }
    }

    console.log('✅ Database seeded with demo users');
    console.log('💡 Users can register their own accounts or use demo accounts for testing');
}

seed()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
