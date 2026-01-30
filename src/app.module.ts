import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './infrastructure/modules/product.module';
import { WompiModule } from '@infrastructure/external/wompi/wompi.module';
import wompiConfig from '@infrastructure/config/wompi.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [wompiConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // Cuidado en producción
      }),
    }),
    ProductModule,
    WompiModule,
  ],
})
export class AppModule {}
