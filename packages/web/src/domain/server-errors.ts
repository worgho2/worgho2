import createHttpError from 'http-errors';
import { ZodError } from 'zod';

export class ServerErrors {
  static readonly validation = (error?: ZodError | string) => {
    const reasonMessage =
      typeof error === 'string'
        ? error
        : (error?.errors.map((e) => `[${e.path.join(', ')}] ${e.message}`).join(', ') ?? '');
    return new createHttpError.BadRequest(`Validation: ${reasonMessage}`);
  };

  static readonly internal = (message?: string) => {
    const reasonMessage = message ?? '';
    return new createHttpError.InternalServerError(`Internal: ${reasonMessage}`);
  };

  static readonly unauthorized = (reason?: string) => {
    const reasonMessage = reason ?? '';
    return new createHttpError.Unauthorized(`Unauthorized: ${reasonMessage}`);
  };

  static readonly notFound = (resource?: string, resourceId?: string) => {
    const reasonMessage = resource && resourceId ? `${resource} (id: ${resourceId})` : '';
    return new createHttpError.NotFound(`Not found: ${reasonMessage}`);
  };
}
