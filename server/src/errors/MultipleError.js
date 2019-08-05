import AppError from './AppError';

export default class MultipleError extends AppError {
  appErrors = [];

  addAppError(appError) {
    this.appErrors.push(appError);
  }
}
