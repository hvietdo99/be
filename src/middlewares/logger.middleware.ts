import { Injectable, NestMiddleware } from '@nestjs/common';
import { WinstonLoggerService } from '../common/services/winston.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl, params, query, body } = req;

    res.on('close', () => {
      const { statusCode, statusMessage } = res;

      this.logger.apiLog({
        statusCode,
        statusMessage,
        ip,
        method,
        originalUrl,
        params,
        query,
        body,
      });
    });

    next();
  }
}
