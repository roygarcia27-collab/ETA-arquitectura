import { Coordenada } from '../../src/modules/eta/dominio/coordenada';

describe('Coordenada', () => {
  it('RN-01: rechaza latitud fuera de rango', () => {
    expect(() => new Coordenada(91, 0)).toThrow();
  });

  it('RN-01: rechaza longitud fuera de rango', () => {
    expect(() => new Coordenada(0, 181)).toThrow();
  });

  it('distancia a sí misma es cero', () => {
    const c = new Coordenada(-13.1588, -74.2220);
    expect(c.distanciaMetrosA(c)).toBe(0);
  });

  it('0.01 grados de longitud en esta latitud son aproximadamente 1.08 km', () => {
    const a = new Coordenada(-13.1588, -74.2220);
    const b = new Coordenada(-13.1588, -74.2120);
    const metros = a.distanciaMetrosA(b);
    expect(metros).toBeGreaterThan(1000);
    expect(metros).toBeLessThan(1200);
  });
});
