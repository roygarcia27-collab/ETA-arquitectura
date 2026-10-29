export interface EtaVehiculoDTO {
  vehiculoId: string;
  minutos: number;
  metodo: string;
  confianza: string;
  calculadaEn: string;
}

export interface ConsultarEtaResultado {
  paradaId: string;
  paradaNombre: string;
  vehiculos: EtaVehiculoDTO[];
}
