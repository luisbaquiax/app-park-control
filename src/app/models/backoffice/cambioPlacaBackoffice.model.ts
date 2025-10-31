// ====================================================
// INTERFACES PARA MOSTRAR CAMBIO DE PLACA - BACKOFFICE
// ====================================================

export interface CambioPlacaResponseBackoffice {
    idUsuario: number;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cui: string;
    direccion: string;
    detalleSolicitudesCambioPlaca: DetalleSolicitudCambioPlacaBackoffice[];
}

export interface DetalleSolicitudCambioPlacaBackoffice {
    idSolicitudCambio: number;
    placaNueva: string;
    motivo: string;
    descripcionMotivo: string;
    fechaSolicitud: string;
    estado: string;
    fechaRevision: string | null;
    observacionesRevision: string | null;
    fechaEfectiva: string | null;
    vehiculoActual: VehiculoBackoffice;
    vehiculoNuevo: VehiculoBackoffice;
    evidenciaCambioPlaca: EvidenciaCambioPlacaBackoffice;
    suscripcionCliente: SuscripcionClienteBackoffice;
}

export interface VehiculoBackoffice {
    idVehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
    tipoVehiculo: string;
}

export interface EvidenciaCambioPlacaBackoffice {
    idEvidencia: number;
    tipoDocumento: string;
    nombreArchivo: string;
    urlDocumento: string;
    descripcion: string;
    fechaCarga: string;
}

export interface SuscripcionClienteBackoffice {
    idSuscripcion: number;
    periodoContratado: string;
    descuentoAplicado: number;
    precioPlan: number;
    horasMensualesIncluidas: number;
    horasConsumidas: number;
    fechaInicio: string;
    fechaFin: string;
    fechaCompra: string;
    estadoSuscripcion: string;
    tarifaBaseReferencia: number;
    vehiculoClienteDTO: any;
    tipoPlanSuscripcionDTO: TipoPlanSuscripcionBackoffice;
    sucursalesDisponibles: SucursalBackoffice[];
}

export interface TipoPlanSuscripcionBackoffice {
    id: number;
    idEmpresa: number;
    nombrePlan: string;
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
    configuracionDescuento: ConfiguracionDescuentoBackoffice;
}

export interface ConfiguracionDescuentoBackoffice {
    idConfiguracionDescuento: number;
    descuentoMensual: number;
    descuentoAnualAdicional: number;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    estadoConfiguracion: string;
    idUsuarioCreacion: number;
    fechaCreacionDescuento: string;
}

export interface SucursalBackoffice {
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
    usuario: any;
}

// =====================================
// INTERFACES CAMBIAR PLACA - BACKOFFICE
// =====================================

export interface CambioPlacaRequestBackoffice {
    idUsuarioBackoffice: number;
    idSolicitudCambio: number;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
    observacionesRevision: string;
}

export interface ApiResponseBackoffice {
    success: boolean;
    message: string;
}