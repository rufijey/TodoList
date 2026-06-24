"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("./users.repository");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("../mail/mail.service");
const crypto = require("crypto");
let UsersService = class UsersService {
    usersRepository;
    jwtService;
    config;
    mailService;
    constructor(usersRepository, jwtService, config, mailService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.config = config;
        this.mailService = mailService;
    }
    async signup(createUserDto) {
        const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const token = crypto.randomUUID();
            await this.usersRepository.updateUnverifiedUser(existingUser.id, hashedPassword, token);
            this.mailService.sendVerificationEmail(existingUser.email, token);
            return {
                message: 'Verification email sent. Please check your mailbox.',
            };
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const token = crypto.randomUUID();
        const user = await this.usersRepository.create(createUserDto.email, hashedPassword, token, false);
        this.mailService.sendVerificationEmail(user.email, token);
        return {
            message: 'Verification email sent. Please check your mailbox.',
        };
    }
    async signin(loginUserDto) {
        const user = await this.usersRepository.findByEmail(loginUserDto.email);
        if (!user) {
            throw new common_1.ForbiddenException('Invalid email or password');
        }
        if (!user.isVerified) {
            throw new common_1.ForbiddenException('Please verify your email address before logging in');
        }
        const passwordMatches = await bcrypt.compare(loginUserDto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.ForbiddenException('Invalid email or password');
        }
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
            },
            ...tokens,
        };
    }
    async verifyEmail(token) {
        const user = await this.usersRepository.findByVerificationToken(token);
        if (!user) {
            throw new common_1.ForbiddenException('Invalid or expired verification token');
        }
        await this.usersRepository.verifyUser(user.id);
        return {
            message: 'Email verified successfully',
        };
    }
    async logout(userId) {
        await this.usersRepository.clearRefreshToken(userId);
    }
    async refreshTokens(userId, rt) {
        const user = await this.usersRepository.findById(userId);
        if (!user || !user.refreshToken) {
            throw new common_1.ForbiddenException('Access denied (user not authenticated or token invalid)');
        }
        const rtMatches = await bcrypt.compare(rt, user.refreshToken);
        if (!rtMatches) {
            throw new common_1.ForbiddenException('Access denied (invalid refresh token)');
        }
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async findByEmail(email) {
        const user = await this.usersRepository.findByEmail(email);
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
        };
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.updateRefreshToken(userId, hashedToken);
    }
    async getTokens(userId, email) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                userId,
                email,
            }, {
                secret: this.config.get('JWT_ACCESS_SECRET') || 'myaccesssecret_super_secret_key_123',
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({
                userId,
                email,
            }, {
                secret: this.config.get('JWT_REFRESH_SECRET') || 'myrefreshsecret_super_secret_key_456',
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken: at,
            refreshToken: rt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map