import { z } from 'zod';

export class ClientError {
  private constructor(
    public readonly code: string,
    public readonly title: string,
    public readonly message: string
  ) {}

  /**
   * @todo Improve implementation to support multiple errors
   */
  static readonly fromServerResponse = (props: { body: unknown; status?: number }): ClientError => {
    return new ClientError('SERVER_ERROR', 'Server error', JSON.stringify(props));
  };

  static readonly fromZodError = (props: {
    code: string;
    title: string;
    error: z.ZodError;
  }): ClientError => {
    const message = props.error.errors.map((e) => e.message).join(', ');
    return new ClientError(props.code, props.title, message);
  };
}
