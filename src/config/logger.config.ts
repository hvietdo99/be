import chalk from 'chalk';
import moment from 'moment-timezone';
import winston from 'winston';
import { AppConstants } from '@common/constants/app.constants';

const consoleLoggerFormat = winston.format.combine(
  winston.format.json({ space: 2 }),
  winston.format.errors({ stack: true }),
  winston.format.timestamp({
    format: moment().tz(AppConstants.VIETNAM_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
  }),
  winston.format.label({ label: 'H247' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((information) => {
    const {
      method,
      originalUrl,
      timestamp,
      ip,
      statusMessage,
      statusCode,
      apiLogger,
      level,
    } = information;

    const apiMethod = chalk.green(`${method}`);
    const endpoint = chalk.gray(`${originalUrl}`);
    const apiTimestamp = chalk.gray(`${timestamp}`);
    const ipAddress = chalk.gray(`${ip}`);

    let status: string;
    switch (statusCode) {
      case 200:
      case 201:
        status = chalk.green(`${statusCode}`);
        break;
      case 304:
      case 400:
      case 401:
      case 403:
        status = chalk.yellow(`${statusCode}`);
        break;
      default:
        status = chalk.red(`${statusCode}`);
        break;
    }

    let message: string;
    switch (statusCode) {
      case 200:
      case 201:
        message = chalk.green(`${statusMessage}`);
        break;
      case 304:
      case 400:
      case 401:
      case 403:
        message = chalk.yellow(`${statusMessage}`);
        break;
      default:
        message = chalk.red(`${statusMessage}`);
        break;
    }

    if (apiLogger) {
      return `[${apiMethod}] ${endpoint} | ${status} | ${apiTimestamp} | ${ipAddress} - ${message}`;
    }

    return `[${level}] - ${apiTimestamp} | ${JSON.stringify(information)}`;
  }),
);

export const consoleLoggerTransport = new winston.transports.Console({
  format: consoleLoggerFormat,
  level: 'info',
  silent: false,
});
