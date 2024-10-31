import * as dotenv from 'dotenv';

dotenv.config();

export const Config = {
  PORT: process.env.PORT || 4869,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_EXPIRED_TIME: '1d',
  REFRESH_TOKEN_EXPIRED_TIME: '8d',
  COPPER_API_KEY: process.env.COPPER_API_KEY,
};
