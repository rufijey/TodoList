import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
export declare class UsersService {
    private usersRepository;
    private jwtService;
    private config;
    private mailService;
    constructor(usersRepository: UsersRepository, jwtService: JwtService, config: ConfigService, mailService: MailService);
    signup(createUserDto: CreateUserDto): Promise<{
        message: string;
    }>;
    signin(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(userId: string, rt: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
    }>;
    private updateRefreshToken;
    private getTokens;
}
