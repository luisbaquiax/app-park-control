// ===========================================================
// INTERFACES PARA EL MODELO DE PERMISO TEMPORAL EN BACKOFFICE
// ===========================================================

export interface PermisoTemporalRequest {
    idUsuario: number;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cui: string;
    direccion: string;
    detalleSolicitudesTemporal: DetalleSolicitudTemporal[];
}

export interface DetalleSolicitudTemporal {
    idPermisoTemporal: number;
    placaTemporal: string;
    tipoVehiculoPermitido: 'CUATRO_RUEDAS' | 'DOS_RUEDAS';
    motivo: string;
    fechaInicio: string | null;
    fechaFin: string | null;
    usosMaximos: number | null;
    usosRealizados: number;
    estado: string;
    aprobadoPor: string | null;
    fechaAprobacion: string | null;
    observaciones: string | null;
    sucursalesDisponiblesPermiso: any[];
    suscripcionCliente: SuscripcionCliente;
}

export interface SuscripcionCliente {
    idSuscripcion: number;
    periodoContratado: 'MENSUAL' | 'ANUAL';
    descuentoAplicado: number;
    precioPlan: number;
    horasMensualesIncluidas: number;
    horasConsumidas: number;
    fechaInicio: string;
    fechaFin: string;
    fechaCompra: string;
    estadoSuscripcion: string;
    tarifaBaseReferencia: number;
    vehiculoClienteDTO: any | null;
    tipoPlanSuscripcionDTO: TipoPlanSuscripcionDTO;
    sucursalesDisponibles: SucursalDisponible[];
}

export interface TipoPlanSuscripcionDTO {
    id: number;
    idEmpresa: number;
    nombrePlan: 'FULL_ACCESS' | 'WORKWEEK' | 'OFFICE_LIGHT' | 'DIARIO_FLEXIBLE' | 'NOCTURNO'
    codigoPlan: string;
    descripcion: string;
    precioPlan: number;
    horasDia: number;
    horasMensuales: number;
    diasAplicables: string;
    coberturaHoraria: string;
    ordenBeneficio: number;
    activo: string;
    fechaCreacion: string;
    configuracionDescuento: ConfiguracionDescuento;
}

export interface ConfiguracionDescuento {
    idConfiguracionDescuento: number;
    descuentoMensual: number;
    descuentoAnualAdicional: number;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    estadoConfiguracion: string;
    idUsuarioCreacion: number;
    fechaCreacionDescuento: string;
}

export interface SucursalDisponible {
    idSucursal: number;
    nombre: string;
    direccionCompleta: string;
    ciudad: string;
    departamento: string;
    horaApertura: string;
    horaCierre: string;
    capacidad2Ruedas: number;
    capacidad4Ruedas: number;
    estado: string;
    usuario: any | null;
}

// =======================================
// INTERFACE PARA ACEPTAR PERMISO TEMPORAL
// =======================================

export interface AceptarPermisoRequest {
    idSolicitudTemporal: number;
    aprobadoPor: number;
    observaciones: string;
    fechaInicio: string;
    fechaFin: string;
    usosMaximos: number;
    sucursalesAsignadas: string;
}

// ==============================================
// INTERFACE PARA REVOCAR PERMISO TEMPORAL ACTIVO
// ==============================================

export interface RevocarPermisoRequest {
    idSolicitudTemporal: number;
    observaciones: string;
}

// ==================================================
// INTERFACE PARA RECHAZAR PERMISO TEMPORAL PENDIENTE
// ==================================================

export interface RechazarPermisoRequest {
    idSolicitudTemporal: number;
    aprobadoPor: number;
    observaciones: string;
}

// ===========================================================
// INTERFACE PARA RESPUESTA DE OPERACIONES DE PERMISO TEMPORAL
// ===========================================================

export interface Respuesta {
    message: string;
    status: string;
}