// ==============================================
// INTERFACES PARA EMPRESAS FLOTILLA - RESPUESTAS
// ==============================================

export interface FlotillaDetalleResponse {
    empresasFlotilla: EmpresaFlotilla[];
}

export interface EmpresaFlotilla {
    idEmpresaFlotilla: number;
    nombreEmpresa: string;
    razonSocial: string;
    nit: string;
    telefono: string;
    correoContacto: string;
    direccion: string;
    estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
    fechaRegistro: string;
    planesCorporativos: PlanCorporativo[];
}

export interface PlanCorporativo {
    idPlanCorporativo: number;
    nombrePlanCorporativo: string;
    numeroPlacasContratadas: number;
    tipoPlan: string;
    descuentoCorporativoAdicional: number;
    precioPlanCorporativo: number;
    estado: 'ACTIVO' | 'CANCELADO';
    fechaInicio: string;
    fechaFin: string;
    creadoPor: string;
    fechaCreacion: string;
    suscripcionesVehiculos: SuscripcionVehiculo[];
}

export interface SuscripcionVehiculo {
  idSuscripcionFlotilla: number;
  placaVehiculo: string;
  fechaAsignacion: string;
  estado: 'ACTIVA' | 'INACTIVA';
}

// ==================================
// INTERFACES PARA VEHÍCULOS FLOTILLA
// ==================================

export interface VehiculoFlotilla {
  idVehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipoVehiculo: 'DOS_RUEDAS' | 'CUATRO_RUEDAS';
}

// ==============================
// INTERFACES PARA CREAR FLOTILLA
// ==============================

export interface NuevaFlotillaRequest {
  nombreEmpresa: string;
  razonSocial: string;
  nit: string;
  telefono: string;
  correoContacto: string;
  direccion: string;
}

// ================================
// INTERFACES PARA PLAN CORPORATIVO
// ================================

export interface NuevoPlanCorporativoRequest {
  idEmpresaFlotilla: number;
  idTipoPlan: number;
  nombrePlanCorporativo: string;
  numeroPlacasContratadas: number;
  descuentoCorporativoAdicional: number;
  precioPlanCorporativo: number;
  fechaInicio: string;
  fechaFin: string;
  idCreadoPor: number;
}

// ==================================
// INTERFACES PARA SUSCRIBIR VEHÍCULO
// ==================================

export interface SuscribirVehiculoRequest {
  idPlanCorporativo: number;
  idVehiculo: number;
}

// =============================
// INTERFACES PARA RESPUESTA API
// =============================

export interface Respuesta {
  message: string;
  status: string;
}
