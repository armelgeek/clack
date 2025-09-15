export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends DomainError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends DomainError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends DomainError {
  readonly statusCode = 500;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
    this.name = 'InternalServerError';
  }
}
