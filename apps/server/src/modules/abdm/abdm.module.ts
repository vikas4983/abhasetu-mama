import { Module } from "@nestjs/common";
import { AbdmController } from "./abdm.controller";
import { AbdmService } from "./abdm.service";

@Module({
  controllers: [AbdmController],
  providers: [AbdmService],
  exports: [AbdmService]
})
export class AbdmModule {}
