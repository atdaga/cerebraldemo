import NestedError from 'nested-error-stacks';

export default class AppError extends NestedError {
  data;

  constructor({ message, data = undefined, nested = undefined }) {
    if (new.target === AppError) {
      throw new TypeError('Cannot construct AppError instance directly.');
    }
    super(message, nested);
    this.data = data;
  }
}
