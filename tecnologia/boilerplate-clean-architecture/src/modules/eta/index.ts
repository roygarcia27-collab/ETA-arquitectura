// API pública del módulo ETA: lo único que el resto del sistema puede importar.
export { inicializarModuloEta } from './eta.module';
export type { ConsultarEtaUseCase } from './aplicacion/consultar-eta.use-case';
export type { ConsultarEtaQuery } from './aplicacion/consultar-eta.query';
export type { ConsultarEtaResultado, EtaVehiculoDTO } from './aplicacion/consultar-eta.resultado';
