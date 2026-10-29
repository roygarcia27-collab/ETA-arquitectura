import { Router } from 'express';
import { EtaController } from './eta.controller';

export function crearEtaRouter(controller: EtaController): Router {
  const router = Router();
  router.get('/paradas/:paradaId/eta', controller.obtenerEta);
  return router;
}
