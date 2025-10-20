// ========================================
// INTERFACES PARA OBTENER DETALLE SUCURSAL
// ========================================

export interface SucursalDetalleResponse {
  idSucursal: number;
  nombreSucursal: string;
  direccionCompletaSucursal: string;
  ciudadSucursal: string;
  departamentoSucursal: string;
  horaApertura: string;
  horaCierre: string;
  capacidad2Ruedas: number;
  capacidad4Ruedas: number;
  latitud: number;
  longitud: number;
  telefonoContactoSucursal: string;
  correoContactoSucursal: string | null;
  estadoSucursal: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO';
  empresa: {
    idEmpresa: number;
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    direccionFiscal: string;
    telefonoPrincipal: string;
    correoPrincipal: string;
  }
}


// ===================================
// INTERFACES PARA ACTUALIZAR SUCURSAL
// ===================================

export interface SucursalUpdateRequest {
  idSucursal: number;
  nombreSucursal: string;
  direccionCompletaSucursal: string;
  ciudadSucursal: string;
  departamentoSucursal: string;
  horaApertura: string;
  horaCierre: string;
  capacidad2Ruedas: number;
  capacidad4Ruedas: number;
  latitud: number;
  longitud: number;
  telefonoContactoSucursal: string;
  correoContactoSucursal: string | null;
  estadoSucursal: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO';
}

// ============================
// INTERFACES PARA CREAR TARIFA
// ============================

export interface TarifaSucursalCreateRequest {
  idUsuarioSucursal: number;
  precioPorHora?: string;
  moneda: string;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  esTarifaBase: boolean;
}

// =========================
// INTERFACES OBTENER TARIFA
// =========================

export interface TarifaSucursalResponse {
  idUsuarioSucursal: number;
  idTarifaSucursal: number;
  precioPorHora: number;
  moneda: string;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estado: 'VIGENTE' | 'PROGRAMADO' | 'HISTORICO';
}

// =================================
// INTERFACES PARA ACTUALIZAR TARIFA
// =================================

export interface TarifaSucursalUpdateRequest {
  idUsuarioSucursal: number;
  idTarifaSucursal: number;
  precioPorHora: number;
  moneda: string;
  fechaVigenciaInicio: string;
  fechaVigenciaFin: string;
  estado: 'VIGENTE' | 'PROGRAMADO' | 'HISTORICO';
}

// ==============================
// INTERFACES PARA LAS RESPUESTAS
// ==============================

export interface ApiResponse {
  message: string;
  status: string;
}