/**
 * Wompi Module - Infrastructure Layer
 
 * Módulo de NestJS para configurar el servicio de Wompi
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WompiService } from './wompi.service';
import wompiConfig from '../../config/wompi.config';

@Module({
  imports: [HttpModule, ConfigModule.forFeature(wompiConfig)],
  providers: [WompiService],
  exports: [WompiService],
})
export class WompiModule {}
