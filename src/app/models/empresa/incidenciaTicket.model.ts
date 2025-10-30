// ======================================================
// INTERFACES PARA CREAR UNA RESOLUCIÓN DE UNA INCIDENCIA
// ======================================================

export interface ResolverIncidenciaRequest {
    idIncidencia: number;
    idUsuarioResuelve: number;
    observacionesResolucion: string;
}

export interface ApiResponse {
    message: string;
    status: string;
}

// ========================================================
// INTERFACES PARA MOSTRAR LAS INCIDENCIAS DESDE LA EMPRESA
// ========================================================

export interface IncidenciasSucursalResponse {
  idSucursal: number;
  nombreSucursal: string;
  direccionSucursal: string;
  telefonoSucursal: string;
  incidenciasSucursalDTOList: IncidenciasSucursalDTO[];
}

export interface IncidenciasSucursalDTO {
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

export interface Incidencia {
  idIncidencia: number;
  tipoIncidencia: string;
  descripcion: string;
  fechaIncidencia: string;
  resuelto: boolean;
  fechaResolucion: string | null;
  resueltoPor: number;
  observacionesResolucion: string;
  evidencias: Evidencia[];
}

export interface Evidencia {
  idEvidenciaIncidencia: number;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlEvidencia: string;
  descripcion: string;
  fechaCarga: string;
}
