import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('M07ece007@13Lc01', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'rarunkumar@rathinam.in' },
        update: {
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
        },
        create: {
            email: 'rarunkumar@rathinam.in',
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
