import AppError from './AppError';

export class DeviceNotExistError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}

export class TransactionNotExistError extends AppError {
  constructor({ message = undefined, data = undefined, nested = undefined }) {
    super({ message, data, nested });
  }
}
