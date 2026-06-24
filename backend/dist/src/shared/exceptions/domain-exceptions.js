"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = exports.AccessDeniedException = exports.EntityNotFoundException = exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainException = DomainException;
class EntityNotFoundException extends DomainException {
}
exports.EntityNotFoundException = EntityNotFoundException;
class AccessDeniedException extends DomainException {
}
exports.AccessDeniedException = AccessDeniedException;
class ValidationException extends DomainException {
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=domain-exceptions.js.map