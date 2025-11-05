export interface Tarifa {
  idTarifaBase: number;
  idEmpresa: number;
  precioPorHora: number;
  moneda: string;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estado: string;
}
