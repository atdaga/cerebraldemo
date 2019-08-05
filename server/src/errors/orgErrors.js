import AppError from './AppError';

export class OrgExistsError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}

export class OrgNotExistError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}
