import type { RutasApi } from '../rutas';
import type { SeguimientoApi } from '../seguimiento';
import { OsrmRoutingAdapter } from './infraestructura/osrm-routing.adapter';
import { RutasApiAdapter } from './infraestructura/rutas-api.adapter';
import { SeguimientoApiAdapter } from './infraestructura/seguimiento-api.adapter';
import { EtaPorRuteo } from './dominio/estrategias/eta-por-ruteo';
import { EtaPorVelocidadPromedio } from './dominio/estrategias/eta-por-velocidad-promedio';
import { EtaConRespaldo } from './dominio/estrategias/eta-con-respaldo';
import { ConsultarEtaUseCase } from './aplicacion/consultar-eta.use-case';
import { EtaController } from './presentacion/eta.controller';

interface DependenciasEta {
  rutasApi: RutasApi;               // API pública del módulo Rutas
  seguimientoApi: SeguimientoApi;   // API pública del módulo Seguimiento
  osrmBaseUrl: string;
}

export function inicializarModuloEta(deps: DependenciasEta) {
  // Adaptadores de infraestructura
  const paradasPort = new RutasApiAdapter(deps.rutasApi);
  const posicionesPort = new SeguimientoApiAdapter(deps.seguimientoApi);
  const routingPort = new OsrmRoutingAdapter(deps.osrmBaseUrl);

  // Estrategia principal con respaldo automático
  const estrategia = new EtaConRespaldo(
    new EtaPorRuteo(routingPort),
    new EtaPorVelocidadPromedio(15),
  );

  // Inyección de dependencias en el caso de uso y el controlador
  const consultarEtaUseCase = new ConsultarEtaUseCase(paradasPort, posicionesPort, estrategia);
  const etaController = new EtaController(consultarEtaUseCase);

  return {
    etaController,
    // Se expone el caso de uso para que Suscripciones pueda pedir ETAs internamente
    consultarEtaUseCase,
  };
}
