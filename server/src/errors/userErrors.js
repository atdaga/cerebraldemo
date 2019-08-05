import AppError from './AppError';

export class UserExistsError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}

export class UserNotExistError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}
