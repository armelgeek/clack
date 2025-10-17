import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errorName: string | undefined = undefined;
    let stack: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // Attempt to extract message field if present
        // eslint-disable-next-line @typescript-eslint/ban-types
        const payload = res as object & { message?: any };
        message = payload.message || res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
      stack = exception.stack;
    }

  //  const isProd = process.env.NODE_ENV === 'production';
    const isProd = false; // Temporarily disable production mode for testing
    const body: any = {
      statusCode: status,
      message,
      path: (request as any).originalUrl || (request as any).url,
      timestamp: new Date().toISOString(),
    };

    // Include error name and stacktrace in non-production for debugging
    if (!isProd) {
      if (errorName) body.error = errorName;
      if (stack) body.stack = stack;
    }

    // Log full exception server-side for diagnostics
    this.logger.error({ message: body.message, stack: stack || exception });

    response.status(status).json(body);
  }
}
