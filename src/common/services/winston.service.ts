import { Injectable, LoggerService } from '@nestjs/common';
import winston from 'winston';
import { consoleLoggerTransport } from '@src/config/logger.config';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private winston: any;

  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MM/DD/YYYY, h:mm:ss A',
        }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${level.toLocaleUpperCase()}] ${timestamp}: ${message}`;
        }),
      ),
      transports: [consoleLoggerTransport],
    });
  }

  apiLog(message: any) {
    this.winston.log({
      level: 'info',
      statusCode: message.statusCode,
      method: message.method,
      originalUrl: message.originalUrl,
      statusMessage: message.statusMessage,
      ip: message.ip,
      params: message.params,
      query: message.query,
      body: message.body,
      response: message.response,
      apiLogger: true,
    });
  }

  log(message: any, key?: string) {
    this.winston.log({
      level: 'info',
      message,
      key,
    });
  }

  info(message: any, key?: string) {
    this.winston.log({
      level: 'info',
      message,
      key,
    });
  }

  debug(message: any, key?: string) {
    this.winston.log({
      level: 'debug',
      message,
      key,
    });
  }

  error(error: any, key?: string) {
    this.winston.log({
      level: 'info',
      error,
      key,
    });
  }

  warn(message: any, key?: string) {
    this.winston.log({
      level: 'warn',
      message,
      key,
    });
  }
}
