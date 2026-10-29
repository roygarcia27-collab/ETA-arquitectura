import { ParadasPort } from '../dominio/paradas-port';
import { PosicionesPort } from '../dominio/posiciones-port';
import { EtaStrategy } from '../dominio/eta-strategy';
import { ParadaNoEncontradaError } from '../dominio/errores';
import { ConsultarEtaQuery } from './consultar-eta.query';
import { ConsultarEtaResultado } from './consultar-eta.resultado';

export class ConsultarEtaUseCase {
  constructor(
    private readonly paradasPort: ParadasPort,         // Interfaz, no clase concreta
    private readonly posicionesPort: PosicionesPort,   // Interfaz, no Redis
    private readonly etaStrategy: EtaStrategy,         // Interfaz, no proveedor de mapas
    private readonly ttlPosicionSegundos: number = 60,
    private readonly maxResultados: number = 3,
  ) {}

  async ejecutar(query: ConsultarEtaQuery): Promise<ConsultarEtaResultado> {
    // 1. RN-08: la parada debe existir y pertenecer a la ruta
    const parada = await this.paradasPort.buscarPorId(query.paradaId);
    if (!parada || parada.rutaId !== query.rutaId) {
      throw new ParadaNoEncontradaError(query.paradaId);
    }

    // 2. Posiciones en vivo de la ruta
    const posiciones = await this.posicionesPort.obtenerVigentesPorRuta(query.rutaId);

    // 3. RN-03 y RN-04: solo vehículos vigentes que aún no pasaron la parada
    const candidatas = posiciones.filter(
      (p) => p.estaVigente(this.ttlPosicionSegundos) && p.ultimaParadaOrden < parada.orden,
    );

    // 4. Estimación en paralelo mediante la estrategia inyectada
    const estimaciones = await Promise.all(
      candidatas.map((p) => this.etaStrategy.estimar(p, parada)),
    );

    // 5. RN-09: los más cercanos en tiempo, hasta el máximo configurado
    const vehiculos = estimaciones
      .sort((a, b) => a.minutos - b.minutos)
      .slice(0, this.maxResultados)
      .map((e) => ({
        vehiculoId: e.vehiculoId,
        minutos: e.minutos,
        metodo: e.metodo,
        confianza: e.confianza,
        calculadaEn: e.calculadaEn.toISOString(),
      }));

    return { paradaId: parada.id, paradaNombre: parada.nombre, vehiculos };
  }
}
