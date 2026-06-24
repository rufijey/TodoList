export declare class DomainException extends Error {
    constructor(message: string);
}
export declare class EntityNotFoundException extends DomainException {
}
export declare class AccessDeniedException extends DomainException {
}
export declare class ValidationException extends DomainException {
}
