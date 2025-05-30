import { Logger } from '../infrastructure/logger';

export class SignIn {
  constructor(private readonly logger: Logger) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    this.logger.info('SignIn', input);
    return {
      token: '1234567890',
    };
  }
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInOutput {
  token: string;
}
