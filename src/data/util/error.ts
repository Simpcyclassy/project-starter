import HttpStatus from "http-status-codes";
import { Request, Response } from "express";

/**
 * Base error type for errors that the server can respond
 * with.
 */
export class ControllerError extends Error {
  /**
   * HTTP status code for this error
   */
  code: number;
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateModelError extends ControllerError {
  code = HttpStatus.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}

export class ModelNotFoundError extends ControllerError {
  code = HttpStatus.NOT_FOUND;
  constructor(message: string) {
    super(message);
  }
}

export class ServerError extends ControllerError {
  code = HttpStatus.INTERNAL_SERVER_ERROR;
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends ControllerError {
  code = HttpStatus.FORBIDDEN;
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends ControllerError {
  code = HttpStatus.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}

export class BadGatewayError extends ControllerError {
  code = HttpStatus.BAD_GATEWAY;
  constructor(message: string) {
    super(message);
  }
}

export class GatewayTimeoutError extends ControllerError {
  code = HttpStatus.GATEWAY_TIMEOUT;
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends ControllerError {
  code = HttpStatus.NOT_FOUND;
  constructor(message: string) {
    super(message);
  }
}

export class ConstraintError extends ControllerError {
  code = HttpStatus.UNPROCESSABLE_ENTITY;
  constructor(message: string) {
    super(message);
  }
}

export class ConstraintDataError extends ControllerError {
  code = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly data: any;
  constructor(message: string, data: any) {
    super(message);
    this.data = data;
  }
}

export class ConflictError extends ControllerError {
  code = HttpStatus.CONFLICT;
  constructor(message: string) {
    super(message);
  }
}

export class UnAuthorisedError extends ControllerError {
  code = HttpStatus.UNAUTHORIZED;
  constructor(message: string) {
    super(message);
  }
}

export class InvalidSessionError extends Error {
  constructor(readonly originalError: Error) {
    super("Your session is invalid");
  }
}

export class NoAuthenticationError extends Error {
  constructor() {
    super("There's no session associated with this request");
  }
}

export const handleError = (req: Request, res: Response, error: any, code: number) => {
  res.json({
    code,
    error
  });
};
