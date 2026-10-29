import { Request, Response } from 'express';
import { ConsultarEtaUseCase } from '../aplicacion/consultar-eta.use-case';
import { ParadaNoEncontradaError } from '../dominio/errores';

export class EtaController {
  constructor(private readonly consultarEta: ConsultarEtaUseCase) {}

  obtenerEta = async (req: Request, res: Response): Promise<void> => {
    const rutaId = typeof req.query.rutaId === 'string' ? req.query.rutaId : '';
    if (!rutaId) {
      res.status(400).json({ mensaje: 'El parámetro rutaId es obligatorio' });
      return;
    }

    try {
      const resultado = await this.consultarEta.ejecutar({
        paradaId: req.params.paradaId,
        rutaId,
      });
      res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof ParadaNoEncontradaError) {
        res.status(404).json({ mensaje: error.message });
        return;
      }
      // Sin trazas internas hacia el cliente (EQ-03)
      res.status(503).json({ mensaje: 'Servicio de estimación temporalmente no disponible' });
    }
  };
}
