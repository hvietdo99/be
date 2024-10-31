import { Module } from '@nestjs/common';
import { AssetController } from '@modules/admin/asset/asset.controller';
import { AssetService } from '@modules/admin/asset/asset.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Asset, AssetSchema } from '@modules/database/schemas/asset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    JwtModule,
  ],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
