export interface BitacoraTarifa {
  idBitacoraTarifa: number;
  idTarifaBase: number;
  accion: string;
  precioAnterior: number;
  precioNuevo: number;
  idUsuarioResponsable: number;
  fechaCambio: string;
  observaciones: string;
}
