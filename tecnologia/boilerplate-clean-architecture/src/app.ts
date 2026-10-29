import express from 'express';
import { crearRutasApiEnMemoria } from './modules/rutas';
import { crearSeguimientoApiEnMemoria } from './modules/seguimiento';
import { inicializarModuloEta } from './modules/eta';
import { crearEtaRouter } from './modules/eta/presentacion/eta.routes';

export function crearApp() {
  const app = express();
  app.use(express.json());

  // Raíz de composición global: aquí se ensamblan los módulos.
  const rutasApi = crearRutasApiEnMemoria();            // TODO: módulo real
  const seguimientoApi = crearSeguimientoApiEnMemoria(); // TODO: módulo real
  const eta = inicializarModuloEta({
    rutasApi,
    seguimientoApi,
    osrmBaseUrl: process.env.OSRM_URL ?? 'http://localhost:5000',
  });

  app.get('/health', (_req, res) => {
    res.json({ estado: 'ok' });
  });
  app.use('/api/v1', crearEtaRouter(eta.etaController));

  return app;
}
