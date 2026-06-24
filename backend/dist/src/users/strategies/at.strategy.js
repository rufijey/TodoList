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
exports.AtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const users_repository_1 = require("../users.repository");
let AtStrategy = class AtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    usersRepository;
    constructor(config, usersRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_ACCESS_SECRET') || 'myaccesssecret_super_secret_key_123',
        });
        this.usersRepository = usersRepository;
    }
    async validate(payload) {
        if (!payload || !payload.userId) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        const user = await this.usersRepository.findById(payload.userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        return {
            userId: payload.userId,
            email: payload.email,
        };
    }
};
exports.AtStrategy = AtStrategy;
exports.AtStrategy = AtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_repository_1.UsersRepository])
], AtStrategy);
//# sourceMappingURL=at.strategy.js.map