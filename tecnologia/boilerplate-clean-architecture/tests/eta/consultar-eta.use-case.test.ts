import { ConsultarEtaUseCase } from '../../src/modules/eta/aplicacion/consultar-eta.use-case';
import { Coordenada } from '../../src/modules/eta/dominio/coordenada';
import { Parada } from '../../src/modules/eta/dominio/parada';
import { PosicionVehiculo } from '../../src/modules/eta/dominio/posicion-vehiculo';
import { ParadasPort } from '../../src/modules/eta/dominio/paradas-port';
import { PosicionesPort } from '../../src/modules/eta/dominio/posiciones-port';
import { EtaStrategy } from '../../src/modules/eta/dominio/eta-strategy';
import { NivelConfianza } from '../../src/modules/eta/dominio/nivel-confianza';
import { ParadaNoEncontradaError } from '../../src/modules/eta/dominio/errores';
import { EtaPorVelocidadPromedio } from '../../src/modules/eta/dominio/estrategias/eta-por-velocidad-promedio';
import { EtaConRespaldo } from '../../src/modules/eta/dominio/estrategias/eta-con-respaldo';

const LAT = -13.1588;
const parada3 = new Parada('p3', 'r1', 'Parada 3', 3, new Coordenada(LAT, -74.2220));

function posicion(id: string, lon: number, ultimaOrden: number, antiguedadSeg = 0): PosicionVehiculo {
  return new PosicionVehiculo(id, 'r1', new Coordenada(LAT, lon), 15, ultimaOrden,
    new Date(Date.now() - antiguedadSeg * 1000));
}

class ParadasFake implements ParadasPort {
  constructor(private readonly parada: Parada | null) {}
  async buscarPorId(): Promise<Parada | null> { return this.parada; }
}

class PosicionesFake implements PosicionesPort {
  constructor(private readonly posiciones: PosicionVehiculo[]) {}
  async obtenerVigentesPorRuta(): Promise<PosicionVehiculo[]> { return this.posiciones; }
}

function crearCasoDeUso(parada: Parada | null, posiciones: PosicionVehiculo[]) {
  return new ConsultarEtaUseCase(new ParadasFake(parada), new PosicionesFake(posiciones),
    new EtaPorVelocidadPromedio(15));
}

describe('ConsultarEtaUseCase', () => {
  it('RN-08: lanza error si la parada no existe', async () => {
    const uc = crearCasoDeUso(null, []);
    await expect(uc.ejecutar({ paradaId: 'x', rutaId: 'r1' })).rejects.toBeInstanceOf(ParadaNoEncontradaError);
  });

  it('RN-08: lanza error si la parada no pertenece a la ruta', async () => {
    const uc = crearCasoDeUso(parada3, []);
    await expect(uc.ejecutar({ paradaId: 'p3', rutaId: 'otra' })).rejects.toBeInstanceOf(ParadaNoEncontradaError);
  });

  it('RN-03: descarta posiciones no vigentes', async () => {
    const uc = crearCasoDeUso(parada3, [posicion('vigente', -74.2300, 1), posicion('vencida', -74.2300, 1, 300)]);
    const r = await uc.ejecutar({ paradaId: 'p3', rutaId: 'r1' });
    expect(r.vehiculos.map((v) => v.vehiculoId)).toEqual(['vigente']);
  });

  it('RN-04: descarta vehículos que ya pasaron la parada', async () => {
    const uc = crearCasoDeUso(parada3, [posicion('ya-paso', -74.2300, 3), posicion('viene', -74.2300, 2)]);
    const r = await uc.ejecutar({ paradaId: 'p3', rutaId: 'r1' });
    expect(r.vehiculos.map((v) => v.vehiculoId)).toEqual(['viene']);
  });

  it('RN-09: ordena por minutos y devuelve máximo 3', async () => {
    const uc = crearCasoDeUso(parada3, [
      posicion('v1', -74.2450, 1), posicion('v2', -74.2400, 1), posicion('v3', -74.2350, 1),
      posicion('v4', -74.2300, 1), posicion('v5', -74.2250, 1),
    ]);
    const r = await uc.ejecutar({ paradaId: 'p3', rutaId: 'r1' });
    expect(r.vehiculos).toHaveLength(3);
    expect(r.vehiculos[0].vehiculoId).toBe('v5');
    const minutos = r.vehiculos.map((v) => v.minutos);
    expect(minutos).toEqual([...minutos].sort((a, b) => a - b));
  });

  it('sin vehículos candidatos devuelve lista vacía', async () => {
    const uc = crearCasoDeUso(parada3, []);
    const r = await uc.ejecutar({ paradaId: 'p3', rutaId: 'r1' });
    expect(r.vehiculos).toEqual([]);
  });
});

describe('EtaConRespaldo (EQ-02)', () => {
  it('usa la estrategia de respaldo cuando la principal falla', async () => {
    const principalQueFalla: EtaStrategy = {
      async estimar() { throw new Error('servicio de mapas caído'); },
    };
    const estrategia = new EtaConRespaldo(principalQueFalla, new EtaPorVelocidadPromedio(15));
    const e = await estrategia.estimar(posicion('v1', -74.2300, 1), parada3);
    expect(e.confianza).toBe(NivelConfianza.BAJA);
  });
});
