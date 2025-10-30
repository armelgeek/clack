import { Module } from "@nestjs/common";
import { ExternalStoreMappingRepository } from "./external-store-mappings.repository";
@Module({
  providers: [ExternalStoreMappingRepository],
  exports: [ExternalStoreMappingRepository],
})
export class ExternalStoreMappingModule {}
