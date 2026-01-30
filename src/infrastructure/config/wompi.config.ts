/**
 * Configuración de Wompi desde variables de entorno
 */

import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => ({
  // Base URL de la API de Wompi (Sandbox)
  baseUrl: process.env.WOMPI_BASE_URL,
  // API Keys
  publicKey: process.env.WOMPI_PUBLIC_KEY || '',
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  integrityKey: process.env.WOMPI_INTEGRITY_KEY || '',

  // Timeouts
  requestTimeout: 30000, // 30 segundos
  pollingTimeout: 30000, // 30 segundos máximo para polling
  pollingInterval: 2000, // Consultar cada 2 segundos
}));
