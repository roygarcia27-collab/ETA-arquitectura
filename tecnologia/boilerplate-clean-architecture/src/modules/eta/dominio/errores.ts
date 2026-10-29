export class ParadaNoEncontradaError extends Error {
  constructor(paradaId: string) {
    super(`RN-08: La parada ${paradaId} no existe en la ruta indicada`);
    this.name = 'ParadaNoEncontradaError';
  }
}
