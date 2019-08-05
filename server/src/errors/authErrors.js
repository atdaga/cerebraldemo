import AppError from './AppError';

export class UnauthorizedError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}

export class ForbiddenError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}
