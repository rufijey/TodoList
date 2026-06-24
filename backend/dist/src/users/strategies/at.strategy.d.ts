import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users.repository';
export type JwtPayload = {
    userId: string;
    email: string;
};
declare const AtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class AtStrategy extends AtStrategy_base {
    private usersRepository;
    constructor(config: ConfigService, usersRepository: UsersRepository);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
    }>;
}
export {};
