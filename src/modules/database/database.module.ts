import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<MongooseModuleOptions> => {
        const host = configService.get<string>('MONGO_HOST');
        const port = configService.get<number>('MONGO_PORT');
        const username = configService.get<string>('MONGO_USERNAME');
        const password = configService.get<string>('MONGO_PASSWORD');
        const database = configService.get<string>('MONGO_DATABASE');

        const uri =
          'mongodb+srv://kingreturn:tqaSSb0roMkkOCYh@cluster0.almmyh0.mongodb.net/monkhochir-otc';

        return { uri };
      },
    }),
  ],
})
export class DatabaseModule {}
