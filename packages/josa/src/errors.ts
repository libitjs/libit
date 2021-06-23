export class SigningError extends Error {}

export class ExpiredError extends SigningError {
  constructor(message: string, public expiredAt: Date) {
    super(message);
  }
}

export class NotBeforeError extends SigningError {
  constructor(message: string, public date: Date) {
    super(message);
  }
}
