export interface Evidencia {
  idEvidenciaIncidencia: number;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlEvidencia: string;
  descripcion: string;
  fechaCarga: string;
}

export interface Incidencia {
  idIncidencia: number;
  tipoIncidencia: string;
  descripcion: string;
  fechaIncidencia: string;
  resuelto: boolean;
  fechaResolucion: string | null;
  resueltoPor: string | null;
  observacionesResolucion: string | null;
  evidencias: Evidencia[];
}

export interface TicketResponse {
  idTicket: number;
  folioNumerico: string;
  tipoCliente: string;
  estadoTicket: string;
  placaVehiculo: string;
  modeloVehiculo: string;
  colorVehiculo: string;
  nombrePropietario: string;
  telefonoPropietario: string;
  incidencias: Incidencia;
}

export interface InformacionIncidencia {
  idTicket: number;
  tipoIncidencia: string;
  descripcion: string;
  tipoEvidencia: string;
  descripcionEvidencia: string;
}

export interface ApiResponse {
    message: string;
    status: string;
}
