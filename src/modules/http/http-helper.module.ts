import { Module } from '@nestjs/common';
import { HttpHelperService } from '@modules/http/http-helper.service';

@Module({
  imports: [],
  controllers: [],
  providers: [HttpHelperService],
  exports: [HttpHelperService],
})
export class HttpHelperModule {}
