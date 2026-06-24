import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
export declare class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost): void;
}
