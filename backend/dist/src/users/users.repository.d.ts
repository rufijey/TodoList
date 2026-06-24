import { PrismaService } from '../prisma/prisma.service';
export declare class UsersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(email: string, passwordHash: string, verificationToken?: string, isVerified?: boolean): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    } | null>;
    findByVerificationToken(token: string): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    } | null>;
    verifyUser(userId: string): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    }>;
    updateUnverifiedUser(userId: string, passwordHash: string, verificationToken: string): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    }>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        refreshToken: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        createdAt: Date;
    } | null>;
    updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void>;
    clearRefreshToken(userId: string): Promise<void>;
}
