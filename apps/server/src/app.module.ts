import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { AbdmModule } from "./modules/abdm/abdm.module";
import { PrismaService } from "./database/prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AbdmModule
  ],
  providers: [PrismaService]
})
export class AppModule {}
