import moment from 'moment-timezone';
import { apiMessage, ApiMessageKey } from '@common/constants/message.constants';
import { ErrorCode, errorMessage } from '@common/constants/error.constants';
import { Lang } from '@common/classes/response.dto';
import { AppConstants } from '@common/constants/app.constants';
import { Types } from 'mongoose';

export function getCurrentVietnamTimeZone(): Date {
  return moment().tz(AppConstants.VIETNAM_TIMEZONE).toDate();
}

export function toBoolean(data: string): boolean {
  const value = { true: true, false: false };
  return value[data];
}

export function getApiMessage(key: ApiMessageKey, lang: Lang): string {
  return apiMessage[key][lang];
}

export function getErrorMessage(key: ErrorCode, lang: Lang): string {
  return errorMessage[key][lang];
}

export function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export function getRemainingTime(startDate: Date, endDate: Date): number {
  if (startDate > endDate) return 0;
  return endDate.getTime() - startDate.getTime();
}

export function toArray(value: any) {
  if (Array.isArray(value)) return value;
  return [value];
}
